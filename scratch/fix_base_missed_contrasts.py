import os
import re

base_dir = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base"

# Files that we identified in grep search
files_to_fix = [
    "beta3m.html",
    "bpr5rv.html",
    "cronograma_estudo_PMCE.html",
    "cubos.html",
    "g36.html",
    "g36_backup.html",
    "mig.html",
    "r1.html",
    "tig_nv.html",
    "tri.html",
    "trl.html",
    "wmt2.html",
    "tmr.html",
    "tspmemo/tspmemo.html",
    "testes_.html",
    "testes_PMCE.html",
    "bpa/bpa_aa_debug.html",
    "bpa/bpa_debug.html",
    "cta/mapeadorcta.html",
    "cta/debug_cta_aa.html",
    "cta/cta_aa.html",
    "rotas/editor_rotas_unificado copy.html",
    "rotas/rotaa_debug.html",
    "rotas/rotac_debug.html",
    "tem-r/mapeador_tem_r.html",
    "tspdimensoes/mapear_tspdimensoes.html"
]

light_root_vars = """:root {
            --bg-dark: #F8FAFC;
            --bg-card: #FFFFFF;
            --primary-purple: #1E40AF;
            --accent-pink: #2563EB;
            --accent-blue: #0EA5E9;
            --text-light: #1E293B;"""

for rel_path in files_to_fix:
    filepath = os.path.join(base_dir, rel_path.replace("/", "\\"))
    if not os.path.exists(filepath):
        print(f"File not found: {rel_path}")
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    original = content
    
    # 1. Inject or update :root block
    if ":root {" in content:
        # If :root exists, replace it to include our light theme variables
        content = re.sub(
            r':root\s*\{',
            light_root_vars,
            content
        )
    else:
        # If :root doesn't exist, inject it before body style
        content = re.sub(
            r'(body\s*\{)',
            f"{light_root_vars}\n        }}\n\n        \\1",
            content
        )
        
    # 2. Fix body text color e2e8f0 -> 334155
    content = content.replace("color: #e2e8f0;", "color: #334155;")
    content = content.replace("color:#e2e8f0;", "color:#334155;")
    
    # 3. Update glass-panel backgrounds and shadows
    content = re.sub(
        r'background:\s*rgba\(28,\s*27,\s*41,\s*0\.7\);',
        r'background: rgba(255, 255, 255, 0.8);',
        content
    )
    content = re.sub(
        r'background:\s*rgba\(255,\s*255,\s*255,\s*0\.02\);',
        r'background: rgba(255, 255, 255, 0.8);',
        content
    )
    content = re.sub(
        r'border:\s*1px\s+solid\s+rgba\(255,\s*255,\s*255,\s*0\.04\);',
        r'border: 1px solid rgba(0, 0, 0, 0.08);',
        content
    )
    content = re.sub(
        r'border:\s*1px\s+solid\s+rgba\(255,\s*255,\s*255,\s*0\.08\);',
        r'border: 1px solid rgba(0, 0, 0, 0.08);',
        content
    )
    content = re.sub(
        r'box-shadow:\s*0\s+4px\s+30px\s+rgba\(0,\s*0,\s*0,\s*0\.3\);',
        r'box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);',
        content
    )
    content = re.sub(
        r'box-shadow:\s*0\s+4px\s+20px\s+rgba\(0,\s*0,\s*0,\s*0\.2\);',
        r'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);',
        content
    )
    
    # 4. Fix scrollbar track background
    content = content.replace("background: #0f0e1a;", "background: #f1f5f9;")
    content = content.replace("background: #0f172a;", "background: #f1f5f9;")
    content = content.replace("background: #1e1d2f;", "background: #f1f5f9;")
    
    # 5. Fix common dark card tags bg-black/20 to bg-slate-50
    content = content.replace("bg-black/20", "bg-slate-50")
    content = content.replace("bg-black/40", "bg-slate-100/50")
    content = content.replace("bg-gray-800", "bg-slate-50")
    content = content.replace("bg-gray-900", "bg-slate-100")
    content = content.replace("divide-white/5", "divide-slate-200")
    content = content.replace("border-white/5", "border-slate-100")
    content = content.replace("border-white/10", "border-slate-200")
    content = content.replace("border-white/20", "border-slate-200")
    content = content.replace("text-green-400", "text-green-700")
    content = content.replace("text-red-400", "text-red-700")
    content = content.replace("text-yellow-400", "text-yellow-700")
    content = content.replace("text-orange-400", "text-orange-700")
    content = content.replace("text-pink-400", "text-pink-700")
    
    # Fix tables & lists headers
    content = content.replace("bg-white/80", "bg-slate-50")
    content = content.replace("bg-white/10", "bg-slate-50")
    
    # Header styles
    content = content.replace("bg-white/80 backdrop-blur-md", "glass-panel bg-white/80 backdrop-blur-md")
    
    # Special button hovers
    content = content.replace("hover:bg-white/10", "hover:bg-slate-100")
    
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed: {rel_path}")
    else:
        print(f"No changes needed: {rel_path}")
