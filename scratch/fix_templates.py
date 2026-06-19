import os

root_dir = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho"
files = ["memf.html", "pattern.html"]

for filename in files:
    filepath = os.path.join(root_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Replace style tag variables in :root
    content = content.replace(
        ":root { --bg-dark: #100f1c; --bg-card: #1c1b29; --primary-purple: #9f54ff; --accent-pink: #ff00ff; --accent-blue: #00c2ff; --text-light: #f0f0f0; --text-dark: #a0a0a0; }",
        ":root { --bg-dark: #F8FAFC; --bg-card: #FFFFFF; --primary-purple: #2563EB; --accent-pink: #1D4ED8; --accent-blue: #0EA5E9; --text-light: #1E293B; --text-dark: #475569; --glass-border: rgba(0, 0, 0, 0.08); }"
    )
    
    # Add glass-nav style and update classes
    content = content.replace(
        "        .card { background-color: var(--bg-card); border-radius: 0.75rem; border: 1px solid #333; }",
        "        .glass-nav { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--glass-border); }\n        .card { background-color: var(--bg-card); border-radius: 0.75rem; border: 1px solid #e2e8f0; }\n        .cta-button { background: linear-gradient(90deg, #2563EB, #1D4ED8); color: white; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.15); }\n        .cta-button:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.25); }"
    )
    
    content = content.replace(
        "        .card { background-color: var(--bg-card); border-radius: 0.75rem; border: 1px solid #333; transition: transform 0.3s ease, box-shadow 0.3s ease; }",
        "        .glass-nav { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--glass-border); }\n        .card { background-color: var(--bg-card); border-radius: 0.75rem; border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; }\n        .cta-button { background: linear-gradient(90deg, #2563EB, #1D4ED8); color: white; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.15); }\n        .cta-button:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.25); }"
    )
    
    # Update grid borders
    content = content.replace(
        ".mvr-grid-item { transition: all 0.2s ease; border: 2px solid #333; }",
        ".mvr-grid-item { transition: all 0.2s ease; border: 2px solid #cbd5e1; }\n        .mvr-grid-item.selected { border-color: var(--accent-pink); background-color: rgba(29, 78, 216, 0.08); }"
    )
    content = content.replace(
        ".pattern-grid-item { transition: all 0.2s ease; border: 1px solid #333; background-color: var(--bg-dark); }",
        ".pattern-grid-item { transition: all 0.2s ease; border: 1px solid #cbd5e1; background-color: var(--bg-dark); }"
    )
    
    # Correct correct/incorrect selection styling in pattern.html
    content = content.replace(
        ".pattern-grid-item.selected-correct { background-color: #00ff0030; border-color: #00ff00; transform: scale(1.05); }",
        ".pattern-grid-item.selected-correct { background-color: rgba(34, 197, 94, 0.1); border-color: rgb(34, 197, 94); transform: scale(1.05); }"
    )
    content = content.replace(
        ".pattern-grid-item.selected-incorrect { background-color: #ff000030; border-color: #ff0000; transform: scale(1.05); }",
        ".pattern-grid-item.selected-incorrect { background-color: rgba(239, 68, 68, 0.1); border-color: rgb(239, 68, 68); transform: scale(1.05); }"
    )
    
    # Inject Tailwind Config for custom class compatibility
    tailwind_script = """    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'bg-dark': '#F8FAFC',
                        'bg-card': '#FFFFFF',
                        'text-light': '#1E293B',
                        'text-dark': '#475569',
                        'accent-pink': '#1D4ED8'
                    }
                }
            }
        }
    </script>"""
    content = content.replace('<script src="https://cdn.tailwindcss.com"></script>', tailwind_script)
    
    # Fix the header class and navigation
    header_old = '<header class="sticky top-0 z-50 bg-black/40 backdrop-blur-md border-b border-slate-200">'
    header_new = '<header class="fixed top-0 w-full z-50 glass-nav transition-all duration-300">'
    content = content.replace(header_old, header_new)
    
    # Fix the logo
    old_logo_span = '<span class="text-[1.1rem] sm:text-xl font-black" style="color: var(--text-light);">GRUPO DE ESTUDOS <span style="color: var(--accent-pink); filter: drop-shadow(0 0 8px rgba(255,0,255,.7));">PARA PSICOTÉCNICO</span></span>'
    new_logo_span = '<span class="text-[1.1rem] sm:text-xl font-black text-slate-800">GRUPO DE ESTUDOS <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">PARA PSICOTÉCNICO</span></span>'
    content = content.replace(old_logo_span, new_logo_span)
    
    # Replace active tab classes
    content = content.replace(
        '<a href="index.html#sobre" class="text-[var(--accent-pink)] font-semibold">O Curso</a>',
        '<a href="index.html#sobre" class="text-slate-600 hover:text-blue-600 font-semibold transition-colors">O Curso</a>'
    )
    
    # Fix link hover and file names in desktop nav
    content = content.replace('class="text-[var(--text-dark)] hover:text-white"', 'class="text-slate-600 hover:text-blue-600 transition-colors"')
    content = content.replace('class="text-[var(--text-dark)] hover:text-white"', 'class="text-slate-600 hover:text-blue-600 transition-colors"') # Run twice to get all instances
    content = content.replace('class="text-[var(--text-dark)] hover:text-white"', 'class="text-slate-600 hover:text-blue-600 transition-colors"') # Run thrice just in case
    
    content = content.replace('href="equipe.html"', 'href="equi.html"')
    content = content.replace('href="galeria.html"', 'href="galer.html"')
    content = content.replace('href="membros.html"', 'href="membros.html"')
    content = content.replace('href="dicas.html"', 'href="dic.html"')
    content = content.replace('href="simuladores.html"', 'href="simulador.html"')
    content = content.replace('href="turmas.html"', 'href="turm.html"')
    
    # Fix mobile menu button text
    content = content.replace(
        'class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-white/90 hover:text-white border border-white/15"',
        'class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:text-blue-600 border border-slate-200"'
    )
    
    # Fix return link text-accent-pink
    content = content.replace('class="mb-8 inline-flex items-center text-accent-pink hover:text-slate-800 font-semibold"', 'class="mb-8 inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"')
    
    # Fix footer background and style
    content = content.replace(
        '<footer class="border-t border-slate-200 mt-auto py-8 bg-[#0f0e1a] text-center text-sm text-gray-600">',
        '<footer class="border-t border-slate-200 mt-auto py-8 bg-slate-100 text-center text-sm text-slate-600">'
    )
    
    # Fix results texts
    content = content.replace('text-green-400', 'text-green-700')
    content = content.replace('text-red-400', 'text-red-700')
    content = content.replace('text-yellow-400', 'text-yellow-700')
    content = content.replace('border-accent-pink', 'border-blue-600')
    content = content.replace('text-accent-pink', 'text-blue-600')
    content = content.replace('bg-primary-purple/20', 'bg-blue-600/10')
    content = content.replace('text-primary-purple', 'text-blue-700')
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Theme and layout updated for: {filename}")
