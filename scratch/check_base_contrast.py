import os
import re

BASE_DIR = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base"

# Pattern to search for text color classes that could cause low contrast on a light theme
LIGHT_TEXT_CLASS_PATTERN = re.compile(
    r'\bclass="[^"]*\b(text-white|text-slate-50|text-slate-100|text-slate-200|text-slate-300|text-slate-400|text-gray-50|text-gray-100|text-gray-200|text-gray-300|text-gray-400)\b[^"]*"'
)

# Pattern to search for CSS rules that define light text colors
LIGHT_CSS_COLOR_PATTERN = re.compile(
    r'\bcolor:\s*(#fff|#ffffff|white|#eee|#ccc|#ddd|#e2e8f0|#f1f5f9|#f8fafc)\b',
    re.IGNORECASE
)

# Dark bg classes to ignore (because light text on dark bg is fine)
DARK_BG_CLASSES = [
    'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900', 'bg-indigo-600', 'bg-indigo-700', 'bg-indigo-800',
    'bg-purple-600', 'bg-purple-700', 'bg-purple-800', 'bg-green-600', 'bg-green-700', 'bg-red-600', 'bg-red-700',
    'bg-slate-800', 'bg-slate-900', 'bg-gray-800', 'bg-gray-900', 'bg-black', 'bg-primary', 'bg-accent',
    'peer-checked:', 'group-hover:'
]

def scan_files():
    print("Starting scan in Base/ directory...")
    issues_found = 0
    files_checked = 0
    
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if not file.endswith('.html'):
                continue
                
            filepath = os.path.join(root, file)
            files_checked += 1
            rel_path = os.path.relpath(filepath, BASE_DIR)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    
                in_style_tag = False
                for idx, line in enumerate(lines):
                    line_num = idx + 1
                    
                    # Track if we are inside a <style> block
                    if '<style>' in line:
                        in_style_tag = True
                    if '</style>' in line:
                        in_style_tag = False
                        
                    # 1. Check CSS rules inside style tags
                    if in_style_tag:
                        match = LIGHT_CSS_COLOR_PATTERN.search(line)
                        if match:
                            # Check if the selector is something that is expected to be light, like .btn-primary
                            # For safety, let's print it to manually verify
                            print(f"[CSS COLOR] {rel_path}:{line_num} -> {line.strip()}")
                            issues_found += 1
                            
                    # 2. Check HTML classes for light text
                    match_class = LIGHT_TEXT_CLASS_PATTERN.search(line)
                    if match_class:
                        class_content = match_class.group(0)
                        
                        # Check if it has a dark background class
                        has_dark_bg = any(bg in class_content for bg in DARK_BG_CLASSES)
                        if not has_dark_bg:
                            print(f"[HTML CLASS] {rel_path}:{line_num} -> {line.strip()}")
                            issues_found += 1
                            
            except Exception as e:
                print(f"Error reading {rel_path}: {e}")
                
    print(f"\nScan complete. Checked {files_checked} files. Found {issues_found} potential issues.")

if __name__ == "__main__":
    scan_files()
