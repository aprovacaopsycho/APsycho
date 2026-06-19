import os
import re

BASE_DIR = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base"

def fix_file(filepath):
    if not os.path.exists(filepath):
        return False
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # 1. Header brand title contrast update
    # Replace: class="text-xl font-black" style="color:var(--text-light)" -> class="text-xl font-black text-slate-800"
    content = content.replace(
        'class="text-xl font-black" style="color:var(--text-light)"',
        'class="text-xl font-black text-slate-800"'
    )
    content = content.replace(
        'class="text-xl font-black" style="color: var(--text-light)"',
        'class="text-xl font-black text-slate-800"'
    )
    
    # Also handle instances where style comes before class or has subtle differences
    content = content.replace(
        'style="color:var(--text-light)" class="text-xl font-black"',
        'class="text-xl font-black text-slate-800"'
    )
    content = content.replace(
        'style="color: var(--text-light)" class="text-xl font-black"',
        'class="text-xl font-black text-slate-800"'
    )
    
    # Handle style attribute only
    content = content.replace(
        'style="color:var(--text-light)"',
        'class="text-slate-800"'
    )
    content = content.replace(
        'style="color: var(--text-light)"',
        'class="text-slate-800"'
    )

    # 2. Table Headers (thead bg-black/20 -> bg-slate-100)
    content = content.replace(
        '<thead class="text-xs text-slate-400 uppercase bg-black/20">',
        '<thead class="text-xs text-slate-500 uppercase bg-slate-100">'
    )
    
    # 3. Target grids / description boxes
    content = content.replace(
        'bg-black/20 p-6 rounded-xl max-w-xl mx-auto mb-8 border border-slate-100',
        'bg-slate-50 p-6 rounded-xl max-w-xl mx-auto mb-8 border border-slate-200'
    )
    content = content.replace(
        'bg-black/20 p-6 rounded-xl border border-slate-100',
        'bg-slate-50 p-6 rounded-xl border border-slate-200'
    )
    content = content.replace(
        'bg-black/20 rounded-xl border border-slate-100',
        'bg-slate-50 rounded-xl border border-slate-200'
    )
    
    # 4. MVR question containers
    content = content.replace(
        '<div class="bg-black/20 p-4 rounded border border-slate-100">',
        '<div class="bg-slate-50 p-4 rounded border border-slate-200">'
    )
    content = content.replace(
        '<div class="bg-black/20 p-2 rounded">',
        '<div class="bg-slate-50 p-2 rounded border border-slate-100">'
    )
    content = content.replace(
        'class="flex-grow bg-black/20 rounded-xl border border-slate-200 p-4 flex items-center justify-center overflow-auto">',
        'class="flex-grow bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-center overflow-auto">'
    )

    # 5. bg-white/5 buttons/cards to solid white/light gray
    content = content.replace(
        'bg-white/5 hover:bg-slate-50 text-slate-800',
        'bg-white hover:bg-slate-50 text-slate-800 shadow-sm'
    )
    content = content.replace(
        'bg-white/5 hover:bg-slate-50',
        'bg-white hover:bg-slate-50'
    )
    content = content.replace(
        '<div class="bg-white/5 p-5 rounded-xl border border-slate-200">',
        '<div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">'
    )
    content = content.replace(
        'bg-white/5 rounded-lg flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.05)] border border-slate-200',
        'bg-white rounded-lg flex items-center justify-center shadow-lg border border-slate-200'
    )
    content = content.replace(
        '<div class="bg-white/5 rounded-lg p-2 border border-slate-200">',
        '<div class="bg-white rounded-lg p-2 border border-slate-200 shadow-sm">'
    )

    # 6. Banner classes in palografico
    content = content.replace(
        "bannerClass: 'bg-white/5 border border-slate-100'",
        "bannerClass: 'bg-slate-50 border border-slate-200 text-slate-700'"
    )
    content = content.replace(
        "this.bannerClass = 'bg-white/5 border border-slate-100';",
        "this.bannerClass = 'bg-slate-50 border border-slate-200 text-slate-700';"
    )

    # 7. Timer Alert & Result colors in acvetor
    content = content.replace(
        "'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'",
        "'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'"
    )
    content = content.replace(
        "bg-white/5 hover:bg-white/10 text-slate-800 rounded-xl font-bold transition flex items-center gap-3 border border-slate-200 hover:border-white/20",
        "bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-bold transition flex items-center gap-3 border border-slate-200 hover:border-slate-300"
    )

    # 8. Results box gradients
    content = content.replace(
        'bg-gradient-to-br from-purple-900/50 to-blue-900/50',
        'bg-gradient-to-br from-purple-50 to-blue-50'
    )
    content = content.replace(
        'border-blue-500/30',
        'border-blue-200'
    )
    content = content.replace(
        'text-blue-400',
        'text-blue-600'
    )
    content = content.replace(
        'text-blue-300',
        'text-blue-600'
    )
    
    # 9. Body alert mode (redundancy check)
    old_alert = "body.alert-mode {\n            background-color: #3f0909;\n            background-image: radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.2), transparent 70%);\n        }"
    new_alert = "body.alert-mode {\n            background-color: #FEF2F2;\n            background-image: radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1), transparent 70%);\n        }"
    content = content.replace(old_alert, new_alert)
    
    old_alert_inline = "body.alert-mode { background-color: #3f0909; background-image: radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.2), transparent 70%); }"
    new_alert_inline = "body.alert-mode { background-color: #FEF2F2; background-image: radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1), transparent 70%); }"
    content = content.replace(old_alert_inline, new_alert_inline)
    
    content = content.replace("border-red-500/50 bg-red-900/20", "border-red-500 bg-red-50")
    content = content.replace("bg-black/40", "bg-white/80")

    # === NEW REPLACEMENTS FOR REMAINING 67 ISSUES ===
    
    # Dark MVR sidebar background
    content = content.replace(
        'bg-[#13121f]/95',
        'bg-white/95 backdrop-blur-md'
    )
    
    # bg-white/5 badges to bg-slate-100 badges
    content = content.replace(
        'bg-white/5 px-2 py-1 rounded',
        'bg-slate-100 px-2 py-1 rounded'
    )
    
    # bg-white/5 container in acvetor
    content = content.replace(
        'class="flex justify-center gap-6 mb-8 p-6 bg-white/5 rounded-xl border border-slate-200 inline-flex mx-auto backdrop-blur-sm"',
        'class="flex justify-center gap-6 mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 inline-flex mx-auto backdrop-blur-sm"'
    )
    
    # bg-white/5 round badge for shadow-[0_0_30px_rgba(159,84,255,0.2)]
    content = content.replace(
        'bg-white/5 border border-slate-200 shadow-[0_0_30px_rgba(159,84,255,0.2)]',
        'bg-white border border-slate-200 shadow-md'
    )
    
    # icon wrapper in bfp_PMCE, eata, esavi_b, ifp2_pmce, neopi
    content = content.replace(
        'bg-white/5 flex items-center justify-center mb-3 text-slate-800',
        'bg-slate-100 flex items-center justify-center mb-3 text-slate-800'
    )
    
    # close buttons
    content = content.replace(
        'bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-800 transition',
        'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition'
    )
    
    # key badges / results
    content = content.replace(
        'bg-black/20 border border-slate-200',
        'bg-slate-100 border border-slate-200'
    )
    content = content.replace(
        'bg-black/20 px-2 py-1 rounded',
        'bg-slate-100 px-2 py-1 rounded'
    )
    
    # bpr5rv.html
    content = content.replace(
        "'bg-white/5 border-slate-200 hover:bg-slate-50 text-slate-600'",
        "'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm'"
    )
    content = content.replace(
        "'bg-white/5 text-slate-600'",
        "'bg-white text-slate-600'"
    )
    content = content.replace(
        'class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"',
        'class="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"'
    )
    
    # eata text block
    content = content.replace(
        '<div class="mt-4 p-4 rounded-lg bg-white/5 text-sm text-slate-500">',
        '<div class="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600">'
    )
    
    # mig navigation classes
    content = content.replace(
        "currentQuestion === q ? 'bg-white/5 border-blue-200' : ''",
        "currentQuestion === q ? 'bg-slate-100 border-blue-300' : ''"
    )
    content = content.replace(
        "text-slate-500 bg-white/5 hover:text-white",
        "text-slate-600 bg-white hover:bg-purple-50 hover:text-purple-700"
    )
    
    # mvr
    content = content.replace(
        'class="flex items-center gap-1 bg-white/5 p-0.5 rounded hover:bg-white/10 transition group"',
        'class="flex items-center gap-1 bg-slate-100 p-0.5 rounded hover:bg-slate-200 transition group"'
    )
    content = content.replace(
        '<div class="mb-4 p-4 bg-white/5 rounded border border-slate-100">',
        '<div class="mb-4 p-4 bg-slate-50 rounded border border-slate-200">'
    )
    content = content.replace(
        "if (!ans) return 'bg-white/5 text-slate-400';",
        "if (!ans) return 'bg-white text-slate-400 border border-slate-200 shadow-sm';"
    )
    
    # tepic
    content = content.replace(
        'class="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-800 rounded-xl font-bold transition flex items-center justify-center gap-3 border border-slate-200"',
        'class="px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-bold transition flex items-center justify-center gap-3 border border-slate-200 shadow-sm"'
    )
    
    # tmr
    content = content.replace(
        'class="flex-grow bg-white/5 rounded-xl border border-slate-200 p-4 flex items-center justify-center overflow-hidden"',
        'class="flex-grow bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-center overflow-hidden shadow-sm"'
    )
    
    # tspdimensoes
    content = content.replace(
        "resultView === 'list' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'",
        "resultView === 'list' ? 'bg-purple-600 text-white' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'"
    )
    content = content.replace(
        "resultView === 'accordion' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'",
        "resultView === 'accordion' ? 'bg-purple-600 text-white' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'"
    )
    content = content.replace(
        '<thead class="bg-white/5 text-slate-500 uppercase text-xs">',
        '<thead class="bg-slate-100 text-slate-600 uppercase text-xs">'
    )
    content = content.replace(
        '<div class="bg-white/5 rounded-lg border border-slate-100 overflow-hidden"',
        '<div class="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm"'
    )
    
    # tspmemo
    content = content.replace(
        'class="flex items-center justify-between bg-white/5 p-2 rounded hover:bg-slate-50 transition group"',
        'class="flex items-center justify-between bg-white p-2 rounded hover:bg-slate-50 transition border border-slate-200 shadow-sm group"'
    )
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
        
    return False

def main():
    print("Starting recursive scan and correction of all HTML files in Base/...")
    
    html_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
                
    print(f"Found {len(html_files)} HTML files. Processing...")
    
    fixed_count = 0
    for filepath in html_files:
        if fix_file(filepath):
            fixed_count += 1
            print(f"  Fixed: {os.path.relpath(filepath, BASE_DIR)}")
            
    print(f"Correction complete. Updated {fixed_count} files.")

if __name__ == "__main__":
    main()
