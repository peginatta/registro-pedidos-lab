import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "pedidos-lab";

// Product catalog from the Excel file
const CATALOG = [
  {
    id: "mtt",
    keywords: ["mtt", "thiazolyl", "tetrazolium"],
    nombre: "THIAZOLYL BLUE TETRAZOLIUM BROMIDE (MTT)",
    ref: "M5655-500MG",
    proveedor: "MERCK LIFE SCIENCE S.L.U.",
    casaComercial: "MERCK"
  },
  {
    id: "dmem",
    keywords: ["dmem"],
    nombre: "DMEM 4500mg/L glucose + L-Glutamine 500ml",
    ref: "a341966029",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "falcon15",
    keywords: ["falcon 15", "centrifuga 15", "tubo centrífuga 15"],
    nombre: "Tubo centrífuga cónico 15ml Falcon (caja 500 uds)",
    ref: "430791",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "falcon50",
    keywords: ["falcon 50", "centrifuga 50", "tubo centrífuga 50"],
    nombre: "Tubo centrífuga 50ml Falcon (20 bolsas x 25 tubos)",
    ref: "352070",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "pipeta5",
    keywords: ["pipeta 5", "pipeta serológica 5"],
    nombre: "Pipeta serológica 5ml PS estéril (200 uds)",
    ref: "004487",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "pipeta10",
    keywords: ["pipeta 10", "pipeta serológica 10"],
    nombre: "Pipeta serológica 10ml PS estéril (200 uds)",
    ref: "004488",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "pipeta25",
    keywords: ["pipeta 25", "pipeta serológica 25"],
    nombre: "Pipeta serológica 25ml PS estéril (200 uds)",
    ref: "004489",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "pbs_gibco",
    keywords: ["pbs gibco", "pbs life"],
    nombre: "PBS, pH 7.4 (Gibco)",
    ref: "10010031",
    proveedor: "LIFE TECHNOLOGIES S.A",
    casaComercial: "LIFE TECHNOLOGIES"
  },
  {
    id: "pbs_teknovas",
    keywords: ["pbs teknovas"],
    nombre: "PBS pH 7.4 1x 500ml",
    ref: "a310010015",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "dpbs",
    keywords: ["dpbs"],
    nombre: "DPBS -CaCl2 -MgCl2 500ml",
    ref: "a314190094",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "fbs",
    keywords: ["fbs", "fetal bovine serum"],
    nombre: "Fetal Bovine Serum 500ml",
    ref: "a3a5256701",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "fbs_hi",
    keywords: ["fbs hi", "fbs inactivated", "heat inactivated", "value hi fbs"],
    nombre: "Value HI FBS (Heat Inactivated) 500ml",
    ref: "a3a5256801",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "penstrep",
    keywords: ["penicilina", "estreptomicina", "pen/strep"],
    nombre: "Penicilina/Estreptomicina 10000 U/ml",
    ref: "a315140122",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "sybr",
    keywords: ["sybr green"],
    nombre: "iQ SYBR Green Supermix 10x1.25ml",
    ref: "d61708882",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "flask75",
    keywords: ["flask 75", "frasco 75", "t75"],
    nombre: "Frasco cultivo 75cm² TC tapón ventilado (100 uds)",
    ref: "00430641u",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "flask25",
    keywords: ["flask 25", "frasco 25", "t25"],
    nombre: "Frasco cultivo 25cm² TC tapón rosca (200 uds)",
    ref: "353082",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "microplaca96",
    keywords: ["microplaca", "96 pocillos", "placa 96"],
    nombre: "Microplaca 96 pocillos PS TC fondo plano estéril (50 uds)",
    ref: "353072",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "filtro_pes",
    keywords: ["filtro pes", "unidad filtro"],
    nombre: "Unidades filtro PES desechables 500ml 0.22µm",
    ref: "15913307",
    proveedor: "FISHER SCIENTIFIC, S.L.",
    casaComercial: "FISHER SCIENTIFIC"
  },
  {
    id: "scraper",
    keywords: ["scraper", "cell scraper"],
    nombre: "Cell scraper movable blade 300mm (x100)",
    ref: "330099",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "rpmi",
    keywords: ["rpmi"],
    nombre: "RPMI 1640 + L-Glutamine 500ml",
    ref: "a321875034",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "schneider",
    keywords: ["schneider", "drosophila"],
    nombre: "Medio Drosophila de Schneider",
    ref: "a321720024",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "dmso",
    keywords: ["dmso", "dimethyl sulfoxide"],
    nombre: "DMSO puriss. p.a. 1L",
    ref: "34943-1L-M",
    proveedor: "MERCK LIFE SCIENCE S.L.U.",
    casaComercial: "MERCK"
  },
  {
    id: "eppendorf2ml",
    keywords: ["eppendorf 2ml", "eppendorf graduado"],
    nombre: "Tubos Eppendorf graduados 2ml (C/500)",
    ref: "525-1136",
    proveedor: "COMERCIAL MEDICA Y DE LABORATORIO, S.L.",
    casaComercial: "COMERCIAL MEDICA"
  },
  {
    id: "tips_10",
    keywords: ["puntas 10", "filter tips 10", "tips 10"],
    nombre: "Filter tips 10µl low retention Neptune rack x960",
    ref: "711177n",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "tips_20",
    keywords: ["puntas 20", "filter tips 20", "tips 20"],
    nombre: "Filter tips 20µl low retention Neptune rack x960",
    ref: "711178n",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "tips_100",
    keywords: ["puntas 100", "filter tips 100", "tips 100"],
    nombre: "Filter tips 100µl S3 low retention Neptune rack x960",
    ref: "711179n",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "tips_1250",
    keywords: ["puntas 1250", "tips 1250"],
    nombre: "Puntas con filtro 1250µl Neptune BT1250N",
    ref: "713080n",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "hepes_buffer",
    keywords: ["hepes buffer", "hepes 1m"],
    nombre: "HEPES Buffer 1M 100ml",
    ref: "8288616",
    proveedor: "PROQUINORTE, S.A.",
    casaComercial: "PROQUINORTE"
  },
  {
    id: "hepes_sodium",
    keywords: ["hepes sodium", "hepes sal"],
    nombre: "HEPES Sodium Salt >99.5% 500g",
    ref: "H7006-500G",
    proveedor: "MERCK LIFE SCIENCE S.L.U.",
    casaComercial: "MERCK"
  },
  {
    id: "biopterina",
    keywords: ["biopterina"],
    nombre: "6-Biopterina 5mg",
    ref: "B2517-5MG",
    proveedor: "MERCK LIFE SCIENCE S.L.U.",
    casaComercial: "MERCK"
  },
  {
    id: "trypan",
    keywords: ["trypan", "tripano", "azul tripano"],
    nombre: "Solución azul de tripano 0.4% 100ml",
    ref: "T8154-100ML",
    proveedor: "MERCK LIFE SCIENCE S.L.U.",
    casaComercial: "MERCK"
  },
  {
    id: "hardshell96",
    keywords: ["hardshell", "96w low skrtd"],
    nombre: "Hardshell 96W low skrtd WHT/CLR",
    ref: "d6hsp9601",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "maxwell_rna",
    keywords: ["maxwell", "simplyrna"],
    nombre: "Maxwell RSC simplyRNA Tissue Kit",
    ref: "AS1340",
    proveedor: "PROMEGA BIOTECH IBERICA, S.L.",
    casaComercial: "PROMEGA"
  },
  {
    id: "superscript",
    keywords: ["superscript"],
    nombre: "SuperScript II Reverse Transcriptase",
    ref: "18064014",
    proveedor: "LIFE TECHNOLOGIES S.A",
    casaComercial: "LIFE TECHNOLOGIES"
  },
  {
    id: "dnase_free",
    keywords: ["dna-free", "dnase free", "dna removal"],
    nombre: "DNA-free DNA Removal Kit",
    ref: "AM1906",
    proveedor: "LIFE TECHNOLOGIES S.A",
    casaComercial: "LIFE TECHNOLOGIES"
  },
  {
    id: "random_primers",
    keywords: ["random primers"],
    nombre: "Random Primers",
    ref: "48190011",
    proveedor: "LIFE TECHNOLOGIES S.A",
    casaComercial: "LIFE TECHNOLOGIES"
  },
  {
    id: "rnalater",
    keywords: ["rnalater"],
    nombre: "RNAlater Stabilization Solution",
    ref: "AM7020",
    proveedor: "LIFE TECHNOLOGIES S.A",
    casaComercial: "LIFE TECHNOLOGIES"
  },
  {
    id: "amplitaq",
    keywords: ["amplitaq"],
    nombre: "AmpliTaq DNA Polymerase with Buffer II",
    ref: "N8080161",
    proveedor: "LIFE TECHNOLOGIES S.A",
    casaComercial: "LIFE TECHNOLOGIES"
  },
  {
    id: "rnase_inhibitor",
    keywords: ["rnase inhibitor", "n8080119"],
    nombre: "RNase Inhibitor",
    ref: "N8080119",
    proveedor: "LIFE TECHNOLOGIES S.A",
    casaComercial: "LIFE TECHNOLOGIES"
  },
  {
    id: "rnaseout",
    keywords: ["rnase out", "rnaseout", "ribonuclease"],
    nombre: "RNaseOUT Ribonuclease Inhibitor",
    ref: "a310777019",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "mmlv",
    keywords: ["mmlv", "reverse transcripta"],
    nombre: "MMLV Reverse Transcriptase",
    ref: "a328025013",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "filtro_vacio",
    keywords: ["filtración vacío", "filtracion vacio", "431097"],
    nombre: "Sistema filtración vacío 500ml PES 0.22µm (12 uds)",
    ref: "431097",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "biotin",
    keywords: ["biotin"],
    nombre: "Biotin powder BioReagent 100mg",
    ref: "B4639-100MG",
    proveedor: "MERCK LIFE SCIENCE S.L.U.",
    casaComercial: "MERCK"
  },
  {
    id: "hemin",
    keywords: ["hemin"],
    nombre: "Hemin, Bovine 1g",
    ref: "H9039-1G",
    proveedor: "MERCK LIFE SCIENCE S.L.U.",
    casaComercial: "MERCK"
  },
  {
    id: "lectina",
    keywords: ["lectina", "arachis"],
    nombre: "Lectina de cacahuete (Arachis hypogaea) 10mg",
    ref: "L0881-10MG",
    proveedor: "MERCK LIFE SCIENCE S.L.U.",
    casaComercial: "MERCK"
  },
  {
    id: "medio199",
    keywords: ["medio 199", "m199"],
    nombre: "Medio 199 con sales de Hank 10x1L",
    ref: "M0393-10X1L",
    proveedor: "MERCK LIFE SCIENCE S.L.U.",
    casaComercial: "MERCK"
  },
  {
    id: "neubauer",
    keywords: ["neubauer"],
    nombre: "Cámara de recuento Neubauer optimizada doble",
    ref: "140514",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "chamberslide",
    keywords: ["portaobjeto cultivo", "chamber slide", "354118"],
    nombre: "Portaobjeto cultivo 8 cámaras (12 paq x 2 uds)",
    ref: "354118",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "dntp",
    keywords: ["dntp"],
    nombre: "Conjunto dNTP 100mM",
    ref: "a310297018",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  },
  {
    id: "mmlv_buffer",
    keywords: ["tampón transcriptasa", "mmlv buffer"],
    nombre: "Tampón de transcriptasa inversa MMLV",
    ref: "a318057018",
    proveedor: "TEKNOVAS, S.A.",
    casaComercial: "TEKNOVAS"
  }
];

