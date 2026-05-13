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
