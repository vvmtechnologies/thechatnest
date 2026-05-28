import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Chip, MenuItem, Slider, Stack, TextField, Typography } from "@mui/material";
import { PiDownloadDuotone, PiUploadSimpleDuotone } from "react-icons/pi";
import { ToolSection } from "./ToolShell.jsx";

const loadedScripts = new Set();
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (loadedScripts.has(src)) { resolve(); return; }
    const existing = document.querySelector(`script[data-tool-cdn="${src}"]`);
    if (existing) { loadedScripts.add(src); resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.async = true; s.dataset.toolCdn = src;
    s.onload = () => { loadedScripts.add(src); resolve(); };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

const formatBytes = (n) => {
  if (!Number.isFinite(n)) return "—";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0; let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i += 1; }
  return `${v.toFixed(v < 10 ? 2 : v < 100 ? 1 : 0)} ${u[i]}`;
};

const useImageFile = () => {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [img, setImg] = useState(null);
  const handle = useCallback((f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    const r = new FileReader();
    r.onload = (e) => {
      setUrl(e.target.result);
      const im = new Image();
      im.onload = () => setImg(im);
      im.src = e.target.result;
    };
    r.readAsDataURL(f);
  }, []);
  return { file, url, img, handle };
};

const DropZone = ({ onFile, accept = "image/*", hint, multiple = false }) => {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); if (multiple) onFile(e.dataTransfer.files); else onFile(e.dataTransfer.files[0]); }}
      onClick={() => ref.current?.click()}
      sx={(theme) => ({
        p: 3, borderRadius: 2, textAlign: "center", cursor: "pointer",
        border: `2px dashed ${drag ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: drag ? "rgba(59,130,246,0.08)" : theme.palette.mode === "light" ? "#f8fafc" : "rgba(255,255,255,0.04)",
        transition: "border-color 0.15s, background-color 0.15s",
        "&:hover": { borderColor: "primary.main" },
      })}
    >
      <PiUploadSimpleDuotone size={32} />
      <Typography sx={{ fontWeight: 700, mt: 0.5 }}>{hint}</Typography>
      <input ref={ref} type="file" accept={accept} hidden multiple={multiple}
        onChange={(e) => multiple ? onFile(e.target.files) : onFile(e.target.files[0])} />
    </Box>
  );
};

const downloadBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

// ─────────────────────────────────────────────────────────────────────
// Image Converter — canvas-based format swap (PNG ↔ JPG ↔ WebP)
// ─────────────────────────────────────────────────────────────────────
export function ImageConverter() {
  const { file, url, img, handle } = useImageFile();
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(0.92);
  const [outBlob, setOutBlob] = useState(null);
  const [outUrl, setOutUrl] = useState("");

  const convert = useCallback(async () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (format === "jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(img, 0, 0);
    const mime = `image/${format}`;
    const blob = await new Promise((res) => canvas.toBlob(res, mime, quality));
    setOutBlob(blob);
    setOutUrl(canvas.toDataURL(mime, quality));
  }, [img, format, quality]);

  return (
    <>
      <DropZone onFile={handle} hint="Drop image to convert" />
      {file && (
        <>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <Chip label={`${file.name} · ${formatBytes(file.size)}`} sx={{ maxWidth: 320 }} />
            <Box sx={{ flex: 1 }} />
            <TextField size="small" select label="Output" value={format} onChange={(e) => setFormat(e.target.value)} sx={{ width: 140 }}>
              <MenuItem value="png">PNG</MenuItem>
              <MenuItem value="jpeg">JPEG</MenuItem>
              <MenuItem value="webp">WebP</MenuItem>
            </TextField>
          </Stack>
          {format !== "png" && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption">Quality: {Math.round(quality * 100)}%</Typography>
              <Slider value={quality} onChange={(_, v) => setQuality(v)} min={0.3} max={1} step={0.05} />
            </Box>
          )}
          <Button variant="contained" fullWidth onClick={convert} sx={{ mb: 2 }}>Convert</Button>
          {outBlob && (
            <>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
                <PreviewCard title="Original" url={url} note={formatBytes(file.size)} />
                <PreviewCard title={format.toUpperCase()} url={outUrl} note={`${formatBytes(outBlob.size)} · ${Math.round((1 - outBlob.size / file.size) * 100)}% diff`} accent="#22c55e" />
              </Box>
              <Button variant="contained" color="success" fullWidth startIcon={<PiDownloadDuotone />}
                onClick={() => downloadBlob(outBlob, `${file.name.replace(/\.[^.]+$/, "")}.${format === "jpeg" ? "jpg" : format}`)}>
                Download .{format === "jpeg" ? "jpg" : format}
              </Button>
            </>
          )}
        </>
      )}
    </>
  );
}

const PreviewCard = ({ title, url, note, accent }) => (
  <Box sx={(theme) => ({
    p: 1, borderRadius: 2, border: `2px solid ${accent || theme.palette.divider}`, bgcolor: "background.paper",
  })}>
    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1, px: 0.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.5, textTransform: "uppercase" }}>{title}</Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, color: accent || "text.disabled" }}>{note}</Typography>
    </Stack>
    {url ? <Box component="img" src={url} sx={{ width: "100%", maxHeight: 260, objectFit: "contain", bgcolor: "rgba(0,0,0,0.03)", borderRadius: 1 }} /> : null}
  </Box>
);

// ─────────────────────────────────────────────────────────────────────
// Image Resizer — explicit pixel dimensions, optional lock-ratio
// ─────────────────────────────────────────────────────────────────────
export function ImageResizer() {
  const { file, img, handle } = useImageFile();
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [outBlob, setOutBlob] = useState(null);
  const [outUrl, setOutUrl] = useState("");

  useEffect(() => {
    if (img) { setW(img.naturalWidth); setH(img.naturalHeight); }
  }, [img]);

  const onW = (val) => {
    setW(val);
    if (lockRatio && img) setH(Math.round(val * img.naturalHeight / img.naturalWidth));
  };
  const onH = (val) => {
    setH(val);
    if (lockRatio && img) setW(Math.round(val * img.naturalWidth / img.naturalHeight));
  };

  const resize = useCallback(async () => {
    if (!img || !w || !h) return;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    setOutBlob(blob);
    setOutUrl(canvas.toDataURL("image/png"));
  }, [img, w, h]);

  return (
    <>
      <DropZone onFile={handle} hint="Drop image to resize" />
      {file && img && (
        <>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
            <TextField type="number" size="small" label="Width (px)" value={w} onChange={(e) => onW(Math.max(1, Number(e.target.value) || 1))} sx={{ width: 130 }} />
            <Typography sx={{ alignSelf: "center" }}>×</Typography>
            <TextField type="number" size="small" label="Height (px)" value={h} onChange={(e) => onH(Math.max(1, Number(e.target.value) || 1))} sx={{ width: 130 }} />
            <Chip label={lockRatio ? "🔒 Aspect locked" : "🔓 Free"} onClick={() => setLockRatio((v) => !v)}
              color={lockRatio ? "primary" : "default"} variant={lockRatio ? "filled" : "outlined"} sx={{ cursor: "pointer" }} />
            <Box sx={{ flex: 1 }} />
            <Typography variant="caption" color="text.secondary">Original: {img.naturalWidth} × {img.naturalHeight}</Typography>
          </Stack>
          <Button variant="contained" fullWidth onClick={resize} sx={{ mb: 2 }}>Resize</Button>
          {outBlob && (
            <>
              <PreviewCard title="Resized" url={outUrl} note={`${w} × ${h} · ${formatBytes(outBlob.size)}`} accent="#22c55e" />
              <Button variant="contained" color="success" fullWidth startIcon={<PiDownloadDuotone />} sx={{ mt: 2 }}
                onClick={() => downloadBlob(outBlob, `resized-${w}x${h}-${file.name.replace(/\.[^.]+$/, "")}.png`)}>
                Download
              </Button>
            </>
          )}
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Social Media Image Resizer — preset dimensions per platform
// ─────────────────────────────────────────────────────────────────────
const SOCIAL_PRESETS = {
  "instagram-square":   { label: "Instagram Square", w: 1080, h: 1080 },
  "instagram-portrait": { label: "Instagram Portrait", w: 1080, h: 1350 },
  "instagram-story":    { label: "Instagram Story / Reel", w: 1080, h: 1920 },
  "facebook-post":      { label: "Facebook Post", w: 1200, h: 630 },
  "facebook-cover":     { label: "Facebook Cover", w: 851, h: 315 },
  "twitter-post":       { label: "X / Twitter Post", w: 1600, h: 900 },
  "twitter-header":     { label: "X / Twitter Header", w: 1500, h: 500 },
  "linkedin-post":      { label: "LinkedIn Post", w: 1200, h: 627 },
  "linkedin-banner":    { label: "LinkedIn Banner", w: 1584, h: 396 },
  "youtube-thumb":      { label: "YouTube Thumbnail", w: 1280, h: 720 },
  "og-card":            { label: "Open Graph / Link Preview", w: 1200, h: 630 },
};

export function SocialMediaResizer() {
  const { file, img, handle } = useImageFile();
  const [preset, setPreset] = useState("instagram-square");
  const [mode, setMode] = useState("cover"); // cover | contain | stretch
  const [bg, setBg] = useState("#ffffff");
  const [outBlob, setOutBlob] = useState(null);
  const [outUrl, setOutUrl] = useState("");
  const { w, h, label } = SOCIAL_PRESETS[preset];

  const resize = useCallback(async () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    const ar = img.naturalWidth / img.naturalHeight;
    let dw, dh, dx, dy;
    if (mode === "stretch") { dx = 0; dy = 0; dw = w; dh = h; }
    else if (mode === "contain") {
      if (w / h > ar) { dh = h; dw = h * ar; }
      else { dw = w; dh = w / ar; }
      dx = (w - dw) / 2; dy = (h - dh) / 2;
    } else {
      if (w / h > ar) { dw = w; dh = w / ar; }
      else { dh = h; dw = h * ar; }
      dx = (w - dw) / 2; dy = (h - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    setOutBlob(blob);
    setOutUrl(canvas.toDataURL("image/png"));
  }, [img, mode, bg, w, h]);

  return (
    <>
      <DropZone onFile={handle} hint="Drop source image" />
      {file && img && (
        <>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 2, flexWrap: "wrap" }}>
            <TextField select size="small" label="Preset" value={preset} onChange={(e) => setPreset(e.target.value)} sx={{ minWidth: 220 }}>
              {Object.entries(SOCIAL_PRESETS).map(([k, p]) => (
                <MenuItem key={k} value={k}>{p.label} · {p.w}×{p.h}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Fit" value={mode} onChange={(e) => setMode(e.target.value)} sx={{ width: 140 }}>
              <MenuItem value="cover">Cover (crop)</MenuItem>
              <MenuItem value="contain">Contain (letterbox)</MenuItem>
              <MenuItem value="stretch">Stretch</MenuItem>
            </TextField>
            {mode === "contain" && (
              <TextField type="color" size="small" label="Background" value={bg} onChange={(e) => setBg(e.target.value)} sx={{ width: 110 }} InputLabelProps={{ shrink: true }} />
            )}
          </Stack>
          <Button variant="contained" fullWidth onClick={resize} sx={{ mb: 2 }}>Generate {label}</Button>
          {outBlob && (
            <>
              <PreviewCard title={label} url={outUrl} note={`${w}×${h} · ${formatBytes(outBlob.size)}`} accent="#22c55e" />
              <Button variant="contained" color="success" fullWidth startIcon={<PiDownloadDuotone />} sx={{ mt: 2 }}
                onClick={() => downloadBlob(outBlob, `${preset}.png`)}>Download .png</Button>
            </>
          )}
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Image Watermark — text overlay with position + opacity
// ─────────────────────────────────────────────────────────────────────
export function ImageWatermark() {
  const { file, img, handle } = useImageFile();
  const [text, setText] = useState("© Your Brand");
  const [position, setPosition] = useState("bottom-right");
  const [opacity, setOpacity] = useState(0.4);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#ffffff");
  const [outBlob, setOutBlob] = useState(null);
  const [outUrl, setOutUrl] = useState("");

  const apply = useCallback(async () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    const m = ctx.measureText(text);
    const pad = fontSize * 0.5;
    let x, y;
    if (position.endsWith("left")) x = pad;
    else if (position.endsWith("right")) x = canvas.width - m.width - pad;
    else x = (canvas.width - m.width) / 2;
    if (position.startsWith("top")) y = fontSize + pad;
    else if (position.startsWith("bottom")) y = canvas.height - pad;
    else y = canvas.height / 2;
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    setOutBlob(blob);
    setOutUrl(canvas.toDataURL("image/png"));
  }, [img, text, position, opacity, fontSize, color]);

  return (
    <>
      <DropZone onFile={handle} hint="Drop image to watermark" />
      {file && img && (
        <>
          <Box sx={{ mt: 2, mb: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            <TextField size="small" fullWidth label="Watermark text" value={text} onChange={(e) => setText(e.target.value)} />
            <TextField select size="small" fullWidth label="Position" value={position} onChange={(e) => setPosition(e.target.value)}>
              {["top-left","top-center","top-right","middle-left","middle-center","middle-right","bottom-left","bottom-center","bottom-right"].map((p) => (
                <MenuItem key={p} value={p}>{p.replace("-", " · ")}</MenuItem>
              ))}
            </TextField>
            <Box>
              <Typography variant="caption">Font size: {fontSize}px</Typography>
              <Slider value={fontSize} onChange={(_, v) => setFontSize(v)} min={16} max={140} step={4} />
            </Box>
            <Box>
              <Typography variant="caption">Opacity: {Math.round(opacity * 100)}%</Typography>
              <Slider value={opacity} onChange={(_, v) => setOpacity(v)} min={0.1} max={1} step={0.05} />
            </Box>
            <TextField type="color" size="small" label="Color" value={color} onChange={(e) => setColor(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ gridColumn: { xs: "1", sm: "1 / span 2" }, maxWidth: 200 }} />
          </Box>
          <Button variant="contained" fullWidth onClick={apply} sx={{ mb: 2 }}>Add watermark</Button>
          {outBlob && (
            <>
              <PreviewCard title="Watermarked" url={outUrl} note={formatBytes(outBlob.size)} accent="#22c55e" />
              <Button variant="contained" color="success" fullWidth startIcon={<PiDownloadDuotone />} sx={{ mt: 2 }}
                onClick={() => downloadBlob(outBlob, `watermarked-${file.name.replace(/\.[^.]+$/, "")}.png`)}>Download</Button>
            </>
          )}
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Image to PDF — pdf-lib via CDN
// ─────────────────────────────────────────────────────────────────────
const PDFLIB_CDN = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";

export function ImageToPdf() {
  const [files, setFiles] = useState([]);
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState("auto");
  const [working, setWorking] = useState(false);
  const [out, setOut] = useState(null);
  const [error, setError] = useState("");

  const add = (list) => {
    const arr = Array.from(list || []).filter((f) => f.type.startsWith("image/"));
    setFiles((cur) => [...cur, ...arr]);
    setOut(null);
  };
  const remove = (i) => setFiles((cur) => cur.filter((_, j) => j !== i));

  const build = async () => {
    if (!files.length) return;
    setError(""); setWorking(true);
    try {
      await loadScript(PDFLIB_CDN);
      const doc = await window.PDFLib.PDFDocument.create();
      const pageDims = { a4: [595.28, 841.89], letter: [612, 792], a5: [419.53, 595.28] };
      for (const f of files) {
        const bytes = await f.arrayBuffer();
        const embed = f.type.includes("png")
          ? await doc.embedPng(bytes)
          : await doc.embedJpg(bytes);
        const [pw, ph] = pageDims[pageSize] || pageDims.a4;
        const portrait = embed.height >= embed.width;
        const flip = orientation === "auto" ? !portrait : orientation === "landscape";
        const [w, h] = flip ? [ph, pw] : [pw, ph];
        const page = doc.addPage([w, h]);
        const ar = embed.width / embed.height;
        let dw = w - 40, dh = dw / ar;
        if (dh > h - 40) { dh = h - 40; dw = dh * ar; }
        page.drawImage(embed, { x: (w - dw) / 2, y: (h - dh) / 2, width: dw, height: dh });
      }
      const bytes = await doc.save();
      setOut(new Blob([bytes], { type: "application/pdf" }));
    } catch (e) {
      setError(e.message || "Failed to build PDF");
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <DropZone onFile={add} hint="Drop one or more images" multiple />
      {files.length > 0 && (
        <ToolSection title={`${files.length} image${files.length > 1 ? "s" : ""} queued`}>
          <Stack spacing={1}>
            {files.map((f, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center" sx={(theme) => ({ p: 1.25, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper" })}>
                <Chip size="small" label={`#${i + 1}`} sx={{ fontWeight: 800 }} />
                <Typography sx={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</Typography>
                <Chip size="small" label={formatBytes(f.size)} />
                <Button size="small" color="error" onClick={() => remove(i)}>×</Button>
              </Stack>
            ))}
          </Stack>
        </ToolSection>
      )}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Page size" value={pageSize} onChange={(e) => setPageSize(e.target.value)} sx={{ width: 130 }}>
          <MenuItem value="a4">A4</MenuItem>
          <MenuItem value="letter">Letter</MenuItem>
          <MenuItem value="a5">A5</MenuItem>
        </TextField>
        <TextField select size="small" label="Orientation" value={orientation} onChange={(e) => setOrientation(e.target.value)} sx={{ width: 160 }}>
          <MenuItem value="auto">Auto per image</MenuItem>
          <MenuItem value="portrait">Portrait</MenuItem>
          <MenuItem value="landscape">Landscape</MenuItem>
        </TextField>
      </Stack>
      {files.length > 0 && (
        <Button variant="contained" fullWidth onClick={build} disabled={working}>{working ? "Building PDF…" : "Build PDF"}</Button>
      )}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {out && (
        <Button variant="contained" color="success" fullWidth startIcon={<PiDownloadDuotone />} sx={{ mt: 2 }}
          onClick={() => downloadBlob(out, "images.pdf")}>
          Download images.pdf · {formatBytes(out.size)}
        </Button>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Meme Generator — top/bottom text on uploaded image
// ─────────────────────────────────────────────────────────────────────
export function MemeGenerator() {
  const { file, img, handle } = useImageFile();
  const [topText, setTopText] = useState("ONE DOES NOT SIMPLY");
  const [bottomText, setBottomText] = useState("SHIP UNTESTED CODE");
  const [outBlob, setOutBlob] = useState(null);
  const [outUrl, setOutUrl] = useState("");
  const canvasRef = useRef(null);

  const render = useCallback(() => {
    if (!img) return;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvasRef.current = canvas;
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const fontSize = Math.round(canvas.width / 12);
    ctx.font = `bold ${fontSize}px Impact, "Anton", sans-serif`;
    ctx.textAlign = "center";
    ctx.lineWidth = Math.max(2, fontSize / 12);
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#fff";
    const wrap = (text, y, baseline) => {
      ctx.textBaseline = baseline;
      const words = text.toUpperCase().split(" ");
      const lines = [];
      let cur = "";
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (ctx.measureText(test).width > canvas.width * 0.92 && cur) {
          lines.push(cur); cur = w;
        } else { cur = test; }
      }
      if (cur) lines.push(cur);
      lines.forEach((line, i) => {
        const ly = baseline === "top" ? y + i * fontSize * 1.1 : y - (lines.length - 1 - i) * fontSize * 1.1;
        ctx.strokeText(line, canvas.width / 2, ly);
        ctx.fillText(line, canvas.width / 2, ly);
      });
    };
    if (topText) wrap(topText, fontSize * 0.4, "top");
    if (bottomText) wrap(bottomText, canvas.height - fontSize * 0.4, "bottom");
    setOutUrl(canvas.toDataURL("image/png"));
    canvas.toBlob((b) => setOutBlob(b), "image/png");
  }, [img, topText, bottomText]);

  useEffect(() => { if (img) render(); }, [render, img]);

  return (
    <>
      <DropZone onFile={handle} hint="Drop a meme template" />
      {file && img && (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2, mb: 2 }}>
            <TextField fullWidth size="small" label="Top text" value={topText} onChange={(e) => setTopText(e.target.value)} />
            <TextField fullWidth size="small" label="Bottom text" value={bottomText} onChange={(e) => setBottomText(e.target.value)} />
          </Stack>
          {outUrl && (
            <>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Box component="img" src={outUrl} sx={{ maxWidth: "100%", maxHeight: 480, borderRadius: 1.5, border: "1px solid", borderColor: "divider" }} />
              </Box>
              <Button variant="contained" color="success" fullWidth startIcon={<PiDownloadDuotone />}
                onClick={() => outBlob && downloadBlob(outBlob, "meme.png")}>Download meme</Button>
            </>
          )}
        </>
      )}
    </>
  );
}
