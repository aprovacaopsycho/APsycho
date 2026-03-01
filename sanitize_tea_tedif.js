const fs = require('fs');
const path = require('path');

const baseTEA = 'c:/Users/NATHAN/OneDrive/ANTIGOS/Documentos/GitHub/APsycho/Base/';
const teaFiles = ['teaco/teaco.html', 'teadi/teadi.html', 'tealt/tealt.html'];
const tedifFiles = ['tedif/tedif1.html', 'tedif/tedif2.html'];
const allFiles = [...teaFiles, ...tedifFiles];

let collectedGabs = [];

allFiles.forEach(fPath => {
    const fullPath = path.join(baseTEA, fPath);
    if (!fs.existsSync(fullPath)) return;

    let raw = fs.readFileSync(fullPath, 'utf8');
    const fName = path.basename(fPath);

    // Match config object with multiline items array
    const match = raw.match(/"items":\s*\[[\s\S]*?\]/);
    if (match) {
        const itemsStr = `{${match[0]}}`;
        const itemsObj = JSON.parse(itemsStr).items;

        const gabarito = itemsObj.filter(i => i.t === 1).map(i => i.id);
        collectedGabs.push(`Gabarito ${fName}: [${gabarito.join(',')}]`);

        // Remove 't' property for frontend
        let cleanItems = JSON.stringify(itemsObj.map(i => ({ id: i.id, x: i.x, y: i.y })));
        let cleanRaw = raw.replace(match[0], `"items": ${cleanItems}`);

        // Format payload type replacing html
        const testType = fName.replace('.html', '');

        // Add new finishTest block
        let newFinish = `                async finishTest() {
                    clearInterval(this.timer);
                    this.audio = document.getElementById('time-up-audio');
                    
                    const btn = document.querySelector('button[@click="finishTest()"]');
                    if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                    const markedItems = this.grid.filter(item => item.marked).map(item => item.id);
                    const annulledItems = this.grid.filter(item => item.annulled).map(item => item.id);

                    const payload = {
                        tipo: '${testType}',
                        marks: markedItems,
                        annulled: annulledItems,
                        lastSelectedIndex: this.lastSelectedIndex !== undefined ? this.lastSelectedIndex : -1
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

                            const meta = result.meta || 50; // default meta fallback
                            if (result.status === 'APTO' || this.results.score >= meta) { 
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
                            } else if (typeof this.saveHistory !== 'undefined') {
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
        if (splitStart.length >= 2) {
            // we will replace everything from finishTest to showVisualReview() or formatTime()
            let part1 = cleanRaw.substring(0, cleanRaw.indexOf('finishTest() {'));

            // Try to find the next function to preserve rest of the file
            let nextFuncIndex = cleanRaw.indexOf('showVisualReview() {', cleanRaw.indexOf('finishTest() {'));
            if (nextFuncIndex === -1) {
                nextFuncIndex = cleanRaw.indexOf('formatTime(seconds) {', cleanRaw.indexOf('finishTest() {'));
            }
            if (nextFuncIndex === -1 && cleanRaw.indexOf('saveHistory(result) {') !== -1) {
                nextFuncIndex = cleanRaw.indexOf('saveHistory(result) {', cleanRaw.indexOf('finishTest() {'));
            }
            if (nextFuncIndex !== -1) {
                let part2 = cleanRaw.substring(nextFuncIndex);
                cleanRaw = part1 + newFinish + "\n\n                " + part2;
                fs.writeFileSync(fullPath, cleanRaw, 'utf8');
                console.log(`Cleaned and integrated frontend for ${fName}`);
            } else {
                console.log(`Couldn't find natural ending for ${fName}`);
            }
        }
    } else {
        console.log(`No items array match found in ${fName}`);
    }
});

fs.writeFileSync('c:/Users/NATHAN/OneDrive/ANTIGOS/Documentos/GitHub/APsycho/tea_tedif_gabs.txt', collectedGabs.join('\n'));
console.log('Done mapping.');
