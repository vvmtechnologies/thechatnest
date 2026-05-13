import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { PiCheckBold, PiCopyDuotone } from "react-icons/pi";
import { ToolSection, monoFont } from "./ToolShell.jsx";

// ── Meeting cost calculator ───────────────────────────────────────────
export function MeetingCost() {
  const [people, setPeople] = useState(6);
  const [duration, setDuration] = useState(30);
  const [hourlyRate, setHourlyRate] = useState(1500);
  const [currency, setCurrency] = useState("INR");
  const symbols = { INR: "₹", USD: "$", EUR: "€" };
  const cost = useMemo(() => (people * hourlyRate * duration) / 60, [people, duration, hourlyRate]);
  const perWeek = cost * 2; // assume 2 meetings/week of this type
  const perYear = perWeek * 50;

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField label="People" type="number" value={people} onChange={(e) => setPeople(Math.max(1, Number(e.target.value) || 1))} size="small" sx={{ width: 110 }} />
        <TextField label="Duration (min)" type="number" value={duration} onChange={(e) => setDuration(Math.max(5, Number(e.target.value) || 5))} size="small" sx={{ width: 140 }} />
        <TextField label="Hourly rate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Math.max(0, Number(e.target.value) || 0))} size="small" sx={{ width: 140 }} />
        <TextField label="Currency" select value={currency} onChange={(e) => setCurrency(e.target.value)} size="small" sx={{ width: 110 }}>
          {["INR", "USD", "EUR"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
      </Stack>

      <Box
        sx={(theme) => ({
          p: 3,
          borderRadius: 2,
          background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)",
          color: "#fff",
          textAlign: "center",
          mb: 2,
        })}
      >
        <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>
          This meeting will cost
        </Typography>
        <Typography sx={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.02em", my: 0.5 }}>
          {symbols[currency]}{cost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
          {people} people × {duration} min × {symbols[currency]}{hourlyRate}/hr
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.25, mb: 2 }}>
        <Stat label="If you have 2 of these per week" value={`${symbols[currency]}${perWeek.toLocaleString()}`} />
        <Stat label="Over 50 weeks" value={`${symbols[currency]}${perYear.toLocaleString()}`} />
      </Box>

      <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, bgcolor: theme.palette.mode === "light" ? "rgba(255,213,74,0.1)" : "rgba(255,213,74,0.05)", border: `1px solid ${theme.palette.mode === "light" ? "rgba(255,213,74,0.4)" : "rgba(255,213,74,0.25)"}` })}>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          Try replacing this meeting with an <strong>async voice note</strong> in TheChatNest — 90 seconds, transcribed, searchable forever.
          Skip just 2 of these per week and your team saves <strong>{symbols[currency]}{perYear.toLocaleString()}</strong> a year.
        </Typography>
      </Box>
    </>
  );
}
const Stat = ({ label, value }) => (
  <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper" })}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", fontSize: 10 }}>{label}</Typography>
    <Typography sx={{ fontSize: 22, fontWeight: 800, mt: 0.25 }}>{value}</Typography>
  </Box>
);

// ── Timezone converter ────────────────────────────────────────────────
const COMMON_TZ = [
  "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo",
  "Europe/London", "Europe/Berlin", "Europe/Paris",
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Australia/Sydney", "UTC",
];

