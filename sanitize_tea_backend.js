const fs = require('fs');
const path = require('path');

const BACKEND_FILE = 'c:/Users/NATHAN/OneDrive/ANTIGOS/Documentos/GitHub/APsycho/backend-google.js';

let raw = fs.readFileSync(BACKEND_FILE, 'utf8');

// The actual TEA function
const teaFunction = `

// ─────────────────────────────────────────────────────────────────────────────
//  18. MOTOR TEA (TEACO, TEADI, TEALT) e TEDIF (1, 2)
// ─────────────────────────────────────────────────────────────────────────────

var TEA_CONFIG = {};

function getTEAGabarito(tipo) {
    if (TEA_CONFIG[tipo]) return TEA_CONFIG[tipo];
    
    // Fallback dictionary for TEA and TEDIF
    // Note: The HTML files had the arrays inline; we'll define mapping below
    const fallback = {
        'teaco': { meta: 50, gabarito: [] }, // Populated dynamically below in production
        'teadi': { meta: 50, gabarito: [] },
        'tealt': { meta: 50, gabarito: [] },
        'tedif1': { meta: 50, gabarito: [] },
        'tedif2': { meta: 50, gabarito: [] },
    };
    return fallback[tipo] || { meta: 50, gabarito: [] };
}

function corrigirTEA(tipo, marks, annulled, lastSelectedIndex) {
    marks = marks || [];
    annulled = annulled || [];
    lastSelectedIndex = (lastSelectedIndex !== undefined && lastSelectedIndex !== null) ? lastSelectedIndex : -1;
    
    var conf = getTEAGabarito(tipo);

    var gabarito = conf.gabarito || [];
    
    var hits = 0;
    var errors = 0;
    var omissions = 0;
    
    // We don't have total items, we'll assume length based on lastSelectedIndex or standard behavior
    var maxIndex = Math.max.apply(Math, gabarito.concat([lastSelectedIndex]));

    for(var i = 0; i <= maxIndex; i++) {
        var isTarget = gabarito.indexOf(i) !== -1;
        var isMarked = marks.indexOf(i) !== -1;
        var isAnnulled = annulled.indexOf(i) !== -1;

        if (isAnnulled) {
            // Conta omissão caso fosse target e estava pra trás do lastIndex
            if (isTarget && i <= lastSelectedIndex) {
                omissions++;
            }
        } else if (isMarked) {
            if (isTarget) hits++;
            else errors++;
        } else {
            if (isTarget && i <= lastSelectedIndex) {
                omissions++;
            }
        }
    }

    var score = hits - (errors + omissions);
    var status = score >= conf.meta ? 'APTO' : 'INAPTO';

    return {
        sucesso: true,
        tipo: tipo,
        status: status,
        pontuacao: score,
        hits: hits,
        errors: errors,
        omissions: omissions,
        gabarito: gabarito,
        meta: conf.meta
    };
}
`;

// Only add if not there
if (raw.indexOf('MOTOR TEA') === -1) {
    raw += teaFunction;
}

// Ensure cases in doPost
const newCases = `
        case 'teaco': return corrigirTEA('teaco', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'teadi': return corrigirTEA('teadi', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'tealt': return corrigirTEA('tealt', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'tedif1': return corrigirTEA('tedif1', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'tedif2': return corrigirTEA('tedif2', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'bda_aa': return corrigirBDA('aa', parsed.respostas);`;

raw = raw.replace(`case 'bda_aa': return corrigirBDA('aa', parsed.respostas);`, newCases.trim());

// We'll write a better script to embed the correct arrays directly later if needed. 
// For now, let's parse tea_tedif_gabs.txt and inject it into TEA_CONFIG.

const gabsRaw = fs.readFileSync('c:/Users/NATHAN/OneDrive/ANTIGOS/Documentos/GitHub/APsycho/tea_tedif_gabs.txt', 'utf8');

let newConfig = "var TEA_CONFIG = {\\n";
const lines = gabsRaw.split('\\n');
lines.forEach(line => {
    if (line.startsWith('Gabarito ')) {
        const file = line.split(':')[0].replace('Gabarito ', '').replace('.html', '');
        const vals = line.split(':')[1].trim();
        newConfig += "    '" + file + "': { meta: 50, totalItems: 350, gabarito: " + vals + " },\\n";
    }
});
newConfig += "};";

raw = raw.replace("var TEA_CONFIG = {};", newConfig);

fs.writeFileSync(BACKEND_FILE, raw, 'utf8');
console.log('Backend Updated com Motor TEA/TEDIF');
