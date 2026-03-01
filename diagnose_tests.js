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

console.log('=== DIAGNÓSTICO DOS TESTES DE ATENÇÃO ===\n');

files.forEach(f => {
    try {
        const c = fs.readFileSync(path.join(base, f), 'utf8');
        const issues = [];

        // Check for t: values remaining
        if (c.match(/"t"\s*:\s*[012]/)) issues.push('HAS t:0/1/2 (gabarito exposto)');

        // Check for empty items array
        if (c.match(/items\s*:\s*\[\s*\]/)) issues.push('ITEMS VAZIO []');

        // Check for broken config (items removed completely)
        if (c.includes('"id"') && !c.includes('"x"')) issues.push('ITEMS SEM COORDS');

        // Check finishTest function
        const hasAsyncFinish = c.includes('async finishTest');
        const hasFetch = c.includes('fetch(');
        const hasGoogleRunner = c.includes('GoogleRunner');

        if (hasGoogleRunner) issues.push('USA GoogleRunner (deprecated)');
        if (!hasFetch && !hasGoogleRunner) issues.push('SEM fetch() E SEM GoogleRunner');
        if (hasFetch && !hasAsyncFinish) issues.push('fetch SEM async');

        // Check for syntax errors - unmatched braces
        const openBraces = (c.match(/{/g) || []).length;
        const closeBraces = (c.match(/}/g) || []).length;
        if (Math.abs(openBraces - closeBraces) > 2) issues.push(`BRACES MISMATCH {${openBraces} vs }${closeBraces}`);

        // Check Alpine.js data function
        if (c.includes('x-data') && !c.includes('Alpine')) {
            // check if Alpine CDN is included
            if (!c.includes('alpinejs') && !c.includes('alpine')) issues.push('SEM ALPINE CDN');
        }

        // Check for broken script tags
        const scriptOpens = (c.match(/<script/g) || []).length;
        const scriptCloses = (c.match(/<\/script>/g) || []).length;
        if (scriptOpens !== scriptCloses) issues.push(`SCRIPT TAGS MISMATCH <script:${scriptOpens} </script>:${scriptCloses}`);

        // Report
        const status = issues.length === 0 ? '✓ OK' : '✗ PROBLEMAS';
        console.log(`${f.padEnd(30)} ${status}`);
        issues.forEach(i => console.log(`${''.padEnd(32)} → ${i}`));
    } catch (e) {
        console.log(`${f.padEnd(30)} ✗ ARQUIVO NÃO ENCONTRADO`);
    }
});
