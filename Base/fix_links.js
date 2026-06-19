const fs = require('fs');
const path = require('path');

const basePath = `c:\\Users\\NATHAN\\OneDrive\\ANTIGOS\\Documentos\\GitHub\\APsycho\\Base`;

const files = [
    "mig.html", "r1.html", "beta3m.html", "tri.html", "trl.html", 
    "g36.html", "cubos.html", "wmt2.html", "tig_nv.html", "bpr5rv.html"
];

files.forEach(file => {
    const filePath = path.join(basePath, file);
    if (!fs.existsSync(filePath)) {
        console.log(`Arquivo não encontrado: ${file}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Expressão regular para encontrar qualquer variação do link testes_inteligencia_PMCE.html
    const regex = /href="[^"]*testes_inteligencia_PMCE\.html"/g;
    
    const newContent = content.replace(regex, 'href="testes_inteligencia_PMCE.html"');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`Corrigido: ${file}`);
    } else {
        console.log(`Sem mudanças: ${file}`);
    }
});
