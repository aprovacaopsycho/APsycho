const fs = require('fs');
const path = require('path');

const BACKEND_FILE = 'c:/Users/NATHAN/OneDrive/ANTIGOS/Documentos/GitHub/APsycho/backend-google.js';

let raw = fs.readFileSync(BACKEND_FILE, 'utf8');

// 1. Add TECON to doPost cases
const newCases = `
        case 'tecon1': return corrigirTECON(1, parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'tecon2': return corrigirTECON(2, parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'tecon3': return corrigirTECON(3, parsed.marks, parsed.annulled, parsed.lastSelectedIndex);
        case 'bda_aa': return corrigirBDA_AA(parsed.respostas);`;

raw = raw.replace(`case 'bda_aa': return corrigirBDA_AA(parsed.respostas);`, newCases.trim());

// 2. Add testes_disponiveis
raw = raw.replace(`'esavib', 'bda_aa', 'acvetor', 'memof'`, `'esavib', 'bda_aa', 'acvetor', 'memof', 'tecon1', 'tecon2', 'tecon3'`);

// 3. Add the actual function at the end
const teconFunction = `

// ─────────────────────────────────────────────────────────────────────────────
//  14. MOTOR TECON (TECON 1, 2, 3)
// ─────────────────────────────────────────────────────────────────────────────

var TECON_GABARITOS = {
    1: [0, 2, 4, 5, 8, 11, 13, 14, 15, 16, 18, 21, 24, 26, 30, 31, 33, 35, 38, 41, 42, 43, 45, 46, 48, 49, 51, 52, 56, 58, 61, 63, 66, 67, 69, 70, 72, 74, 75, 79, 80, 82, 84, 86, 90, 91, 92, 95, 96, 99, 101, 103, 105, 107, 109, 112, 114, 116, 118, 119, 120, 122, 123, 124, 125, 131, 132, 134, 136, 138, 139, 140, 147, 148, 149, 152, 153, 154, 157, 159, 161, 162, 165, 166, 170, 171, 173, 175, 178, 179, 180, 182, 183, 185, 188, 189, 190, 193, 195, 198, 199, 201, 203, 204, 205, 208, 209, 211, 214, 217, 219, 220, 222, 224, 225, 227, 228, 229, 232, 233, 236, 239, 241, 243, 244, 246, 247, 248, 254, 257, 261, 263],
    2: [2, 3, 5, 8, 9, 11, 13, 17, 18, 19, 21, 23, 25, 27, 28, 30, 33, 34, 37, 39, 40, 43, 44, 45, 49, 51, 52, 54, 56, 59, 62, 63, 65, 66, 68, 69, 74, 75, 76, 77, 79, 80, 84, 86, 89, 91, 94, 95, 96, 98, 99, 101, 104, 106, 109, 112, 114, 116, 117, 118, 123, 124, 126, 127, 129, 131, 134, 136, 137, 139, 141, 142, 145, 146, 150, 151, 152, 154, 159, 161, 163, 164, 166, 167, 168, 171, 172, 174, 177, 179, 180, 182, 183, 185, 188, 189, 192, 193, 197, 199, 201, 203, 205, 206, 207, 210, 212, 215, 217, 219, 221, 222, 224, 226, 228, 229, 230, 231, 232, 235, 241, 244, 245, 246, 247, 249, 253, 254, 258, 261],
    3: [2, 3, 5, 8, 9, 11, 13, 17, 18, 19, 21, 23, 25, 27, 28, 30, 33, 34, 37, 39, 40, 43, 44, 45, 49, 51, 52, 54, 56, 59, 62, 63, 65, 66, 68, 69, 74, 75, 76, 77, 79, 80, 84, 86, 89, 91, 94, 95, 96, 98, 99, 101, 104, 106, 109, 112, 114, 116, 117, 118, 123, 124, 126, 127, 129, 131, 134, 136, 137, 139, 141, 142, 145, 146, 150, 151, 152, 154, 159, 161, 163, 164, 166, 167, 168, 171, 172, 174, 177, 179, 180, 182, 183, 185, 188, 189, 192, 193, 197, 199, 201, 203, 205, 206, 207, 210, 212, 215, 217, 219, 221, 222, 224, 226, 228, 229, 230, 231, 232, 235, 241, 244, 245, 246, 247, 249, 253, 254, 258, 261]
};

function corrigirTECON(tipo, marks, annulled, lastSelectedIndex) {
    marks = marks || [];
    annulled = annulled || [];
    lastSelectedIndex = (lastSelectedIndex !== undefined && lastSelectedIndex !== null) ? lastSelectedIndex : -1;
    
    var gabarito = TECON_GABARITOS[tipo] || [];
    
    var hits = 0;
    var errors = 0;
    var omissions = 0;
    
    var totalItems = 264; // TECON tem 264 items de config estáticos

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
    // Meta de aprovação TECON: 96 pontos
    var status = score >= 96 ? 'APTO' : 'INAPTO';

    return {
        sucesso: true,
        tipo: 'tecon' + tipo,
        status: status,
        pontuacao: score,
        hits: hits,
        errors: errors,
        omissions: omissions,
        gabarito: gabarito
    };
}
`;

raw += teconFunction;

fs.writeFileSync(BACKEND_FILE, raw, 'utf8');
console.log('Backend Updated com Motor TECON');
