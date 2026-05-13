import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Slider,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Alert,
} from "@mui/material";
import {
  PiArrowsClockwiseDuotone,
  PiCheckBold,
  PiCopyDuotone,
  PiShieldCheckDuotone,
} from "react-icons/pi";
import { ToolSection, monoFont } from "./ToolShell.jsx";

// ── Password generator (full page version — same engine as Settings) ───
const CHARS = {
  lower: "abcdefghijkmnopqrstuvwxyz",
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  digit: "23456789",
  symbol: "!@#$%^&*()-_=+[]{}",
};
const pickFrom = (set) => {
  const buf = new Uint32Array(1);
  window.crypto.getRandomValues(buf);
  return set[buf[0] % set.length];
};
const generate = (opts) => {
  const pool =
    (opts.lower ? CHARS.lower : "") +
    (opts.upper ? CHARS.upper : "") +
    (opts.digit ? CHARS.digit : "") +
    (opts.symbol ? CHARS.symbol : "");
  if (!pool.length) return "";
  const seeds = [];
  if (opts.lower) seeds.push(pickFrom(CHARS.lower));
  if (opts.upper) seeds.push(pickFrom(CHARS.upper));
  if (opts.digit) seeds.push(pickFrom(CHARS.digit));
  if (opts.symbol) seeds.push(pickFrom(CHARS.symbol));
  while (seeds.length < opts.length) seeds.push(pickFrom(pool));
  for (let i = seeds.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [seeds[i], seeds[j]] = [seeds[j], seeds[i]];
  }
  return seeds.join("");
};

