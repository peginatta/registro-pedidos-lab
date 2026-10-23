"""Procesa las órdenes de compra (OC) volcadas en inbox/ por leer_correo.js.

Para cada OC: lee el PDF, saca las líneas (ref, cantidad, precio sin IVA), las casa
con los pedidos de data/pedidos.json y los pasa a estado "pedido" con su OC y precio.
Todo lo de la OC queda en data/compras.json (privado). Las líneas que no casan con
ningún pedido se guardan igual en compras.json como "sin registrar".

Las solicitudes [pedido] NO se procesan aquí (hace falta buscar referencias): se
listan para que Claude las resuelva.

Uso: python3 scripts/procesar_correo.py
"""
import json
import re
import shutil
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

import pypdf

ROOT = Path(__file__).resolve().parent.parent
INBOX = ROOT / "inbox"
PROCESADO = INBOX / "procesado"
DIAS_HASTA_RECIBIDO = 14  # no llega correo de recepción: se da por recibido pasado este margen
PEDIDOS = ROOT / "data" / "pedidos.json"
COMPRAS = ROOT / "data" / "compras.json"

NUM = r"[\d.,]+"
LINEA = re.compile(rf"^(.*?)\s*(\d\d-\d\d-\d{{4}})\s+({NUM})\s+({NUM})\s+({NUM})\s+({NUM})\s+({NUM})\s*$")
ENTIDADES = {"aacute": "á", "eacute": "é", "iacute": "í", "oacute": "ó", "uacute": "ú",
             "ntilde": "ñ", "sup2": "²", "micro": "µ"}


def leer_json(path, defecto):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return defecto


def guardar_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def numero(s):
    """'1.206,00' → 1206.0 ; '1,206.00' → 1206.0 ; '54,93' → 54.93"""
    if "," in s and "." in s:
        dec = "," if s.rfind(",") > s.rfind(".") else "."
    else:
        dec = "," if "," in s else "."
    miles = "." if dec == "," else ","
    return float(s.replace(miles, "").replace(dec, "."))


def norm(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def limpiar(s):
    for k, v in ENTIDADES.items():
        s = s.replace(k, v)
    return re.sub(r"\s+", " ", s).strip()


def campo_mail(cuerpo, etiqueta):
    m = re.search(rf"\n{etiqueta}\n(.+)", cuerpo)
    return m.group(1).replace("￼", "").strip() if m else ""


def parsear_pdf(path):
    texto = "\n".join(p.extract_text() or "" for p in pypdf.PdfReader(path).pages)
    lineas_txt = texto.split("\n")
    lineas, inicio = [], 0
    for i, l in enumerate(lineas_txt):
        if re.search(r"\b(Ubicación|Ship To Location)$", l):
            inicio = i + 1
        m = LINEA.match(l)
        if not m:
            continue
        prefijo = m.group(1)
        desc = limpiar(" ".join(lineas_txt[inicio:i] + [prefijo]))
        cantidad, precio, importe, iva, total = (numero(m.group(k)) for k in range(3, 8))
        lineas.append({
            "texto": prefijo or (lineas_txt[i - 2] + lineas_txt[i - 1]),
            "descripcion": desc,
            "entrega": datetime.strptime(m.group(2), "%d-%m-%Y").strftime("%Y-%m-%d"),
            "cantidad": cantidad, "precioUd": precio, "importe": importe,
            "iva": iva, "total": total,
        })
        inicio = i + 1
    total = re.search(rf"(?:Importe Total de la orden de compra|Total Purchase Order) ({NUM})", texto)
    return lineas, numero(total.group(1)) if total else None


def casar(linea, pedidos, fecha_oc):
    """Pedido más antiguo sin OC cuya ref aparece en la línea (o viceversa)."""
    t = norm(linea["texto"])
    candidatos = []
    for p in pedidos:
        r = norm(p.get("ref"))
        if p.get("oc") or len(r) < 5 or p["fecha"] > fecha_oc:
            continue
        if r in t or (len(t) >= 5 and t in r):
            candidatos.append(p)
    return min(candidatos, key=lambda p: (p["fecha"], p["id"])) if candidatos else None


def main():
    pedidos = leer_json(PEDIDOS, [])
    compras = leer_json(COMPRAS, [])
    ya = {c["oc"] for c in compras}
    PROCESADO.mkdir(exist_ok=True)
    informe, solicitudes = [], []

    for f in sorted(INBOX.glob("*.json")):
        msg = leer_json(f, {})
        if msg.get("tipo") == "solicitud":
            solicitudes.append(f.name)
            continue
        oc = re.search(r"OC-\d+", msg["asunto"]).group(0)
        sc = (re.search(r"SC-\d+", msg["asunto"]) or [""])[0]
        if oc in ya:
            shutil.move(f, PROCESADO / f.name)
            continue
        fecha = msg["fecha"][:10]
        pdf = next((a for a in msg.get("adjuntos", []) if a.lower().endswith(".pdf")), None)
        lineas, total = parsear_pdf(ROOT / pdf) if pdf else ([], None)
        compra = {
            "oc": oc, "sc": sc, "fecha": fecha,
            "proveedor": campo_mail(msg["cuerpo"], "Proveedor"),
            "comprador": campo_mail(msg["cuerpo"], "Comprador"),
            "importeSinIva": numero(campo_mail(msg["cuerpo"], "Ordenado") or "0"),
            "totalConIva": total, "pdf": pdf, "lineas": lineas,
        }
        for l in lineas:
            p = casar(l, pedidos, fecha)
            if not p:
                l["pedidoId"] = None
                informe.append(f"  ? {oc} sin registrar: {l['descripcion'][:60]} (x{l['cantidad']:g}, {l['precioUd']:.2f} €/ud)")
                continue
            l["pedidoId"] = p["id"]
            p.update(oc=oc, sc=sc, fechaPedido=fecha, entregaPrevista=l["entrega"],
                     precioUd=l["precioUd"], importe=l["importe"], cantidadOC=l["cantidad"], pdf=pdf)
            if p["estado"] == "pendiente":
                p["estado"] = "pedido"
            aviso = "" if l["cantidad"] == p["cantidad"] else f"  ⚠ cantidad OC {l['cantidad']:g} ≠ registrada {p['cantidad']}"
            informe.append(f"  ✓ {oc} → #{p['id']} {p['producto'][:45]} · {l['precioUd']:.2f} €/ud{aviso}")
        if not lineas:
            informe.append(f"  ! {oc}: no se pudieron leer líneas del PDF ({pdf})")
        compras.append(compra)
        ya.add(oc)
        shutil.move(f, PROCESADO / f.name)

    limite = (date.today() - timedelta(days=DIAS_HASTA_RECIBIDO)).isoformat()
    for p in pedidos:
        if p["estado"] == "pedido" and p.get("entregaPrevista", "9999") < limite:
            p.update(estado="recibido", fechaRecibido=p["entregaPrevista"], recibidoAuto=True)
            informe.append(f"  ↓ #{p['id']} {p['producto'][:45]} → recibido (entrega prevista {p['entregaPrevista']})")

    compras.sort(key=lambda c: c["fecha"])
    guardar_json(PEDIDOS, pedidos)
    guardar_json(COMPRAS, compras)
    print("Órdenes de compra:" if informe else "Sin órdenes de compra nuevas.")
    print("\n".join(informe))
    if solicitudes:
        print("\nSolicitudes [pedido] por resolver (inbox/):")
        print("\n".join("  - " + s for s in solicitudes))


if __name__ == "__main__":
    sys.exit(main())
