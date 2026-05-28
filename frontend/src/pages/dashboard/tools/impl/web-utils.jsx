import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { PiCheckBold, PiCopyDuotone, PiDownloadDuotone } from "react-icons/pi";
import { ToolSection, monoFont } from "./ToolShell.jsx";

const copyText = (t) => navigator.clipboard?.writeText(t);

// ─────────────────────────────────────────────────────────────────────
// URL Shortener — is.gd public API (no auth)
// ─────────────────────────────────────────────────────────────────────
export function UrlShortener() {
  const [long, setLong] = useState("");
  const [out, setOut] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const run = async () => {
    setError(""); setOut("");
    if (!long.match(/^https?:\/\//i)) { setError("Enter a full URL starting with http(s)://"); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(long)}`);
      const text = (await res.text()).trim();
      if (!res.ok || text.startsWith("Error")) throw new Error(text || "Shortening failed");
      setOut(text);
      setHistory((h) => [{ long, short: text }, ...h].slice(0, 8));
    } catch (e) {
      setError(e.message || "Failed to shorten");
    } finally { setLoading(false); }
  };

  return (
    <>
      <TextField fullWidth size="small" sx={{ mb: 1.5 }} label="Paste a long URL"
        placeholder="https://example.com/some/very/long/path?with=lots&of=params"
        value={long} onChange={(e) => setLong(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && run()} />
      <Button variant="contained" fullWidth onClick={run} disabled={loading || !long}>{loading ? "Shortening…" : "Shorten"}</Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {out && (
        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "rgba(34,197,94,0.10)", border: "2px solid #22c55e" }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "#15803d", letterSpacing: 0.4, textTransform: "uppercase" }}>Short URL</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            <Typography sx={{ flex: 1, fontFamily: monoFont, fontSize: 18, fontWeight: 800, wordBreak: "break-all", color: "#15803d" }}>{out}</Typography>
            <IconButton onClick={() => { copyText(out); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
              {copied ? <PiCheckBold style={{ color: "#15803d" }} /> : <PiCopyDuotone />}
            </IconButton>
          </Stack>
        </Box>
      )}
      {history.length > 0 && (
        <ToolSection title={`History (${history.length})`}>
          <Stack spacing={0.75}>
            {history.map((h, i) => (
              <Box key={i} sx={(theme) => ({ p: 1, borderRadius: 1, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper" })}>
                <Typography sx={{ fontFamily: monoFont, fontSize: 12, fontWeight: 700 }}>{h.short}</Typography>
                <Typography sx={{ fontFamily: monoFont, fontSize: 11, color: "text.disabled", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>↳ {h.long}</Typography>
              </Box>
            ))}
          </Stack>
        </ToolSection>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// OG Preview — microlink.io free tier (CORS-friendly)
// ─────────────────────────────────────────────────────────────────────
export function OgPreview() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setError(""); setData(null);
    if (!url.match(/^https?:\/\//i)) { setError("Enter a full URL starting with http(s)://"); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
      const payload = await res.json();
      if (payload.status !== "success") throw new Error(payload?.data?.error || "Couldn't fetch metadata");
      setData(payload.data);
    } catch (e) { setError(e.message || "Failed to fetch"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <TextField fullWidth size="small" sx={{ mb: 1.5 }} label="URL to preview"
        placeholder="https://thechatnest.com/blog/async-meetings"
        value={url} onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && run()} />
      <Button variant="contained" fullWidth onClick={run} disabled={loading || !url}>{loading ? "Fetching…" : "Preview link"}</Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {data && (
        <>
          <Typography variant="caption" sx={{ display: "block", mt: 2, mb: 1, fontWeight: 700, color: "text.secondary" }}>
            ↓ This is how your link will look when shared
          </Typography>
          <Box sx={(theme) => ({ borderRadius: 2, overflow: "hidden", border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper" })}>
            {data.image?.url && <Box component="img" src={data.image.url} sx={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />}
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.disabled" }}>{data.publisher || new URL(data.url || url).hostname}</Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1.3, mt: 0.25 }}>{data.title || "—"}</Typography>
              {data.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{data.description}</Typography>}
            </Box>
          </Box>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Public Holidays — Nager.Date API (no auth)
// ─────────────────────────────────────────────────────────────────────
const COUNTRIES = [
  ["IN", "India"], ["US", "United States"], ["GB", "United Kingdom"], ["CA", "Canada"], ["AU", "Australia"],
  ["DE", "Germany"], ["FR", "France"], ["ES", "Spain"], ["IT", "Italy"], ["NL", "Netherlands"],
  ["JP", "Japan"], ["SG", "Singapore"], ["AE", "UAE"], ["BR", "Brazil"], ["MX", "Mexico"],
  ["ZA", "South Africa"], ["KR", "South Korea"], ["ID", "Indonesia"], ["PH", "Philippines"], ["TH", "Thailand"],
];

export function PublicHolidays() {
  const [country, setCountry] = useState("IN");
  const [year, setYear] = useState(new Date().getFullYear());
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setError(""); setLoading(true);
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setList(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setError("Couldn't fetch holidays."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [country, year]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = list.filter((h) => h.date >= today);

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Country" value={country} onChange={(e) => setCountry(e.target.value)} sx={{ width: 200 }}>
          {COUNTRIES.map(([c, n]) => <MenuItem key={c} value={c}>{n}</MenuItem>)}
        </TextField>
        <TextField type="number" size="small" label="Year" value={year} onChange={(e) => setYear(Math.max(2000, Math.min(2099, Number(e.target.value) || 0)))} sx={{ width: 110 }} />
        <Box sx={{ flex: 1 }} />
        <Chip label={`${list.length} total · ${upcoming.length} upcoming`} sx={{ alignSelf: "center", fontWeight: 700 }} />
      </Stack>

      {loading && <Box sx={{ textAlign: "center", py: 3 }}>Loading…</Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <Stack spacing={0.75}>
          {list.map((h) => {
            const isPast = h.date < today;
            const isToday = h.date === today;
            return (
              <Box key={`${h.date}-${h.name}`} sx={(theme) => ({
                p: 1.25, borderRadius: 1.5, display: "flex", alignItems: "center", gap: 1.5,
                border: `1px solid ${isToday ? "#22c55e" : theme.palette.divider}`,
                bgcolor: isToday ? "rgba(34,197,94,0.10)" : "background.paper",
                opacity: isPast ? 0.5 : 1,
              })}>
                <Box sx={{ minWidth: 70, fontFamily: monoFont, fontWeight: 800, fontSize: 13, color: isToday ? "#15803d" : "text.secondary" }}>{h.date}</Box>
                <Typography sx={{ flex: 1, fontWeight: 700 }}>{h.name}</Typography>
                {h.global ? <Chip size="small" label="National" /> : <Chip size="small" label="Regional" color="warning" variant="outlined" />}
              </Box>
            );
          })}
        </Stack>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Currency Converter — frankfurter.app (no auth, ECB rates)
// ─────────────────────────────────────────────────────────────────────
const CURRENCIES = ["USD","EUR","GBP","INR","JPY","AUD","CAD","CHF","CNY","SGD","HKD","NZD","SEK","KRW","MXN","BRL","ZAR","AED","SAR","TRY"];

export function CurrencyConverter() {
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [rate, setRate] = useState(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (from === to) { setRate(1); setDate(""); return; }
    let cancelled = false;
    setLoading(true);
    fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setRate(data?.rates?.[to] ?? null);
        setDate(data?.date || "");
      })
      .catch(() => { if (!cancelled) setRate(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [from, to]);

  const result = rate !== null ? amount * rate : null;

  const swap = () => { setFrom(to); setTo(from); };

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2, alignItems: "center" }}>
        <TextField fullWidth type="number" size="small" label="Amount" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))} />
        <TextField fullWidth select size="small" label="From" value={from} onChange={(e) => setFrom(e.target.value)}>
          {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <IconButton onClick={swap}>⇄</IconButton>
        <TextField fullWidth select size="small" label="To" value={to} onChange={(e) => setTo(e.target.value)}>
          {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
      </Stack>

      <Box sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center", mb: 2 }}>
        <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>{loading ? "Loading…" : `${amount.toLocaleString()} ${from} =`}</Typography>
        <Typography sx={{ fontSize: 48, fontWeight: 900, mt: 0.25 }}>
          {result === null ? "—" : `${result.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}`}
        </Typography>
        {rate !== null && from !== to && (
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            1 {from} = {rate.toFixed(4)} {to} · {date}
          </Typography>
        )}
      </Box>
      <Typography variant="caption" color="text.disabled">Rates from ECB via frankfurter.app — updated daily, may lag.</Typography>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Website Status Checker — isitup.org JSON endpoint
// ─────────────────────────────────────────────────────────────────────
export function WebsiteStatus() {
  const [host, setHost] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setError(""); setResult(null);
    let h = host.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
    if (!h) { setError("Enter a domain (e.g. example.com)."); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://isitup.org/${encodeURIComponent(h)}.json`);
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Couldn't reach checker. Try again.");
    } finally { setLoading(false); }
  };

  const up = result?.status_code === 1;
  const down = result?.status_code === 2;
  const invalid = result?.status_code === 3;

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField fullWidth size="small" label="Domain or host" placeholder="example.com"
          value={host} onChange={(e) => setHost(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()} />
        <Button variant="contained" onClick={run} disabled={loading}>{loading ? "Checking…" : "Check"}</Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {result && (
        <Box sx={{
          p: 3, borderRadius: 2, textAlign: "center",
          background: up ? "linear-gradient(135deg, #16a34a, #15803d)" : down ? "linear-gradient(135deg, #ef4444, #b91c1c)" : "linear-gradient(135deg, #6b7280, #4b5563)",
          color: "#fff",
        }}>
          <Typography sx={{ fontSize: 48 }}>{up ? "✅" : down ? "❌" : "⚠️"}</Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 900, mt: 1 }}>
            {up && `${result.domain} is UP`}
            {down && `${result.domain} is DOWN`}
            {invalid && `Invalid host`}
          </Typography>
          {up && (
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
              <Chip label={`HTTP ${result.response_code}`} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 700 }} />
              <Chip label={`${result.response_time}s`} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 700 }} />
              <Chip label={result.response_ip} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 700 }} />
            </Stack>
          )}
        </Box>
      )}
      <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 2 }}>
        Checked via isitup.org — independent third party so the result reflects general internet reachability, not just your own.
      </Typography>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// IP Address Lookup — ipapi.co
// ─────────────────────────────────────────────────────────────────────
export function IpLookup() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchIp = async (target = "") => {
    setError(""); setData(null); setLoading(true);
    try {
      const url = target.trim() ? `https://ipapi.co/${target.trim()}/json/` : "https://ipapi.co/json/";
      const res = await fetch(url);
      const payload = await res.json();
      if (payload.error) throw new Error(payload.reason || "Lookup failed");
      setData(payload);
    } catch (e) { setError(e.message || "Lookup failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIp(""); }, []);

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField fullWidth size="small" label="IP address (blank = your own)" placeholder="8.8.8.8"
          value={ip} onChange={(e) => setIp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchIp(ip)} />
        <Button variant="contained" onClick={() => fetchIp(ip)} disabled={loading}>{loading ? "Looking up…" : "Lookup"}</Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {data && (
        <>
          <Box sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center", mb: 2 }}>
            <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>{data.ip}</Typography>
            <Typography sx={{ fontSize: 32, fontWeight: 900, mt: 0.25 }}>{data.city}, {data.country_name}</Typography>
            <Typography sx={{ opacity: 0.75 }}>{data.region}</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1.25 }}>
            <InfoCard label="ISP" value={data.org || "—"} />
            <InfoCard label="ASN" value={data.asn || "—"} />
            <InfoCard label="Timezone" value={data.timezone || "—"} />
            <InfoCard label="Country code" value={data.country_code || "—"} />
            <InfoCard label="Postal" value={data.postal || "—"} />
            <InfoCard label="Currency" value={data.currency || "—"} />
            <InfoCard label="Latitude" value={data.latitude || "—"} />
            <InfoCard label="Longitude" value={data.longitude || "—"} />
            <InfoCard label="Calling code" value={data.country_calling_code || "—"} />
          </Box>
        </>
      )}
    </>
  );
}

const InfoCard = ({ label, value }) => (
  <Box sx={(theme) => ({ p: 1.5, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper" })}>
    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.4, textTransform: "uppercase", fontSize: 10 }}>{label}</Typography>
    <Typography sx={{ fontSize: 14, fontWeight: 700, mt: 0.25, wordBreak: "break-word" }}>{value}</Typography>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────
// Browser & Device Info — pure navigator/screen API
// ─────────────────────────────────────────────────────────────────────
export function BrowserInfo() {
  const info = useMemo(() => {
    const n = navigator;
    const s = screen;
    const ua = n.userAgent;
    const detect = (re) => re.test(ua);
    let browser = "Unknown";
    if (detect(/Edg\//)) browser = "Edge";
    else if (detect(/OPR\//)) browser = "Opera";
    else if (detect(/Chrome\//)) browser = "Chrome";
    else if (detect(/Firefox\//)) browser = "Firefox";
    else if (detect(/Safari\//)) browser = "Safari";
    let os = "Unknown";
    if (detect(/Windows NT 10/)) os = "Windows 10/11";
    else if (detect(/Windows NT/)) os = "Windows";
    else if (detect(/Mac OS X/)) os = "macOS";
    else if (detect(/Linux/)) os = "Linux";
    else if (detect(/Android/)) os = "Android";
    else if (detect(/iPhone|iPad/)) os = "iOS";
    return {
      browser, os,
      ua,
      language: n.language,
      languages: (n.languages || []).join(", "),
      cookies: n.cookieEnabled ? "Enabled" : "Disabled",
      online: n.onLine ? "Yes" : "No",
      cores: n.hardwareConcurrency || "Unknown",
      memory: n.deviceMemory ? `${n.deviceMemory} GB` : "Unknown",
      screenSize: `${s.width} × ${s.height}`,
      viewport: `${window.innerWidth} × ${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio,
      colorDepth: `${s.colorDepth}-bit`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      doNotTrack: n.doNotTrack === "1" ? "Yes" : "No",
      platform: n.platform,
    };
  }, []);

  return (
    <>
      <Box sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center", mb: 2 }}>
        <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>You are using</Typography>
        <Typography sx={{ fontSize: 32, fontWeight: 900, mt: 0.25 }}>{info.browser} on {info.os}</Typography>
        <Typography sx={{ opacity: 0.75 }}>{info.viewport} viewport · {info.timezone}</Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1.25, mb: 2 }}>
        <InfoCard label="Language" value={info.language} />
        <InfoCard label="Cookies" value={info.cookies} />
        <InfoCard label="Online" value={info.online} />
        <InfoCard label="CPU cores" value={info.cores} />
        <InfoCard label="RAM" value={info.memory} />
        <InfoCard label="Screen" value={info.screenSize} />
        <InfoCard label="Pixel ratio" value={info.pixelRatio} />
        <InfoCard label="Color depth" value={info.colorDepth} />
        <InfoCard label="DNT" value={info.doNotTrack} />
      </Box>
      <ToolSection title="User Agent" action={
        <Button size="small" startIcon={<PiCopyDuotone />} onClick={() => copyText(info.ua)}>Copy</Button>
      }>
        <Box sx={(theme) => ({ p: 1.5, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper", fontFamily: monoFont, fontSize: 12, wordBreak: "break-all" })}>
          {info.ua}
        </Box>
      </ToolSection>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// HTTP Status Codes Reference
// ─────────────────────────────────────────────────────────────────────
const STATUS_CODES = [
  [100, "Continue", "1xx"], [101, "Switching Protocols", "1xx"], [102, "Processing", "1xx"],
  [200, "OK", "2xx"], [201, "Created", "2xx"], [202, "Accepted", "2xx"], [204, "No Content", "2xx"], [206, "Partial Content", "2xx"],
  [301, "Moved Permanently", "3xx"], [302, "Found", "3xx"], [304, "Not Modified", "3xx"], [307, "Temporary Redirect", "3xx"], [308, "Permanent Redirect", "3xx"],
  [400, "Bad Request", "4xx"], [401, "Unauthorized", "4xx"], [402, "Payment Required", "4xx"], [403, "Forbidden", "4xx"], [404, "Not Found", "4xx"], [405, "Method Not Allowed", "4xx"], [408, "Request Timeout", "4xx"], [409, "Conflict", "4xx"], [410, "Gone", "4xx"], [413, "Payload Too Large", "4xx"], [418, "I'm a teapot", "4xx"], [422, "Unprocessable Entity", "4xx"], [429, "Too Many Requests", "4xx"],
  [500, "Internal Server Error", "5xx"], [501, "Not Implemented", "5xx"], [502, "Bad Gateway", "5xx"], [503, "Service Unavailable", "5xx"], [504, "Gateway Timeout", "5xx"], [507, "Insufficient Storage", "5xx"],
];
const CLASS_TINT = { "1xx": "#3b82f6", "2xx": "#22c55e", "3xx": "#f59e0b", "4xx": "#ef4444", "5xx": "#a855f7" };

export function HttpStatusCodes() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return STATUS_CODES;
    return STATUS_CODES.filter(([code, name]) => String(code).includes(term) || name.toLowerCase().includes(term));
  }, [q]);

  return (
    <>
      <TextField fullWidth size="small" sx={{ mb: 2 }} placeholder="Search by code or name…" value={q} onChange={(e) => setQ(e.target.value)} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
        {filtered.map(([code, name, cls]) => (
          <Box key={code} sx={{
            p: 1.5, borderRadius: 1.5, display: "flex", alignItems: "center", gap: 1.5,
            border: `2px solid ${CLASS_TINT[cls]}33`, bgcolor: "background.paper",
            cursor: "pointer", "&:hover": { borderColor: CLASS_TINT[cls] },
          }} onClick={() => copyText(`${code} ${name}`)}>
            <Box sx={{ fontFamily: monoFont, fontSize: 22, fontWeight: 900, color: CLASS_TINT[cls], minWidth: 50 }}>{code}</Box>
            <Box>
              <Typography sx={{ fontWeight: 700 }}>{name}</Typography>
              <Typography variant="caption" color="text.disabled">{cls}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Slug URL Generator — text → URL-safe slug
// ─────────────────────────────────────────────────────────────────────
export function SlugGenerator() {
  const [input, setInput] = useState("Building a chat app that doesn't suck");
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);
  const [copied, setCopied] = useState(false);

  const slug = useMemo(() => {
    let s = input.normalize("NFKD").replace(/[̀-ͯ]/g, "");
    if (lowercase) s = s.toLowerCase();
    s = s.replace(/[^a-zA-Z0-9\s-_]/g, "");
    s = s.trim().replace(/[\s-_]+/g, separator);
    s = s.replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "");
    return s;
  }, [input, separator, lowercase]);

  return (
    <>
      <TextField fullWidth multiline minRows={2} sx={{ mb: 2 }} label="Input text" value={input} onChange={(e) => setInput(e.target.value)} />
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Separator" value={separator} onChange={(e) => setSeparator(e.target.value)} sx={{ width: 130 }}>
          <MenuItem value="-">- (kebab)</MenuItem>
          <MenuItem value="_">_ (snake)</MenuItem>
          <MenuItem value=".">. (dot)</MenuItem>
        </TextField>
        <Chip label={lowercase ? "lowercase ON" : "lowercase OFF"} onClick={() => setLowercase((v) => !v)}
          color={lowercase ? "primary" : "default"} variant={lowercase ? "filled" : "outlined"} sx={{ cursor: "pointer", alignSelf: "center" }} />
      </Stack>

      <Box sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center", mb: 2 }}>
        <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>Slug</Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 800, mt: 0.5, fontFamily: monoFont, wordBreak: "break-all" }}>{slug || "—"}</Typography>
      </Box>
      <Button variant="contained" fullWidth startIcon={copied ? <PiCheckBold /> : <PiCopyDuotone />}
        onClick={() => { copyText(slug); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
        {copied ? "Copied!" : "Copy slug"}
      </Button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// YouTube Thumbnail Downloader — extracts all thumbnail sizes
// ─────────────────────────────────────────────────────────────────────
const extractYtId = (urlOrId) => {
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  return null;
};

const YT_SIZES = [
  { key: "maxresdefault", label: "Max Res (1280×720)" },
  { key: "sddefault", label: "Standard (640×480)" },
  { key: "hqdefault", label: "High (480×360)" },
  { key: "mqdefault", label: "Medium (320×180)" },
  { key: "default", label: "Default (120×90)" },
];

export function YouTubeThumbnail() {
  const [input, setInput] = useState("");
  const [id, setId] = useState("");
  const [error, setError] = useState("");

  const extract = () => {
    const i = extractYtId(input);
    if (!i) { setError("Couldn't find a YouTube video ID in that input."); setId(""); return; }
    setError(""); setId(i);
  };

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField fullWidth size="small" label="YouTube URL or ID" placeholder="https://youtube.com/watch?v=…"
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && extract()} />
        <Button variant="contained" onClick={extract} disabled={!input}>Get thumbnails</Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {id && (
        <Stack spacing={1.5}>
          {YT_SIZES.map((s) => {
            const url = `https://img.youtube.com/vi/${id}/${s.key}.jpg`;
            return (
              <Box key={s.key} sx={(theme) => ({ p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper" })}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
                  <Box component="img" src={url} sx={{ width: { xs: "100%", sm: 200 }, maxHeight: 120, objectFit: "contain", borderRadius: 1, bgcolor: "rgba(0,0,0,0.03)" }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }}>{s.label}</Typography>
                    <Typography variant="caption" sx={{ fontFamily: monoFont, color: "text.disabled", display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>{url}</Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <Button size="small" component="a" href={url} target="_blank" rel="noopener noreferrer">Open</Button>
                    <Button size="small" startIcon={<PiDownloadDuotone />} component="a" href={url} download={`yt-${id}-${s.key}.jpg`}>Save</Button>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </>
  );
}
