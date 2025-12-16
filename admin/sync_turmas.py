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

# ================= SERVIDOR LOCAL (A Ponte) =================

class RequestHandler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, format, *args):
        # Override para forçar flush no stdout
        print(f"[{self.log_date_time_string()}] {format%args}")

    def _set_headers(self, code=200):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "*") # Allow ALL
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.end_headers()

    def do_GET(self):
        self._set_headers(200)
        self.wfile.write(b"OK - Server Online")

    def do_OPTIONS(self):
        print(f"[REQUISIÇÃO] OPTIONS recebido em {self.path}")
        self._set_headers(200)

    def do_POST(self):
        print(f"[REQUISIÇÃO] POST recebido em {self.path}")
        if self.path == '/sync-turmas':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                # 1. Recebe a lista atualizada do Front-end
                turmas_data = json.loads(post_data)
                
                # 2. Salva no disco (Persistence)
                save_db(turmas_data)
                
                # 3. Executa a criação de pastas
                created = process_sync_logic(turmas_data)
                
                # Resposta
                self._set_headers(200)
                response = {"status": "success", "created": created}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except Exception as e:
                self._set_headers(500)
                print(f"Erro no servidor: {e}")
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def do_POST(self):
        print(f"[REQUISIÇÃO] POST recebido em {self.path}")
        if self.path == '/sync-turmas':
            # ... existing logic
            pass 

# ... inside do_POST implementation ...

def run_server():
    print(f"🚀 Servidor de Automação rodando em http://127.0.0.1:{SERVER_PORT}")
    print("Mantenha esta janela aberta enquanto usa o Dashboard.")
    # Bind to 0.0.0.0 to accept all local connections (IPv4 safe)
    server = HTTPServer(('0.0.0.0', SERVER_PORT), RequestHandler)
    server.serve_forever()

if __name__ == "__main__":
    # Se rodar direto, inicia o servidor. 
    # Para rodar apenas o sync manual antigo, você pode comentar run_server() e chamar process_sync_logic(load_db())
    run_server()