export function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digit, setDigit] = useState(true);
  const [symbol, setSymbol] = useState(true);
  const [pw, setPw] = useState("");
  const [copied, setCopied] = useState(false);

  const regenerate = () => setPw(generate({ length, lower, upper, digit, symbol }));
  useEffect(() => { regenerate(); /* eslint-disable-line */ }, [length, lower, upper, digit, symbol]);

  const handleCopy = async () => {
    if (!pw) return;
    try { await navigator.clipboard.writeText(pw); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  return (
    <>
      <ToolSection title="Options">
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">Length: <strong>{length}</strong></Typography>
            <Slider value={length} onChange={(_, v) => setLength(v)} min={8} max={64} valueLabelDisplay="auto" />
          </Box>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {[
              ["Lower (a-z)", lower, setLower],
              ["Upper (A-Z)", upper, setUpper],
              ["Digits (0-9)", digit, setDigit],
              ["Symbols", symbol, setSymbol],
            ].map(([label, val, set]) => (
              <Stack key={label} direction="row" alignItems="center" spacing={0.5}>
                <Switch checked={val} onChange={(e) => set(e.target.checked)} size="small" />
                <Typography variant="caption">{label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </ToolSection>
      <ToolSection
        title="Generated"
        action={
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Regenerate"><IconButton size="small" onClick={regenerate}><PiArrowsClockwiseDuotone size={16} /></IconButton></Tooltip>
            <Tooltip title={copied ? "Copied!" : "Copy"}><span><IconButton size="small" onClick={handleCopy} disabled={!pw}>{copied ? <PiCheckBold size={16} color="#22c55e" /> : <PiCopyDuotone size={16} />}</IconButton></span></Tooltip>
          </Stack>
        }
      >
        <TextField fullWidth value={pw} InputProps={{ readOnly: true, sx: { fontFamily: monoFont, fontSize: 16, fontWeight: 600, letterSpacing: 0.5 } }} />
      </ToolSection>
    </>
  );
}

// ── JWT decoder ───────────────────────────────────────────────────────
const b64UrlDecode = (s) => {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = norm.length % 4 ? "=".repeat(4 - (norm.length % 4)) : "";
  return decodeURIComponent(escape(atob(norm + pad)));
};

export function JwtDecoder() {
  const [token, setToken] = useState("");
  const result = useMemo(() => {
    const parts = token.trim().split(".");
    if (parts.length < 2) return null;
    try {
      const header = JSON.parse(b64UrlDecode(parts[0]));
      const payload = JSON.parse(b64UrlDecode(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      const exp = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : null;
      const iat = payload.iat ? new Date(payload.iat * 1000).toLocaleString() : null;
      const expired = payload.exp ? payload.exp < now : null;
      return { header, payload, exp, iat, expired };
    } catch (e) {
      return { error: e.message };
    }
  }, [token]);

  return (
    <>
      <ToolSection title="Paste JWT">
        <TextField
          value={token}
          onChange={(e) => setToken(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          placeholder="eyJhbGciOi…"
          InputProps={{ sx: { fontFamily: monoFont, fontSize: 12 } }}
        />
      </ToolSection>
      {result?.error && <Alert severity="error" sx={{ mb: 2 }}>Couldn't decode: {result.error}</Alert>}
      {result && !result.error && (
        <>
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
            <Chip icon={<PiShieldCheckDuotone size={14} />} label={result.header.alg || "?"} size="small" />
            {result.iat && <Chip label={`Issued: ${result.iat}`} size="small" variant="outlined" />}
            {result.exp && (
              <Chip
                label={result.expired ? `Expired ${result.exp}` : `Expires ${result.exp}`}
                size="small"
                color={result.expired ? "error" : "success"}
              />
            )}
          </Stack>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
            <ResultBlock title="Header" value={JSON.stringify(result.header, null, 2)} />
            <ResultBlock title="Payload" value={JSON.stringify(result.payload, null, 2)} />
          </Box>
        </>
      )}
    </>
  );
}

const ResultBlock = ({ title, value }) => (
  <Box>
    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.6, textTransform: "uppercase", display: "block", mb: 0.85 }}>{title}</Typography>
    <Box component="pre" sx={(theme) => ({ m: 0, p: 1.5, fontFamily: monoFont, fontSize: 12, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.mode === "light" ? "#0f172a" : "rgba(0,0,0,0.4)", color: "#e2e8f0", maxHeight: 320, overflow: "auto", whiteSpace: "pre-wrap" })}>{value}</Box>
  </Box>
);

// ── Hash generator (MD5 via tiny implementation; SHA via WebCrypto) ────
const md5 = (s) => {
  // Tiny MD5 — RFC 1321, public-domain implementation, golfed
  function rotl(x, n) { return (x << n) | (x >>> (32 - n)); }
  function add32(a, b) { return ((a + b) | 0); }
  const bytes = new TextEncoder().encode(s);
  const msgLen = bytes.length;
  const msg = Array.from(bytes).concat([0x80]);
  while (msg.length % 64 !== 56) msg.push(0);
  const lo = (msgLen * 8) >>> 0;
  const hi = Math.floor((msgLen * 8) / 0x100000000) >>> 0;
  msg.push(lo & 0xff, (lo >>> 8) & 0xff, (lo >>> 16) & 0xff, (lo >>> 24) & 0xff);
  msg.push(hi & 0xff, (hi >>> 8) & 0xff, (hi >>> 16) & 0xff, (hi >>> 24) & 0xff);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const K = [
    0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,
    0x698098d8,0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,0xa679438e,0x49b40821,
    0xf61e2562,0xc040b340,0x265e5a51,0xe9b6c7aa,0xd62f105d,0x02441453,0xd8a1e681,0xe7d3fbc8,
    0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,0xfcefa3f8,0x676f02d9,0x8d2a4c8a,
    0xfffa3942,0x8771f681,0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,0xbebfbc70,
    0x289b7ec6,0xeaa127fa,0xd4ef3085,0x04881d05,0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,
    0xf4292244,0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,0xffeff47d,0x85845dd1,
    0x6fa87e4f,0xfe2ce6e0,0xa3014314,0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391,
  ];
  const S = [
    7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
    5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
    4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
    6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21,
  ];
  for (let chunk = 0; chunk < msg.length; chunk += 64) {
    const M = new Array(16);
    for (let i = 0; i < 16; i++) {
      M[i] = (msg[chunk + i * 4]) | (msg[chunk + i * 4 + 1] << 8) | (msg[chunk + i * 4 + 2] << 16) | (msg[chunk + i * 4 + 3] << 24);
    }
    let A = a, B = b, C = c, D = d;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      const temp = D;
      D = C; C = B;
      B = add32(B, rotl(add32(add32(A, F), add32(K[i], M[g])), S[i]));
      A = temp;
    }
    a = add32(a, A); b = add32(b, B); c = add32(c, C); d = add32(d, D);
  }
  const toHex = (n) => Array.from({ length: 4 }, (_, i) => ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, "0")).join("");
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
};

const sha = async (algo, text) => {
  const buf = await window.crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState({ md5: "", sha1: "", sha256: "", sha512: "" });
  useEffect(() => {
    let cancelled = false;
    if (!input) { setHashes({ md5: "", sha1: "", sha256: "", sha512: "" }); return; }
    (async () => {
      const [s1, s256, s512] = await Promise.all([
        sha("SHA-1", input), sha("SHA-256", input), sha("SHA-512", input),
      ]);
      if (cancelled) return;
      setHashes({ md5: md5(input), sha1: s1, sha256: s256, sha512: s512 });
    })();
    return () => { cancelled = true; };
  }, [input]);

  return (
    <>
      <ToolSection title="Input text">
        <TextField value={input} onChange={(e) => setInput(e.target.value)} fullWidth multiline minRows={3} maxRows={10} InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }} />
      </ToolSection>
      <Stack spacing={1.5}>
        {[
          ["MD5", hashes.md5],
          ["SHA-1", hashes.sha1],
          ["SHA-256", hashes.sha256],
          ["SHA-512", hashes.sha512],
        ].map(([label, v]) => (
          <HashRow key={label} label={label} value={v} />
        ))}
      </Stack>
    </>
  );
}
const HashRow = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!value) return;
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip label={label} size="small" sx={{ width: 80, fontWeight: 700 }} />
      <TextField value={value} fullWidth size="small" InputProps={{ readOnly: true, sx: { fontFamily: monoFont, fontSize: 12 } }} />
      <Tooltip title={copied ? "Copied!" : "Copy"}>
        <span>
          <IconButton size="small" onClick={copy} disabled={!value}>
            {copied ? <PiCheckBold size={14} color="#22c55e" /> : <PiCopyDuotone size={14} />}
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
};