export function TimezoneConverter() {
  const now = new Date();
  const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const [iso, setIso] = useState(localIso);
  const [sourceTz, setSourceTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");

  const parsed = useMemo(() => {
    try {
      // Treat input as wall-clock time in sourceTz; build a date that represents that moment.
      const [date, time] = iso.split("T");
      const [y, m, d] = date.split("-").map(Number);
      const [hh, mm] = time.split(":").map(Number);
      // Hack: build a UTC date and let Intl format handle conversion
      const utc = Date.UTC(y, m - 1, d, hh, mm);
      // To get the offset for sourceTz at this date:
      const fmt = new Intl.DateTimeFormat("en-US", { timeZone: sourceTz, timeZoneName: "short" });
      const offsetMinutes = -new Date(utc).getTimezoneOffset(); // approx fallback
      return { utc, offsetMinutes, fmt };
    } catch { return null; }
  }, [iso, sourceTz]);

  const format = (tz, t) => {
    try {
      return new Intl.DateTimeFormat("en-IN", {
        timeZone: tz,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(t);
    } catch (e) { return e.message; }
  };

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField type="datetime-local" label="Date & time" value={iso} onChange={(e) => setIso(e.target.value)} size="small" InputLabelProps={{ shrink: true }} sx={{ minWidth: 220 }} />
        <TextField select label="Source timezone" value={sourceTz} onChange={(e) => setSourceTz(e.target.value)} size="small" sx={{ minWidth: 220 }}>
          {COMMON_TZ.map((tz) => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
        </TextField>
      </Stack>

      <Stack spacing={1}>
        {COMMON_TZ.map((tz) => {
          const isSource = tz === sourceTz;
          // Reconstruct moment: treat iso as time-in-sourceTz, convert by formatting
          const t = parsed ? new Date(parsed.utc + (parsed.offsetMinutes - 0) * 60000) : new Date();
          return (
            <Stack key={tz} direction="row" spacing={1.5} alignItems="center" sx={(theme) => ({ p: 1.25, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: isSource ? "rgba(255,213,74,0.08)" : "background.paper" })}>
              <Chip label={tz} size="small" sx={{ minWidth: 160, fontWeight: 700 }} variant={isSource ? "filled" : "outlined"} />
              <Typography sx={{ fontFamily: monoFont, fontSize: 13 }}>{format(tz, t)}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </>
  );
}

// ── Word & character counter ──────────────────────────────────────────
export function WordCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || 1 : 0;
    const paragraphs = text.trim() ? text.trim().split(/\n+/).filter(Boolean).length : 0;
    const readingMin = Math.max(1, Math.ceil(words / 200));
    const speakingMin = Math.max(1, Math.ceil(words / 130));
    return { chars, charsNoSpace, words, sentences, paragraphs, readingMin, speakingMin };
  }, [text]);
  return (
    <>
      <ToolSection title="Text">
        <TextField value={text} onChange={(e) => setText(e.target.value)} fullWidth multiline minRows={6} maxRows={16} placeholder="Paste or type your content…" />
      </ToolSection>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.25 }}>
        <Stat label="Characters" value={stats.chars.toLocaleString()} />
        <Stat label="Chars (no spaces)" value={stats.charsNoSpace.toLocaleString()} />
        <Stat label="Words" value={stats.words.toLocaleString()} />
        <Stat label="Sentences" value={stats.sentences.toLocaleString()} />
        <Stat label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
        <Stat label="Reading time" value={`${stats.readingMin} min`} />
        <Stat label="Speaking time" value={`${stats.speakingMin} min`} />
        <Stat label="Avg word length" value={stats.words ? (stats.charsNoSpace / stats.words).toFixed(1) : "0"} />
      </Box>
    </>
  );
}

// ── Unix timestamp converter ──────────────────────────────────────────
export function TimestampConverter() {
  const [ts, setTs] = useState(String(Math.floor(Date.now() / 1000)));
  const [iso, setIso] = useState(new Date().toISOString());

  const tsToIso = (val) => {
    if (!val) return "";
    let n = Number(val);
    if (!Number.isFinite(n)) return "Invalid";
    // Heuristic: > 1e12 means ms
    if (n > 1e12) n = n / 1000;
    return new Date(n * 1000).toISOString();
  };
  const isoToTs = (val) => {
    if (!val) return "";
    const t = Date.parse(val);
    if (Number.isNaN(t)) return "Invalid";
    return String(Math.floor(t / 1000));
  };
  const tsParsed = tsToIso(ts);
  const isoParsed = isoToTs(iso);

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
        <Box>
          <ToolSection title="Unix timestamp" hint="seconds or ms">
            <TextField fullWidth value={ts} onChange={(e) => setTs(e.target.value)} InputProps={{ sx: { fontFamily: monoFont } }} />
          </ToolSection>
          <ResultLine label="ISO 8601" value={tsParsed} />
          <ResultLine label="Local time" value={(() => {
            try { return new Date(tsParsed).toLocaleString(); } catch { return ""; }
          })()} />
        </Box>
        <Box>
          <ToolSection title="ISO date" hint="e.g. 2026-05-13T10:42:00Z">
            <TextField fullWidth value={iso} onChange={(e) => setIso(e.target.value)} InputProps={{ sx: { fontFamily: monoFont } }} />
          </ToolSection>
          <ResultLine label="Unix (s)" value={isoParsed} />
          <ResultLine label="Unix (ms)" value={isoParsed && isoParsed !== "Invalid" ? String(Number(isoParsed) * 1000) : ""} />
        </Box>
      </Box>
    </>
  );
}
const ResultLine = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} };
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.85 }}>
      <Chip label={label} size="small" sx={{ minWidth: 90, fontWeight: 700 }} />
      <TextField value={value || ""} size="small" fullWidth InputProps={{ readOnly: true, sx: { fontFamily: monoFont, fontSize: 12 } }} />
      <IconButton size="small" onClick={copy} disabled={!value}>{copied ? <PiCheckBold size={14} color="#22c55e" /> : <PiCopyDuotone size={14} />}</IconButton>
    </Stack>
  );
};
