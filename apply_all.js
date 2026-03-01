const fs = require('fs');

let backendContent = fs.readFileSync('backend-google.js', 'utf8');

try {
    const teconPatch = fs.readFileSync('sanitize_tecon2.js', 'utf8').split('var TECON_GABARITOS')[1];
    if (teconPatch && !backendContent.includes('TECON_GABARITOS')) backendContent += '\nvar TECON_GABARITOS' + teconPatch;

    const bpaPatch = fs.readFileSync('sanitize_bpa2.js', 'utf8').split('var BPA_CONFIG')[1];
    if (bpaPatch && !backendContent.includes('BPA_CONFIG')) backendContent += '\nvar BPA_CONFIG' + bpaPatch;

    const ctaPatch = fs.readFileSync('sanitize_cta2.js', 'utf8').split('var CTA_CONFIG')[1];
    if (ctaPatch && !backendContent.includes('CTA_CONFIG')) backendContent += '\nvar CTA_CONFIG' + ctaPatch;

    const routerCases = `
            case 'tecon1': resultado = corrigirTECON(1, respostas, dados.annulled, dados.lastSelectedIndex); break;
            case 'tecon2': resultado = corrigirTECON(2, respostas, dados.annulled, dados.lastSelectedIndex); break;
            case 'tecon3': resultado = corrigirTECON(3, respostas, dados.annulled, dados.lastSelectedIndex); break;
            case 'bpa_aa': resultado = corrigirBPA('aa', respostas, dados.annulled, dados.lastSelectedIndex); break;
            case 'bpa_ac': resultado = corrigirBPA('ac', respostas, dados.annulled, dados.lastSelectedIndex); break;
            case 'bpa_ad': resultado = corrigirBPA('ad', respostas, dados.annulled, dados.lastSelectedIndex); break;
            case 'cta_aa': resultado = corrigirCTA('aa', respostas, dados.annulled, dados.lastSelectedIndex); break;
            case 'cta_ac': resultado = corrigirCTA('ac', respostas, dados.annulled, dados.lastSelectedIndex); break;
            case 'cta_ad': resultado = corrigirCTA('ad', respostas, dados.annulled, dados.lastSelectedIndex); break;
`;
    if (!backendContent.includes("case 'tecon1'")) {
        backendContent = backendContent.replace("case 'esavib':", routerCases.trim() + "\n            case 'esavib':");
    }
    fs.writeFileSync('backend-google.js', backendContent, 'utf8');
    console.log("Backend patched successfully!");
} catch (e) { console.log('Error patching backend:', e.message); }

const filesToStrip = [
    'Base/tecon/tecon1.html', 'Base/tecon/tecon2.html', 'Base/tecon/tecon3.html',
    'Base/cta/ctaac.html', 'Base/tem-r/tem_r_2.html', 'Base/tmr.html', 'Base/tspdimensoes/tsp3.html'
];
filesToStrip.forEach(f => {
    try {
        let content = fs.readFileSync(f, 'utf8');
        content = content.replace(/,\s*"t"\s*:\s*[012]/g, '');
        content = content.replace(/"t"\s*:\s*[012]\s*,/g, '');
        fs.writeFileSync(f, content, 'utf8');
        console.log("Stripped t values from", f);
    } catch (e) { }
});

// Update TECON finishTest
[1, 2, 3].forEach(n => {
    try {
        const file = `Base/tecon/tecon${n}.html`;
        let code = fs.readFileSync(file, 'utf8');
        if (!code.includes('async finishTest')) {
            const newFinish = `async finishTest() {
                    clearInterval(this.timer);
                    if(this.audio && this.audio.finish) this.audio.finish.play().catch(e=>e);
                    
                    const btn = document.querySelector('button[@click="finishTest()"]');
                    if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                    const payload = { tipo: 'tecon${n}', respostas: this.marks||[], annulled: this.annulled||[], lastSelectedIndex: this.lastSelectedIndex };
                    
                    try {
                        const response = await fetch("https://script.google.com/macros/s/AKfycbwv_7pDuo521IyFsknbLWTH-idXaZCw0XN2nlq9pHGKjNDs8kklgaF8avm6tqLbaQkR1w/exec", {
                            method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload)
                        });
                        const result = await response.json();
                        if(result.sucesso) {
                            this.results = { hits: result.hits, errors: result.errors, omissions: result.omissions, score: result.pontuacao };
                            const gab = result.gabarito || [];
                            this.config.items.forEach(i => i.t = gab.includes(i.id) ? 1 : 0);
                            this.state = 'results';
                            window.scrollTo(0, 0);
                            if(this.results.score >= 96 && typeof this.triggerConfetti === 'function') this.triggerConfetti();
                            else if(this.results.score < 96) { document.body.classList.add('shake-screen'); setTimeout(() => document.body.classList.remove('shake-screen'), 500); }
                            if(typeof this.saveHistory === 'function') this.saveHistory();
                        } else { alert("Erro: " + result.erro); if(btn) btn.innerHTML = 'FINALIZAR'; }
                    } catch(e) { alert("Erro conexão: " + e.message); if(btn) btn.innerHTML = 'FINALIZAR'; }
                },`;
            code = code.replace(/finishTest\(\)\s*\{[\s\S]*?this\.saveHistory.*?;\s*\}/, newFinish);
            fs.writeFileSync(file, code, 'utf8');
        }
    } catch (e) { }
});

