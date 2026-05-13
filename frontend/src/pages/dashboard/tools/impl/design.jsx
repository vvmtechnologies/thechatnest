import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Alert,
} from "@mui/material";
import { PiCopyDuotone, PiCheckBold, PiDownloadDuotone, PiQrCodeDuotone } from "react-icons/pi";
import { ToolSection, monoFont } from "./ToolShell.jsx";

// ── Color converter ───────────────────────────────────────────────────
const hexToRgb = (hex) => {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
};
const rgbToHex = ({ r, g, b }) => "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
const rgbToHsl = ({ r, g, b }) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export function ColorConverter() {
  const [hex, setHex] = useState("#2065D1");
  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb) : null;
  const rgbStr = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "";
  const hslStr = hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "";
  const isLight = rgb ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 155 : true;

  return (
    <>
      <ToolSection title="Color">
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Box
            sx={{
              width: 140,
              height: 100,
              borderRadius: 1.5,
              background: hex,
              border: "1px solid rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isLight ? "#0b0f1e" : "#fff",
              fontFamily: monoFont,
              fontWeight: 700,
              fontSize: 14,
              textTransform: "uppercase",
            }}
          >
            {hex}
          </Box>
          <Stack spacing={1}>
            <TextField label="HEX" size="small" value={hex} onChange={(e) => setHex(e.target.value)} InputProps={{ sx: { fontFamily: monoFont } }} sx={{ width: 180 }} />
            <input
              type="color"
              value={rgb ? rgbToHex(rgb) : "#000000"}
              onChange={(e) => setHex(e.target.value)}
              style={{ width: 180, height: 40, border: 0, cursor: "pointer", borderRadius: 4 }}
            />
          </Stack>
        </Stack>
      </ToolSection>
      <Stack spacing={1.25}>
        <CopyRow label="HEX" value={hex.toUpperCase()} />
        <CopyRow label="RGB" value={rgbStr} />
        <CopyRow label="HSL" value={hslStr} />
      </Stack>
    </>
  );
}
const CopyRow = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} };
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip label={label} size="small" sx={{ width: 60, fontWeight: 700 }} />
      <TextField value={value} fullWidth size="small" InputProps={{ readOnly: true, sx: { fontFamily: monoFont, fontSize: 13 } }} />
      <IconButton size="small" onClick={copy} disabled={!value}>{copied ? <PiCheckBold size={14} color="#22c55e" /> : <PiCopyDuotone size={14} />}</IconButton>
    </Stack>
  );
};

