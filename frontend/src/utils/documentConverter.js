// Cross-format document converter — runs entirely client-side.
//
// Heavy libraries (mammoth for .docx, sheetjs for .xlsx, pdf.js for .pdf,
// jspdf for any → pdf) are NOT bundled. They're loaded from a CDN on
// first use and cached in window for the rest of the session. This
// keeps the chat composer bundle slim while still offering a rich set
// of conversions.

const CDN = {
  mammoth: "https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js",
  xlsx: "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
  pdfjs: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs",
  pdfjsWorker: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs",
};

const scriptCache = new Map();
const loadScript = (url, { module = false } = {}) => {
  if (scriptCache.has(url)) return scriptCache.get(url);
  const p = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    if (module) s.type = "module";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(s);
  });
  scriptCache.set(url, p);
  return p;
};

// ── Source-type detection helpers ─────────────────────────────────────
export const detectKind = (file) => {
  const name = (file?.name || "").toLowerCase();
  const mime = (file?.type || "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  )
    return "docx";
  if (
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime === "application/vnd.ms-excel" ||
    name.endsWith(".xlsx") ||
    name.endsWith(".xls")
  )
    return "xlsx";
  if (mime === "text/csv" || name.endsWith(".csv")) return "csv";
  if (mime === "text/markdown" || name.endsWith(".md") || name.endsWith(".markdown")) return "md";
  if (mime.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".json") || name.endsWith(".log"))
    return "text";
  return "other";
};

// What conversions are possible for a given source kind
export const CONVERSION_TARGETS = {
  image: [
    { id: "image-to-pdf", label: "PDF", desc: "Wrap in a PDF page" },
  ],
  pdf: [
    { id: "pdf-to-text", label: "Plain text", desc: "Extract all text" },
  ],
  docx: [
    { id: "docx-to-pdf", label: "PDF", desc: "Preserve formatting" },
    { id: "docx-to-md",  label: "Markdown", desc: "Headings, lists, bold" },
    { id: "docx-to-text", label: "Plain text", desc: "Strip formatting" },
  ],
  xlsx: [
    { id: "xlsx-to-json", label: "JSON", desc: "Rows as objects" },
    { id: "xlsx-to-csv",  label: "CSV", desc: "First sheet only" },
  ],
  csv: [
    { id: "csv-to-json", label: "JSON", desc: "Rows as objects" },
  ],
  text: [
    { id: "text-to-pdf", label: "PDF", desc: "Wrap text in a PDF" },
  ],
  md: [
    { id: "text-to-pdf", label: "PDF", desc: "Wrap as PDF" },
  ],
  other: [],
};

// ── Conversions ───────────────────────────────────────────────────────

const readArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsArrayBuffer(file);
  });

const readText = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });

const replaceExt = (name, ext) => {
  const base = String(name || "file").replace(/\.[^.]+$/, "");
  return `${base}.${ext}`;
};

const makeFile = (data, name, type) => {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  return new File([blob], name, { type, lastModified: Date.now() });
};

// ── Image → PDF ───────────────────────────────────────────────────────
const imageToPdf = async (file) => {
  const { default: jsPDF } = await import("jspdf");
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("Could not read image"));
    i.src = dataUrl;
  });
  const orientation = img.width > img.height ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const scale = Math.min((pageW - margin * 2) / img.width, (pageH - margin * 2) / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const fmt = file.type.includes("png") ? "PNG" : "JPEG";
  pdf.addImage(dataUrl, fmt, (pageW - w) / 2, (pageH - h) / 2, w, h);
  const out = pdf.output("blob");
  return makeFile(out, replaceExt(file.name, "pdf"), "application/pdf");
};

// ── PDF → Text ────────────────────────────────────────────────────────
const pdfToText = async (file) => {
  // Load pdf.js as ESM module from CDN
  if (!window.pdfjsLib) {
    const mod = await import(/* @vite-ignore */ CDN.pdfjs);
    window.pdfjsLib = mod;
    mod.GlobalWorkerOptions.workerSrc = CDN.pdfjsWorker;
  }
  const data = await readArrayBuffer(file);
  const pdf = await window.pdfjsLib.getDocument({ data }).promise;
  const out = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    out.push(content.items.map((it) => it.str).join(" "));
  }
  const text = out.join("\n\n");
  return makeFile(text, replaceExt(file.name, "txt"), "text/plain");
};

// ── DOCX → PDF / Markdown / Text via mammoth ─────────────────────────
const loadMammoth = async () => {
  if (window.mammoth) return window.mammoth;
  await loadScript(CDN.mammoth);
  if (!window.mammoth) throw new Error("Failed to load DOCX engine");
  return window.mammoth;
};

