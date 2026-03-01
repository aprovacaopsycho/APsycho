const fs = require('fs');
const path = require('path');

const BACKEND_FILE = 'c:/Users/NATHAN/OneDrive/ANTIGOS/Documentos/GitHub/APsycho/backend-google.js';

let raw = fs.readFileSync(BACKEND_FILE, 'utf8');

// The function for Phase 6 Tests
const phase6Function = `

// ─────────────────────────────────────────────────────────────────────────────
//  19. MOTOR OUTROS (Rotas, TADIM, TEM-R)
// ─────────────────────────────────────────────────────────────────────────────

var OUTROS_CONFIG = {};

function getOutrosGabarito(tipo) {
    if (OUTROS_CONFIG[tipo]) return OUTROS_CONFIG[tipo];
    
    // Fallback dictionary
    const fallback = {
        'rotaa': { meta: 50, gabarito: [] },
        'rotac': { meta: 50, gabarito: [] },
        'rotad': { meta: 50, gabarito: [] },
        'tadim1': { meta: 50, gabarito: [] },
        'tem_r_2': { meta: 50, gabarito: [] }
    };
    return fallback[tipo] || { meta: 50, gabarito: [] };
}

function corrigirOutrosVisual(tipo, marks, annulled, lastSelectedIndex) {
    marks = marks || [];
    annulled = annulled || [];
    lastSelectedIndex = (lastSelectedIndex !== undefined && lastSelectedIndex !== null) ? lastSelectedIndex : -1;
    
    var conf = getOutrosGabarito(tipo);

    var gabarito = conf.gabarito || [];
    
    var hits = 0;
    var errors = 0;
    var omissions = 0;
    
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
if (raw.indexOf('MOTOR OUTROS') === -1) {
    raw += phase6Function;
}

// Ensure cases in doPost
const newCases = `
        case 'rotaa': return corrigirOutrosVisual('rotaa', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'rotac': return corrigirOutrosVisual('rotac', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'rotad': return corrigirOutrosVisual('rotad', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'tadim1': return corrigirOutrosVisual('tadim1', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'tem_r_2': return corrigirOutrosVisual('tem_r_2', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'teaco': return corrigirTEA('teaco', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);`;

raw = raw.replace(`case 'teaco': return corrigirTEA('teaco', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);`, newCases.trim());

// Insert tests to testes_disponiveis
if (raw.indexOf(`'rotaa'`) === -1) {
    raw = raw.replace(`'tedif2'`, `'tedif2', 'rotaa', 'rotac', 'rotad', 'tadim1', 'tem_r_2'`);
}

// Map Gabaritos from phase6_gabs.txt into OUTROS_CONFIG
const gabsRaw = fs.readFileSync('c:/Users/NATHAN/OneDrive/ANTIGOS/Documentos/GitHub/APsycho/phase6_gabs.txt', 'utf8');

let newConfig = "var OUTROS_CONFIG = {\\n";
const lines = gabsRaw.split('\\n');
lines.forEach(line => {
    if (line.startsWith('Gabarito ')) {
        const file = line.split(':')[0].replace('Gabarito ', '').replace('.html', '');
        const vals = line.split(':')[1].trim();
        newConfig += "    '" + file + "': { meta: 50, gabarito: " + vals + " },\\n";
    }
});
newConfig += "};";

raw = raw.replace("var OUTROS_CONFIG = {};", newConfig);

fs.writeFileSync(BACKEND_FILE, raw, 'utf8');
console.log('Backend Updated com Motor OUTROS (Fase 6)');
