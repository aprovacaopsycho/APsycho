import os

base_dir = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho"

files_fixed = 0

for root, dirs, files in os.walk(base_dir):
    if any(p in root for p in [".git", ".remember", ".venv", ".vscode", "__pycache__", "assets", "galeria", "memf_images", "vozes"]):
        continue
    for filename in files:
        if not filename.endswith(".html"):
            continue
        filepath = os.path.join(root, filename)
        
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
        original = content
        
        # Replace color-scheme meta tag
        content = content.replace('<meta name="color-scheme" content="dark" />', '<meta name="color-scheme" content="light" />')
        content = content.replace('<meta name="color-scheme" content="dark">', '<meta name="color-scheme" content="light">')
        content = content.replace('<meta name="color-scheme" content="dark"\\>', '<meta name="color-scheme" content="light"\\>')
        
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            files_fixed += 1

print(f"Fixed color-scheme meta tag in {files_fixed} files.")
