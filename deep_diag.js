const fs = require('fs');
const path = require('path');
const base = 'Base';
const files = [
    'tecon/tecon1.html', 'tecon/tecon2.html', 'tecon/tecon3.html',
    'bpa/bpa_aa.html', 'bpa/bpa_ac.html', 'bpa/bpa_ad.html',
    'cta/cta_aa.html', 'cta/ctaac.html', 'cta/ctaad.html',
    'bda/bda_aa.html', 'bda/bda_ac.html', 'bda/bda_ad.html',
    'teaco/teaco.html', 'teadi/teadi.html', 'tealt/tealt.html',
    'tedif/tedif1.html', 'tedif/tedif2.html',
    'rotas/rotaa.html', 'rotas/rotac.html', 'rotas/rotad.html',
    'tadim/tadim1.html', 'tem-r/tem_r_2.html',
    'acvetor.html', 'tspdimensoes/tsp3.html'
];

const output = [];
output.push('=== DEEP DIAGNOSTIC ===\n');

files.forEach(f => {
    try {
        const c = fs.readFileSync(path.join(base, f), 'utf8');
        const issues = [];

        // 1. Check items have x,y but NOT t (meaning t was stripped - which is good)
        // But check if the HTML/JS references .t in rendering logic
        const refsDotT = [];
        const lines = c.split('\n');
        lines.forEach((line, idx) => {
            // Skip comments
            if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
            // Look for .t references in non-data lines (rendering, conditions)
            if (line.match(/\b[a-z]\.t\b/) && !line.includes('"t"') && !line.includes("'t'") && !line.includes('content')) {
                refsDotT.push(`L${idx + 1}: ${line.trim().substring(0, 80)}`);
            }
            // Also check for item.t, cell.t etc in template bindings
            if (line.match(/(?:item|cell|c|i|el)\.t\s*[=!><]/) || line.match(/(?:item|cell|c|i|el)\.t\s*\?/) || line.match(/x-show.*\.t/) || line.match(/x-bind.*\.t/) || line.match(/:class.*\.t/)) {
                if (!refsDotT.includes(`L${idx + 1}: ${line.trim().substring(0, 80)}`)) {
                    refsDotT.push(`L${idx + 1}: ${line.trim().substring(0, 80)}`);
                }
            }
        });
        if (refsDotT.length > 0) issues.push('REFS to .t in rendering: ' + refsDotT.length + ' lines');

        // 2. Check for isTarget references without backend scoring
        if (c.includes('isTarget') && !c.includes('fetch')) issues.push('Uses isTarget without fetch');

        // 3. Check for finishTest that does local scoring (hits/errors calc without fetch)  
        const finishMatch = c.match(/finishTest[\s\S]{0,500}/);
        if (finishMatch) {
            const snippet = finishMatch[0];
            if (snippet.includes('this.results') && !snippet.includes('fetch') && !snippet.includes('GoogleRunner')) {
                issues.push('finishTest does local scoring (no backend call)');
            }
        }

        // 4. Check for empty items arrays
        if (c.match(/items\s*:\s*\[\s*\]/)) issues.push('ITEMS ARRAY IS EMPTY');

        // 5. Check GoogleRunner dependency
        if (c.includes('GoogleRunner')) issues.push('Still uses GoogleRunner');

        // 6. SEM fetch
        if (!c.includes('fetch(') && !c.includes('GoogleRunner')) issues.push('NO fetch AND NO GoogleRunner');

        // 7. Check items have id,x,y but no t
        const hasIdXY = c.includes('"id"') && c.includes('"x"') && c.includes('"y"');
        const hasT = !!c.match(/"t"\s*:\s*[012]/);
        if (hasIdXY && hasT) issues.push('t: still present (gabarito exposed!)');

        const status = issues.length === 0 ? 'OK' : 'PROBLEMS';
        output.push(`${f}: ${status}`);
        issues.forEach(i => output.push(`  -> ${i}`));

    } catch (e) {
        output.push(`${f}: FILE NOT FOUND`);
    }
});

fs.writeFileSync('deep_diag.txt', output.join('\n'), 'utf8');
console.log('Done. Check deep_diag.txt');
