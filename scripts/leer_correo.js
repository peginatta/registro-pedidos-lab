// Lee Apple Mail y vuelca a inbox/ los correos relevantes que aún no se han procesado.
//   - Asunto con "[pedido]"                 → solicitud (lo que hay que comprar)
//   - Asunto "... OC-xxxxx ... implantado"  → orden de compra emitida (+ PDF a recibos/)
// Uso: osascript -l JavaScript scripts/leer_correo.js <raiz-proyecto> <dias-atras>
ObjC.import("Foundation");

function run(argv) {
  const root = argv[0];
  const dias = parseInt(argv[1] || "8", 10);
  const Mail = Application("Mail");

  const vistosPath = root + "/data/correo-procesado.json";
  let vistos = [];
  try { vistos = JSON.parse($.NSString.stringWithContentsOfFileEncodingError(vistosPath, $.NSUTF8StringEncoding, null).js); } catch (e) {}
  const visto = new Set(vistos);

  const desde = new Date(Date.now() - dias * 86400000);
  const escribir = (path, text) =>
    $(text).writeToFileAtomicallyEncodingError(path, true, $.NSUTF8StringEncoding, null);
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);

  const nuevos = [];
  for (const acc of Mail.accounts()) {
    let box;
    try { box = acc.mailboxes.byName("INBOX"); box.name(); } catch (e) {
      try { box = acc.mailboxes.byName("Inbox"); box.name(); } catch (e2) { continue; }
    }
    const filtros = [
      { tipo: "solicitud", q: { _and: [{ subject: { _contains: "[pedido]" } }, { dateReceived: { _greaterThan: desde } }] } },
      { tipo: "oc", q: { _and: [{ subject: { _contains: "implantado" } }, { subject: { _contains: "OC-" } }, { dateReceived: { _greaterThan: desde } }] } },
    ];
    for (const { tipo, q } of filtros) {
      for (const m of box.messages.whose(q)()) {
        try {
        const id = m.messageId();
        if (visto.has(id)) continue;
        const fecha = m.dateReceived();
        const subject = m.subject();
        const adjuntos = [];
        if (tipo === "oc") {
          for (const a of m.mailAttachments()) {
            const name = a.name();
            if (!/\.pdf$/i.test(name)) continue;
            const dest = root + "/recibos/" + name;
            Mail.save(a, { in: Path(dest) });
            adjuntos.push("recibos/" + name);
          }
        }
        const oc = (subject.match(/OC-\d+/) || [""])[0];
        const slug = tipo === "oc" ? oc : id.replace(/[^A-Za-z0-9]/g, "").slice(0, 16);
        const file = "inbox/" + iso(fecha).slice(0, 10) + "_" + tipo + "_" + slug + ".json";
        escribir(root + "/" + file, JSON.stringify({
          tipo, messageId: id, de: m.sender(), fecha: iso(fecha), asunto: subject,
          cuerpo: m.content(), adjuntos,
        }, null, 2));
        visto.add(id);
        nuevos.push(file);
        } catch (e) { nuevos.push("ERROR " + acc.name() + ": " + e.message); }
      }
    }
  }
  escribir(vistosPath, JSON.stringify([...visto], null, 2));
  return JSON.stringify(nuevos, null, 2);
}
