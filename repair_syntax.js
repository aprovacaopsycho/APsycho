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

let fixes = 0;

files.forEach(f => {
    try {
        const filePath = path.join(base, f);
        let c = fs.readFileSync(filePath, 'utf8');
        let orig = c;

        // 1. Fix the syntax error injected previously
        c = c.replace(/},\,/g, '},'); // Double commas inside object
        c = c.replace(/},,/g, '},');

        // 2. Fix the querySelector syntax error (button[@click=...])
        // Instead of fixing the selector just change it to not crash or remove it, or use a class.
        // Let's replace document.querySelector('button[@click="finishTest()"]') with document.querySelector('[x-text="formatTime(time)"]')?.parentElement?.nextElementSibling 
        // Or simply remove it.
        c = c.replace(/querySelector\('button\[@click="finishTest\(\)"\]'\)/g, "querySelector('[onclick=\"finishTest()\"], [x-on\\\\:click=\"finishTest()\"], [\\\\@click=\"finishTest()\"]')");
        // Also handle the double quotes variant if any
        c = c.replace(/querySelector\("button\[@click='finishTest\(\)'\]"\)/g, "querySelector('[onclick=\"finishTest()\"], [x-on\\\\:click=\"finishTest()\"], [\\\\@click=\"finishTest()\"]')");

        // 3. Fix the newly created fetch URL endpoint
        c = c.replace(/AKfycbwv_7pDuo521IyFsknbLWTH-idXaZCw0XN2nlq9pHGKjNDs8kklgaF8avm6tqLbaQkR1w/g, 'AKfycbzSb0NgcW6pFcVF-ZXyw0bugKWA2a28Go3-X-d5PfCgnnEnD3eV2R6Xj0RbmIk6xBrN');

        if (c !== orig) {
            fs.writeFileSync(filePath, c, 'utf8');
            console.log('Repaired syntax/URL in', f);
            fixes++;
        }
    } catch (e) { }
});
console.log('Total fixed:', fixes);
