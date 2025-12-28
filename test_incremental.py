import os
import shutil
import importlib.util
import pandas as pd
import fitz


def create_excel(path, lines):
    # Cria um DataFrame com uma única coluna onde cada célula tem o formato esperado
    df = pd.DataFrame(lines)
    df.to_excel(path, index=False, header=False)


def create_base_pdf(path):
    doc = fitz.open()
    doc.new_page()
    doc.save(path)
    doc.close()


def load_module(path):
    spec = importlib.util.spec_from_file_location('atualizar_mod', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def list_pdfs(dirpath):
    if not os.path.exists(dirpath):
        return []
    return sorted([f for f in os.listdir(dirpath) if f.endswith('.pdf')])


def main():
    cwd = os.getcwd()
    tmp = os.path.join(cwd, 'tmp_test')
    if os.path.exists(tmp):
        shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp, exist_ok=True)

    plan1 = os.path.join(tmp, 'planilha1.xlsx')
    plan2 = os.path.join(tmp, 'planilha_novos.xlsx')
    base_pdf = os.path.join(tmp, 'base.pdf')

    # Linhas no formato que parse_planilha espera
    linhas1 = [
        'aluno1@example.com, nome:Aluno Um, inscricao:1001',
        'aluno2@example.com, nome:Aluno Dois, inscricao:1002',
    ]
    linhas2 = [
        'aluno3@example.com, nome:Aluno Tres, inscricao:1003',
    ]

    create_excel(plan1, linhas1)
    create_excel(plan2, linhas2)
    create_base_pdf(base_pdf)

    mod_path = os.path.join(cwd, 'atualizar_alunos_gui (1).py')
    mod = load_module(mod_path)

    turma = 'Ceara Teste'

    print('--- Primeira execução (2 alunos) ---')
    novos1 = mod.processar(plan1, base_pdf, turma)
    print('novos retornados:', novos1)
    # Agora a saída é na pasta do script (programa)
    out_dir = os.path.join(os.path.dirname(mod_path), f'pdf_com_chaves_{mod.slugify(turma)}')
    print('PDFs gerados:', list_pdfs(out_dir))

    print('\n--- Segunda execução (1 aluno novo) ---')
    novos2 = mod.processar(plan2, base_pdf, turma)
    print('novos retornados:', novos2)
    print('PDFs agora:', list_pdfs(out_dir))


if __name__ == '__main__':
    main()
