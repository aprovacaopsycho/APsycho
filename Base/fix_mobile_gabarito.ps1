
# Script para adicionar gabarito mobile em todos os testes de inteligência
# Cada arquivo tem total de questões e opções diferentes

$basePath = "c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base"

# Configurações de cada arquivo: [arquivo, total, disabled]
# disabled = se o gabarito desktop usa :disabled (impede re-marcação)
$configs = @(
    @{ file = "r1.html";      total = 40; disabled = $true  },
    @{ file = "beta3m.html";  total = 25; disabled = $false },
    @{ file = "tri.html";     total = 15; disabled = $false },
    @{ file = "trl.html";     total = 15; disabled = $false },
    @{ file = "g36.html";     total = 36; disabled = $false },
    @{ file = "cubos.html";   total = 15; disabled = $false },
    @{ file = "wmt2.html";    total = 18; disabled = $false },
    @{ file = "tig_nv.html";  total = 30; disabled = $false }
)

# Bloco de gabarito mobile a inserir (template genérico)
# Usa as variáveis Alpine.js do contexto de cada arquivo
function Get-MobileGabaritoBlock($total) {
    return @"

                    <!-- GABARITO MOBILE (visivel apenas em mobile/tablet) -->
                    <div class="block lg:hidden glass-panel p-4 rounded-2xl border border-white/10" x-show="currentQuestion > 0 && !finished" x-transition>
                        <details class="group" open>
                            <summary class="flex items-center justify-between cursor-pointer list-none select-none">
                                <h3 class="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <i class="fas fa-list-ol text-purple-400"></i> Gabarito
                                    <span class="text-xs text-gray-500 font-normal normal-case tracking-normal" x-text="Object.keys(userAnswers).length + '/$total marcadas'"></span>
                                </h3>
                                <i class="fas fa-chevron-down text-gray-400 transition-transform duration-300 group-open:rotate-180"></i>
                            </summary>

                            <div class="mt-4">
                                <!-- Barra de progresso -->
                                <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-4">
                                    <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                                        :style="`width: `$`{(Object.keys(userAnswers).length / $total) * 100}`%`"></div>
                                </div>

                                <!-- Grade de questoes compacta -->
                                <div class="space-y-1.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                                    <template x-for="q in $total" :key="q">
                                        <div class="flex items-center gap-2 p-1.5 rounded-lg transition hover:bg-white/5 border border-transparent"
                                            :class="currentQuestion === q ? 'bg-white/5 border-purple-500/30' : ''">

                                            <!-- Numero da questao (clicavel para pular) -->
                                            <button @click="jumpToQuestion(q)"
                                                class="w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold flex-shrink-0 transition-colors"
                                                :class="currentQuestion === q ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-400 bg-white/5 hover:text-white'">
                                                <span x-text="q"></span>
                                            </button>

                                            <!-- Opcoes de resposta -->
                                            <div class="flex items-center gap-1 flex-grow justify-end flex-wrap">
                                                <template x-for="opt in options" :key="opt">
                                                    <button @click="selectAnswer(q, opt, `$`event)"
                                                        class="w-6 h-6 rounded-full text-[9px] font-bold border flex items-center justify-center transition-all"
                                                        :class="{
                                                            'bg-purple-500 border-purple-400 text-white shadow-[0_0_6px_rgba(168,85,247,0.4)] scale-110': userAnswers[q] === opt,
                                                            'border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300 hover:bg-white/5': userAnswers[q] !== opt && !userAnswers[q],
                                                            'border-white/5 text-gray-700 opacity-40': userAnswers[q] && userAnswers[q] !== opt
                                                        }">
                                                        <span x-text="opt"></span>
                                                    </button>
                                                </template>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </details>
                    </div>

"@
}

$anchor = "                <!-- TELA DE RESULTADOS -->"

foreach ($cfg in $configs) {
    $filePath = Join-Path $basePath $cfg.file
    $content = Get-Content $filePath -Raw -Encoding UTF8
    
    # Verificar se ja foi corrigido
    if ($content -match "GABARITO MOBILE") {
        Write-Host "SKIP: $($cfg.file) ja possui gabarito mobile." -ForegroundColor Yellow
        continue
    }
    
    $mobileBlock = Get-MobileGabaritoBlock $cfg.total
    
    # Inserir o bloco ANTES do comentario TELA DE RESULTADOS
    $newContent = $content.Replace($anchor, $mobileBlock + $anchor)
    
    if ($newContent -eq $content) {
        Write-Host "ERRO: Anchor nao encontrado em $($cfg.file)" -ForegroundColor Red
    } else {
        [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "OK: $($cfg.file) corrigido!" -ForegroundColor Green
    }
}

Write-Host "`nConcluido!" -ForegroundColor Cyan
