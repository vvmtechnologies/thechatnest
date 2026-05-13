import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { PiCheckBold, PiCopyDuotone, PiPlayDuotone, PiPauseDuotone, PiArrowsClockwiseDuotone } from "react-icons/pi";
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

// ── Stopwatch + Timer ─────────────────────────────────────────────────
const fmtTime = (ms) => {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 10);
  const cs = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000) % 60;
  const h = Math.floor(total / 360000);
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
};

export function Stopwatch() {
  const [mode, setMode] = useState("stopwatch"); // 'stopwatch' | 'timer'
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [target, setTarget] = useState(5 * 60 * 1000); // 5 min default
  const [setupMin, setSetupMin] = useState(5);
  const [setupSec, setSetupSec] = useState(0);
  const startRef = useRef(0);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now() - elapsed;
    tickRef.current = setInterval(() => {
      const now = Date.now() - startRef.current;
      setElapsed(now);
      if (mode === "timer" && now >= target) {
        setRunning(false);
        try { new Audio("data:audio/wav;base64,UklGRpQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAAAACAgICAgIB/f39/f4CAgICAgICAgIB/f39/f3+AgICAgICAgIB/f39/f3+AgICAgIB/f39/f3+AgICAgICAgIB/f39/f3+AgICAgIB/f39/f3+AgICAgIB/f39/f3+AgICAgIB/").play(); } catch {}
      }
    }, 30);
    return () => clearInterval(tickRef.current);
  }, [running, mode, target, elapsed]);

  const displayMs = mode === "stopwatch" ? elapsed : Math.max(0, target - elapsed);
  const reset = () => { setRunning(false); setElapsed(0); };
  const applyTimer = () => {
    setMode("timer");
    setTarget(Math.max(1000, (Number(setupMin) || 0) * 60000 + (Number(setupSec) || 0) * 1000));
    setElapsed(0);
    setRunning(false);
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant={mode === "stopwatch" ? "contained" : "outlined"} size="small" onClick={() => { setMode("stopwatch"); reset(); }}>Stopwatch</Button>
        <Button variant={mode === "timer" ? "contained" : "outlined"} size="small" onClick={() => setMode("timer")}>Timer</Button>
      </Stack>

      {mode === "timer" && (
        <ToolSection title="Set duration">
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField type="number" label="Minutes" value={setupMin} onChange={(e) => setSetupMin(Math.max(0, Number(e.target.value) || 0))} size="small" sx={{ width: 120 }} />
            <TextField type="number" label="Seconds" value={setupSec} onChange={(e) => setSetupSec(Math.max(0, Math.min(59, Number(e.target.value) || 0)))} size="small" sx={{ width: 120 }} />
            <Button size="small" onClick={applyTimer}>Set</Button>
          </Stack>
        </ToolSection>
      )}

      <Box sx={{ textAlign: "center", py: 3, mb: 2, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff" }}>
        <Typography sx={{ fontFamily: monoFont, fontSize: 56, fontWeight: 800, letterSpacing: "-0.02em" }}>{fmtTime(displayMs)}</Typography>
      </Box>
      <Stack direction="row" spacing={1} justifyContent="center">
        <Button startIcon={running ? <PiPauseDuotone /> : <PiPlayDuotone />} variant="contained" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"}
        </Button>
        <Button startIcon={<PiArrowsClockwiseDuotone />} variant="outlined" onClick={reset}>Reset</Button>
      </Stack>
    </>
  );
}

// ── Pomodoro ──────────────────────────────────────────────────────────
const POMODORO_WORK = 25 * 60;
const POMODORO_BREAK = 5 * 60;

export function Pomodoro() {
  const [phase, setPhase] = useState("work"); // 'work' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_WORK);
  const [running, setRunning] = useState(false);
  const [cyclesDone, setCyclesDone] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // phase done — flip
          try { new Audio("data:audio/wav;base64,UklGRpQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAAAACAgICAgIB/f39/f4CAgICAgICAgIB/f39/f3+AgICAgICAgIB/f39/f3+AgICAgIB/f39/f3+AgICAgICAgIB/f39/f3+AgICAgIB/f39/f3+AgICAgIB/f39/f3+AgICAgIB/").play(); } catch {}
          setPhase((p) => {
            const next = p === "work" ? "break" : "work";
            if (p === "work") setCyclesDone((c) => c + 1);
            return next;
          });
          return phase === "work" ? POMODORO_BREAK : POMODORO_WORK;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase]);
  const reset = () => { setRunning(false); setPhase("work"); setSecondsLeft(POMODORO_WORK); setCyclesDone(0); };
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const tint = phase === "work" ? "#dc2626" : "#16a34a";
  return (
    <>
      <Box sx={{ textAlign: "center", py: 4, mb: 2, borderRadius: 2, background: `linear-gradient(135deg, ${tint}, ${tint}cc)`, color: "#fff" }}>
        <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 800, opacity: 0.85 }}>{phase === "work" ? "Focus" : "Break"}</Typography>
        <Typography sx={{ fontFamily: monoFont, fontSize: 64, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" }}>{mm}:{ss}</Typography>
        <Typography sx={{ mt: 1, opacity: 0.85, fontSize: 13 }}>Cycles completed: {cyclesDone}</Typography>
      </Box>
      <Stack direction="row" spacing={1} justifyContent="center">
        <Button startIcon={running ? <PiPauseDuotone /> : <PiPlayDuotone />} variant="contained" onClick={() => setRunning((r) => !r)} sx={{ bgcolor: tint, "&:hover": { bgcolor: tint } }}>
          {running ? "Pause" : "Start"}
        </Button>
        <Button startIcon={<PiArrowsClockwiseDuotone />} variant="outlined" onClick={reset}>Reset</Button>
      </Stack>
    </>
  );
}

