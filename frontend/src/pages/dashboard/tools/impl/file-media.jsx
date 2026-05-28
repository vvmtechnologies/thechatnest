import { useCallback, useRef, useState } from "react";
import { Alert, Box, Button, Chip, IconButton, LinearProgress, MenuItem, Slider, Stack, TextField, Typography } from "@mui/material";
import { PiCopyDuotone, PiDownloadDuotone, PiTrashDuotone, PiUploadSimpleDuotone } from "react-icons/pi";
import { ToolSection, monoFont } from "./ToolShell.jsx";

// CDN script loader — used by OCR and PDF tools so the libs only download
// when the owner actually opens that specific tool, not on every dashboard
// load. Cached by URL so opening the tool twice doesn't re-fetch.
const loadedScripts = new Set();
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (loadedScripts.has(src)) { resolve(); return; }
    if (document.querySelector(`script[data-tool-cdn="${src}"]`)) { loadedScripts.add(src); resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.toolCdn = src;
    s.onload = () => { loadedScripts.add(src); resolve(); };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

const formatBytes = (n) => {
  if (!Number.isFinite(n)) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0; let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i += 1; }
  return `${v.toFixed(v < 10 ? 2 : v < 100 ? 1 : 0)} ${u[i]}`;
};

// ─────────────────────────────────────────────────────────────────────
// Image Compressor — canvas-based, no deps. Resize + JPEG re-encode.
// ─────────────────────────────────────────────────────────────────────
export function ImageCompressor() {
  const [file, setFile] = useState(null);
  const [originalDataUrl, setOriginalDataUrl] = useState("");
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [compressedDataUrl, setCompressedDataUrl] = useState("");
  const [maxWidth, setMaxWidth] = useState(1600);
  const [quality, setQuality] = useState(0.8);
  const [working, setWorking] = useState(false);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setCompressedBlob(null);
    setCompressedDataUrl("");
    const reader = new FileReader();
    reader.onload = (e) => setOriginalDataUrl(e.target.result);
    reader.readAsDataURL(f);
  };

  const compress = useCallback(async () => {
    if (!originalDataUrl) return;
    setWorking(true);
    try {
      const img = new Image();
      img.src = originalDataUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      const ratio = Math.min(1, maxWidth / img.naturalWidth);
      const w = Math.round(img.naturalWidth * ratio);
      const h = Math.round(img.naturalHeight * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
      setCompressedBlob(blob);
      setCompressedDataUrl(canvas.toDataURL("image/jpeg", quality));
    } finally {
      setWorking(false);
    }
  }, [originalDataUrl, maxWidth, quality]);

  const download = () => {
    if (!compressedBlob) return;
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed-${file?.name?.replace(/\.[^.]+$/, "") || "image"}.jpg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const reduction = compressedBlob && file
    ? Math.round((1 - compressedBlob.size / file.size) * 100)
    : 0;

  return (
    <>
      <DropZone onFile={handleFile} accept="image/*" hint="Drop an image here, or click to pick" />

      {file && (
        <>
          <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1.5, flexWrap: "wrap" }}>
            <Chip label={file.name} sx={{ maxWidth: 240 }} />
            <Chip label={formatBytes(file.size)} sx={{ fontWeight: 700 }} />
          </Stack>

          <ToolSection title="Compression settings">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">Max width</Typography>
                <Slider value={maxWidth} onChange={(_, v) => setMaxWidth(v)} min={320} max={3840} step={80} valueLabelDisplay="auto" />
                <Typography variant="caption" color="text.disabled">{maxWidth}px (image scales down if larger)</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">Quality</Typography>
                <Slider value={quality} onChange={(_, v) => setQuality(v)} min={0.3} max={1} step={0.05} valueLabelDisplay="auto" />
                <Typography variant="caption" color="text.disabled">{Math.round(quality * 100)}% (JPEG)</Typography>
              </Box>
            </Stack>
          </ToolSection>

          <Button variant="contained" fullWidth onClick={compress} disabled={working} sx={{ mb: 2 }}>
            {working ? "Compressing…" : "Compress"}
          </Button>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <PreviewCard title="Original" dataUrl={originalDataUrl} sizeLabel={formatBytes(file.size)} />
            <PreviewCard
              title="Compressed"
              dataUrl={compressedDataUrl}
              sizeLabel={compressedBlob ? `${formatBytes(compressedBlob.size)} · ${reduction}% smaller` : "—"}
              accent={compressedBlob && reduction > 0 ? "#22c55e" : undefined}
            />
          </Box>

          {compressedBlob && (
            <Button startIcon={<PiDownloadDuotone />} variant="contained" color="success" fullWidth onClick={download} sx={{ mt: 2 }}>
              Download compressed image
            </Button>
          )}
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// OCR — Tesseract.js v5 from unpkg CDN. Loads only when used.
// ─────────────────────────────────────────────────────────────────────
const TESSERACT_CDN = "https://unpkg.com/tesseract.js@5/dist/tesseract.min.js";

export function Ocr() {
  const [file, setFile] = useState(null);
  const [dataUrl, setDataUrl] = useState("");
  const [language, setLanguage] = useState("eng");
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setText("");
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setDataUrl(e.target.result);
    reader.readAsDataURL(f);
  };

  const run = async () => {
    if (!file) return;
    setError("");
    setText("");
    setProgress(0);
    setWorking(true);
    try {
      await loadScript(TESSERACT_CDN);
      const T = window.Tesseract;
      if (!T) throw new Error("Tesseract failed to load");
      const result = await T.recognize(file, language, {
        logger: (m) => {
          if (m.status === "recognizing text" && typeof m.progress === "number") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      setText(result?.data?.text || "");
    } catch (err) {
      setError(err.message || "OCR failed");
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <DropZone onFile={handleFile} accept="image/*" hint="Drop a screenshot, photo of receipt, or scanned doc" />

      {file && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1.5, flexWrap: "wrap" }}>
          <Chip label={file.name} sx={{ maxWidth: 240 }} />
          <Chip label={formatBytes(file.size)} sx={{ fontWeight: 700 }} />
        </Stack>
      )}

      <Stack direction="row" spacing={1.25} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Language" value={language} onChange={(e) => setLanguage(e.target.value)} sx={{ width: 200 }}>
          <MenuItem value="eng">English</MenuItem>
          <MenuItem value="hin">Hindi (हिन्दी)</MenuItem>
          <MenuItem value="ara">Arabic (العربية)</MenuItem>
          <MenuItem value="spa">Spanish</MenuItem>
          <MenuItem value="fra">French</MenuItem>
          <MenuItem value="deu">German</MenuItem>
          <MenuItem value="chi_sim">Chinese (simplified)</MenuItem>
          <MenuItem value="jpn">Japanese</MenuItem>
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={run} disabled={!file || working}>
          {working ? "Reading…" : "Extract text"}
        </Button>
      </Stack>

      {working && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption">Recognizing… {progress}%</Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ mt: 0.5, height: 6, borderRadius: 3 }} />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {dataUrl && (
        <Box sx={(theme) => ({ p: 1, mb: 2, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, textAlign: "center" })}>
          <Box component="img" src={dataUrl} sx={{ maxWidth: "100%", maxHeight: 240, borderRadius: 1 }} />
        </Box>
      )}

      {text && (
        <ToolSection title="Extracted text" hint={`${text.length} chars`} action={
          <Button size="small" startIcon={<PiCopyDuotone />} onClick={() => navigator.clipboard?.writeText(text)}>Copy</Button>
        }>
          <TextField
            fullWidth multiline minRows={6} value={text} onChange={(e) => setText(e.target.value)}
            InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }}
          />
        </ToolSection>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PDF Splitter — split a PDF into N single-page PDFs, or by page ranges.
// pdf-lib loaded from unpkg.
// ─────────────────────────────────────────────────────────────────────
const PDFLIB_CDN = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";

export function PdfSplitter() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [ranges, setRanges] = useState("");
  const [splits, setSplits] = useState([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (f) => {
    if (!f || f.type !== "application/pdf") {
      setError("Pick a PDF file.");
      return;
    }
    setError("");
    setFile(f);
    setSplits([]);
    try {
      await loadScript(PDFLIB_CDN);
      const buf = await f.arrayBuffer();
      const doc = await window.PDFLib.PDFDocument.load(buf);
      setPageCount(doc.getPageCount());
    } catch (e) {
      setError(e.message || "Failed to read PDF");
    }
  };

  const parseRanges = (input, max) => {
    if (!input.trim()) {
      // No ranges = one PDF per page
      return Array.from({ length: max }, (_, i) => [i]);
    }
    return input.split(",").map((part) => {
      const s = part.trim();
      if (!s) return [];
      if (s.includes("-")) {
        const [a, b] = s.split("-").map((v) => parseInt(v.trim(), 10));
        if (!Number.isFinite(a) || !Number.isFinite(b)) return [];
        const lo = Math.max(1, Math.min(a, b));
        const hi = Math.min(max, Math.max(a, b));
        const out = [];
        for (let i = lo; i <= hi; i += 1) out.push(i - 1);
        return out;
      }
      const n = parseInt(s, 10);
      if (Number.isFinite(n) && n >= 1 && n <= max) return [n - 1];
      return [];
    }).filter((r) => r.length);
  };

  const run = async () => {
    if (!file) return;
    setError("");
    setWorking(true);
    setSplits([]);
    try {
      const buf = await file.arrayBuffer();
      const src = await window.PDFLib.PDFDocument.load(buf);
      const total = src.getPageCount();
      const groups = parseRanges(ranges, total);
      if (!groups.length) { setError("No valid pages in those ranges."); return; }
      const out = [];
      for (const group of groups) {
        const target = await window.PDFLib.PDFDocument.create();
        const pages = await target.copyPages(src, group);
        pages.forEach((p) => target.addPage(p));
        const bytes = await target.save();
        const blob = new Blob([bytes], { type: "application/pdf" });
        const label = group.length === 1
          ? `page-${group[0] + 1}`
          : `pages-${group[0] + 1}-${group[group.length - 1] + 1}`;
        out.push({ label, blob, size: blob.size });
      }
      setSplits(out);
    } catch (e) {
      setError(e.message || "Split failed");
    } finally {
      setWorking(false);
    }
  };

  const downloadOne = (item) => {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.pdf$/i, "")}-${item.label}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <>
      <DropZone onFile={handleFile} accept="application/pdf" hint="Drop a PDF here" />

      {file && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1.5, flexWrap: "wrap" }}>
          <Chip label={file.name} sx={{ maxWidth: 240 }} />
          <Chip label={`${pageCount} page${pageCount === 1 ? "" : "s"}`} sx={{ fontWeight: 700 }} />
          <Chip label={formatBytes(file.size)} />
        </Stack>
      )}

      {file && (
        <TextField
          fullWidth size="small" sx={{ mb: 2 }}
          label="Page ranges (optional)"
          placeholder='e.g. "1-3, 5, 7-9" — leave blank to split into one PDF per page'
          value={ranges}
          onChange={(e) => setRanges(e.target.value)}
        />
      )}

      {file && (
        <Button variant="contained" fullWidth onClick={run} disabled={working}>
          {working ? "Splitting…" : "Split"}
        </Button>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {splits.length > 0 && (
        <ToolSection title={`${splits.length} part${splits.length === 1 ? "" : "s"} generated`}>
          <Stack spacing={1}>
            {splits.map((item, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center"
                sx={(theme) => ({ p: 1.25, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper" })}>
                <Typography sx={{ flex: 1, fontWeight: 700 }}>{item.label}.pdf</Typography>
                <Chip size="small" label={formatBytes(item.size)} />
                <Button size="small" startIcon={<PiDownloadDuotone />} onClick={() => downloadOne(item)}>Download</Button>
              </Stack>
            ))}
          </Stack>
        </ToolSection>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PDF Merger — multiple PDFs → one combined PDF.
// ─────────────────────────────────────────────────────────────────────
export function PdfMerger() {
  const [files, setFiles] = useState([]);
  const [working, setWorking] = useState(false);
  const [merged, setMerged] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const addFiles = (list) => {
    const arr = Array.from(list || []).filter((f) => f.type === "application/pdf");
    setFiles((cur) => [...cur, ...arr]);
    setMerged(null);
  };

  const removeFile = (idx) => {
    setFiles((cur) => cur.filter((_, i) => i !== idx));
    setMerged(null);
  };

  const move = (idx, dir) => {
    setFiles((cur) => {
      const next = [...cur];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return cur;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
    setMerged(null);
  };

  const run = async () => {
    if (files.length < 2) { setError("Add at least 2 PDFs to merge."); return; }
    setError(""); setMerged(null); setWorking(true);
    try {
      await loadScript(PDFLIB_CDN);
      const target = await window.PDFLib.PDFDocument.create();
      for (const f of files) {
        const buf = await f.arrayBuffer();
        const doc = await window.PDFLib.PDFDocument.load(buf);
        const pages = await target.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => target.addPage(p));
      }
      const bytes = await target.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      setMerged(blob);
    } catch (e) {
      setError(e.message || "Merge failed");
    } finally {
      setWorking(false);
    }
  };

  const download = () => {
    if (!merged) return;
    const url = URL.createObjectURL(merged);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <>
      <Box
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        sx={(theme) => ({
          p: 3, mb: 2, borderRadius: 2, textAlign: "center", cursor: "pointer",
          border: `2px dashed ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === "light" ? "#f8fafc" : "rgba(255,255,255,0.04)",
          "&:hover": { borderColor: "primary.main", bgcolor: theme.palette.mode === "light" ? "#f1f5f9" : "rgba(255,255,255,0.06)" },
        })}
      >
        <PiUploadSimpleDuotone size={32} />
        <Typography sx={{ fontWeight: 700, mt: 0.5 }}>Drop PDFs here, or click to pick (multiple)</Typography>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
      </Box>

      {files.length > 0 && (
        <ToolSection title={`${files.length} file${files.length === 1 ? "" : "s"} queued`}>
          <Stack spacing={1}>
            {files.map((f, i) => (
              <Stack key={`${f.name}-${i}`} direction="row" spacing={1} alignItems="center"
                sx={(theme) => ({ p: 1.25, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper" })}>
                <Chip size="small" label={`#${i + 1}`} sx={{ fontWeight: 800 }} />
                <Typography sx={{ flex: 1, fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</Typography>
                <Chip size="small" label={formatBytes(f.size)} />
                <IconButton size="small" disabled={i === 0} onClick={() => move(i, -1)}>↑</IconButton>
                <IconButton size="small" disabled={i === files.length - 1} onClick={() => move(i, 1)}>↓</IconButton>
                <IconButton size="small" color="error" onClick={() => removeFile(i)}><PiTrashDuotone /></IconButton>
              </Stack>
            ))}
          </Stack>
        </ToolSection>
      )}

      {files.length >= 2 && (
        <Button variant="contained" fullWidth onClick={run} disabled={working}>
          {working ? "Merging…" : "Merge PDFs"}
        </Button>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {merged && (
        <Button variant="contained" color="success" fullWidth startIcon={<PiDownloadDuotone />} onClick={download} sx={{ mt: 2 }}>
          Download merged.pdf · {formatBytes(merged.size)}
        </Button>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// File Size Formatter — converts bytes ↔ human readable, pure JS.
// ─────────────────────────────────────────────────────────────────────
export function FileSizeFormatter() {
  const [bytes, setBytes] = useState(1572864);
  const [human, setHuman] = useState("");

  const updateBytes = (n) => {
    const v = Math.max(0, Number(n) || 0);
    setBytes(v);
  };

  const parseHuman = (input) => {
    setHuman(input);
    const m = input.match(/^\s*([\d.]+)\s*(B|KB|MB|GB|TB|KiB|MiB|GiB|TiB)?\s*$/i);
    if (!m) return;
    const n = parseFloat(m[1]);
    if (!Number.isFinite(n)) return;
    const unit = (m[2] || "B").toUpperCase();
    const mult = {
      B: 1,
      KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4,
      KIB: 1024, MIB: 1024 ** 2, GIB: 1024 ** 3, TIB: 1024 ** 4,
    }[unit];
    setBytes(Math.round(n * mult));
  };

  const units = {
    "Bytes (B)": bytes,
    "Kilobytes (KB)": bytes / 1024,
    "Megabytes (MB)": bytes / 1024 ** 2,
    "Gigabytes (GB)": bytes / 1024 ** 3,
    "Terabytes (TB)": bytes / 1024 ** 4,
  };

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 3 }}>
        <TextField
          fullWidth size="small" type="number" label="Bytes"
          value={bytes} onChange={(e) => updateBytes(e.target.value)}
          InputProps={{ sx: { fontFamily: monoFont } }}
        />
        <TextField
          fullWidth size="small" label="Human readable"
          placeholder='e.g. "1.5 MB", "250 KB", "2 GB"'
          value={human} onChange={(e) => parseHuman(e.target.value)}
          InputProps={{ sx: { fontFamily: monoFont } }}
        />
      </Stack>

      <Box sx={{ p: 3, borderRadius: 2, textAlign: "center",
        background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)",
        color: "#fff", mb: 2,
      }}>
        <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>That's</Typography>
        <Typography sx={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.02em", mt: 0.5 }}>{formatBytes(bytes)}</Typography>
      </Box>

      <ToolSection title="Every unit">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
          {Object.entries(units).map(([label, val]) => (
            <Box key={label} sx={(theme) => ({ p: 1.5, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper" })}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{label}</Typography>
              <Typography sx={{ fontFamily: monoFont, fontWeight: 800, fontSize: 18 }}>
                {val < 0.001 ? val.toExponential(3) : val.toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </Typography>
            </Box>
          ))}
        </Box>
      </ToolSection>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Shared drag-drop file picker.
// ─────────────────────────────────────────────────────────────────────
const DropZone = ({ onFile, accept, hint }) => {
  const ref = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files[0]); }}
      onClick={() => ref.current?.click()}
      sx={(theme) => ({
        p: 3, borderRadius: 2, textAlign: "center", cursor: "pointer",
        border: `2px dashed ${dragOver ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: dragOver
          ? (theme.palette.mode === "light" ? "#eff6ff" : "rgba(59,130,246,0.08)")
          : theme.palette.mode === "light" ? "#f8fafc" : "rgba(255,255,255,0.04)",
        transition: "border-color 0.15s, background-color 0.15s",
        "&:hover": { borderColor: "primary.main" },
      })}
    >
      <PiUploadSimpleDuotone size={36} />
      <Typography sx={{ fontWeight: 700, mt: 0.5 }}>{hint}</Typography>
      <input ref={ref} type="file" accept={accept} hidden onChange={(e) => onFile(e.target.files[0])} />
    </Box>
  );
};

const PreviewCard = ({ title, dataUrl, sizeLabel, accent }) => (
  <Box sx={(theme) => ({
    p: 1, borderRadius: 2,
    border: `2px solid ${accent || theme.palette.divider}`,
    bgcolor: "background.paper",
  })}>
    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1, px: 0.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.5, textTransform: "uppercase" }}>{title}</Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, color: accent || "text.disabled" }}>{sizeLabel}</Typography>
    </Stack>
    {dataUrl ? (
      <Box component="img" src={dataUrl} sx={{ width: "100%", maxHeight: 280, objectFit: "contain", borderRadius: 1, bgcolor: "rgba(15,23,42,0.04)" }} />
    ) : (
      <Box sx={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled" }}>—</Box>
    )}
  </Box>
);
