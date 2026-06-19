import os
import re

BASE_DIR = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base"
REPORT_PATH = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\scratch\contrast_report.txt"

# Search for light text color classes
LIGHT_TEXT_CLASS_PATTERN = re.compile(
    r'\bclass="[^"]*\b(text-white|text-slate-50|text-slate-100|text-slate-200|text-slate-300|text-slate-400|text-gray-50|text-gray-100|text-gray-200|text-gray-300|text-gray-400|text-purple-100|text-purple-200|text-purple-300)\b[^"]*"'
)

# Search for CSS color rules specifying light colors
LIGHT_CSS_COLOR_PATTERN = re.compile(
    r'\bcolor:\s*(#fff|#ffffff|white|#eee|#ccc|#ddd|#e2e8f0|#f1f5f9|#f8fafc|#e0c8ff|#c4a0ff|#d4b4ff|#aaa|#fca5a5)\b',
    re.IGNORECASE
)

DARK_BG_CLASSES = [
    'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900', 'bg-indigo-600', 'bg-indigo-700', 'bg-indigo-800',
    'bg-purple-600', 'bg-purple-700', 'bg-purple-800', 'bg-green-600', 'bg-green-700', 'bg-red-600', 'bg-red-700',
    'bg-slate-800', 'bg-slate-900', 'bg-gray-800', 'bg-gray-900', 'bg-black', 'bg-primary', 'bg-accent',
    'peer-checked:', 'group-hover:', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-yellow-600'
]

def scan_files():
    report_lines = []
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
                    
                    if '<style>' in line:
                        in_style_tag = True
                    if '</style>' in line:
                        in_style_tag = False
                        
                    # 1. Check CSS rules in style tags
                    if in_style_tag:
                        match = LIGHT_CSS_COLOR_PATTERN.search(line)
                        if match:
                            report_lines.append(f"[CSS COLOR] {rel_path}:{line_num} -> {line.strip()}")
                            issues_found += 1
                            
                    # 2. Check HTML classes for light text
                    match_class = LIGHT_TEXT_CLASS_PATTERN.search(line)
                    if match_class:
                        class_content = match_class.group(0)
                        has_dark_bg = any(bg in class_content for bg in DARK_BG_CLASSES)
                        if not has_dark_bg:
                            report_lines.append(f"[HTML CLASS] {rel_path}:{line_num} -> {line.strip()}")
                            issues_found += 1
                            
            except Exception as e:
                report_lines.append(f"Error reading {rel_path}: {e}")
                
    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write(f"Scan complete. Checked {files_checked} files. Found {issues_found} potential issues.\n\n")
        f.write("\n".join(report_lines))
        
    print(f"Detailed scan complete. Results written to {REPORT_PATH}")

if __name__ == "__main__":
    scan_files()
