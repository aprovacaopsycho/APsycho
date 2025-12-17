const fs = require('fs');
const path = require('path');

const sourcePath = 'rotac.html';
const destPath = 'rotac_debug.html';

console.log('Reading source file...');
const content = fs.readFileSync(sourcePath, 'utf8');

// Extract config
// Look for "config: {" and "state: 'instructions'"
const startMarker = "config: {";
const endMarker = "state: 'instructions'";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

let configBlock = content.substring(startIndex, endIndex);
// Remove anything after the last "},"
// This is to safely close the object if comments or newlines are captured
const lastBraceIndex = configBlock.lastIndexOf("},");
if (lastBraceIndex !== -1) {
    configBlock = configBlock.substring(0, lastBraceIndex + 2);
}

console.log('Config block extracted.');

const template = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Rota C - DEBUG MODE</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/cdn.min.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background-color: #100f1c; color: white; font-family: sans-serif; }
        .responsive-paper {
            position: relative;
            width: 100%;
            max-width: 1000px;
            aspect-ratio: 1000 / 1250;
            margin: 0 auto;
            background-image: url('rotac.png');
            background-size: 100% 100%;
            box-shadow: 0 0 30px rgba(0,0,0,0.5);
        }
        .hit-zone {
            position: absolute;
            cursor: pointer;
            border: 1px dotted rgba(255, 255, 255, 0.2);
            transition: all 0.1s;
        }
        .debug-correct {
            background-color: rgba(34, 197, 94, 0.5);
            border: 2px solid #22c55e;
        }
        .debug-incorrect {
            background-color: rgba(239, 68, 68, 0.5);
            border: 2px solid #ef4444;
        }
        .hit-zone:hover::after {
            content: attr(data-id);
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            background: black;
            color: white;
            font-size: 10px;
            padding: 2px 4px;
            border-radius: 4px;
            white-space: nowrap;
            z-index: 50;
            pointer-events: none;
        }
        [x-cloak] { display: none; }
    </style>
</head>
<body x-data="debugSim()" class="min-h-screen flex flex-col items-center">

    <div class="fixed top-4 right-4 bg-gray-900/90 backdrop-blur p-4 rounded-xl shadow-2xl z-[100] w-96 border border-gray-700">
        <h2 class="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
            <i class="fas fa-tools"></i> Debug Tool
        </h2>
        
        <div class="mb-4 bg-black/40 p-3 rounded-lg">
            <p class="text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">Legenda</p>
            <div class="flex gap-4 text-sm font-medium">
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-green-500/50 border border-green-500 rounded"></div> 
                    <span>Correto (1)</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-red-500/50 border border-red-500 rounded"></div> 
                    <span>Incorreto (0)</span>
                </div>
            </div>
        </div>

        <div class="space-y-3">
            <button @click="generateJSON()" class="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 font-bold transition flex items-center justify-center gap-2">
                <i class="fas fa-code"></i> Gerar JSON
            </button>
            
            <div class="relative">
                <textarea x-model="jsonOutput" class="w-full h-32 bg-black text-[10px] font-mono text-green-400 p-2 rounded-lg border border-gray-700 focus:border-blue-500 outline-none resize-none" readonly placeholder="Clique em Gerar JSON..."></textarea>
                <button @click="copyJSON()" x-show="jsonOutput" class="absolute bottom-2 right-2 bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1 text-xs transition">
                    <i class="fas fa-copy"></i> Copiar
                </button>
            </div>
        </div>
        
         <div class="mt-4 border-t border-gray-700 pt-3 grid grid-cols-2 gap-2 text-center">
            <div class="bg-black/40 p-2 rounded">
                <div class="text-[10px] text-gray-500 uppercase">Total</div>
                <div class="font-mono text-white" x-text="config.items.length"></div>
            </div>
            <div class="bg-black/40 p-2 rounded">
                <div class="text-[10px] text-gray-500 uppercase">Corretos</div>
                <div class="font-mono text-green-400" x-text="config.items.filter(i => i.t === 1).length"></div>
            </div>
        </div>
        <div class="mt-2 text-[10px] text-gray-600 text-center">
            Clique nos quadrados na imagem para editar.
        </div>
    </div>

    <div class="p-8 pb-32 w-full flex justify-center overflow-auto">
        <div class="responsive-paper">
            <template x-for="item in config.items" :key="item.id">
                <div @click="toggleType(item)" 
                     class="hit-zone"
                     :class="item.t === 1 ? 'debug-correct' : 'debug-incorrect'"
                     :data-id="item.id"
                     :style="\`
                        left: \${getPos(item.x, config.imgWidth)}%; 
                        top: \${getPos(item.y, config.imgHeight)}%; 
                        width: \${getPos(config.boxW, config.imgWidth)}%; 
                        height: \${getPos(config.boxH, config.imgHeight)}%;
                     \`">
                </div>
            </template>
        </div>
    </div>

    <script>
        document.addEventListener('alpine:init', () => {
            Alpine.data('debugSim', () => ({
                PLACEHOLDER_CONFIG,
                
                jsonOutput: '',

                toggleType(item) {
                    item.t = item.t === 1 ? 0 : 1;
                },

                getPos(val, total) {
                    if (!total || total === 0) return 0;
                    return (val / total) * 100;
                },

                generateJSON() {
                     // Generate just the items array to be pasted back into the config
                     const itemsJson = JSON.stringify(this.config.items);
                     this.jsonOutput = itemsJson;
                },

                copyJSON() {
                    navigator.clipboard.writeText(this.jsonOutput);
                    alert('JSON copiado!');
                }
            }));
        });
    </script>
</body>
</html>
`;

console.log('Replacing placeholder...');
const finalHtml = template.replace('PLACEHOLDER_CONFIG', configBlock);

console.log('Writing target file...');
fs.writeFileSync(destPath, finalHtml, 'utf8');
console.log('Debug file created successfully at ' + destPath);