// ── QR generator ──────────────────────────────────────────────────────
export function QrGenerator() {
  const [text, setText] = useState("https://www.thechatnest.com");
  const [size, setSize] = useState(320);
  const src = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&qzone=2&color=0b0f1e&bgcolor=ffffff&data=${encodeURIComponent(text)}`,
    [text, size]
  );
  const handleDownload = async () => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "thechatnest-qr.png"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };
  return (
    <>
      <ToolSection title="URL or text">
        <TextField value={text} onChange={(e) => setText(e.target.value)} fullWidth multiline minRows={2} maxRows={6} placeholder="https://…" />
      </ToolSection>
      <ToolSection title="Size">
        <Stack direction="row" spacing={0.75}>
          {[200, 320, 480, 640].map((s) => (
            <Button key={s} size="small" variant={size === s ? "contained" : "outlined"} onClick={() => setSize(s)}>{s}px</Button>
          ))}
        </Stack>
      </ToolSection>
      <ToolSection title="QR" action={<Button size="small" startIcon={<PiDownloadDuotone size={14} />} onClick={handleDownload}>Download PNG</Button>}>
        <Box sx={{ display: "flex", justifyContent: "center", p: 3, borderRadius: 2, bgcolor: "background.paper", border: (t) => `1px solid ${t.palette.divider}` }}>
          {text ? <img src={src} alt="QR" width={Math.min(size, 320)} height={Math.min(size, 320)} /> : <Typography color="text.secondary">Enter a URL or text above</Typography>}
        </Box>
      </ToolSection>
    </>
  );
}

// ── Regex tester ──────────────────────────────────────────────────────
export function RegexTester() {
  const [pattern, setPattern] = useState("\\b\\w+\\b");
  const [flags, setFlags] = useState("gi");
  const [input, setInput] = useState("TheChatNest ships secure messaging.");
  const result = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      const matches = [...input.matchAll(flags.includes("g") ? re : new RegExp(pattern, flags + "g"))];
      // Build highlighted HTML
      let html = "";
      let cursor = 0;
      matches.forEach((m) => {
        html += escapeHtml(input.slice(cursor, m.index));
        html += `<mark>${escapeHtml(m[0])}</mark>`;
        cursor = m.index + m[0].length;
      });
      html += escapeHtml(input.slice(cursor));
      return { ok: true, html, count: matches.length, error: "" };
    } catch (e) {
      return { ok: false, error: e.message, html: "", count: 0 };
    }
  }, [pattern, flags, input]);

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField label="Pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} fullWidth InputProps={{ sx: { fontFamily: monoFont } }} />
        <TextField label="Flags" value={flags} onChange={(e) => setFlags(e.target.value.toLowerCase().replace(/[^gimsuy]/g, ""))} sx={{ width: 120 }} InputProps={{ sx: { fontFamily: monoFont } }} />
      </Stack>
      <ToolSection title="Test input">
        <TextField value={input} onChange={(e) => setInput(e.target.value)} fullWidth multiline minRows={4} maxRows={10} InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }} />
      </ToolSection>
      {!result.ok && <Alert severity="error" sx={{ mb: 2 }}>{result.error}</Alert>}
      {result.ok && (
        <ToolSection title={`Matches: ${result.count}`}>
          <Box
            sx={(theme) => ({
              p: 2,
              fontFamily: monoFont,
              fontSize: 13,
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
              "& mark": { background: "#ffd54a", padding: "0 2px", borderRadius: 2, color: "#0b0f1e", fontWeight: 600 },
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            })}
            dangerouslySetInnerHTML={{ __html: result.html || "<span style='color:#94a3b8'>No matches</span>" }}
          />
        </ToolSection>
      )}
    </>
  );
}
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ── CSS Gradient Generator ────────────────────────────────────────────
export function CssGradient() {
  const [type, setType] = useState("linear");
  const [angle, setAngle] = useState(135);
  const [c1, setC1] = useState("#2065D1");
  const [c2, setC2] = useState("#ffd54a");
  const css = useMemo(() => {
    if (type === "linear") return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
    return `radial-gradient(circle at center, ${c1} 0%, ${c2} 100%)`;
  }, [type, angle, c1, c2]);
  const full = `background: ${css};`;
  return (
    <>
      <ToolSection title="Options">
        <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center" useFlexGap>
          <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value)} size="small" SelectProps={{ native: true }} sx={{ minWidth: 130 }}>
            <option value="linear">linear</option>
            <option value="radial">radial</option>
          </TextField>
          {type === "linear" && (
            <TextField type="number" label="Angle (°)" value={angle} onChange={(e) => setAngle(Math.max(0, Math.min(360, Number(e.target.value) || 0)))} size="small" sx={{ width: 120 }} />
          )}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption">Color 1</Typography>
            <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} style={{ width: 44, height: 36, border: 0, cursor: "pointer", borderRadius: 4 }} />
            <TextField value={c1} onChange={(e) => setC1(e.target.value)} size="small" sx={{ width: 110, "& input": { fontFamily: monoFont } }} />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption">Color 2</Typography>
            <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} style={{ width: 44, height: 36, border: 0, cursor: "pointer", borderRadius: 4 }} />
            <TextField value={c2} onChange={(e) => setC2(e.target.value)} size="small" sx={{ width: 110, "& input": { fontFamily: monoFont } }} />
          </Stack>
        </Stack>
      </ToolSection>
      <ToolSection title="Preview">
        <Box sx={{ height: 220, borderRadius: 2, background: css, border: (t) => `1px solid ${t.palette.divider}` }} />
      </ToolSection>
      <CopyRow label="CSS" value={full} />
    </>
  );
}

// ── Box Shadow Generator ──────────────────────────────────────────────
export function BoxShadow() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(10);
  const [blur, setBlur] = useState(24);
  const [spread, setSpread] = useState(-4);
  const [color, setColor] = useState("#0f172a");
  const [opacity, setOpacity] = useState(0.18);
  const rgba = useMemo(() => {
    const m = color.replace("#", "");
    const r = parseInt(m.slice(0, 2), 16);
    const g = parseInt(m.slice(2, 4), 16);
    const b = parseInt(m.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }, [color, opacity]);
  const shadow = `${x}px ${y}px ${blur}px ${spread}px ${rgba}`;
  return (
    <>
      <ToolSection title="Options">
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <TextField type="number" label="X offset" value={x} onChange={(e) => setX(Number(e.target.value) || 0)} size="small" sx={{ width: 110 }} />
            <TextField type="number" label="Y offset" value={y} onChange={(e) => setY(Number(e.target.value) || 0)} size="small" sx={{ width: 110 }} />
            <TextField type="number" label="Blur" value={blur} onChange={(e) => setBlur(Math.max(0, Number(e.target.value) || 0))} size="small" sx={{ width: 110 }} />
            <TextField type="number" label="Spread" value={spread} onChange={(e) => setSpread(Number(e.target.value) || 0)} size="small" sx={{ width: 110 }} />
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption">Color</Typography>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 44, height: 36, border: 0, cursor: "pointer", borderRadius: 4 }} />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 220 }}>
              <Typography variant="caption">Opacity</Typography>
              <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} style={{ flex: 1 }} />
              <Typography variant="caption" sx={{ fontFamily: monoFont, minWidth: 36 }}>{opacity.toFixed(2)}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </ToolSection>
      <ToolSection title="Preview">
        <Box sx={{ p: 5, display: "flex", justifyContent: "center", borderRadius: 2, bgcolor: "background.paper", border: (t) => `1px solid ${t.palette.divider}` }}>
          <Box sx={{ width: 180, height: 120, borderRadius: 2, bgcolor: "background.paper", border: (t) => `1px solid ${t.palette.divider}`, boxShadow: shadow }} />
        </Box>
      </ToolSection>
      <CopyRow label="CSS" value={`box-shadow: ${shadow};`} />
    </>
  );
}

// ── Favicon Preview ───────────────────────────────────────────────────
export function FaviconPreview() {
  const [url, setUrl] = useState("");
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setUrl(reader.result);
    reader.readAsDataURL(f);
  };
  return (
    <>
      <ToolSection title="Upload an image">
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button variant="outlined" component="label" size="small">
            Choose image
            <input hidden type="file" accept="image/*" onChange={onFile} />
          </Button>
          <TextField placeholder="or paste image URL" value={typeof url === "string" && url.startsWith("data:") ? "" : url} onChange={(e) => setUrl(e.target.value)} size="small" sx={{ flex: 1, minWidth: 220 }} />
        </Stack>
      </ToolSection>
      {url ? (
        <ToolSection title="Preview at common sizes">
          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            {[16, 32, 48, 64, 96, 128, 180].map((s) => (
              <Stack key={s} alignItems="center" spacing={0.5}>
                <Box sx={(t) => ({ p: 1, borderRadius: 1.25, bgcolor: t.palette.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)", border: `1px dashed ${t.palette.divider}` })}>
                  <img src={url} alt="" width={s} height={s} style={{ display: "block", objectFit: "contain" }} />
                </Box>
                <Typography variant="caption" sx={{ fontFamily: monoFont, fontSize: 11 }}>{s}×{s}</Typography>
              </Stack>
            ))}
          </Stack>
        </ToolSection>
      ) : (
        <Alert severity="info">Upload an image or paste a URL above.</Alert>
      )}
    </>
  );
}
