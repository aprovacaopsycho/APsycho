
$basePath = "c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base"

$filesConfig = @(
    @{ file = "r1.html";      total = 40; comment = "<!-- Removed Bottom Options as per request -->" },
    @{ file = "beta3m.html";  total = 25; comment = $null },
    @{ file = "tri.html";     total = 15; comment = $null },
    @{ file = "trl.html";     total = 15; comment = $null },
    @{ file = "g36.html";     total = 36; comment = $null },
    @{ file = "cubos.html";   total = 15; comment = $null },
    @{ file = "wmt2.html";    total = 18; comment = $null },
    @{ file = "tig_nv.html";  total = 30; comment = $null }
)

$mobileButtonsTemplate = @"
                        <!-- BOTÕES DE RESPOSTA MOBILE (dentro do card, só em mobile) -->
                        <div class="lg:hidden w-full mt-4 mb-2">
                            <div class="mb-2 flex items-center justify-between">
                                <span class="text-xs text-gray-400 uppercase tracking-wider font-bold">Sua resposta — Questão <span x-text="currentQuestion"></span></span>
                                <span class="text-xs text-gray-500" x-text="userAnswers[currentQuestion] ? 'Marcada: ' + userAnswers[currentQuestion] : 'Não marcada'"></span>
                            </div>
                            <div class="grid grid-cols-6 gap-2">
                                <template x-for="opt in options" :key="opt">
                                    <button @click="selectAnswer(currentQuestion, opt, `$`event)"
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

"@

foreach ($cfg in $filesConfig) {
    $filePath = Join-Path $basePath $cfg.file
    
    # Read UTF-8 correctly
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

    if ($content -match "BOTÕES DE RESPOSTA MOBILE") {
        Write-Host "SKIP: $($cfg.file) já tem botões mobile." -ForegroundColor Yellow
        continue
    }

    # Find anchor position
    $anchorIdx = $content.IndexOf("<!-- Botão Navigation")
    if ($anchorIdx -eq -1) {
        $anchorIdx = $content.IndexOf("<!-- Botão Próximo")
    }
    
    if ($anchorIdx -eq -1) {
        Write-Host "ERRO: Anchor não encontrado em $($cfg.file)" -ForegroundColor Red
        continue
    }

    # Insert buttons before the anchor line
    $lineStart = $content.LastIndexOf("`n", $anchorIdx)
    if ($lineStart -eq -1) { $lineStart = $anchorIdx }
    
    $newContent = $content.Substring(0, $lineStart) + "`n" + $mobileButtonsTemplate + $content.Substring($lineStart)

    # Remove the old mobile panel injected by the previous script
    $pattern1 = '(?s)\s*<!-- GABARITO MOBILE \(visivel apenas em mobile/tablet\) -->.*?</div>\s*</div>\s*<!-- fim AREA DO TESTE -->'
    $pattern2 = '(?s)\s*<!-- GABARITO MOBILE \(visivel apenas em mobile/tablet\) -->.*?</details>\s*</div>\s*'
    
    $newContent = [regex]::Replace($newContent, $pattern1, "`n                </div>`n                <!-- fim AREA DO TESTE -->")
    $newContent = [regex]::Replace($newContent, $pattern2, "`n")

    [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "OK: $($cfg.file) corrigido!" -ForegroundColor Green
}
Write-Host "Concluído!"