// Initial orders for today
const INITIAL_ORDERS = [
  { id: 1, fecha: "2026-05-08", producto: "THIAZOLYL BLUE TETRAZOLIUM BROMIDE (MTT)", ref: "M5655-500MG", casaComercial: "MERCK LIFE SCIENCE S.L.U.", cantidad: 5, estado: "pendiente", notas: "" },
  { id: 2, fecha: "2026-05-08", producto: "DMEM 4500mg/L glucose + L-Glutamine 500ml", ref: "a341966029", casaComercial: "TEKNOVAS, S.A.", cantidad: 20, estado: "pendiente", notas: "" },
  { id: 3, fecha: "2026-05-08", producto: "Tubo centrífuga cónico 15ml Falcon (caja 500 uds)", ref: "430791", casaComercial: "TEKNOVAS, S.A.", cantidad: 2, estado: "pendiente", notas: "Falcon 15ml" },
  { id: 4, fecha: "2026-05-08", producto: "Tubo centrífuga 50ml Falcon (20 bolsas x 25 tubos)", ref: "352070", casaComercial: "TEKNOVAS, S.A.", cantidad: 4, estado: "pendiente", notas: "Falcon 50ml" },
  { id: 5, fecha: "2026-05-08", producto: "DPBS -CaCl2 -MgCl2 500ml", ref: "a314190094", casaComercial: "TEKNOVAS, S.A.", cantidad: 10, estado: "pendiente", notas: "" },
  { id: 7, fecha: "2026-05-08", producto: "Microplaca 96 pocillos PS TC fondo plano estéril (50 uds)", ref: "353072", casaComercial: "TEKNOVAS, S.A.", cantidad: 2, estado: "pendiente", notas: "Placas 96 pocillos Falcon" },
  { id: 8, fecha: "2026-05-08", producto: "DMSO puriss. p.a. 1L", ref: "34943-1L-M", casaComercial: "MERCK LIFE SCIENCE S.L.U.", cantidad: 1, estado: "pendiente", notas: "" },
  { id: 9, fecha: "2026-05-08", producto: "Value HI FBS (Heat Inactivated) 500ml", ref: "a3a5256801", casaComercial: "TEKNOVAS, S.A.", cantidad: 2, estado: "pendiente", notas: "FBS inactivado" },
  { id: 10, fecha: "2026-05-08", producto: "Pipeta serológica 5ml PS estéril (200 uds)", ref: "004487", casaComercial: "TEKNOVAS, S.A.", cantidad: 3, estado: "pendiente", notas: "" },
  { id: 11, fecha: "2026-05-08", producto: "Pipeta serológica 10ml PS estéril (200 uds)", ref: "004488", casaComercial: "TEKNOVAS, S.A.", cantidad: 2, estado: "pendiente", notas: "" },
  { id: 12, fecha: "2026-05-08", producto: "Filter tips 20µl low retention Neptune on rack x960", ref: "711178n", casaComercial: "TEKNOVAS, S.A.", cantidad: 1, estado: "pendiente", notas: "Puntas Neptune con filtro 20µL" },
  { id: 13, fecha: "2026-05-08", producto: "Portaobjeto para cultivo 8 cámaras (12 paq x 2 uds)", ref: "354118", casaComercial: "TEKNOVAS, S.A.", cantidad: 2, estado: "pendiente", notas: "Labtek chamber slides" },
  { id: 14, fecha: "2026-05-08", producto: "Fisherbrand Unidades de filtro 500ml PES desechable 0.22µm", ref: "15913307", casaComercial: "FISHER SCIENTIFIC, S.L.", cantidad: 1, estado: "pendiente", notas: "Filtros 0.22 500ml" },
  { id: 15, fecha: "2026-05-08", producto: "Fisherbrand Unidades de filtro 1000ml PES desechable 0.22µm", ref: "15933307", casaComercial: "FISHER SCIENTIFIC, S.L.", cantidad: 1, estado: "pendiente", notas: "Filtros 0.22 1L" },
  { id: 16, fecha: "2026-05-13", producto: "NZYSupreme qPCR Green Master Mix (2x) 50mL", ref: "MB41902", casaComercial: "NZYTECH", cantidad: 1, estado: "pendiente", notas: "SYBR Green NZYTech - Presupuesto 1761" },
  { id: 17, fecha: "2026-06-19", producto: "Portaobjeto para cultivo 8 cámaras (12 paq x 2 uds)", ref: "354118", casaComercial: "TEKNOVAS, S.A.", cantidad: 3, estado: "pendiente", notas: "3 packs de 24 labteks" },
  { id: 18, fecha: "2026-06-19", producto: "Medio Drosophila de Schneider", ref: "a321720024", casaComercial: "TEKNOVAS, S.A.", cantidad: 3, estado: "pendiente", notas: "" },
  { id: 19, fecha: "2026-06-19", producto: "Pipeta serológica 25ml PS estéril (200 uds)", ref: "004489", casaComercial: "TEKNOVAS, S.A.", cantidad: 2, estado: "pendiente", notas: "" },
  { id: 20, fecha: "2026-06-19", producto: "Microplaca 96 pocillos PS TC fondo plano estéril (50 uds)", ref: "353072", casaComercial: "TEKNOVAS, S.A.", cantidad: 1, estado: "pendiente", notas: "" },
  { id: 21, fecha: "2026-06-19", producto: "Pipeta serológica 5ml PS estéril (200 uds)", ref: "004487", casaComercial: "TEKNOVAS, S.A.", cantidad: 2, estado: "pendiente", notas: "" },
  { id: 22, fecha: "2026-06-19", producto: "Pipeta serológica 10ml PS estéril (200 uds)", ref: "004488", casaComercial: "TEKNOVAS, S.A.", cantidad: 1, estado: "pendiente", notas: "" },
  { id: 23, fecha: "2026-06-19", producto: "Tubo centrífuga 50ml Falcon (20 bolsas x 25 tubos)", ref: "352070", casaComercial: "TEKNOVAS, S.A.", cantidad: 1, estado: "pendiente", notas: "" },
  { id: 24, fecha: "2026-09-16", producto: "Cell Scraper pala móvil 300mm (x100)", ref: "330099", casaComercial: "TEKNOVAS, S.A.", cantidad: 1, estado: "pendiente", notas: "" },
  { id: 25, fecha: "2026-09-16", producto: "Aqua Stabila (sulfato de cobre)", ref: "", casaComercial: "", cantidad: 1, estado: "pendiente", notas: "Referencia pendiente — buscar manualmente" },
  { id: 26, fecha: "2026-09-16", producto: "T25 EasYFlask superficie recubierta Poli-D-Lisina", ref: "132703", casaComercial: "THERMO FISHER SCIENTIFIC", cantidad: 1, estado: "pendiente", notas: "Nueva referencia Thermo" },
  { id: 27, fecha: "2026-09-16", producto: "Solución azul de tripano 0.4% 100ml", ref: "T8154-100ML", casaComercial: "MERCK LIFE SCIENCE S.L.U.", cantidad: 1, estado: "pendiente", notas: "" },
  { id: 28, fecha: "2026-09-16", producto: "Penicilina/Estreptomicina 10000 U/ml 100ml", ref: "15140-122", casaComercial: "TEKNOVAS, S.A.", cantidad: 1, estado: "pendiente", notas: "" },
  { id: 29, fecha: "2026-10-11", producto: "DNasa I Amplification Grade 100 U", ref: "18068-015", casaComercial: "Invitrogen (Thermo Fisher Scientific)", cantidad: 1, estado: "pendiente", notas: "" },
  { id: 30, fecha: "2026-10-23", producto: "Microplaca 96 pocillos PS TC fondo plano estéril (50 uds)", ref: "353072", casaComercial: "TEKNOVAS, S.A.", cantidad: 2, estado: "pendiente", notas: "" },
];

