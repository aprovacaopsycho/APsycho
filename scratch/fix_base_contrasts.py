import os
import re

BASE_DIR = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base"

def fix_file_content(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    rel_path = os.path.relpath(filepath, BASE_DIR)

    # 1. Fix .scale-option input:checked+div selection background and text color
    # Replace background: rgba(159, 84, 255, 0.2); with solid var(--primary-purple) for high contrast
    scale_opt_pattern = re.compile(
        r'\.scale-option\s+input:checked\+div\s*\{\s*background:\s*rgba\(159,\s*84,\s*255,\s*0\.2\);(.*?color:\s*white;.*?)\}',
        re.DOTALL
    )
    if scale_opt_pattern.search(content):
        content = scale_opt_pattern.sub(
            lambda m: f".scale-option input:checked+div {{\n            background: var(--primary-purple);\n            border-color: var(--primary-purple);\n            color: white;\n            box-shadow: 0 0 15px rgba(30, 64, 175, 0.4);\n            transform: scale(1.05);\n        }}",
            content
        )

    # 2. Fix .neon-text color inside style tag from white to var(--primary-purple)
    neon_text_pattern = re.compile(
        r'\.neon-text\s*\{\s*color:\s*#fff;\s*text-shadow:\s*0\s*0\s*5px\s*rgba\(255,\s*255,\s*255,\s*0\.5\),\s*0\s*0\s*10px\s*var\(--primary-purple\);\s*\}',
        re.DOTALL
    )
    if neon_text_pattern.search(content):
        content = neon_text_pattern.sub(
            ".neon-text {\n            color: var(--primary-purple);\n            text-shadow: none;\n        }",
            content
        )

    # 3. Fix timer class additions inside Javascript updateTimerDisplay()
    # (a) replace: el.classList.add('text-white') and remove('text-white')
    content = content.replace("el.classList.add('text-white')", "el.classList.add('text-slate-800')")
    content = content.replace("el.classList.remove('text-white')", "el.classList.remove('text-slate-800')")
    
    # (b) replace: display.className = "... text-white ..." and pill.className = "... border-white/20 bg-white/90 ..."
    # We want text-slate-800 instead of text-white, and border-slate-200 instead of border-white/20
    content = content.replace("text-white tabular-nums leading-none", "text-slate-800 tabular-nums leading-none")
    content = content.replace("border-white/20 bg-white/90", "border-slate-200 bg-white/90")
    content = content.replace("text-red-400 animate-pulse tabular-nums leading-none", "text-red-600 animate-pulse tabular-nums leading-none")
    content = content.replace("border-red-500 bg-red-900/40", "border-red-500 bg-red-50/90")

    # 4. Fix typed words correct/wrong list colors (e.g. text-green-300 -> text-green-800, text-red-300 -> text-red-800)
    # Correct list in results
    content = content.replace("bg-green-500/20 text-green-300", "bg-green-500/10 text-green-800 font-bold")
    content = content.replace("bg-green-500/10 border-green-500/30 text-green-300", "bg-green-500/10 border-green-500/30 text-green-800 font-bold")
    
    # Wrong list in results
    content = content.replace("bg-red-500/10 text-red-300", "bg-red-500/10 text-red-800 font-bold")
    content = content.replace("bg-red-500/20 text-red-300", "bg-red-500/10 text-red-800 font-bold")
    content = content.replace("bg-red-500/10 border-red-500/30 text-red-300", "bg-red-500/10 border-red-500/30 text-red-800 font-bold")

    # 5. Fix lessons header hover color & lesson header collapse title color
    # background: var(--bg-card); and color: white;
    content = content.replace("--header-hover: #2a2938;", "--header-hover: #F1F5F9;")
    content = content.replace(".lesson-info h3 {\n            color: white;", ".lesson-info h3 {\n            color: #1e293b;")
    content = content.replace("background: rgba(0, 0, 0, 0.2);", "background: rgba(0, 0, 0, 0.02);")
    content = content.replace("color:#a0a0a0", "color:#1e293b")
    content = content.replace("style=\"color:#ff00ff;text-shadow:0 0 8px #ff00ff\"", "style=\"color:#2563eb\"")
    content = content.replace("text-[#ff00ff]", "text-[#2563eb]")
    content = content.replace("border-[#9f54ff]", "border-slate-200")
    content = content.replace("shadow-[0_0_10px_rgba(159,84,255,0.3)]", "shadow-sm")

    # 6. Specific fix for banco_testes.html (making it a clean light theme)
    if file_is_banco_testes(filepath):
        content = content.replace("'brand-dark': '#0f172a'", "'brand-dark': '#F8FAFC'")
        content = content.replace("'brand-panel': '#1e293b'", "'brand-panel': '#FFFFFF'")
        content = content.replace("bg-brand-dark text-slate-800 font-sans", "bg-brand-dark text-slate-800 font-sans")
        content = content.replace("bg-brand-panel border-r border-slate-700", "bg-brand-panel border-r border-slate-100")
        content = content.replace("p-6 border-b border-slate-700", "p-6 border-b border-slate-100")
        content = content.replace("border-t border-slate-700 bg-slate-800/50", "border-t border-slate-100 bg-slate-50")
        content = content.replace("text-slate-300 hover:bg-slate-700 hover:text-white border border-transparent hover:border-slate-600", "text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200")
        content = content.replace("pt-2 border-t border-slate-700/50", "pt-2 border-t border-slate-100")
        content = content.replace("bg-slate-700 hover:bg-slate-600 text-white", "bg-slate-100 hover:bg-slate-200 text-slate-800")
        content = content.replace("bg-brand-panel border-b border-slate-700", "bg-brand-panel border-b border-slate-100")
        content = content.replace("border-slate-700", "border-slate-100")
        content = content.replace("border-slate-800", "border-slate-200")
        content = content.replace("bg-slate-800", "bg-slate-100")
        content = content.replace("text-slate-300", "text-slate-700")
        content = content.replace("text-slate-400", "text-slate-600")
        content = content.replace("bg-slate-900", "bg-white")
        content = content.replace("hover:bg-slate-800", "hover:bg-slate-50")

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched: {rel_path}")
        return True
    return False

def file_is_banco_testes(filepath):
    return "banco_testes.html" in filepath

def main():
    print("Starting automatic patch on Base/ directory...")
    patched_count = 0
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                if fix_file_content(filepath):
                    patched_count += 1
    print(f"Finished. Patched {patched_count} files.")

if __name__ == "__main__":
    main()
