#!/bin/bash
# Parte automática del repaso semanal: correo → OCs → docs/.
# Las solicitudes [pedido] que queden en inbox/ las resuelve Claude (ver CLAUDE.md).
set -euo pipefail
cd "$(dirname "$0")/.."
echo "== Correo =="
osascript -l JavaScript scripts/leer_correo.js "$PWD" "${1:-10}"
echo "== Órdenes de compra =="
python3 -I scripts/procesar_correo.py
python3 -I scripts/publicar.py
