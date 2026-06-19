import os
import re

root_dir = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho"
html_files = [
    "index.html", 
    "turm.html", 
    "depoimens.html", 
    "equi.html", 
    "galer.html", 
    "dic.html", 
    "simulador.html",
    "membros.html"
]

replacements = {
    "turmas.html": "turm.html",
    "depoimentos.html": "depoimens.html",
    "equipe.html": "equi.html",
    "galeria.html": "galer.html",
    "dicas.html": "dic.html",
    "simuladores.html": "simulador.html"
}

for filename in html_files:
    filepath = os.path.join(root_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original_content = content
    
    # 1. Replace all links to old filenames with new ones
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    # 2. Fix the logo in index.html (change text-white to text-slate-900)
    if filename == "index.html":
        content = content.replace(
            '<span class="text-xl font-black text-white tracking-tight">',
            '<span class="text-xl font-black text-slate-900 tracking-tight">'
        )
        
    # 3. Replace active tab color "text-white" in header navigation with "text-blue-600"
    # Find any navigation links with text-white and font-bold
    content = re.sub(
        r'class="text-white\s+transition-colors\s+font-bold"',
        r'class="text-blue-600 transition-colors font-bold"',
        content
    )
    content = re.sub(
        r'class="text-white\s+font-bold\s+transition-colors"',
        r'class="text-blue-600 font-bold transition-colors"',
        content
    )
    
    # 4. Replace hover:text-white on menu button with hover:text-blue-600 or hover:text-slate-800
    content = content.replace("hover:text-white rounded-lg border border-slate-200", "hover:text-blue-600 rounded-lg border border-slate-200")
    
    # 5. Fix membros.html logo
    if filename == "membros.html":
        # Let's replace the old APROVAÇÃO PSYCHO logo with the new naming
        old_logo = """          <div class="flex flex-col">
            <span class="text-xl font-black leading-none tracking-tight text-slate-800">APROVAÇÃO</span>
            <span class="text-base font-black leading-none tracking-widest gradient-text">PSYCHO</span>
          </div>"""
        new_logo = """          <div class="flex flex-col">
            <span class="text-xl font-black leading-none tracking-tight text-slate-800">GRUPO DE ESTUDOS</span>
            <span class="text-base font-black leading-none tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">PARA PSICOTÉCNICO</span>
          </div>"""
        content = content.replace(old_logo, new_logo)
        
    if content != original_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Successfully updated: {filename}")
    else:
        print(f"No changes made to: {filename}")
