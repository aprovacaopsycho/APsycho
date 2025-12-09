#!/usr/bin/env python3
"""
Utility to add test members to a JSON file used by the static validation flow.
It computes SHA-256(email + senha) to match the client-side logic used in
`membros.html` / `membros.html`.

Usage:
  python scripts/add_member.py --email user@example.com --senha secret
  python scripts/add_member.py   (interactive prompt)

Security note: This is intended for local/test use only. Storing unhashed
passwords or using this in production is NOT recommended. Prefer server-side
authentication for real deployments.
"""
import argparse
import hashlib
import json
from pathlib import Path

DEFAULT_FILE = Path(__file__).resolve().parents[1] / 'hashes_membros.json'


def sha256_hex(msg: str) -> str:
    h = hashlib.sha256()
    h.update(msg.encode('utf-8'))
    return h.hexdigest()


def load_hashes(path: Path):
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
        if isinstance(data, list):
            return data
        # try common structures
        if isinstance(data, dict):
            for key in ('validHashes','hashes','items'):
                if key in data and isinstance(data[key], list):
                    return data[key]
        return []
    except Exception as e:
        print('Falha ao ler', path, ':', e)
        return []


def save_hashes(path: Path, arr):
    path.write_text(json.dumps(arr, indent=2, ensure_ascii=False), encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description='Adiciona um membro (gera hash SHA256 de email+senha)')
    parser.add_argument('--email', '-e', help='E-mail do membro')
    parser.add_argument('--senha', '-s', help='Senha do membro')
    parser.add_argument('--out', '-o', help='Arquivo JSON de saída (padrão: hashes_membros.json)', default=str(DEFAULT_FILE))
    parser.add_argument('--show', action='store_true', help='Apenas mostra o hash calculado, não salva')
    args = parser.parse_args()

    email = args.email
    senha = args.senha

    if not email:
        email = input('E-mail: ').strip()
    if not senha:
        # nota: senha via input() pode aparecer no terminal; use apenas para testes
        senha = input('Senha: ').strip()

    if not email or not senha:
        print('E-mail e senha são obrigatórios.')
        return

    hash_value = sha256_hex(email.strip().lower() + senha)
    print('Hash calculado:', hash_value)

    if args.show:
        return

    out_path = Path(args.out)
    arr = load_hashes(out_path)
    if hash_value in arr:
        print('Hash já existe no arquivo:', out_path)
    else:
        arr.append(hash_value)
        save_hashes(out_path, arr)
        print('Hash salvo em', out_path)


if __name__ == '__main__':
    main()
