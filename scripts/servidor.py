"""Servidor local para editar los pedidos desde la web (con precios y PDFs).

Sirve docs/ pero con los datos completos de data/, y guarda los cambios en
data/pedidos.json (y regenera docs/ con publicar.py).
Uso: python3 scripts/servidor.py  → http://localhost:8765
"""
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import publicar

ROOT = Path(__file__).resolve().parent.parent
PORT = 8765
RUTAS = {"/pedidos.json": ROOT / "data/pedidos.json", "/catalogo.json": ROOT / "data/catalogo.json"}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT / "docs"), **kw)

    def translate_path(self, path):
        clean = path.split("?")[0]
        if clean in RUTAS:
            return str(RUTAS[clean])
        if clean.startswith("/recibos/"):
            return str(ROOT / clean.lstrip("/"))
        return super().translate_path(path)

    def do_GET(self):
        if self.path == "/api/estado":
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ok")
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/pedidos":
            self.send_error(404)
            return
        pedidos = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        destino = ROOT / "data/pedidos.json"
        tmp = destino.with_suffix(".tmp")
        tmp.write_text(json.dumps(pedidos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        os.replace(tmp, destino)
        publicar.main()
        self.send_response(204)
        self.end_headers()


if __name__ == "__main__":
    print(f"Pedidos en http://localhost:{PORT}  (Ctrl-C para parar)")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
