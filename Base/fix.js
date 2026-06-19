const fs = require('fs');
const path = require('path');

const basePath = `c:\\Users\\NATHAN\\OneDrive\\ANTIGOS\\Documentos\\GitHub\\APsycho\\Base`;

const filesConfig = [
    { file: "r1.html", total: 40 }
];

const mobileButtonsTemplate = `
                        <!-- BOTÕES DE RESPOSTA MOBILE (dentro do card, só em mobile) -->
                        <div class="lg:hidden w-full mt-4 mb-2">
                            <div class="mb-2 flex items-center justify-between">
                                <span class="text-xs text-gray-400 uppercase tracking-wider font-bold">Sua resposta — Questão <span x-text="currentQuestion"></span></span>
                                <span class="text-xs text-gray-500" x-text="userAnswers[currentQuestion] ? 'Marcada: ' + userAnswers[currentQuestion] : 'Não marcada'"></span>
                            </div>
                            <div class="grid grid-cols-4 gap-2">
                                <template x-for="opt in options" :key="opt">
                                    <button @click="selectAnswer(currentQuestion, opt, $event)"
                                        class="py-2 rounded-lg text-sm font-black border flex items-center justify-center transition-all active:scale-95"
                                        :class="{
                                            'bg-purple-500 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]': userAnswers[currentQuestion] === opt,
                                            'border-white/20 text-gray-300 bg-white/5 hover:bg-white/10 hover:border-purple-400': userAnswers[currentQuestion] !== opt && !userAnswers[currentQuestion],
                                            'border-white/5 text-gray-600 opacity-50': userAnswers[currentQuestion] && userAnswers[currentQuestion] !== opt
                                        }">
                                        <span x-text="opt"></span>
                                    </button>
                                </template>
                            </div>
                        </div>
`;

filesConfig.forEach(cfg => {
    const filePath = path.join(basePath, cfg.file);
    let content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes('BOTÕES DE RESPOSTA MOBILE')) {
        console.log(`SKIP: ${cfg.file}`);
        return;
    }

    let anchorIdx = content.indexOf('<!-- Botão Navigation');
    if (anchorIdx === -1) {
        anchorIdx = content.indexOf('<!-- Botão Próximo');
    }

    if (anchorIdx === -1) {
        console.log(`ERRO: Anchor não encontrado em ${cfg.file}`);
        return;
    }

    const lineStart = content.lastIndexOf('\n', anchorIdx);
    
    // Inserir os botões no lugar certo
    content = content.slice(0, lineStart) + '\n' + mobileButtonsTemplate + content.slice(lineStart);

    const regexFullPanel = /\s*<!-- GABARITO MOBILE \(visivel apenas em mobile\/tablet\) -->[\s\S]*?<\/details>\s*<\/div>/g;
    content = content.replace(regexFullPanel, '');
    
    const regexFullPanel2 = /\s*<!-- GABARITO MOBILE \(visivel apenas em mobile\/tablet\) -->[\s\S]*?<\/div>\s*<\/div>\s*<!-- fim AREA DO TESTE -->/g;
    content = content.replace(regexFullPanel2, '\n                </div>\n                <!-- fim AREA DO TESTE -->');

    const regexFullPanel3 = /\s*<!-- GABARITO MOBILE \(visivel apenas em mobile\/tablet\) -->[\s\S]*?(?=<!-- TELA DE RESULTADOS -->)/g;
    content = content.replace(regexFullPanel3, '\n                </div>\n                ');

    const regexStrayPanel = /<div class="block lg:hidden glass-panel.*?x-transition>\s*<\/div>/g;
    content = content.replace(regexStrayPanel, '');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`OK: ${cfg.file} corrigido`);
});