const docxToMd = async (file) => {
  const mammoth = await loadMammoth();
  const buf = await readArrayBuffer(file);
  const { value } = await mammoth.convertToMarkdown({ arrayBuffer: buf });
  return makeFile(value, replaceExt(file.name, "md"), "text/markdown");
};

const docxToText = async (file) => {
  const mammoth = await loadMammoth();
  const buf = await readArrayBuffer(file);
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  return makeFile(value, replaceExt(file.name, "txt"), "text/plain");
};

const docxToPdf = async (file) => {
  // Strategy: docx → HTML via mammoth, then HTML → PDF via jsPDF.html()
  const mammoth = await loadMammoth();
  const buf = await readArrayBuffer(file);
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  // jsPDF html() needs a real DOM node; render into an off-screen container
  const container = document.createElement("div");
  container.style.cssText = "position:absolute;left:-9999px;top:0;width:520px;font-family:Helvetica,Arial,sans-serif;font-size:11pt;line-height:1.55;color:#111;";
  container.innerHTML = html;
  document.body.appendChild(container);
  try {
    await pdf.html(container, {
      margin: [40, 40, 40, 40],
      autoPaging: "text",
      width: 520,
      windowWidth: 520,
    });
  } finally {
    container.remove();
  }
  const out = pdf.output("blob");
  return makeFile(out, replaceExt(file.name, "pdf"), "application/pdf");
};

// ── XLSX / CSV → JSON / CSV via SheetJS ──────────────────────────────
const loadSheetjs = async () => {
  if (window.XLSX) return window.XLSX;
  await loadScript(CDN.xlsx);
  if (!window.XLSX) throw new Error("Failed to load spreadsheet engine");
  return window.XLSX;
};

const xlsxToJson = async (file) => {
  const XLSX = await loadSheetjs();
  const buf = await readArrayBuffer(file);
  const wb = XLSX.read(buf, { type: "array" });
  const out = {};
  wb.SheetNames.forEach((name) => {
    out[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "" });
  });
  // If only one sheet, flatten
  const payload = wb.SheetNames.length === 1 ? out[wb.SheetNames[0]] : out;
  return makeFile(JSON.stringify(payload, null, 2), replaceExt(file.name, "json"), "application/json");
};

const xlsxToCsv = async (file) => {
  const XLSX = await loadSheetjs();
  const buf = await readArrayBuffer(file);
  const wb = XLSX.read(buf, { type: "array" });
  const first = wb.Sheets[wb.SheetNames[0]];
  const csv = XLSX.utils.sheet_to_csv(first);
  return makeFile(csv, replaceExt(file.name, "csv"), "text/csv");
};

const csvToJson = async (file) => {
  const XLSX = await loadSheetjs();
  const text = await readText(file);
  const wb = XLSX.read(text, { type: "string" });
  const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
  return makeFile(JSON.stringify(json, null, 2), replaceExt(file.name, "json"), "application/json");
};

// ── Text / Markdown → PDF ─────────────────────────────────────────────
const textToPdf = async (file) => {
  const text = await readText(file);
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const margin = 48;
  const maxW = pageW - margin * 2;
  pdf.setFont("Helvetica", "normal");
  pdf.setFontSize(11);
  const lines = pdf.splitTextToSize(text, maxW);
  const lineH = 14;
  const pageH = pdf.internal.pageSize.getHeight();
  let y = margin;
  lines.forEach((ln) => {
    if (y > pageH - margin) { pdf.addPage(); y = margin; }
    pdf.text(ln, margin, y);
    y += lineH;
  });
  const out = pdf.output("blob");
  return makeFile(out, replaceExt(file.name, "pdf"), "application/pdf");
};

// ── Dispatcher ────────────────────────────────────────────────────────
const CONVERTERS = {
  "image-to-pdf": imageToPdf,
  "pdf-to-text":  pdfToText,
  "docx-to-pdf":  docxToPdf,
  "docx-to-md":   docxToMd,
  "docx-to-text": docxToText,
  "xlsx-to-json": xlsxToJson,
  "xlsx-to-csv":  xlsxToCsv,
  "csv-to-json":  csvToJson,
  "text-to-pdf":  textToPdf,
};

export const convertFile = async (file, targetId) => {
  const fn = CONVERTERS[targetId];
  if (!fn) throw new Error(`Unsupported conversion: ${targetId}`);
  return fn(file);
};

export const isConvertible = (file) => {
  const kind = detectKind(file);
  return (CONVERSION_TARGETS[kind] || []).length > 0;
};

export const getTargetsFor = (file) => CONVERSION_TARGETS[detectKind(file)] || [];
