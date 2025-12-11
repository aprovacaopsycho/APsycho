const fs = require('fs');

function extractData(content, varName) {
    const regex = new RegExp(`const ${varName} = ([\\s\\S]*?);`);
    const match = content.match(regex);
    if (match) {
        // Evaluate the JS code to get the object
        // This is safe enough for this environment as we trust the content
        try {
            return eval(match[1]);
        } catch (e) {
            console.error(`Error parsing ${varName}:`, e);
            return null;
        }
    }
    return null;
}

const debugContent = fs.readFileSync('PMPR/bfp_debug.html', 'utf8');
const prodContent = fs.readFileSync('PMPR/bfppmpr.html', 'utf8');

const vars = ['DATA_QUESTIONS', 'DATA_CRITERIA', 'DATA_PERCENTILES'];
let diffFound = false;

vars.forEach(v => {
    const d1 = extractData(debugContent, v);
    const d2 = extractData(prodContent, v);

    const s1 = JSON.stringify(d1);
    const s2 = JSON.stringify(d2);

    if (s1 !== s2) {
        console.log(`DIFFERENCE FOUND IN ${v}`);
        diffFound = true;
        // Find where they differ
        for (let i = 0; i < s1.length; i++) {
            if (s1[i] !== s2[i]) {
                console.log(`Mismatch at index ${i}:`);
                console.log(`Debug: ...${s1.substring(i, i + 50)}...`);
                console.log(`Prod:  ...${s2.substring(i, i + 50)}...`);
                break;
            }
        }
    } else {
        console.log(`${v} matches.`);
    }
});

// Also compare calculate function body roughly
function extractFunc(content, funcName) {
    const regex = new RegExp(`function ${funcName}\\s*\\([\\s\\S]*?\\)\\s*{([\\s\\S]*?)}`);
    const match = content.match(regex);
    return match ? match[1].replace(/\s+/g, '') : '';
}

const c1 = extractFunc(debugContent, 'calculate');
const c2 = extractFunc(prodContent, 'calculate');

// Note: calculate functions are DIFFERENT by nature (one takes arg, one reads DOM).
// So we can't simple diff them. But we can compare the CORE math part?
// Actually, let's just dump the diffs first.
