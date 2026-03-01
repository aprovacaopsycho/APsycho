const fs = require('fs');
const path = require('path');

const targets = [
    { file: 'Base/bda/bda_ac.html', tipo: 'bda_ac', scoreField: 'Math.round(result.pontuacao)', meta: 78 },
    { file: 'Base/bda/bda_ad.html', tipo: 'bda_ad', scoreField: 'Math.round(result.pontuacao)', meta: 89 },
    { file: 'Base/cta/ctaad.html', tipo: 'cta_ad', scoreField: 'result.pontuacao', meta: 32 }
];

const fetchSnippetTemplate = (tipo, scoreField, meta) => `
                async finishTest() {
                    clearInterval(this.timer);
                    if(this.audio && this.audio.finish) this.audio.finish.play().catch(e=>e);
                    
                    const btn = document.querySelector('[onclick="finishTest()"], [x-on\\\\:click="finishTest()"], [\\\\@click="finishTest()"]');
                    if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                    const payload = { tipo: '${tipo}', respostas: this.marks||[], annulled: this.annulled||[], lastSelectedIndex: this.lastSelectedIndex };
                    
                    try {
                        const response = await fetch("AKfycbzSb0NgcW6pFcVF-ZXyw0bugKWA2a28Go3-X-d5PfCgnnEnD3eV2R6Xj0RbmIk6xBrN".includes('https') ? "AKfycbzSb0NgcW6pFcVF-ZXyw0bugKWA2a28Go3-X-d5PfCgnnEnD3eV2R6Xj0RbmIk6xBrN" : "https://script.google.com/macros/s/AKfycbzSb0NgcW6pFcVF-ZXyw0bugKWA2a28Go3-X-d5PfCgnnEnD3eV2R6Xj0RbmIk6xBrN/exec", {
                            method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload)
                        });
                        const result = await response.json();
                        if(result.sucesso) {
                            this.results = { hits: result.hits, errors: result.errors, omissions: result.omissions, score: ${scoreField} };
                            const gab = result.gabarito || [];
                            this.config.items.forEach(i => i.t = gab.includes(i.id) ? 1 : 0);
                            this.state = 'results';
                            window.scrollTo(0, 0);
                            if(this.results.score >= ${meta} && typeof this.triggerConfetti === 'function') this.triggerConfetti();
                            else if(this.results.score < ${meta}) { document.body.classList.add('shake-screen'); setTimeout(() => document.body.classList.remove('shake-screen'), 500); }
                            if(typeof this.saveHistory === 'function') this.saveHistory();
                        } else { alert("Erro: " + result.erro); if(btn) btn.innerHTML = '<i class="fas fa-stop"></i>'; }
                    } catch(e) { alert("Erro conexão: " + e.message); if(btn) btn.innerHTML = '<i class="fas fa-stop"></i>'; }
                },`;

targets.forEach(t => {
    try {
        let content = fs.readFileSync(t.file, 'utf8');

        // Find finishTest() block until loadHistory()
        const regex = /finishTest\(\)\s*\{[\s\S]+?\},[\s\n]+loadHistory/g;
        const match = regex.exec(content);
        if (match) {
            const newBlock = fetchSnippetTemplate(t.tipo, t.scoreField, t.meta) + '\n                loadHistory';
            content = content.replace(match[0], newBlock);
            fs.writeFileSync(t.file, content, 'utf8');
            console.log('Updated', t.file);
        } else {
            console.log('Regex did not match in', t.file);
        }
    } catch (e) {
        console.log('Error processing', t.file, e.message);
    }
});
