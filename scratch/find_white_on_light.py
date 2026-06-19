import os
import re

base_dir = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho"

light_bg_classes = [
    "bg-white", "bg-slate-50", "bg-slate-100", "bg-slate-200", 
    "bg-gray-50", "bg-gray-100", "bg-gray-200", 
    "bg-neutral-50", "bg-neutral-100", "bg-neutral-200"
]

light_text_classes = [
    "text-white", "text-slate-50", "text-slate-100", "text-slate-200", "text-slate-300",
    "text-gray-50", "text-gray-100", "text-gray-200", "text-gray-300",
    "text-neutral-50", "text-neutral-100", "text-neutral-200"
]

issues_found = []

for root, dirs, files in os.walk(base_dir):
    # Skip virtual env or Git dirs
    if any(p in root for p in [".git", ".remember", ".venv", ".vscode", "__pycache__", "assets", "galeria", "memf_images", "vozes"]):
        continue
        
    for filename in files:
        if not filename.endswith(".html"):
            continue
        filepath = os.path.join(root, filename)
        
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
        # Let's find all class="..." attributes
        matches = re.finditer(r'\bclass="([^"]*)"', content)
        for match in matches:
            class_str = match.group(1)
            classes = class_str.split()
            
            # Check if it has a light background
            has_light_bg = any(bg in classes for bg in light_bg_classes)
            # Check if it has light text
            has_light_text = any(txt in classes for txt in light_text_classes)
            
            # Check if it has a dark background that might override the light bg
            has_dark_bg_override = any(
                c.startswith("bg-") and c not in light_bg_classes and not c.endswith("/10") and not c.endswith("/20") and not c.endswith("/5")
                for c in classes
            )
            
            if has_light_bg and has_light_text and not has_dark_bg_override:
                # Get some surrounding context
                start = max(0, match.start() - 50)
                end = min(len(content), match.end() + 50)
                surrounding = content[start:end].replace("\n", " ").strip()
                
                issues_found.append({
                    "file": os.path.relpath(filepath, base_dir),
                    "class": class_str,
                    "context": surrounding
                })

print(f"Found {len(issues_found)} potential white-on-light contrast issues:")
for idx, issue in enumerate(issues_found, 1):
    print(f"\n{idx}. File: {issue['file']}\n   Class: {issue['class']}\n   Context: ... {issue['context']} ...")
