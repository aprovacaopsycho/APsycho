const fs = require('fs');
const path = require('path');

const bpath = 'c:/Users/NATHAN/OneDrive/ANTIGOS/Documentos/GitHub/APsycho/Base/cta/';
const f = 'cta_aa.html';

let raw = fs.readFileSync(path.join(bpath, f), 'utf8');

// Match config object with multiline items array
const match = raw.match(/"items":\s*\[[\s\S]*?\]/);
if (match) {
    const itemsStr = `{${match[0]}}`;
    const itemsObj = JSON.parse(itemsStr).items;

    const gabarito = itemsObj.filter(i => i.t === 1).map(i => i.id);
    console.log(`Gabarito ${f}: [${gabarito.join(',')}]`);

    // Remove 't' property for frontend
    let cleanItems = JSON.stringify(itemsObj.map(i => ({ id: i.id, x: i.x, y: i.y })));
    let cleanRaw = raw.replace(match[0], `"items": ${cleanItems}`);

    let newFinish = `                async finishTest() {
                    clearInterval(this.timer);
                    this.audio = document.getElementById('time-up-audio');
                    
                    const btn = document.querySelector('button[@click="finishTest()"]');
                    if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                    const markedItems = this.grid.filter(item => item.marked).map(item => item.id);
                    const annulledItems = this.grid.filter(item => item.annulled).map(item => item.id);

                    const payload = {
                        tipo: '${f.replace('.html', '')}',
                        marks: markedItems,
                        annulled: annulledItems,
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
                            this.grid.forEach((item, index) => {
                                item.isTarget = gabarito.includes(item.id);
                            });

                            this.state = 'results';
                            window.scrollTo(0, 0);

                            const meta = result.meta || 32;
                            if (this.results.score >= meta) { 
                                const duration = 3000;
                                const end = Date.now() + duration;

                                (function frame() {
                                    confetti({
                                        particleCount: 5,
                                        angle: 60,
                                        spread: 55,
                                        origin: { x: 0 },
                                        colors: ['#9f54ff', '#ff00ff', '#00c2ff']
                                    });
                                    confetti({
                                        particleCount: 5,
                                        angle: 120,
                                        spread: 55,
                                        origin: { x: 1 },
                                        colors: ['#9f54ff', '#ff00ff', '#00c2ff']
                                    });

                                    if (Date.now() < end) {
                                        requestAnimationFrame(frame);
                                    }
                                }());
                            } else { 
                                document.body.classList.add('shake-screen'); 
                                setTimeout(() => document.body.classList.remove('shake-screen'), 500);
                                if(this.audio) this.audio.play().catch(e => console.log('Áudio final erro'));
                            }
                            
                            if (typeof this.saveHistory === 'function') {
                                this.saveHistory(this.results);
                            } else {
                                this.saveHistory();
                            }
                        } else {
                            alert("Erro na correção: " + result.erro);
                            if(btn) btn.innerHTML = '<i class="fas fa-stop"></i>';
                        }
                    } catch (e) {
                        alert("Erro de conexão: " + e.message);
                        if(btn) btn.innerHTML = '<i class="fas fa-stop"></i>';
                    }
                },`;

    const startRegex = /finishTest\(\)\s*\{/;
    let splitStart = cleanRaw.split(startRegex);
    if (splitStart.length === 2) {
        let splitEnd = splitStart[1].split('showVisualReview() {');
        if (splitEnd.length === 2) {
            cleanRaw = splitStart[0] + newFinish + "\n\n                showVisualReview() {" + splitEnd[1];
            fs.writeFileSync(path.join(bpath, f), cleanRaw, 'utf8');
            console.log(`Cleaned and integrated ${f}`);
        }
    }
} else {
    console.log("No config items matched.");
}
