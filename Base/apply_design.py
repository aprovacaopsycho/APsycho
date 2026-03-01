"""
Script para aplicar design premium uniformizado em todos os arquivos HTML da pasta Base
"""

import os
import re
from pathlib import Path

# Diretório base
BASE_DIR = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base"

# CSS para adicionar (Outfit font + particles + glassmorphism)
OUTFIT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');"

PARTICLES_HTML = """
    <!-- Particles -->
    <div class="particles">
        <div class="particle" style="left: 10%; animation-delay: 0s;"></div>
        <div class="particle" style="left: 20%; animation-delay: 2s;"></div>
        <div class="particle" style="left: 30%; animation-delay: 4s;"></div>
        <div class="particle" style="left: 40%; animation-delay: 1s;"></div>
        <div class="particle" style="left: 50%; animation-delay: 3s;"></div>
        <div class="particle" style="left: 60%; animation-delay: 5s;"></div>
        <div class="particle" style="left: 70%; animation-delay: 2.5s;"></div>
        <div class="particle" style="left: 80%; animation-delay: 4.5s;"></div>
        <div class="particle" style="left: 90%; animation-delay: 1.5s;"></div>
    </div>
"""

PREMIUM_CSS = """
        /* Animated Background */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;\n            background: 
                radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
            animation: gradientShift 15s ease infinite;
            z-index: 0;
        }

        @keyframes gradientShift {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
        }

        /* Particles */
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 1;
            pointer-events: none;
        }

        .particle {
            position: absolute;
            width: 3px;
            height: 3px;
            background: rgba(139, 92, 246, 0.6);
            border-radius: 50%;
            animation: float 20s infinite;
        }

        .particle:nth-child(2n) { background: rgba(236, 72, 153, 0.6); animation-duration: 25s; }
        .particle:nth-child(3n) { background: rgba(6, 182, 212, 0.6); animation-duration: 30s; }

        @keyframes float {
            0% { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(100px) scale(1); opacity: 0; }
        }
"""

def process_html_file(filepath):
    """Processa um arquivo HTML individual"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        modified = False
        
        # 1. Adicionar Outfit font import se não existir
        if 'Outfit' not in content and '<style>' in content:
            content = content.replace('<style>', f'<style>\n        {OUTFIT_IMPORT}\n')
            modified = True
        
        # 2. Atualizar font-family para incluir Outfit
        if "font-family: 'Inter'" in content:
            content = content.replace("font-family: 'Inter'", "font-family: 'Outfit', 'Inter'")
            modified = True
        
        # 3. Adicionar particles HTML se não existir
        if '<div class="particles">' not in content and '<body' in content:
            # Encontrar a tag body e adicionar particles logo após
            body_match = re.search(r'(<body[^>]*>)', content)
            if body_match:
                insert_pos = body_match.end()
                content = content[:insert_pos] + PARTICLES_HTML + content[insert_pos:]
                modified = True
        
        # 4. Adicionar CSS de animações se não existir
        if 'gradientShift' not in content and '<style>' in content:
            # Adicionar após a primeira ocorrência de body {
            style_section = re.search(r'(body\s*{[^}]*})', content)
            if style_section:
                insert_pos = style_section.end()
                content = content[:insert_pos] + '\n' + PREMIUM_CSS + content[insert_pos:]
                modified = True
        
        # 5. Atualizar selection color
        if 'selection:bg-purple-500' in content:
            content = content.replace('selection:bg-purple-500', 'selection:bg-pink-500')
            modified = True
        
        # 6. Atualizar header para glassmorphism
        if 'bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50' in content:
            content = content.replace(
                'bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50',
                'glass-panel sticky top-0 z-50 border-b-0 relative'
            )
            modified = True
        
        # Salvar se modificado
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Erro ao processar {filepath}: {e}")
        return False

def main():
    """Função principal"""
    # Arquivos a ignorar
    ignore_files = {'banco_testes.html', 'modelo.html'}
    
    # Contadores
    processed = 0
    modified = 0
    
    # Processar todos os arquivos HTML
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file.endswith('.html') and file not in ignore_files:
                filepath = os.path.join(root, file)
                processed += 1
                if process_html_file(filepath):
                    modified += 1
                    print(f"✓ {os.path.relpath(filepath, BASE_DIR)}")
    
    print(f"\n{'='*50}")
    print(f"Processados: {processed} arquivos")
    print(f"Modificados: {modified} arquivos")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
