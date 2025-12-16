import os
import shutil
import json
import re
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading

# Configuration
DB_PATH = os.path.join('admin', 'private', 'turmas_db.json')
BASE_DIR = os.getcwd()
SERVER_PORT = 8080

# ================= LÓGICA DE NEGÓCIO (Reutilizável) =================

def load_db():
    if not os.path.exists(DB_PATH):
        return []
    try:
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading DB: {e}")
        return []

def save_db(data):
    # Garante que o diretório existe
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def safe_replace(content, new_name, new_image=None):
    # 1. Troca Título e Nome da Turma
    def title_sub(match):
        return match.group(0).replace('PMPR', new_name)
    content = re.sub(r'<title>.*?</title>', title_sub, content, flags=re.IGNORECASE)
    content = content.replace('>PMPR <', f'>{new_name} <')
    content = content.replace('Módulo PMPR', f'Módulo {new_name}')

    # 2. Troca Imagem de Fundo (Se fornecida)
    DEFAULT_IMG = "https://www.pmpr.pr.gov.br/sites/default/arquivos_restritos/files/imagem/2025-07/img_1121_0.jpg"
    if new_image and new_image.strip():
        content = content.replace(DEFAULT_IMG, new_image.strip())
        
    return content

def process_sync_logic(turmas):
    print(f"--- Iniciando Sincronização de {len(turmas)} turmas ---")
    changes_count = 0
    
    for turma in turmas:
        name = turma.get('nome')
        folder_slug = turma.get('pasta')
        base_folder = turma.get('base', 'PMPR')
        imagem = turma.get('imagem')

        if not folder_slug: continue

        target_path = os.path.join(BASE_DIR, folder_slug)
        source_path = os.path.join(BASE_DIR, base_folder)

        # Se a pasta não existe, cria
        if not os.path.exists(target_path):
            if not os.path.exists(source_path):
                print(f"[ERRO] Pasta base {base_folder} não encontrada.")
                continue
            
            print(f"[CRIANDO] {folder_slug} (Base: {base_folder})...")
            try:
                shutil.copytree(source_path, target_path)
                
                # Atualiza Headers e Imagens
                for root, _, files in os.walk(target_path):
                    for file in files:
                        if file.endswith('.html'):
                            file_path = os.path.join(root, file)
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                            
                            new_content = safe_replace(content, name, imagem)
                            
                            if content != new_content:
                                with open(file_path, 'w', encoding='utf-8') as f:
                                    f.write(new_content)
                changes_count += 1
            except Exception as e:
                print(f"[ERRO] Falha ao criar {folder_slug}: {e}")
    
    print(f"--- Fim (Novas pastas criadas: {changes_count}) ---")
    return changes_count


# ... (No changes to logic functions)


# ================= SERVER LOGIC (AUTO-SYNC) =================
class SimpleHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/sync-turmas':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                turmas = json.loads(post_data.decode('utf-8'))
                
                # 1. Salva DB
                save_db(turmas)
                
                # 2. Processa (Criação)
                created = process_sync_logic(turmas)
                
                # 3. Processa (Limpeza/Rename - Opcional no AutoSync, mas seguro listar)
                # No modo server, não perguntamos interativamente para não travar,
                # Mas poderiamos implementar um flag force. Por segurança, apenas criamos no auto-sync.
                
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = json.dumps({"status": "ok", "created": created})
                self.wfile.write(response.encode('utf-8'))
                
                # Log no terminal do servidor
                print(f"[AUTO-SYNC] Recebido update via Browser. Pastas criadas: {created}")
                
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                print(f"[ERRO SERVER] {e}")

def run_server():
    print(f"--- SERVIDOR DE AUTOMAÇÃO ATIVO (Porta {SERVER_PORT}) ---")
    print("Mantenha esta janela aberta para sincronização automática.")
    print("Para sincronizar/limpar manualmente, pare o servidor (Ctrl+C) e rode o script novamente.")
    
    server = HTTPServer(('127.0.0.1', SERVER_PORT), SimpleHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor parado.")

def main():
    print("========================================")
    print("    GERENCIADOR DE TURMAS (SYNC)        ")
    print("========================================")
    print("1. Sincronizar Agora (Apenas Criação/Update)")
    print("2. Iniciar Servidor (Ouvir Navegador)")
    choice = input("\nEscolha [1/2]: ")
    
    if choice == '2':
        run_server()
    else:
        # Modo Manual (Padrão)
        print(f"\n--- SINCRONIZAÇÃO MANUAL ---")
        turmas = load_db()
        if not turmas:
            print("[AVISO] Nenhuma turma encontrada ou erro ao ler JSON.")
            return

        # 1. Criação
        process_sync_logic(turmas)
        
        # 2. Limpeza (Removido por segurança)
        # prune_orphans(turmas)
        
        print("\n" + "="*40)
        print(f"CONCLUÍDO!")
        print("="*40)
        input("Pressione ENTER para sair...")

if __name__ == "__main__":
    main()
