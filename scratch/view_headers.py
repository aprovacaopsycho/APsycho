import os
import re

root_dir = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho"
html_files = ["index.html", "turm.html", "depoimens.html", "equi.html", "galer.html", "dic.html", "simulador.html"]

for filename in html_files:
    filepath = os.path.join(root_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Find header tag block
    match = re.search(r"<header.*?</header>", content, re.DOTALL)
    if match:
        print(f"=== HEADER FOR {filename} ===")
        print(match.group(0))
        print("=" * 40)
    else:
        print(f"Header not found in {filename}")
