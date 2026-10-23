"""Genera la copia pública de los datos en docs/ (lo que ve GitHub Pages).

Quita precios, importes y rutas a PDFs; el resto de data/pedidos.json se publica tal cual.
Uso: python3 scripts/publicar.py [--push]   (--push hace commit + push si hay cambios)
"""
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRIVADO = {"precioUd", "importe", "pdf", "sc"}


def escribir(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    pedidos = json.loads((ROOT / "data/pedidos.json").read_text(encoding="utf-8"))
    catalogo = json.loads((ROOT / "data/catalogo.json").read_text(encoding="utf-8"))
    publicos = [{k: v for k, v in p.items() if k not in PRIVADO} for p in pedidos]

    destino = ROOT / "docs/pedidos.json"
    antes = destino.read_text(encoding="utf-8") if destino.exists() else ""
    escribir(destino, publicos)
    escribir(ROOT / "docs/catalogo.json", catalogo)
    cambiado = destino.read_text(encoding="utf-8") != antes
    if cambiado:
        escribir(ROOT / "docs/meta.json", {"actualizado": datetime.now().isoformat(timespec="minutes")})
    print(f"docs/ actualizado ({len(publicos)} pedidos){'' if cambiado else ' — sin cambios'}")

    if "--push" in sys.argv:
        git = lambda *a: subprocess.run(["git", "-C", str(ROOT), *a], check=True)
        git("add", "-A")
        if subprocess.run(["git", "-C", str(ROOT), "diff", "--cached", "--quiet"]).returncode:
            git("commit", "-m", f"Actualiza pedidos {datetime.now():%Y-%m-%d}")
            git("push")
        else:
            print("Nada que subir.")


if __name__ == "__main__":
    main()
