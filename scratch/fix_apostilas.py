import os
import re

dir_path = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base\apostila"
files = [
    "index.html",
    "apostila_atencao.html",
    "apostila_inteligencia.html",
    "apostila_memoria.html",
    "apostila_personalidade.html",
    "slides_atencao.html"
]

for filename in files:
    filepath = os.path.join(dir_path, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    original = content
    
    # 1. Update css variables inside all apostilas
    if filename in ["index.html", "apostila_atencao.html", "apostila_inteligencia.html", "apostila_memoria.html", "apostila_personalidade.html"]:
        # Change text-light from e2e8f0 to 1E293B
        content = content.replace("--text-light: #e2e8f0;", "--text-light: #1E293B;")
        
        # Change body text color from e2e8f0 to 334155
        content = content.replace("color: #e2e8f0;", "color: #334155;")
        
        # Update glass-panel styles for light mode
        old_glass = """        .glass-panel {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
        }"""
        new_glass = """        .glass-panel {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.02);
        }"""
        content = content.replace(old_glass, new_glass)
        
        # In case indentation was slightly different
        content = re.sub(
            r'background:\s*linear-gradient\(135deg,\s*rgba\(255,\s*255,\s*255,\s*0\.08\)[^}]+shadow:[^}]+rgba\(0,\s*0,\s*0,\s*0\.4\);',
            r'background: linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%); backdrop-filter: blur(16px); border: 1px solid rgba(0, 0, 0, 0.08); box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.02);',
            content
        )
        
        # Fix the scrollbar track background
        content = content.replace("background: #0f172a;", "background: #f1f5f9;")
        
        # Replace the toolbar bg-black/90 with bg-white/90 and change its layout to light theme
        content = content.replace(
            "sticky top-24 z-40 mb-4 bg-black/90 backdrop-blur-xl border border-slate-200",
            "sticky top-24 z-40 mb-4 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-lg"
        )
        content = content.replace(
            "bg-white/5 rounded-lg p-1 border border-slate-100",
            "bg-slate-100 rounded-lg p-1 border border-slate-200"
        )
        content = content.replace(
            "bg-white/80 text-slate-500 hover:text-slate-800 hover:bg-white/10",
            "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
        )
        content = content.replace(
            "bg-white/5 text-slate-50 border-slate-100 hover:bg-white/10",
            "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
        )
        content = content.replace(
            "bg-white/5 text-slate-500 border-slate-100 hover:bg-white/10",
            "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
        )
        content = content.replace(
            "text-slate-500 hover:bg-slate-100 border-transparent",
            "text-slate-600 hover:bg-slate-100 border-transparent"
        )
        
        # Change content box dark background "bg-black/20" to "bg-slate-50"
        content = content.replace("bg-black/20 p-6 rounded-xl border border-slate-100", "bg-slate-50 p-6 rounded-xl border border-slate-200")
        content = content.replace("bg-black/20 p-8 rounded-3xl border border-slate-200", "bg-slate-50 p-8 rounded-3xl border border-slate-200")
        content = content.replace("bg-black/20 text-center", "bg-slate-50 text-center")
        content = content.replace("bg-black/20 p-4 rounded-xl", "bg-slate-50 p-4 rounded-xl")
        content = content.replace("bg-black/20 rounded-2xl", "bg-slate-50 rounded-2xl")
        
        # Fix text-yellow-100, text-pink-100, etc. on light background
        content = content.replace("text-yellow-100", "text-slate-800")
        content = content.replace("text-pink-100", "text-slate-800")
        content = content.replace("text-blue-100", "text-slate-800")
        content = content.replace("text-green-400", "text-green-800")
        content = content.replace("text-red-400", "text-red-800")
        content = content.replace("text-yellow-400", "text-yellow-800")
        content = content.replace("text-orange-400", "text-orange-800")
        content = content.replace("text-pink-400", "text-pink-800")
        content = content.replace("text-cyan-400", "text-cyan-800")
        content = content.replace("bg-yellow-500/10", "bg-amber-50 border border-amber-200/60")
        content = content.replace("bg-blue-500/10", "bg-blue-50 border border-blue-200/60")
        content = content.replace("bg-pink-500/10", "bg-pink-50 border border-pink-200/60")
        content = content.replace("bg-green-500/10", "bg-green-50 border border-green-200/60")
        content = content.replace("bg-red-500/10", "bg-red-50 border border-red-200/60")
        content = content.replace("bg-orange-500/10", "bg-orange-50 border border-orange-200/60")
        
        # Change index.html (apostila one) card text-white titles to text-slate-800
        if filename == "index.html":
            content = content.replace(
                '<h2 class="text-xl font-bold text-white mb-2 group-hover:text-blue-600 transition-colors">Testes de\n                    Personalidade</h2>',
                '<h2 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Testes de Personalidade</h2>'
            )
            content = content.replace(
                '<h2 class="text-xl font-bold text-white mb-2 group-hover:text-blue-500 transition-colors">Testes de\n                    Atenção</h2>',
                '<h2 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Testes de Atenção</h2>'
            )
            content = content.replace(
                '<h2 class="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">Testes de\n                    Memória</h2>',
                '<h2 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Testes de Memória</h2>'
            )
            content = content.replace(
                '<h2 class="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">Testes\n                    de Inteligência</h2>',
                '<h2 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Testes de Inteligência</h2>'
            )
            content = content.replace("text-white mb-4 tracking-tight", "text-slate-900 mb-4 tracking-tight")
            
    # 2. Update slides_atencao.html specific styles
    if filename == "slides_atencao.html":
        # Convert background to light mode
        content = content.replace("background-color: #050508;", "background-color: #F8FAFC;")
        content = content.replace("rgba(0, 194, 255, 0.08)", "rgba(14, 165, 233, 0.04)")
        content = content.replace("rgba(159, 84, 255, 0.08)", "rgba(37, 99, 235, 0.04)")
        content = content.replace("color: #e2e8f0;", "color: #334155;")
        
        # Convert glass-panel
        old_slide_glass = """        .glass-panel {
            background: rgba(20, 20, 30, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
        }"""
        new_slide_glass = """        .glass-panel {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
        }"""
        content = content.replace(old_slide_glass, new_slide_glass)
        
        # Change headers in slides to show nicely
        content = content.replace("text-slate-800/10", "text-slate-200/50")
        
        # Convert yellow and pink boxes inside slides for high contrast
        content = content.replace("text-yellow-100", "text-slate-800")
        content = content.replace("text-pink-100", "text-slate-800")
        content = content.replace("text-blue-100", "text-slate-800")
        content = content.replace("text-green-400", "text-green-800")
        content = content.replace("text-red-400", "text-red-800")
        content = content.replace("text-yellow-400", "text-yellow-800")
        content = content.replace("text-orange-400", "text-orange-800")
        content = content.replace("text-pink-400", "text-pink-800")
        content = content.replace("text-cyan-400", "text-cyan-800")
        
        content = content.replace("bg-yellow-500/10", "bg-amber-50 border border-amber-200/60")
        content = content.replace("bg-blue-500/10", "bg-blue-50 border border-blue-200/60")
        content = content.replace("bg-pink-500/10", "bg-pink-50 border border-pink-200/60")
        content = content.replace("bg-green-500/10", "bg-green-50 border border-green-200/60")
        content = content.replace("bg-red-500/10", "bg-red-50 border border-red-200/60")
        content = content.replace("bg-purple-500/20", "bg-purple-50 border border-purple-200/60")
        content = content.replace("bg-primary/20", "bg-blue-50 border border-blue-200/60")
        content = content.replace("bg-white/10", "bg-slate-100 border border-slate-200/60")
        
        # Fix button text and styles
        content = content.replace("bg-primary text-black font-black text-xl rounded-full hover:bg-white", "bg-blue-600 text-white font-black text-xl rounded-full hover:bg-blue-700")
        content = content.replace("bg-primary text-black font-black text-2xl rounded-xl hover:bg-white", "bg-blue-600 text-white font-black text-2xl rounded-xl hover:bg-blue-700")
        content = content.replace("bg-pink-500 text-slate-800 font-bold text-2xl rounded-xl", "bg-pink-600 text-white font-bold text-2xl rounded-xl")
        content = content.replace("bg-yellow-500 text-black font-black text-2xl rounded-xl", "bg-yellow-600 text-white font-black text-2xl rounded-xl")
        content = content.replace("bg-pink-600 text-slate-900 font-black text-2xl rounded-xl hover:bg-pink-500", "bg-pink-600 text-white font-black text-2xl rounded-xl hover:bg-pink-700")
        content = content.replace("bg-blue-600 text-slate-900 font-black text-2xl rounded-xl hover:bg-blue-500", "bg-blue-600 text-white font-black text-2xl rounded-xl hover:bg-blue-700")
        content = content.replace("bg-yellow-600 text-slate-900 font-black text-2xl rounded-xl hover:bg-yellow-500", "bg-yellow-600 text-white font-black text-2xl rounded-xl hover:bg-yellow-700")
        content = content.replace("text-primary", "text-blue-600")
        
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Successfully converted to light theme: {filename}")
    else:
        print(f"No changes needed for: {filename}")
