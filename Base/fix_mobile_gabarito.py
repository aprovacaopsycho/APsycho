
import os
import re

base_path = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base"

files_config = [
    {"file": "r1.html", "total": 40},
    {"file": "beta3m.html", "total": 25},
    {"file": "tri.html", "total": 15},
    {"file": "trl.html", "total": 15},
    {"file": "g36.html", "total": 36},
    {"file": "cubos.html", "total": 15},
    {"file": "wmt2.html", "total": 18},
    {"file": "tig_nv.html", "total": 30}
]

mobile_buttons_template = """
                        <!-- BOTÕES DE RESPOSTA MOBILE (dentro do card, só em mobile) -->
                        <div class="lg:hidden w-full mt-4 mb-2">
                            <div class="mb-2 flex items-center justify-between">
                                <span class="text-xs text-gray-400 uppercase tracking-wider font-bold">Sua resposta — Questão <span x-text="currentQuestion"></span></span>
                                <span class="text-xs text-gray-500" x-text="userAnswers[currentQuestion] ? 'Marcada: ' + userAnswers[currentQuestion] : 'Não marcada'"></span>
                            </div>
                            <div class="grid grid-cols-6 gap-2">
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
"""

for cfg in files_config:
    file_path = os.path.join(base_path, cfg['file'])
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if "BOTÕES DE RESPOSTA MOBILE" in content:
        print(f"SKIP: {cfg['file']} já tem botões mobile.")
        continue

    # Achar "Botão Navigation" ou "Botão Próximo"
    anchor_idx = content.find("<!-- Botão Navigation")
    if anchor_idx == -1:
        anchor_idx = content.find("<!-- Botão Próximo")
        
    if anchor_idx == -1:
        print(f"ERRO: Anchor não encontrado em {cfg['file']}")
        continue

    # Encontrar o início da linha
    line_start = content.rfind("\n", 0, anchor_idx)
    
    # Inserir botões
    new_content = content[:line_start] + mobile_buttons_template + content[line_start:]

    # Remover o antigo GABARITO MOBILE que foi colocado entre "fim AREA DO TESTE" e "TELA DE RESULTADOS"
    pattern1 = r'\s*<!-- GABARITO MOBILE \(visivel apenas em mobile/tablet\) -->.*?</div>\s*</div>\s*<!-- fim AREA DO TESTE -->'
    # Nosso script anterior colocou entre <!-- Botão Próximo/Navigation ... e <!-- TELA DE RESULTADOS -->
    # O painel começava com <!-- GABARITO MOBILE (visivel apenas em mobile/tablet) --> e terminava com </details></div>
    
    # Vamos usar regex pra extrair a div lg:hidden do gabarito mobile antigo
    pattern_old_panel = r'(?s)\s*<!-- GABARITO MOBILE \(visivel apenas em mobile/tablet\) -->.*?</div>\s*(?=</div>\s*<!-- (?:fim )?AREA DO TESTE|(?:<!-- )?TELA DE RESULTADOS)'
    new_content = re.sub(pattern_old_panel, '', new_content)

    # Remover também qualquer tag <details class="group" open> solta que tenha sobrado
    new_content = re.sub(r'(?s)\s*<!-- GABARITO MOBILE \(visivel apenas em mobile/tablet\) -->.*?</details>\s*</div>\s*', '\n', new_content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"OK: {cfg['file']} corrigido!")

