import os

base_dir = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho"

files_fixed = 0

for filename in os.listdir(base_dir):
    if not filename.endswith(".html"):
        continue
    filepath = os.path.join(base_dir, filename)
    
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        
    original = content
    
    # Replacements
    content = content.replace("text-red-400", "text-red-700")
    content = content.replace("text-green-400", "text-green-700")
    content = content.replace("text-yellow-400", "text-yellow-700")
    content = content.replace("text-orange-400", "text-orange-700")
    
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        files_fixed += 1
        print(f"Updated root file: {filename}")

print(f"Total root files fixed: {files_fixed}")