// Update CTAAC finishTest
try {
    const file = 'Base/cta/ctaac.html';
    let code = fs.readFileSync(file, 'utf8');
    if (!code.includes('async finishTest')) {
        const newFinish = `async finishTest() {
                    clearInterval(this.timer);
                    let myMarks = []; let myAnnulled = [];
                    this.grid.forEach((c, idx) => { if(c.marked) myMarks.push(idx); if(c.annulled) myAnnulled.push(idx); });
                    const payload = { tipo: 'cta_ac', respostas: myMarks, annulled: myAnnulled, lastSelectedIndex: this.lastSelectedIndex };
                    try {
                        const response = await fetch("https://script.google.com/macros/s/AKfycbwv_7pDuo521IyFsknbLWTH-idXaZCw0XN2nlq9pHGKjNDs8kklgaF8avm6tqLbaQkR1w/exec", {
                            method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload)
                        });
                        const result = await response.json();
                        if(result.sucesso) {
                            this.results = { hits: result.hits, errors: result.errors, omissions: result.omissions, score: result.pontuacao };
                            const gab = result.gabarito || [];
                            this.grid.forEach(c => c.isTarget = gab.includes(c.id));
                            this.state = 'results';
                            window.scrollTo(0, 0);
                            if(this.results.score >= 32 && typeof confetti === 'function') confetti();
                            this.saveHistory();
                        }
                    } catch(e) { alert("Erro conexão: " + e.message); }
                },`;
        code = code.replace(/finishTest\(\)\s*\{[\s\S]*?this\.saveHistory.*?;\s*\}/, newFinish);
        fs.writeFileSync(file, code, 'utf8');
    }
} catch (e) { }

// Update TEM_R_2 finishTest
try {
    const file = 'Base/tem-r/tem_r_2.html';
    let code = fs.readFileSync(file, 'utf8');
    if (!code.includes('async finishTest')) {
        const newFinish = `async finishTest() {
                    clearInterval(this.timer);
                    const payload = { tipo: 'tem_r_2', respostas: this.marks || {}, annulled: {}, lastSelectedIndex: -1 };
                    try {
                        const response = await fetch("https://script.google.com/macros/s/AKfycbwv_7pDuo521IyFsknbLWTH-idXaZCw0XN2nlq9pHGKjNDs8kklgaF8avm6tqLbaQkR1w/exec", {
                            method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload)
                        });
                        const result = await response.json();
                        if(result.sucesso) {
                            this.results = { hitsScore: result.hitsScore !== undefined ? result.hitsScore : result.pontuacao, errorsCount: result.errorsCount !== undefined ? result.errorsCount : result.errors, penalty: result.penalty !== undefined ? result.penalty : 0, totalScore: result.pontuacao };
                            if (result.gabarito) { this.config.items.forEach(i => i.t = result.gabarito[i.id] !== undefined ? result.gabarito[i.id] : (result.gabarito.includes(i.id) ? 1 : 0)); }
                            this.state = 'results';
                            window.scrollTo(0, 0);
                            if(this.results.totalScore >= 26 && typeof confetti === 'function') confetti();
                            this.saveHistory();
                        }
                    } catch(e) { alert("Erro conexão: " + e.message); }
                },`;
        code = code.replace(/finishTest\(\)\s*\{[\s\S]*?this\.saveHistory.*?;\s*\}/, newFinish);
        fs.writeFileSync(file, code, 'utf8');
    }
} catch (e) { }
console.log("All patches complete!");
