const fs = require('fs');
const path = require('path');

const bpath = 'c:/Users/NATHAN/OneDrive/ANTIGOS/Documentos/GitHub/APsycho/Base/TECON/';
const files = ['tecon1.html', 'tecon2.html', 'tecon3.html'];

files.forEach(f => {
    let raw = fs.readFileSync(path.join(bpath, f), 'utf8');

    // Extract items using regex
    const match = raw.match(/("items":\s*\[.*?\])/);
    if (match) {
        const itemsStr = `{${match[1]}}`;
        const itemsObj = JSON.parse(itemsStr).items;

        const gabarito = itemsObj.filter(i => i.t === 1).map(i => i.id);
        console.log(`Gabarito ${f}: [${gabarito.join(',')}]`);

        // Remove 't' property from HTML string
        let cleanItems = JSON.stringify(itemsObj.map(i => ({ id: i.id, x: i.x, y: i.y })));
        let cleanRaw = raw.replace(match[1], `"items": ${cleanItems}`);

        // Update function finishTest
        const newFinish = `                async finishTest() {
                    clearInterval(this.timer);
                    this.audio.finish.play().catch(e => console.log('Áudio final erro'));
                    
                    const btn = document.querySelector('button[@click="finishTest()"]');
                    if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                    const payload = {
                        tipo: '${f.replace('.html', '')}',
                        marks: this.marks,
                        annulled: this.annulled,
                        lastSelectedIndex: this.lastSelectedIndex
                    };

                    try {
                        const API_URL = "https://script.google.com/macros/s/AKfycbwv_7pDuo521IyFsknbLWTH-idXaZCw0XN2nlq9pHGKjNDs8kklgaF8avm6tqLbaQkR1w/exec";
                        const response = await fetch(API_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'text/plain' },
                            body: JSON.stringify(payload)
                        });
                        const result = await response.json();

                        if (result.sucesso) {
                            this.results = {
                                hits: result.hits,
                                errors: result.errors,
                                omissions: result.omissions,
                                score: result.pontuacao
                            };
                            
                            // Rehydrate target mapping for visual review
                            const gabarito = result.gabarito || [];
                            this.config.items.forEach(item => {
                                item.t = gabarito.includes(item.id) ? 1 : 0;
                            });

                            this.state = 'results';
                            window.scrollTo(0, 0);

                            if (this.results.score >= 96) { this.triggerConfetti(); }
                            else { document.body.classList.add('shake-screen'); setTimeout(() => document.body.classList.remove('shake-screen'), 500); }
                            this.saveHistory();
                        } else {
                            alert("Erro na correção: " + result.erro);
                            if(btn) btn.innerHTML = '<i class="fas fa-stop"></i>';
                        }
                    } catch (e) {
                        alert("Erro de conexão: " + e.message);
                        if(btn) btn.innerHTML = '<i class="fas fa-stop"></i>';
                    }
                },`;

        // replace finishTest block
        const startRegex = /finishTest\(\)\s*\{/;
        const endStr = `this.saveHistory();\n                },`;

        let splitStart = cleanRaw.split(startRegex);
        if (splitStart.length === 2) {
            let splitEnd = splitStart[1].split(endStr);
            if (splitEnd.length === 2) {
                cleanRaw = splitStart[0] + newFinish + splitEnd[1];
                fs.writeFileSync(path.join(bpath, f), cleanRaw, 'utf8');
                console.log(`Cleaned and integrated ${f}`);
            }
        }
    }
});
