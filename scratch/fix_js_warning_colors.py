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
        
        # 1. replace text-red-400 in classList warning styles
        content = content.replace("classList.add('text-red-400'", "classList.add('text-red-700'")
        content = content.replace('classList.add("text-red-400"', 'classList.add("text-red-700"')
        content = content.replace("classList.remove('text-red-400'", "classList.remove('text-red-700'")
        content = content.replace('classList.remove("text-red-400"', 'classList.remove("text-red-700"')
        
        # 2. replace bg-red-900/40 in classList warning styles
        content = content.replace("bg-red-900/40", "bg-red-50/90")
        
        # 3. replace text-red-400 in class names of timers
        content = content.replace("'text-red-400 animate-pulse'", "'text-red-700 animate-pulse'")
        content = content.replace('"text-red-400 animate-pulse"', '"text-red-700 animate-pulse"')
        
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            files_fixed += 1
            print(f"Fixed JS warnings in: {os.path.relpath(filepath, base_dir)}")

print(f"Total files fixed: {files_fixed}")
