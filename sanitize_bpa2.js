const fs = require('fs');
const path = require('path');

const BACKEND_FILE = 'c:/Users/NATHAN/OneDrive/ANTIGOS/Documentos/GitHub/APsycho/backend-google.js';

let raw = fs.readFileSync(BACKEND_FILE, 'utf8');

// 1. Add BPA to doPost cases
const newCases = `
        case 'tecon3': return corrigirTECON(3, parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'bpa_aa': return corrigirBPA('aa', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'bpa_ac': return corrigirBPA('ac', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'bpa_ad': return corrigirBPA('ad', parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'bda_aa': return corrigirBDA_AA(parsed.respostas);`;

raw = raw.replace(`case 'tecon3': return corrigirTECON(3, parsed.marks, parsed.annulled, parsed.lastSelectedIndex);\n        case 'bda_aa': return corrigirBDA_AA(parsed.respostas);`, newCases.trim());

// 2. Add testes_disponiveis
raw = raw.replace(`'esavib', 'bda_aa', 'acvetor', 'memof', 'tecon1', 'tecon2', 'tecon3'`, `'esavib', 'bda_aa', 'acvetor', 'memof', 'tecon1', 'tecon2', 'tecon3', 'bpa_aa', 'bpa_ac', 'bpa_ad'`);

// 3. Add the actual function at the end
const bpaFunction = `

// ─────────────────────────────────────────────────────────────────────────────
//  15. MOTOR BPA (BPA-AA, BPA-AC, BPA-AD)
// ─────────────────────────────────────────────────────────────────────────────

var BPA_CONFIG = {
    'aa': {
        meta: 96,
        totalItems: 468,
        gabarito: [2, 6, 8, 11, 14, 16, 25, 26, 27, 30, 32, 33, 35, 37, 45, 48, 50, 51, 53, 56, 57, 59, 60, 62, 63, 66, 72, 73, 74, 78, 79, 82, 85, 89, 91, 94, 95, 96, 101, 103, 105, 107, 113, 114, 115, 118, 120, 125, 127, 131, 135, 137, 139, 143, 145, 149, 153, 156, 162, 165, 167, 170, 174, 176, 181, 184, 186, 191, 192, 193, 194, 195, 202, 205, 210, 212, 215, 219, 224, 227, 231, 234, 235, 240, 241, 245, 252, 258, 267, 268, 271, 275, 277, 281, 283, 290, 296, 297, 302, 305, 312, 315, 316, 322, 323, 327, 330, 341, 342, 345, 348, 352, 362, 366, 368, 371, 374, 375, 378, 384, 388, 391, 395, 397, 409, 412, 413, 414, 418, 422, 427, 429, 435, 444, 445, 446, 449, 451, 452, 457, 460, 463, 467]
    },
    'ac': {
        meta: 192,
        totalItems: 468,
        gabarito: [0, 4, 7, 11, 13, 15, 19, 26, 30, 34, 41, 43, 49, 50, 52, 56, 61, 64, 66, 73, 80, 81, 86, 87, 96, 99, 101, 108, 113, 114, 115, 124, 127, 131, 134, 136, 144, 146, 150, 153, 157, 160, 161, 169, 173, 177, 181, 182, 194, 195, 200, 203, 207, 210, 211, 216, 219, 223, 227, 233, 241, 245, 249, 252, 253, 255, 258, 267, 270, 272, 280, 283, 288, 292, 295, 298, 300, 303, 305, 313, 319, 323, 324, 328, 336, 340, 342, 345, 350, 351, 354, 361, 364, 370, 373, 378, 384, 387, 390, 392, 393, 396, 401, 408, 411, 416, 420, 422, 425, 428, 433, 435, 440, 443, 444, 447, 450, 452, 455, 462, 467]
    },
    'ad': {
        meta: 72,
        totalItems: 468,
        gabarito: [1, 3, 6, 10, 12, 15, 17, 24, 28, 32, 37, 41, 43, 50, 54, 57, 61, 63, 65, 72, 74, 76, 79, 82, 84, 102, 104, 106, 110, 112, 114, 123, 125, 129, 133, 137, 139, 144, 148, 152, 156, 159, 160, 169, 171, 177, 179, 182, 187, 192, 196, 197, 198, 202, 209, 218, 221, 225, 227, 228, 230, 240, 241, 253, 256, 258, 259, 267, 269, 271, 273, 275, 278, 288, 290, 292, 295, 300, 306, 312, 317, 319, 323, 326, 327, 338, 343, 347, 349, 353, 355, 361, 366, 368, 370, 372, 375, 384, 387, 388, 395, 402, 403, 409, 413, 416, 421, 424, 425, 431, 434, 435, 438, 442, 449, 452, 457, 460, 464, 467]
    }
};

function corrigirBPA(tipo, marks, annulled, lastSelectedIndex) {
    marks = marks || [];
    annulled = annulled || [];
    lastSelectedIndex = (lastSelectedIndex !== undefined && lastSelectedIndex !== null) ? lastSelectedIndex : -1;
    
    var conf = BPA_CONFIG[tipo];
    if (!conf) throw new Error("Tipo de BPA inválido");

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
        tipo: 'bpa_' + tipo,
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

raw += bpaFunction;

fs.writeFileSync(BACKEND_FILE, raw, 'utf8');
console.log('Backend Updated com Motor BPA');
