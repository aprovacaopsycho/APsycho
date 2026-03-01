const fs = require('fs');
const path = require('path');

const BACKEND_FILE = 'c:/Users/NATHAN/OneDrive/ANTIGOS/Documentos/GitHub/APsycho/backend-google.js';

let raw = fs.readFileSync(BACKEND_FILE, 'utf8');

// 1. Update doPost cases
raw = raw.replace(`case 'bda_aa': return corrigirBDA_AA(parsed.respostas);`, `case 'bda_aa': return corrigirBDA('aa', parsed.respostas);
        case 'bda_ac': return corrigirBDA('ac', parsed.respostas);
        case 'bda_ad': return corrigirBDA('ad', parsed.respostas);`);

// 2. Add testes_disponiveis (we might have already bda_aa, but we need ac and ad)
if (raw.indexOf(`'bda_aa'`) !== -1 && raw.indexOf(`'bda_ac'`) === -1) {
    raw = raw.replace(`'bda_aa'`, `'bda_aa', 'bda_ac', 'bda_ad'`);
}

// 3. Add the generic BDA function
const bdaFunction = `

// ─────────────────────────────────────────────────────────────────────────────
//  17. MOTOR BDA (BDA-AA, BDA-AC, BDA-AD)
// ─────────────────────────────────────────────────────────────────────────────

var BDA_CONFIG = {
    'aa': {
        meta: 55,
        totalItems: 225,
        gabarito: [0, 2, 4, 8, 11, 14, 16, 24, 25, 28, 32, 33, 35, 37, 45, 48, 50, 51, 53, 55, 56, 57, 59, 60, 62, 63, 66, 72, 73, 74, 78, 79, 82, 85, 89, 91, 94, 95, 96, 101, 103, 105, 107, 113, 114, 115, 118, 120, 125, 127, 131, 135, 137, 139, 143, 145, 149, 153, 156, 162, 165, 167, 170, 174, 176, 181, 184, 186, 191, 192, 193, 194, 195, 202, 205, 210, 212, 215, 219, 224]
    },
    'ac': {
        meta: 78,
        totalItems: 225,
        gabarito: [0, 2, 4, 8, 11, 14, 16, 24, 25, 28, 32, 33, 35, 37, 45, 48, 50, 51, 53, 55, 56, 57, 59, 60, 62, 63, 66, 72, 73, 74, 78, 79, 82, 85, 89, 91, 94, 95, 96, 101, 103, 105, 107, 113, 114, 115, 118, 120, 125, 127, 131, 135, 137, 139, 143, 145, 149, 153, 156, 162, 165, 167, 170, 174, 176, 181, 184, 186, 191, 192, 193, 194, 195, 202, 205, 210, 212, 215, 219, 224]
    },
    'ad': {
        meta: 89,
        totalItems: 225,
        gabarito: [1, 3, 5, 9, 12, 15, 17, 23, 26, 29, 31, 34, 36, 38, 44, 47, 49, 52, 54, 58, 61, 64, 65, 67, 71, 75, 77, 80, 81, 83, 86, 88, 90, 92, 93, 97, 98, 99, 100, 102, 104, 106, 108, 109, 110, 111, 112, 116, 117, 119, 121, 122, 123, 124, 126, 128, 129, 130, 132, 133, 134, 136, 138, 140, 141, 142, 144, 146, 147, 148, 150, 151, 152, 154, 155, 157, 158, 159, 160, 161, 163, 164, 166, 168, 169, 171, 172, 173, 175, 177, 178, 179, 180, 182, 183, 185, 187, 188, 189, 190, 196, 197, 198, 199, 200, 201, 203, 204, 206, 207, 208, 209, 211, 213, 214, 216, 217, 218, 219, 220]
    }
};

function corrigirBDA(tipo, respostas) {
    if (!respostas || !Array.isArray(respostas)) {
        respostas = [];
    }
    
    var conf = BDA_CONFIG[tipo];
    if (!conf) throw new Error("Tipo de BDA inválido");

    var gabarito = conf.gabarito || [];
    
    var acertos = 0;
    var erros = 0;
    var omissoes = 0; // O BDA antigo conta apenas acertos e erros? O bda_aa.html faz fetch passando type e respostas array. It uses simple "status" calculation.
    
    // Antigo BDA: 
    // const acertos = marks.filter(item => BDA_AA_CONFIG.gabarito.includes(item)).length;
    // const erros = marks.filter(item => !BDA_AA_CONFIG.gabarito.includes(item)).length;
    // const omissoes = BDA_AA_CONFIG.gabarito.length - acertos; // Ou algo do tipo

    for (var i = 0; i < respostas.length; i++) {
        if (gabarito.indexOf(respostas[i]) !== -1) {
            acertos++;
        } else {
            erros++;
        }
    }
    
    // Omissões assumindo que o teste não tem lastIndex, apenas conta as faltas do gabarito total
    omissoes = gabarito.length - acertos;

    var score = acertos - (erros + omissoes);
    var pontuacao = acertos; // O BDA anterior parecia usar acertos. Let's send both just in case.

    var status = acertos >= conf.meta ? 'APTO' : 'INAPTO';

    return {
        sucesso: true,
        tipo: 'bda_' + tipo,
        status: status,
        pontuacao: acertos, // BDA meta baseada em acertos brutos, aparentemente
        scoreFormatado: score,
        hits: acertos,
        errors: erros,
        omissions: omissoes,
        gabarito: gabarito,
        meta: conf.meta
    };
}
`;

raw += bdaFunction;

fs.writeFileSync(BACKEND_FILE, raw, 'utf8');
console.log('Backend Updated com Motor BDA');
