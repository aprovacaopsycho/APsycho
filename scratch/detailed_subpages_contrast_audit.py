import os
import re

BASE_DIR = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base"

INDEX_PAGES = [
    "testes_personalidade_PMCE.html",
    "testes_atencao_PMCE.html",
    "testes_memoria_PMCE.html",
    "testes_inteligencia_PMCE.html"
]

def extract_links(html_file):
    filepath = os.path.join(BASE_DIR, html_file)
    if not os.path.exists(filepath):
        return []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract href and JS link properties
    href_links = re.findall(r'href=["\']\s*(\.?\/?[^"\']+\.html)\s*["\']', content)
    js_links = re.findall(r'link\s*:\s*["\']\s*(\.?\/?[^"\']+\.html)\s*["\']', content)
    
    links = list(set(href_links + js_links))
    filtered_links = []
    for link in links:
        normalized = link.strip().replace('./', '').replace('/', '\\')
        if normalized.startswith('\\'):
            normalized = normalized[1:]
        if any(parent in normalized for parent in ["index_PMCE", "testes_", "testes.html", "membros.html", "index.html"]):
            continue
        filtered_links.append(normalized)
        
    return list(set(filtered_links))

def audit_file(filepath, rel_path):
    issues = []
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.splitlines()
        
    # Check for header brand color issue
    for idx, line in enumerate(lines):
        line_num = idx + 1
        
        # 1. Header brand color contrast
        if 'color:var(--text-light)' in line or 'color: var(--text-light)' in line:
            issues.append((line_num, "HEADER_LIGHT_TEXT", line.strip()))
            
        # 2. Dark glassmorphism classes
        if any(cls in line for cls in ['bg-black/20', 'bg-black/30', 'bg-black/40', 'bg-black/50', 'bg-white/5']):
            issues.append((line_num, "DARK_GLASS_CONTAINER", line.strip()))
            
        # 3. Dark alert mode background
        if '#3f0909' in line:
            issues.append((line_num, "DARK_ALERT_BG", line.strip()))
            
        # 4. Old dark-theme container colors
        if any(bg in line for bg in ['bg-[#0B0A14]', 'bg-[#0f0e1a]', 'bg-[#1a192f]', 'bg-[#1e1e2f]']):
            issues.append((line_num, "DARK_THEME_BG", line.strip()))
            
        # 5. Timer alert colors (dark red backgrounds)
        if 'bg-red-900/20' in line:
            issues.append((line_num, "TIMER_ALERT_BG", line.strip()))
            
        # 6. Check for bg-gradient-to-br from-purple-900 to-blue-900 styles containing dark slate text
        if ('bg-gradient-to-br from-purple-900' in line or 'from-purple-900/50 to-blue-900/50' in line) and 'text-slate-800' in line:
            issues.append((line_num, "DARK_GRADIENT_WITH_DARK_TEXT", line.strip()))

    return issues

def main():
    all_subpages = []
    for index_page in INDEX_PAGES:
        subpages = extract_links(index_page)
        for sub in subpages:
            all_subpages.append(sub)
            
    # Include the index pages themselves in the audit
    unique_files = sorted(list(set(all_subpages)))
    files_to_audit = [(os.path.join(BASE_DIR, index), index) for index in INDEX_PAGES]
    for sub in unique_files:
        files_to_audit.append((os.path.join(BASE_DIR, sub), sub))
        
    print(f"Auditing {len(files_to_audit)} files...")
    
    total_issues = 0
    with open("scratch/subpages_audit_report.txt", "w", encoding="utf-8") as out:
        out.write("SUBPAGES CONTRAST & DARK-MODE AUDIT REPORT\n")
        out.write("==========================================\n\n")
        
        for filepath, rel_path in files_to_audit:
            if not os.path.exists(filepath):
                out.write(f"FILE NOT FOUND: {rel_path}\n\n")
                continue
                
            issues = audit_file(filepath, rel_path)
            if issues:
                out.write(f"FILE: {rel_path} ({len(issues)} issues)\n")
                out.write("-" * len(rel_path) + "\n")
                for line_num, category, line in issues:
                    out.write(f"  Line {line_num} [{category}]: {line}\n")
                out.write("\n")
                total_issues += len(issues)
                
        out.write(f"TOTAL POTENTIAL ISSUES FOUND: {total_issues}\n")
        
    print(f"Audit completed. Found {total_issues} potential issues. Report written to scratch/subpages_audit_report.txt")

if __name__ == "__main__":
    main()