const ACCENT = "#0f766e";
const ACCENT_LIGHT = "#ccfbf1";
const ACCENT_DARK = "#134e4a";
const SUCCESS = "#16a34a";

export default function RegistroPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [search, setSearch] = useState("");
  const [showCatalog, setShowCatalog] = useState(false);
  const [filterEstado, setFilterEstado] = useState("todos");
  const [loading, setLoading] = useState(true);

  // One-off date corrections (id -> correct fecha). Applied on every load,
  // fixing only the 'fecha' field — estado/cantidad/deletions stay untouched.
  const DATE_FIXES = { 17: "2026-06-19", 18: "2026-06-19", 19: "2026-06-19", 20: "2026-06-19", 21: "2026-06-19", 22: "2026-06-19", 23: "2026-06-19" };
  const applyDateFixes = (list) => list.map(p => DATE_FIXES[p.id] ? { ...p, fecha: DATE_FIXES[p.id] } : p);

  // Storage logic:
  // - First load ever: seed with INITIAL_ORDERS
  // - Version bump (I added new items): merge ONLY new ids into existing data,
  //   preserving user edits (estado, cantidad, deletions) on existing items
  // - Same version: load storage as-is, no merging
  const STORAGE_VERSION = "v13";
  useEffect(() => {
    (async () => {
      try {
        const vResult = await window.storage.get("pedidos-version");
        const currentVersion = vResult ? vResult.value : null;
        const result = await window.storage.get("pedidos-data");
        const stored = result && result.value ? JSON.parse(result.value) : null;

        if (!stored) {
          // First time ever — seed everything
          const seeded = applyDateFixes(INITIAL_ORDERS);
          setPedidos(seeded);
          await window.storage.set("pedidos-data", JSON.stringify(seeded));
          await window.storage.set("pedidos-version", STORAGE_VERSION);
        } else if (currentVersion !== STORAGE_VERSION) {
          // Version bump — keep ALL user data intact, only ADD new ids, then apply date fixes
          const storedIds = new Set(stored.map(p => p.id));
          const newItems = INITIAL_ORDERS.filter(p => !storedIds.has(p.id));
          const merged = applyDateFixes([...stored, ...newItems]);
          setPedidos(merged);
          await window.storage.set("pedidos-data", JSON.stringify(merged));
          await window.storage.set("pedidos-version", STORAGE_VERSION);
        } else {
          // Same version — trust storage 100%
          setPedidos(stored);
        }
      } catch {
        setPedidos(INITIAL_ORDERS);
        try {
          await window.storage.set("pedidos-data", JSON.stringify(INITIAL_ORDERS));
          await window.storage.set("pedidos-version", STORAGE_VERSION);
        } catch {}
      }
      setLoading(false);
    })();
  }, []);

  // Save to storage
  const savePedidos = useCallback(async (newPedidos) => {
    setPedidos(newPedidos);
    try {
      await window.storage.set("pedidos-data", JSON.stringify(newPedidos));
    } catch {}
  }, []);

  const addFromCatalog = (item) => {
    const nuevo = {
      id: Date.now(),
      fecha: new Date().toISOString().split("T")[0],
      producto: item.nombre,
      ref: item.ref,
      casaComercial: item.proveedor,
      cantidad: 1,
      estado: "pendiente",
      notas: ""
    };
    savePedidos([nuevo, ...pedidos]);
    setShowCatalog(false);
    setSearch("");
  };

  const updateCantidad = (id, val) => {
    const n = parseInt(val) || 0;
    savePedidos(pedidos.map(p => p.id === id ? { ...p, cantidad: n } : p));
  };

  const toggleEstado = (id) => {
    savePedidos(pedidos.map(p =>
      p.id === id
        ? { ...p, estado: p.estado === "pendiente" ? "pedido" : p.estado === "pedido" ? "recibido" : "pendiente" }
        : p
    ));
  };

  const deletePedido = (id) => {
    savePedidos(pedidos.filter(p => p.id !== id));
  };

  const copyToClipboard = (text) => {
    // Try modern API first, fallback to execCommand
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand("copy"); } catch {}
    document.body.removeChild(ta);
  };

  const copyRef = (ref, id) => {
    copyToClipboard(ref);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const copyAllRefs = () => {
    const pendientes = pedidos.filter(p => filterEstado === "todos" || p.estado === filterEstado);
    const grouped = {};
    pendientes.forEach(p => {
      if (!grouped[p.casaComercial]) grouped[p.casaComercial] = [];
      grouped[p.casaComercial].push(`${p.ref} (x${p.cantidad})`);
    });
    let text = "";
    Object.entries(grouped).forEach(([casa, refs]) => {
      text += `${casa}:\n${refs.join("\n")}\n\n`;
    });
    copyToClipboard(text.trim());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const filteredPedidos = pedidos.filter(p =>
    filterEstado === "todos" || p.estado === filterEstado
  );

  // Group by date
  const grouped = {};
  filteredPedidos.forEach(p => {
    if (!grouped[p.fecha]) grouped[p.fecha] = [];
    grouped[p.fecha].push(p);
  });

  // Group by provider for quick copy
  const byProvider = {};
  filteredPedidos.forEach(p => {
    if (!byProvider[p.casaComercial]) byProvider[p.casaComercial] = [];
    byProvider[p.casaComercial].push(p);
  });

  const catalogFiltered = CATALOG.filter(item =>
    search.length > 1 &&
    (item.nombre.toLowerCase().includes(search.toLowerCase()) ||
     item.ref.toLowerCase().includes(search.toLowerCase()) ||
     item.keywords.some(k => k.includes(search.toLowerCase())))
  );

  const estadoBadge = (estado) => {
    const colors = {
      pendiente: { bg: "#fef3c7", text: "#92400e", border: "#fbbf24" },
      pedido: { bg: "#dbeafe", text: "#1e40af", border: "#60a5fa" },
      recibido: { bg: "#dcfce7", text: "#166534", border: "#4ade80" }
    };
    const c = colors[estado];
    return (
      <span style={{
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.15s"
      }}>
        {estado}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300, fontFamily: "'DM Sans', sans-serif" }}>
        <p style={{ color: "#6b7280" }}>Cargando registro...</p>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      maxWidth: 900,
      margin: "0 auto",
      padding: "24px 16px",
      background: "#fafaf9",
      minHeight: "100vh"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 18, fontWeight: 700
          }}>P</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1c1917", margin: 0, letterSpacing: "-0.02em" }}>
            Registro de Pedidos
          </h1>
        </div>
        <p style={{ color: "#78716c", fontSize: 13, margin: "6px 0 0 46px" }}>
          {pedidos.length} producto{pedidos.length !== 1 ? "s" : ""} registrado{pedidos.length !== 1 ? "s" : ""} · {pedidos.filter(p => p.estado === "pendiente").length} pendiente{pedidos.filter(p => p.estado === "pendiente").length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={() => setShowCatalog(!showCatalog)}
          style={{
            padding: "8px 16px", borderRadius: 8,
            background: showCatalog ? ACCENT_DARK : ACCENT,
            color: "white", border: "none",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            transition: "all 0.15s"
          }}
        >
          + Añadir producto
        </button>

        <div style={{ display: "flex", gap: 4, background: "white", borderRadius: 8, padding: 3, border: "1px solid #e7e5e4" }}>
          {["todos", "pendiente", "pedido", "recibido"].map(e => (
            <button
              key={e}
              onClick={() => setFilterEstado(e)}
              style={{
                padding: "5px 12px", borderRadius: 6,
                background: filterEstado === e ? ACCENT_LIGHT : "transparent",
                color: filterEstado === e ? ACCENT_DARK : "#78716c",
                border: "none", fontSize: 12, fontWeight: 600,
                cursor: "pointer", textTransform: "capitalize",
                transition: "all 0.15s"
              }}
            >
              {e}
            </button>
          ))}
        </div>

        <button
          onClick={copyAllRefs}
          style={{
            padding: "8px 14px", borderRadius: 8,
            background: copiedAll ? SUCCESS : "white",
            color: copiedAll ? "white" : "#44403c",
            border: copiedAll ? "none" : "1px solid #d6d3d1",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            marginLeft: "auto",
            transition: "all 0.2s"
          }}
        >
          {copiedAll ? "✓ Copiado" : "Copiar todas las refs"}
        </button>
      </div>

      {/* Catalog search */}
      {showCatalog && (
        <div style={{
          background: "white", borderRadius: 12,
          border: `2px solid ${ACCENT}`,
          padding: 16, marginBottom: 16,
          boxShadow: "0 4px 20px rgba(15,118,110,0.1)"
        }}>
          <input
            autoFocus
            placeholder="Buscar producto (ej: DMEM, MTT, PBS, falcon...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8,
              border: "1px solid #d6d3d1", fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              outline: "none", boxSizing: "border-box"
            }}
          />
          {catalogFiltered.length > 0 && (
            <div style={{ marginTop: 10, maxHeight: 250, overflowY: "auto" }}>
              {catalogFiltered.map(item => (
                <div
                  key={item.id}
                  onClick={() => addFromCatalog(item)}
                  style={{
                    padding: "10px 12px", borderRadius: 8,
                    cursor: "pointer", display: "flex",
                    justifyContent: "space-between", alignItems: "center",
                    transition: "background 0.1s",
                    borderBottom: "1px solid #f5f5f4"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = ACCENT_LIGHT}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1c1917" }}>{item.nombre}</div>
                    <div style={{ fontSize: 11, color: "#78716c", marginTop: 2 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: ACCENT, fontWeight: 500 }}>{item.ref}</span>
                      {" · "}{item.proveedor}
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: ACCENT }}>+</span>
                </div>
              ))}
            </div>
          )}
          {search.length > 1 && catalogFiltered.length === 0 && (
            <p style={{ color: "#a8a29e", fontSize: 13, textAlign: "center", margin: "16px 0 8px" }}>
              No encontrado en catálogo. Pídeme que lo busque en el Drive.
            </p>
          )}
        </div>
      )}

      {/* Quick copy by provider */}
      {Object.keys(byProvider).length > 0 && (
        <div style={{
          background: "white", borderRadius: 12,
          border: "1px solid #e7e5e4",
          padding: 16, marginBottom: 20
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#44403c", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Referencias por casa comercial (copia rápida)
          </h3>
          {Object.entries(byProvider).map(([casa, items]) => (
            <div key={casa} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT_DARK, marginBottom: 4 }}>{casa}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => copyRef(item.ref, item.id)}
                    style={{
                      padding: "4px 10px", borderRadius: 6,
                      background: copiedId === item.id ? SUCCESS : "#f5f5f4",
                      color: copiedId === item.id ? "white" : "#1c1917",
                      border: "1px solid " + (copiedId === item.id ? SUCCESS : "#e7e5e4"),
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                    title={`${item.producto} (x${item.cantidad})`}
                  >
                    {copiedId === item.id ? "✓" : item.ref}{" "}
                    <span style={{ opacity: 0.6, fontSize: 10 }}>×{item.cantidad}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pedidos list grouped by date */}
      {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([fecha, items]) => (
        <div key={fecha} style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: "#78716c",
            textTransform: "uppercase", letterSpacing: "0.08em",
            marginBottom: 8, paddingLeft: 4
          }}>
            {new Date(fecha + "T12:00:00").toLocaleDateString("es-ES", {
              weekday: "long", day: "numeric", month: "long", year: "numeric"
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map(p => (
              <div
                key={p.id}
                style={{
                  background: "white",
                  borderRadius: 10,
                  border: "1px solid #e7e5e4",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "box-shadow 0.15s",
                  opacity: p.estado === "recibido" ? 0.6 : 1
                }}
              >
                {/* Status toggle */}
                <div onClick={() => toggleEstado(p.id)} title="Click para cambiar estado">
                  {estadoBadge(p.estado)}
                </div>

                {/* Product info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: "#1c1917",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                  }}>
                    {p.producto}
                  </div>
                  <div style={{ fontSize: 11, color: "#a8a29e", marginTop: 2 }}>
                    {p.casaComercial}
                  </div>
                </div>

                {/* Ref (copyable) */}
                <button
                  onClick={() => copyRef(p.ref, p.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: copiedId === p.id ? SUCCESS : "#f5f5f4",
                    color: copiedId === p.id ? "white" : ACCENT_DARK,
                    border: "1px solid " + (copiedId === p.id ? SUCCESS : "#e7e5e4"),
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12, fontWeight: 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s"
                  }}
                  title="Click para copiar referencia"
                >
                  {copiedId === p.id ? "✓ Copiado" : p.ref}
                </button>

                {/* Quantity */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "#a8a29e" }}>×</span>
                  <input
                    type="number"
                    min="1"
                    value={p.cantidad}
                    onChange={e => updateCantidad(p.id, e.target.value)}
                    style={{
                      width: 42, padding: "4px 6px",
                      borderRadius: 6, border: "1px solid #e7e5e4",
                      fontSize: 13, fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                      textAlign: "center", outline: "none",
                      color: "#1c1917"
                    }}
                  />
                </div>

                {/* Delete */}
                <button
                  onClick={() => deletePedido(p.id)}
                  style={{
                    width: 28, height: 28,
                    borderRadius: 6,
                    background: "transparent",
                    border: "1px solid transparent",
                    color: "#d6d3d1",
                    cursor: "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#fecaca"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#d6d3d1"; e.currentTarget.style.borderColor = "transparent"; }}
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filteredPedidos.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#a8a29e" }}>
          <p style={{ fontSize: 14 }}>No hay pedidos {filterEstado !== "todos" ? `con estado "${filterEstado}"` : ""}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 32, padding: "12px 0",
        borderTop: "1px solid #e7e5e4",
        fontSize: 11, color: "#a8a29e",
        textAlign: "center"
      }}>
        Click en el estado para cambiarlo: pendiente → pedido → recibido · Click en la referencia para copiarla
      </div>
    </div>
  );
}