// ── Age Calculator ────────────────────────────────────────────────────
export function AgeCalculator() {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState("2000-01-01");
  const [to, setTo] = useState(today);

  const diff = useMemo(() => {
    if (!from || !to) return null;
    const a = new Date(from);
    const b = new Date(to);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
    if (b < a) return { error: "End date must be after start date" };
    let y = b.getFullYear() - a.getFullYear();
    let m = b.getMonth() - a.getMonth();
    let d = b.getDate() - a.getDate();
    if (d < 0) {
      m -= 1;
      const prevMonth = new Date(b.getFullYear(), b.getMonth(), 0).getDate();
      d += prevMonth;
    }
    if (m < 0) { y -= 1; m += 12; }
    const totalDays = Math.floor((b - a) / 86400000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = y * 12 + m;
    return { y, m, d, totalDays, totalWeeks, totalMonths };
  }, [from, to]);

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <TextField type="date" label="Start date" value={from} onChange={(e) => setFrom(e.target.value)} size="small" InputLabelProps={{ shrink: true }}
          sx={(t) => ({ "& input[type='date']::-webkit-calendar-picker-indicator": { filter: t.palette.mode === "light" ? "invert(0.45)" : "invert(0.85)", cursor: "pointer", opacity: 1 } })} />
        <TextField type="date" label="End date" value={to} onChange={(e) => setTo(e.target.value)} size="small" InputLabelProps={{ shrink: true }}
          sx={(t) => ({ "& input[type='date']::-webkit-calendar-picker-indicator": { filter: t.palette.mode === "light" ? "invert(0.45)" : "invert(0.85)", cursor: "pointer", opacity: 1 } })} />
      </Stack>
      {diff?.error && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{diff.error}</Typography>}
      {diff && !diff.error && (
        <>
          <Box sx={{ p: 3, mb: 2, borderRadius: 2, background: "linear-gradient(135deg, #2065D1, #1242a3)", color: "#fff", textAlign: "center" }}>
            <Typography sx={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em" }}>
              {diff.y} years, {diff.m} months, {diff.d} days
            </Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1.25 }}>
            <Stat label="Total months" value={diff.totalMonths.toLocaleString()} />
            <Stat label="Total weeks" value={diff.totalWeeks.toLocaleString()} />
            <Stat label="Total days" value={diff.totalDays.toLocaleString()} />
          </Box>
        </>
      )}
    </>
  );
}

// ── Percentage Calculator ─────────────────────────────────────────────
export function PercentageCalc() {
  const [a, setA] = useState(25);
  const [b, setB] = useState(200);
  const [from, setFrom] = useState(100);
  const [to, setTo] = useState(125);

  const res1 = useMemo(() => (Number(a) || 0) * (Number(b) || 0) / 100, [a, b]);
  const ratio = useMemo(() => {
    if (!from || from === 0) return null;
    return ((Number(to) - Number(from)) / Number(from)) * 100;
  }, [from, to]);
  const fmt = (n) => Number.isFinite(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "—";

  return (
    <>
      <ToolSection title="What is X% of Y">
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <TextField label="X (%)" type="number" value={a} onChange={(e) => setA(e.target.value)} size="small" sx={{ width: 120 }} />
          <Typography>of</Typography>
          <TextField label="Y" type="number" value={b} onChange={(e) => setB(e.target.value)} size="small" sx={{ width: 140 }} />
          <Typography>=</Typography>
          <Box sx={{ px: 1.5, py: 0.85, borderRadius: 1, bgcolor: "primary.main", color: "#fff", fontWeight: 700, fontFamily: monoFont }}>{fmt(res1)}</Box>
        </Stack>
      </ToolSection>
      <ToolSection title="Change from X to Y">
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <TextField label="From" type="number" value={from} onChange={(e) => setFrom(e.target.value)} size="small" sx={{ width: 140 }} />
          <TextField label="To" type="number" value={to} onChange={(e) => setTo(e.target.value)} size="small" sx={{ width: 140 }} />
          <Typography>=</Typography>
          <Box sx={{ px: 1.5, py: 0.85, borderRadius: 1, bgcolor: ratio >= 0 ? "#16a34a" : "#dc2626", color: "#fff", fontWeight: 700, fontFamily: monoFont }}>
            {ratio === null ? "—" : `${ratio >= 0 ? "+" : ""}${fmt(ratio)}%`}
          </Box>
        </Stack>
      </ToolSection>
    </>
  );
}
