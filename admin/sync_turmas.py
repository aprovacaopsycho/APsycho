import os
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

# Configuration
DB_PATH = os.path.join('assets', 'data', 'turmas_db.json')
SERVER_PORT = 8080

# ================= LÓGICA DE NEGÓCIO =================

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
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def process_sync_logic(turmas):
    """
    Nova versão: registra as turmas no JSON e cria arquivos específicos.
    Cria uma cópia de Base/index.html e Base/aulas.html para cada turma.
    Ex: Base/index_pmpr.html e altera links internos.
    """
    print(f"--- Registrando {len(turmas)} turmas no banco de dados ---")
    
    base_dir = os.path.join(os.path.dirname(__file__), '..', 'Base')
    base_index = os.path.join(base_dir, 'index.html')
    base_aulas = os.path.join(base_dir, 'aulas.html')

    created = 0
    for turma in turmas:
        name = turma.get('nome', '(sem nome)')
        pasta = turma.get('pasta', '')
        
        if not pasta or pasta.lower() == 'base':
            print(f"  ✓ {name}")
            continue

        target_index = os.path.join(base_dir, f"index_{pasta}.html")
        target_aulas = os.path.join(base_dir, f"aulas_{pasta}.html")
        
        if os.path.exists(base_index) and not os.path.exists(target_index):
            with open(base_index, 'r', encoding='utf-8') as f:
                content = f.read()
            content = content.replace('href="aulas.html"', f'href="aulas_{pasta}.html"')
            with open(target_index, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✓ {name} -> Criado index_{pasta}.html")
            created += 1
        elif os.path.exists(target_index):
            print(f"  ✓ {name} -> index_{pasta}.html já existe")
            
        if os.path.exists(base_aulas) and not os.path.exists(target_aulas):
            with open(base_aulas, 'r', encoding='utf-8') as f:
                content = f.read()
            content = content.replace('href="index.html"', f'href="index_{pasta}.html"')
            with open(target_aulas, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✓ {name} -> Criado aulas_{pasta}.html")
            created += 1
        elif os.path.exists(target_aulas):
             pass

    print(f"--- Concluído. Todas as turmas apontam para arquivos na /Base/ ---")
    return created


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
                
                # 2. Registra (sem criar pastas)
                count = process_sync_logic(turmas)
                
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = json.dumps({"status": "ok", "registered": count})
                self.wfile.write(response.encode('utf-8'))
                
                print(f"[AUTO-SYNC] Update recebido via Browser. Turmas registradas: {count}")
                
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                print(f"[ERRO SERVER] {e}")

def run_server():
    print(f"--- SERVIDOR DE AUTOMAÇÃO ATIVO (Porta {SERVER_PORT}) ---")
    print("Mantenha esta janela aberta para sincronização automática.")
    
    server = HTTPServer(('127.0.0.1', SERVER_PORT), SimpleHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor parado.")

def main():
    print("========================================")
    print("    GERENCIADOR DE TURMAS (SYNC)        ")
    print("========================================")
    print("1. Sincronizar Agora (Apenas Registro)")
    print("2. Iniciar Servidor (Ouvir Navegador)")
    choice = input("\nEscolha [1/2]: ")
    
    if choice == '2':
        run_server()
    else:
        print(f"\n--- SINCRONIZAÇÃO MANUAL ---")
        turmas = load_db()
        if not turmas:
            print("[AVISO] Nenhuma turma encontrada ou erro ao ler JSON.")
            return

        save_db(turmas)
        process_sync_logic(turmas)
        
        print("\n" + "="*40)
        print(f"CONCLUÍDO!")
        print("="*40)
        input("Pressione ENTER para sair...")

if __name__ == "__main__":
    main()
