#!/usr/bin/env python3
"""
Utilitário para atualizar a lista de alunos a partir de uma planilha Excel e
gerar PDFs personalizados.

Este script faz duas coisas:
 1. Lê uma planilha Excel contendo registros de alunos (com campos de
    e-mail, nome, inscrição e telefone) e converte essas informações em
    um JSON (`chaves_completo.json`) com hashes calculadas a partir do
    e-mail e do número de inscrição. A hash é calculada como SHA-256 da
    concatenação (e-mail em minúsculas sem espaços + inscrição sem espaços).
 2. Chama o script `gerar_pdfs_com_chaves.py` para gerar os PDFs
    personalizados e os arquivos `hashes.json`/`hashes.js`.

Uso:
    Coloque este script, `gerar_pdfs_com_chaves.py` e o PDF base no mesmo
    diretório. Em seguida execute:

        python atualizar_alunos.py PLANILHA.xlsx cronograma-pc-pm-cbm-ce.pdf

    Isso irá ler a planilha, criar/atualizar `chaves_completo.json` com
    as hashes e gerar os PDFs personalizados na pasta `pdf_com_chaves`.

Dependências:
    - pandas para ler o Excel: `pip install pandas openpyxl`
    - PyMuPDF (fitz) para gerar PDFs: `pip install pymupdf`
    - O script `gerar_pdfs_com_chaves.py` deve estar no mesmo diretório.

Formato esperado da planilha:
    Cada linha deve conter uma string separada por vírgulas com os campos:
      "EMAIL, Nome:NOME COMPLETO, Inscrição:NUMERO, Telefone:TELEFONE"
    O script irá dividir os campos por vírgula e extrair os valores.

    Exemplo de linha:
      enfamirlorena@gmail.com, Nome:MIRLA LORENA DA SILVA PEREIRA, Inscrição:44981, Telefone:85999495255
"""
import hashlib
import json
import os
import subprocess
import sys
from typing import List, Dict

import pandas as pd


def parse_planilha(path_excel: str) -> List[Dict[str, str]]:
    """Lê a planilha Excel e extrai registros de e-mail, nome e inscrição.

    Args:
        path_excel: caminho para a planilha .xlsx

    Returns:
        Lista de dicionários com chaves: email, nome, inscricao, telefone (opcional).
    """
    # Lê a planilha como texto. Detecta CSV vs Excel e normaliza cada linha
    ext = os.path.splitext(path_excel)[1].lower()
    registros = []
    if ext == '.csv':
        df = pd.read_csv(path_excel, header=None, dtype=str, encoding='utf-8', keep_default_na=False)
        linhas = df.apply(lambda r: ', '.join([str(x).strip() for x in r.dropna() if str(x).strip() != '']), axis=1)
    else:
        df = pd.read_excel(path_excel, header=None, dtype=str)
        if df.shape[1] >= 1:
            linhas = df.iloc[:, 0].astype(str)
        else:
            linhas = df.apply(lambda r: ', '.join([str(x).strip() for x in r.dropna() if str(x).strip() != '']), axis=1)

    for linha in linhas:
        if linha is None:
            continue
        linha = str(linha).strip()
        if not linha:
            continue
        parts = [p.strip() for p in linha.split(',')]
        if not parts:
            continue
        email = parts[0].strip()
        nome = ''
        inscricao = ''
        telefone = ''
        for part in parts[1:]:
            if part.lower().startswith('nome:'):
                nome = part.split(':', 1)[1].strip()
            elif part.lower().startswith('inscrição:') or part.lower().startswith('inscricao:'):
                inscricao = part.split(':', 1)[1].strip()
            elif part.lower().startswith('telefone:'):
                telefone = part.split(':', 1)[1].strip()
        if email and inscricao:
            registros.append({'email': email, 'nome': nome, 'inscricao': inscricao, 'telefone': telefone})
    return registros


def calcular_hash(email: str, inscricao: str) -> str:
    """Calcula a hash SHA-256 de email+inscrição.

    O e-mail é convertido para minúsculas e ambos os campos são
    removidos de espaços antes do cálculo.

    Returns:
        Hexadecimal da hash.
    """
    concat = (email.strip().lower() + inscricao.strip()).encode('utf-8')
    return hashlib.sha256(concat).hexdigest()


def gerar_chaves_json(registros: List[Dict[str, str]], out_json: str):
    """Gera o arquivo chaves_completo.json a partir dos registros.

    Args:
        registros: lista de dicts com email, nome, inscricao e telefone
        out_json: caminho onde salvar o JSON
    """
    out_data = []
    for r in registros:
        h = calcular_hash(r['email'], r['inscricao'])
        out_data.append({'hash': h, 'nome': r['nome'], 'inscricao': r['inscricao'], 'telefone': r.get('telefone', '')})
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(out_data, f, ensure_ascii=False, indent=2)
    print(f"Arquivo {out_json} gerado com {len(out_data)} registros.")


def main():
    if len(sys.argv) < 3:
        print("Uso: python atualizar_alunos.py PLANILHA.xlsx PDF_BASE [PASTA_SAIDA]")
        sys.exit(1)
    planilha = sys.argv[1]
    pdf_base = sys.argv[2]
    # Por padrão salva json e pdfs na pasta atual
    pasta_saida = sys.argv[3] if len(sys.argv) > 3 else '.'
    # Extrai registros
    registros = parse_planilha(planilha)
    if not registros:
        print("Nenhum registro encontrado na planilha.")
        sys.exit(1)
    # Define caminho do JSON completo
    json_path = os.path.join(pasta_saida, 'chaves_completo.json')
    gerar_chaves_json(registros, json_path)
    # Agora chama o script de geração de PDFs
    script_dir = os.path.dirname(os.path.abspath(__file__))
    gerar_script = os.path.join(script_dir, 'gerar_pdfs_com_chaves.py')
    cmd = [sys.executable, gerar_script]
    # Ajusta variáveis de ambiente para usar o PDF base e JSON gerado
    # O script gerar_pdfs_com_chaves lê BASE_PDF e JSON_CHAVES se definidos
    env = os.environ.copy()
    env['BASE_PDF'] = pdf_base
    env['JSON_CHAVES'] = json_path
    try:
        print("Gerando PDFs personalizados...")
        subprocess.check_call(cmd, env=env)
    except subprocess.CalledProcessError as e:
        print("Erro ao gerar PDFs:", e)
        sys.exit(1)
    print("Processo concluído. Atualize seu site com os arquivos gerados.")


if __name__ == '__main__':
    main()