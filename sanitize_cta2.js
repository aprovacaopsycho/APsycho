const fs = require('fs');
const path = require('path');

const BACKEND_FILE = 'c:/Users/NATHAN/OneDrive/ANTIGOS/Documentos/GitHub/APsycho/backend-google.js';

let raw = fs.readFileSync(BACKEND_FILE, 'utf8');

// 1. Add CTA to doPost cases
const newCases = `
        case 'bpa_ad': return corrigirBPA('ad', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'cta_aa': return corrigirCTA('aa', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'bda_aa': return corrigirBDA_AA(parsed.respostas);`;

raw = raw.replace(`case 'bpa_ad': return corrigirBPA('ad', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);\n        case 'bda_aa': return corrigirBDA_AA(parsed.respostas);`, newCases.trim());

// 2. Add testes_disponiveis
raw = raw.replace(`'bpa_aa', 'bpa_ac', 'bpa_ad'`, `'bpa_aa', 'bpa_ac', 'bpa_ad', 'cta_aa'`);

// 3. Add the actual function at the end
const ctaFunction = `

// ─────────────────────────────────────────────────────────────────────────────
//  16. MOTOR CTA (CTA-AA)
// ─────────────────────────────────────────────────────────────────────────────

var CTA_CONFIG = {
    'aa': {
        meta: 32,
        totalItems: 118,
        gabarito: [0, 2, 6, 7, 9, 12, 14, 18, 20, 21, 23, 26, 30, 31, 33, 35, 37, 39, 44, 46, 50, 52, 53, 56, 59, 61, 62, 65, 66, 68, 70, 71, 75, 78, 80, 83, 85, 87, 88, 93, 95, 96, 97, 100, 101, 107, 108, 110, 113, 117]
    }
};

function corrigirCTA(tipo, marks, annulled, lastSelectedIndex) {
    marks = marks || [];
    annulled = annulled || [];
    lastSelectedIndex = (lastSelectedIndex !== undefined && lastSelectedIndex !== null) ? lastSelectedIndex : -1;
    
    var conf = CTA_CONFIG[tipo];
    if (!conf) throw new Error("Tipo de CTA inválido");

    var gabarito = conf.gabarito || [];
    
    var hits = 0;
    var errors = 0;
    var omissions = 0;
    
    var totalItems = conf.totalItems;

    for(var i = 0; i < totalItems; i++) {
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
        tipo: 'cta_' + tipo,
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

raw += ctaFunction;

fs.writeFileSync(BACKEND_FILE, raw, 'utf8');
console.log('Backend Updated com Motor CTA');
