"""Servidor local para editar los pedidos desde la web (con precios y PDFs).

Sirve docs/ pero con los datos completos de data/, y guarda los cambios en
data/pedidos.json (y regenera docs/ con publicar.py).
Uso: python3 scripts/servidor.py  → http://localhost:8765
"""
import json
import os
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import publicar

ROOT = Path(__file__).resolve().parent.parent
PORT = 8765
BLOQUEO = threading.Lock()
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
        if self.path != "/api/cambio":
            self.send_error(404)
            return
        cambio = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        destino = ROOT / "data/pedidos.json"
        with BLOQUEO:
            pedidos = json.loads(destino.read_text(encoding="utf-8"))
            if cambio["op"] == "update":
                for p in pedidos:
                    if p["id"] == cambio["id"]:
                        for k, v in cambio["campos"].items():
                            if v is None:
                                p.pop(k, None)
                            else:
                                p[k] = v
            elif cambio["op"] == "delete":
                pedidos = [p for p in pedidos if p["id"] != cambio["id"]]
            elif cambio["op"] == "add":
                pedidos.append({"id": max((p["id"] for p in pedidos), default=0) + 1, **cambio["pedido"]})
            tmp = destino.with_suffix(".tmp")
            tmp.write_text(json.dumps(pedidos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            os.replace(tmp, destino)
            publicar.main()
        cuerpo = json.dumps(pedidos, ensure_ascii=False).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(cuerpo)

if __name__ == "__main__":
    print(f"Pedidos en http://localhost:{PORT}  (Ctrl-C para parar)")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
