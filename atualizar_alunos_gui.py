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
    df = pd.read_excel(path_excel, header=None)
    registros = []
    for _, row in df.iterrows():
        if not row.empty:
            linha = str(row.iloc[0])
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


def gerar_pdfs(base_pdf: str, chaves_json: str, output_dir: str = 'pdf_com_chaves'):
    """Gera PDFs personalizados com marca d’água a partir de um JSON de chaves."""
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
    # Também gera hashes.js e hashes.json
    hashes = [reg['hash'] for reg in registros if reg.get('hash')]
    hashes_json_path = os.path.join(os.path.dirname(chaves_json), 'hashes.json')
    with open(hashes_json_path, 'w', encoding='utf-8') as f:
        json.dump(hashes, f, ensure_ascii=False, indent=2)
    hashes_js_path = os.path.join(os.path.dirname(chaves_json), 'hashes.js')
    with open(hashes_js_path, 'w', encoding='utf-8') as f:
        f.write('const VALID_HASHES = ' + json.dumps(hashes, ensure_ascii=False) + ';\n')
        f.write('if (typeof window !== "undefined") window.VALID_HASHES = VALID_HASHES;')


def processar(planilha_path: str, pdf_base_path: str):
    # Cria JSON e gera PDFs
    json_path = os.path.join(os.path.dirname(planilha_path), 'chaves_completo.json')
    registros = parse_planilha(planilha_path)
    if not registros:
        raise RuntimeError('Nenhum registro encontrado na planilha')
    gerar_chaves_json(registros, json_path)
    gerar_pdfs(pdf_base_path, json_path)


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('Gerar PDFs Personalizados')
        self.geometry('500x250')
        self.planilha_path = tk.StringVar()
        self.pdf_path = tk.StringVar()
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

        tk.Button(self, text='Gerar PDFs', command=self.run_process, width=20, bg='#4CAF50', fg='white').grid(row=4, column=0, columnspan=2, pady=20)

    def browse_planilha(self):
        file_path = filedialog.askopenfilename(title='Selecione a planilha Excel', filetypes=[('Planilhas Excel', '*.xlsx;*.xls')])
        if file_path:
            self.planilha_path.set(file_path)

    def browse_pdf(self):
        file_path = filedialog.askopenfilename(title='Selecione o PDF base', filetypes=[('Arquivos PDF', '*.pdf')])
        if file_path:
            self.pdf_path.set(file_path)

    def run_process(self):
        planilha = self.planilha_path.get()
        pdf_base = self.pdf_path.get()
        if not planilha or not pdf_base:
            messagebox.showerror('Erro', 'Selecione a planilha e o PDF base.')
            return
        try:
            processar(planilha, pdf_base)
            messagebox.showinfo('Sucesso', 'PDFs gerados com sucesso! Verifique a pasta pdf_com_chaves.')
        except Exception as e:
            messagebox.showerror('Erro', str(e))


if __name__ == '__main__':
    app = App()
    app.mainloop()