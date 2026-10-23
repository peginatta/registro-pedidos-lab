// Lee Apple Mail y vuelca a inbox/ los correos relevantes que aún no se han procesado.
//   - Asunto con "[pedido]"                 → solicitud (lo que hay que comprar)
//   - Asunto "... OC-xxxxx ... implantado"  → orden de compra emitida (+ PDF a recibos/)
//   - Tienda Teknovas "Pedido enviado ..."   → envío (total o parcial) de una OC
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
  // Las solicitudes pueden acabar en spam (pasó con la primera prueba): se miran también ahí.
  const SPAM = ["Spam", "Junk", "Junk E-mail", "Correo no deseado", "[Gmail]/Spam"];
  for (const acc of Mail.accounts()) {
    const buzones = [];
    for (const nombre of ["INBOX", "Inbox", ...SPAM]) {
      try { const b = acc.mailboxes.byName(nombre); b.name(); buzones.push(b); } catch (e) {}
    }
    for (const box of buzones) {
    const esSpam = SPAM.includes(box.name());
    const filtros = [
      { tipo: "solicitud", q: { _and: [{ subject: { _contains: "[pedido]" } }, { dateReceived: { _greaterThan: desde } }] } },
      { tipo: "oc", q: { _and: [{ subject: { _contains: "implantado" } }, { subject: { _contains: "OC-" } }, { dateReceived: { _greaterThan: desde } }] } },
      { tipo: "envio", q: { _and: [{ sender: { _contains: "teknovas" } }, { subject: { _beginsWith: "Pedido enviado" } }, { dateReceived: { _greaterThan: desde } }] } },
    ];
    for (const { tipo, q } of filtros) {
      if (esSpam && tipo !== "solicitud") continue;
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
        const oc = ((tipo === "envio" ? m.content() : subject).match(/OC-\d+/) || [""])[0];
        const slug = tipo === "solicitud" ? id.replace(/[^A-Za-z0-9]/g, "").slice(0, 16) : oc + (tipo === "envio" ? "_" + iso(fecha).slice(11, 19).replace(/:/g, "") : "");
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
  }
  escribir(vistosPath, JSON.stringify([...visto], null, 2));
  return JSON.stringify(nuevos, null, 2);
}
