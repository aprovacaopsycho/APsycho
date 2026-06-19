import os

base_dir = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base"

files_fixed = 0

for root, dirs, files in os.walk(base_dir):
    for filename in files:
        if not filename.endswith(".html"):
            continue
        filepath = os.path.join(root, filename)
        
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
            print(f"Updated colors in: {os.path.relpath(filepath, base_dir)}")

print(f"Total files fixed: {files_fixed}")
