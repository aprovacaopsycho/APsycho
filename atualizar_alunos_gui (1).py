#!/usr/bin/env python3
"""
Interface gráfica simples para gerar PDFs personalizados a partir de uma
planilha Excel e um PDF base.

Esta interface utiliza Tkinter para permitir que o usuário escolha
visualmente os arquivos de planilha e PDF. Ao clicar em "Gerar PDFs",
ela lê a planilha, calcula hashes (SHA-256 de email+inscrição), cria
`chaves_completo.json` e gera PDFs personalizados usando as funções
existentes em `gerar_pdfs_com_chaves.py`.

Requisitos:
    - tkinter (incluído na maioria das distribuições Python)
    - pandas (`pip install pandas openpyxl`)
    - pymupdf (`pip install pymupdf`)

Coloque este script no mesmo diretório que:
    - gerar_pdfs_com_chaves.py
    - O PDF base

E execute:
    python atualizar_alunos_gui.py

O usuário poderá selecionar os arquivos e gerar os PDFs com um clique.
"""
import hashlib
import json
import os
import tkinter as tk
from tkinter import filedialog, messagebox
from typing import List, Dict

import pandas as pd

import fitz  # PyMuPDF


def parse_planilha(path_excel: str) -> List[Dict[str, str]]:
    """Lê a planilha Excel e extrai registros de e-mail, nome e inscrição.

    Retorna lista de dicionários com campos email, nome, inscricao e telefone.
    """
    # Detecta extensão e usa a função correta para ler
    ext = os.path.splitext(path_excel)[1].lower()
    registros = []
    if ext == '.csv':
        # Lê CSV como texto, permitindo múltiplas colunas (cada célula pode corresponder a uma parte)
        df = pd.read_csv(path_excel, header=None, dtype=str, encoding='utf-8', keep_default_na=False)
        # Junta as colunas não vazias em uma única string por linha, separando por vírgula
        linhas = df.apply(lambda r: ', '.join([str(x).strip() for x in r.dropna() if str(x).strip() != '']), axis=1)
    else:
        # Assume Excel (.xls/.xlsx) por padrão
        df = pd.read_excel(path_excel, header=None, dtype=str)
        # Se a planilha tiver a informação inteira na primeira coluna, use-a; caso contrário, junte as colunas
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
            lower = part.lower()
            if lower.startswith('nome:'):
                nome = part.split(':', 1)[1].strip()
            elif lower.startswith('inscrição:') or lower.startswith('inscricao:'):
                inscricao = part.split(':', 1)[1].strip()
            elif lower.startswith('telefone:'):
                telefone = part.split(':', 1)[1].strip()
        if email and inscricao:
            registros.append({'email': email, 'nome': nome, 'inscricao': inscricao, 'telefone': telefone})
    return registros


def calcular_hash(email: str, inscricao: str) -> str:
    concat = (email.strip().lower() + inscricao.strip()).encode('utf-8')
    return hashlib.sha256(concat).hexdigest()


def gerar_chaves_json(registros: List[Dict[str, str]], out_json: str) -> List[str]:
    """Gera chaves_completo.json e retorna lista de hashes geradas."""
    out_data = []
    hashes = []
    for r in registros:
        h = calcular_hash(r['email'], r['inscricao'])
        out_data.append({'hash': h, 'nome': r['nome'], 'inscricao': r['inscricao'], 'telefone': r.get('telefone', '')})
        hashes.append(h)
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(out_data, f, ensure_ascii=False, indent=2)
    return hashes


def gerar_pdfs(base_pdf: str, chaves_json: str, output_dir: str = 'pdf_com_chaves',
               hashes_basename: str = 'hashes', variable_name: str = 'VALID_HASHES'):
    """
    Gera PDFs personalizados com marca d’água e grava arquivos de hashes.

    Args:
        base_pdf: caminho do PDF original.
        chaves_json: arquivo JSON contendo registros com `hash`, `nome` e `inscricao`.
        output_dir: pasta onde serão salvos os PDFs personalizados.
        hashes_basename: prefixo do arquivo de hashes (`<prefixo>.json` e `<prefixo>.js`).
        variable_name: nome da variável JavaScript a ser atribuída com a lista de hashes.
    """
    os.makedirs(output_dir, exist_ok=True)
    with open(chaves_json, 'r', encoding='utf-8') as f:
        registros = json.load(f)
    for reg in registros:
        nome = reg.get('nome', '')
        inscricao = reg.get('inscricao', '')
        chave = reg.get('hash')
        if not chave:
            continue
        with fitz.open(base_pdf) as pdf:
            marca = f"Material de uso exclusivo de {nome} – Inscrição: {inscricao}"
            for pagina in pdf:
                pagina.insert_text((30, 30), marca, fontsize=10, color=(0.3, 0.3, 0.3), overlay=True)
            output_path = os.path.join(output_dir, f"{chave}.pdf")
            pdf.save(output_path)
    # Lista de hashes
    hashes = [reg['hash'] for reg in registros if reg.get('hash')]
    # Gera arquivo JSON de hashes
    hashes_json_path = os.path.join(os.path.dirname(chaves_json), f'{hashes_basename}.json')
    with open(hashes_json_path, 'w', encoding='utf-8') as f:
        json.dump(hashes, f, ensure_ascii=False, indent=2)
    # Gera arquivo JS com a variável especificada
    hashes_js_path = os.path.join(os.path.dirname(chaves_json), f'{hashes_basename}.js')
    with open(hashes_js_path, 'w', encoding='utf-8') as f:
        f.write(f'const {variable_name} = ' + json.dumps(hashes, ensure_ascii=False) + ';\n')
        f.write(f'if (typeof window !== "undefined") window.{variable_name} = {variable_name};')


