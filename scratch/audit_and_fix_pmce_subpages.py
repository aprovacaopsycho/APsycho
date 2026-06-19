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
        print(f"Index page not found: {html_file}")
        return []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Extract href links that end in .html
    href_links = re.findall(r'href=["\']\s*(\.?\/?[^"\']+\.html)\s*["\']', content)
    
    # 2. Extract links in JS objects: link: './acvetor.html'
    js_links = re.findall(r'link\s*:\s*["\']\s*(\.?\/?[^"\']+\.html)\s*["\']', content)
    
    links = list(set(href_links + js_links))
    
    # Filter links: exclude index_PMCE_2026.html, testes_.html, testes_PMCE.html, etc.
    filtered_links = []
    for link in links:
        # Normalize path
        normalized = link.strip().replace('./', '').replace('/', '\\')
        if normalized.startswith('\\'):
            normalized = normalized[1:]
            
        # Exclude navigation/parent links
        if any(parent in normalized for parent in ["index_PMCE", "testes_", "testes.html", "membros.html", "index.html"]):
            continue
            
        filtered_links.append(normalized)
        
    return list(set(filtered_links))

def fix_index_pages_contrast():
    # 1. Fix testes_inteligencia_PMCE.html and testes_personalidade_PMCE.html
    for page in ["testes_inteligencia_PMCE.html", "testes_personalidade_PMCE.html"]:
        filepath = os.path.join(BASE_DIR, page)
        if not os.path.exists(filepath):
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        
        # Replace the dark glass-panel / card gradient with a light one
        dark_card_style = (
            "background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);\n"
            "            backdrop-filter: blur(16px);\n"
            "            border: 1px solid rgba(0, 0, 0, 0.08);\n"
            "            border-radius: 12px;\n"
            "            transition: all 0.3s ease;"
        )
        light_card_style = (
            "background: rgba(255, 255, 255, 0.85);\n"
            "            backdrop-filter: blur(16px);\n"
            "            border: 1px solid rgba(0, 0, 0, 0.08);\n"
            "            border-radius: 12px;\n"
            "            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);\n"
            "            transition: all 0.3s ease;"
        )
        
        if dark_card_style in content:
            content = content.replace(dark_card_style, light_card_style)
            modified = True
            print(f"Fixed card class styling in {page}")
            
        # Replace hover shadow glow to be light blue/purple on hover
        old_hover = "box-shadow: 0 10px 30px rgba(37, 99, 235, 0.04);"
        new_hover = "box-shadow: 0 10px 30px rgba(37, 99, 235, 0.15);"
        if old_hover in content:
            content = content.replace(old_hover, new_hover)
            modified = True
            
        # Remove dark hover background hover:bg-[#1f1e33]
        if "hover:bg-[#1f1e33]" in content:
            content = content.replace("hover:bg-[#1f1e33]", "hover:bg-slate-50")
            modified = True
            print(f"Replaced hover:bg-[#1f1e33] with hover:bg-slate-50 in {page}")
            
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

def fix_subpage_content(subpage_rel):
    filepath = os.path.join(BASE_DIR, subpage_rel)
    if not os.path.exists(filepath):
        print(f"Subpage file not found: {subpage_rel}")
        return False
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    modified = False
    
    # 1. Fix dark alert mode body styles
    old_alert = "body.alert-mode {\n            background-color: #3f0909;\n            background-image: radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.2), transparent 70%);\n        }"
    new_alert = "body.alert-mode {\n            background-color: #FEF2F2;\n            background-image: radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1), transparent 70%);\n        }"
    if old_alert in content:
        content = content.replace(old_alert, new_alert)
        modified = True
        print(f"Fixed alert-mode styles in {subpage_rel}")
        
    # Another variation of alert-mode without newlines
    old_alert_inline = "body.alert-mode { background-color: #3f0909; background-image: radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.2), transparent 70%); }"
    new_alert_inline = "body.alert-mode { background-color: #FEF2F2; background-image: radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1), transparent 70%); }"
    if old_alert_inline in content:
        content = content.replace(old_alert_inline, new_alert_inline)
        modified = True
        print(f"Fixed alert-mode inline styles in {subpage_rel}")

    # Check for timer container style with dark red background in alert mode
    old_timer_alert = "border-red-500/50 bg-red-900/20"
    new_timer_alert = "border-red-500 bg-red-50"
    if old_timer_alert in content:
        content = content.replace(old_timer_alert, new_timer_alert)
        modified = True
        print(f"Fixed timer alert bg classes in {subpage_rel}")
        
    # Replace glass panel/card dark styles if any remain
    # E.g., cards with black background and opacity in light mode
    old_glass_dark = "bg-black/40"
    new_glass_light = "bg-white/80"
    if old_glass_dark in content:
        # Only replace if not inside a dark background element (or replace safely)
        # In simple simulator pages, bg-black/40 is often used for panels
        content = content.replace("bg-black/40", "bg-white/80")
        content = content.replace("bg-white/5", "bg-slate-100/50")
        modified = True
        print(f"Converted transparent dark cards in {subpage_rel}")

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
        
    return False

def main():
    print("Starting PM-CE Pages Audit and Correction...")
    
    # Fix the index pages themselves
    fix_index_pages_contrast()
    
    all_subpages = []
    for index_page in INDEX_PAGES:
        subpages = extract_links(index_page)
        print(f"Extracted {len(subpages)} subpages from {index_page}:")
        for sub in subpages:
            print(f"  - {sub}")
            all_subpages.append(sub)
            
    unique_subpages = sorted(list(set(all_subpages)))
    print(f"\nTotal unique subpages found: {len(unique_subpages)}")
    
    fixed_count = 0
    for sub in unique_subpages:
        if fix_subpage_content(sub):
            fixed_count += 1
            
    print(f"\nAudit complete. Fixed {fixed_count} subpages.")

if __name__ == "__main__":
    main()
