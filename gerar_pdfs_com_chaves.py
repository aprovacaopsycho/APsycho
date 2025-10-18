#!/usr/bin/env python3
"""
Script para gerar PDFs personalizados com marca d’água a partir de uma lista de alunos.

Uso:
  Coloque este script no mesmo diretório que:
    - O arquivo PDF base (por exemplo, `cronograma-pc-pm-cbm-ce_5.pdf`)
    - O arquivo `chaves_completo.json` contendo um array de objetos com campos
      `hash`, `nome` e `inscricao` (número de inscrição).

  Execute o script:
    python gerar_pdfs_com_chaves.py

  Será criada uma pasta chamada `pdf_com_chaves` contendo um PDF
  personalizado para cada entrada do JSON. O nome do arquivo será o valor
  do campo `hash` com a extensão `.pdf`.

Dependências:
  Este script utiliza a biblioteca PyMuPDF (`fitz`). A depender do ambiente,
  pode ser instalada com:
    pip install pymupdf
"""
import json
import os
import fitz  # PyMuPDF


def gerar_pdfs(base_pdf: str, json_chaves: str, output_dir: str = "pdf_com_chaves"):
    """Gera PDFs com marca d’água para cada entrada em um arquivo JSON.

    Args:
        base_pdf: Caminho para o PDF original que servirá de modelo.
        json_chaves: Caminho para o JSON contendo `hash`, `nome` e `inscricao`.
        output_dir: Diretório onde os PDFs personalizados serão salvos.
    """
    # Cria a pasta de saída, se necessário
    os.makedirs(output_dir, exist_ok=True)

    # Carrega os registros do JSON
    with open(json_chaves, "r", encoding="utf-8") as f:
        registros = json.load(f)

    print(f"Gerando PDFs personalizados a partir de {base_pdf}...")
    for reg in registros:
        nome = reg.get("nome", "")
        inscricao = reg.get("inscricao", "")
        chave = reg.get("hash")
        if not chave:
            continue
        # Abre o PDF base
        with fitz.open(base_pdf) as pdf:
            # Monta o texto da marca d’água
            marca = f"Material de uso exclusivo de {nome} – Inscrição: {inscricao}"
            for pagina in pdf:
                # Insere o texto 30 pontos abaixo do topo (coordenadas em points)
                pagina.insert_text(
                    (30, 30),
                    marca,
                    fontsize=10,
                    color=(0.3, 0.3, 0.3),
                    overlay=True,
                )
            # Salva com o nome da chave
            caminho_saida = os.path.join(output_dir, f"{chave}.pdf")
            pdf.save(caminho_saida)
        print(f"Salvo: {caminho_saida}")
    print("Concluído.")

    # Após gerar todos os PDFs, salvamos também um arquivo com apenas as hashes.
    hashes = [reg.get("hash") for reg in registros if reg.get("hash")]
    # Caminho do arquivo hashes.json, um nível acima da pasta de PDFs
    hashes_json_path = os.path.join(output_dir, '..', 'hashes.json')
    with open(hashes_json_path, 'w', encoding='utf-8') as hash_file:
        import json as _json
        _json.dump(hashes, hash_file, ensure_ascii=False, indent=2)
    print(f"Lista de hashes salva em {hashes_json_path}")

    # Também salvamos um arquivo hashes.js que define a variável global VALID_HASHES.
    # Isso permite que a página HTML carregue a lista de hashes via <script src="hashes.js"></script>
    # mesmo quando o site é aberto localmente (file://), sem depender de fetch.
    hashes_js_path = os.path.join(output_dir, '..', 'hashes.js')
    with open(hashes_js_path, 'w', encoding='utf-8') as js_file:
        js_file.write('const VALID_HASHES = ')
        import json as _json
        js_file.write(_json.dumps(hashes, ensure_ascii=False))
        js_file.write(';\n')
        js_file.write('if (typeof window !== "undefined") window.VALID_HASHES = VALID_HASHES;')
    print(f"Script de hashes salvo em {hashes_js_path}")


if __name__ == "__main__":
    # Defina os nomes dos arquivos conforme necessário.
    BASE_PDF = "cronograma-pc-pm-cbm-ce.pdf"
    JSON_CHAVES = "chaves_completo.json"
    OUTPUT_DIR = "pdf_com_chaves"
    gerar_pdfs(BASE_PDF, JSON_CHAVES, OUTPUT_DIR)