def slugify(name: str) -> str:
    """Converte o nome de uma turma em um slug seguro para uso em nomes de arquivos e pastas."""
    import re
    # Converte para minúsculas, troca espaços por underscore e remove caracteres inválidos
    slug = name.strip().lower()
    slug = slug.replace(' ', '_')
    # Remove acentos e caracteres especiais
    import unicodedata
    slug = ''.join(c for c in unicodedata.normalize('NFD', slug) if unicodedata.category(c) != 'Mn')
    slug = re.sub(r'[^a-z0-9_]', '', slug)
    return slug


def processar(planilha_path: str, pdf_base_path: str, turma_nome: str):
    """
    Processa a planilha e o PDF para uma turma específica.

    Args:
        planilha_path: caminho da planilha Excel.
        pdf_base_path: caminho do PDF base.
        turma_nome: nome da turma, usado para criar pastas e arquivos.
    """
    registros = parse_planilha(planilha_path)
    if not registros:
        raise RuntimeError('Nenhum registro encontrado na planilha')
    # Gera slug e nomes
    slug = slugify(turma_nome)
    # Diretório de PDFs por turma
    output_dir = os.path.join(os.path.dirname(planilha_path), f'pdf_com_chaves_{slug}')
    # Caminho para chaves completo por turma
    chaves_json = os.path.join(os.path.dirname(planilha_path), f'chaves_completo_{slug}.json')
    # Arquivos de hashes
    hashes_basename = f'hashes_{slug}'
    # Nome da variável JS (ex: VALID_HASHES_TURMA)
    var_name = f'VALID_HASHES_{slug.upper()}'
    gerar_chaves_json(registros, chaves_json)
    gerar_pdfs(pdf_base_path, chaves_json, output_dir, hashes_basename, var_name)


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('Gerar PDFs Personalizados')
        self.geometry('500x250')
        self.planilha_path = tk.StringVar()
        self.pdf_path = tk.StringVar()
        self.turma_nome = tk.StringVar()
        # Widgets
        self.create_widgets()

    def create_widgets(self):
        padding = {'padx': 10, 'pady': 5}
        tk.Label(self, text='Selecione a planilha Excel:').grid(row=0, column=0, sticky='w', **padding)
        tk.Entry(self, textvariable=self.planilha_path, width=40).grid(row=1, column=0, **padding)
        tk.Button(self, text='Procurar...', command=self.browse_planilha).grid(row=1, column=1, **padding)

        tk.Label(self, text='Selecione o PDF base:').grid(row=2, column=0, sticky='w', **padding)
        tk.Entry(self, textvariable=self.pdf_path, width=40).grid(row=3, column=0, **padding)
        tk.Button(self, text='Procurar...', command=self.browse_pdf).grid(row=3, column=1, **padding)

        # Campo para nome da turma
        tk.Label(self, text='Nome da turma:').grid(row=4, column=0, sticky='w', **padding)
        tk.Entry(self, textvariable=self.turma_nome, width=40).grid(row=5, column=0, **padding)
        tk.Button(self, text='Gerar PDFs', command=self.run_process, width=20, bg='#4CAF50', fg='white').grid(row=6, column=0, columnspan=2, pady=20)

    def browse_planilha(self):
        file_path = filedialog.askopenfilename(title='Selecione a planilha Excel', filetypes=[('Planilhas Excel', '*.csv;*.xlsx;*.xls')])
        if file_path:
            self.planilha_path.set(file_path)

    def browse_pdf(self):
        file_path = filedialog.askopenfilename(title='Selecione o PDF base', filetypes=[('Arquivos PDF', '*.pdf')])
        if file_path:
            self.pdf_path.set(file_path)

    def run_process(self):
        planilha = self.planilha_path.get()
        pdf_base = self.pdf_path.get()
        turma = self.turma_nome.get().strip()
        if not planilha or not pdf_base or not turma:
            messagebox.showerror('Erro', 'Selecione a planilha, o PDF base e informe o nome da turma.')
            return
        try:
            processar(planilha, pdf_base, turma)
            slug = slugify(turma)
            out_dir = os.path.join(os.path.dirname(planilha), f'pdf_com_chaves_{slug}')
            messagebox.showinfo('Sucesso', f'PDFs gerados com sucesso! Verifique a pasta {out_dir}.')
        except Exception as e:
            messagebox.showerror('Erro', str(e))


if __name__ == '__main__':
    app = App()
    app.mainloop()