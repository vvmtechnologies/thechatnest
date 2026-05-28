import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { PiArrowsClockwiseDuotone, PiCheckBold, PiCopyDuotone } from "react-icons/pi";
import { ToolSection, monoFont } from "./ToolShell.jsx";

const copy = (text) => navigator.clipboard?.writeText(text);
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─────────────────────────────────────────────────────────────────────
// Markdown / Mention Formatter
// Quick formatting helpers for chat messages — pick a style, paste text,
// get formatted output ready to paste into the chat composer.
// ─────────────────────────────────────────────────────────────────────
export function MentionFormatter() {
  const [input, setInput] = useState("Hey team — here are today's priorities");
  const [copied, setCopied] = useState("");

  const variants = useMemo(() => {
    const t = input || "";
    return [
      { label: "Bold",         value: `**${t}**` },
      { label: "Italic",       value: `_${t}_` },
      { label: "Bold + Italic", value: `***${t}***` },
      { label: "Strikethrough", value: `~~${t}~~` },
      { label: "Inline code",  value: `\`${t}\`` },
      { label: "Block quote",  value: t.split("\n").map((l) => `> ${l}`).join("\n") },
      { label: "Code block",   value: `\`\`\`\n${t}\n\`\`\`` },
      { label: "Bullet list",  value: t.split(/\n+/).map((l) => `- ${l.trim()}`).filter((l) => l !== "- ").join("\n") },
      { label: "Numbered list", value: t.split(/\n+/).map((l, i) => `${i + 1}. ${l.trim()}`).filter((l) => !l.endsWith(". ")).join("\n") },
      { label: "Headline",     value: `# ${t.split("\n")[0]}` },
    ];
  }, [input]);

  return (
    <>
      <ToolSection title="Your message">
        <TextField
          fullWidth multiline minRows={4} value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste your message here"
        />
      </ToolSection>

      <ToolSection title="Formatted variants" hint="click any to copy">
        <Stack spacing={1}>
          {variants.map((v) => (
            <Box
              key={v.label}
              onClick={() => { copy(v.value); setCopied(v.label); setTimeout(() => setCopied(""), 1500); }}
              sx={(theme) => ({
                p: 1.5, borderRadius: 1.5, cursor: "pointer",
                border: `1px solid ${copied === v.label ? "#22c55e" : theme.palette.divider}`,
                bgcolor: copied === v.label ? "rgba(34,197,94,0.08)" : "background.paper",
                "&:hover": { borderColor: "primary.main" },
                transition: "all 0.15s",
              })}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.4, textTransform: "uppercase" }}>
                  {v.label}
                </Typography>
                {copied === v.label ? <PiCheckBold style={{ color: "#22c55e" }} /> : <PiCopyDuotone style={{ color: "#94a3b8" }} />}
              </Stack>
              <Box sx={{ fontFamily: monoFont, fontSize: 13, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {v.value}
              </Box>
            </Box>
          ))}
        </Stack>
      </ToolSection>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Calendar Link Generator — Google Calendar / Outlook Web / ICS download
// ─────────────────────────────────────────────────────────────────────
const toUtcCompact = (iso) => {
  // Returns YYYYMMDDTHHmmssZ for use in Google/Outlook URLs.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
};

export function CalendarLink() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  tomorrow.setMinutes(0, 0, 0);
  const tomorrow1h = new Date(tomorrow.getTime() + 60 * 60 * 1000);
  const toLocalInput = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  const [title, setTitle] = useState("TheChatNest team sync");
  const [start, setStart] = useState(toLocalInput(tomorrow));
  const [end, setEnd] = useState(toLocalInput(tomorrow1h));
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("Quarterly priorities check-in.");
  const [copied, setCopied] = useState("");

  const startUtc = toUtcCompact(start);
  const endUtc = toUtcCompact(end);

  const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startUtc}/${endUtc}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${encodeURIComponent(new Date(start).toISOString())}&enddt=${encodeURIComponent(new Date(end).toISOString())}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;

  const ics = useMemo(() => {
    const uid = `${Date.now()}@thechatnest`;
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TheChatNest//Tools//EN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${toUtcCompact(new Date().toISOString())}`,
      `DTSTART:${startUtc}`,
      `DTEND:${endUtc}`,
      `SUMMARY:${title.replace(/\n/g, "\\n")}`,
      location ? `LOCATION:${location.replace(/\n/g, "\\n")}` : "",
      `DESCRIPTION:${details.replace(/\n/g, "\\n")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");
  }, [title, startUtc, endUtc, location, details]);

  const downloadIcs = () => {
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const onCopy = (label, value) => { copy(value); setCopied(label); setTimeout(() => setCopied(""), 1500); };

  return (
    <>
      <ToolSection title="Event details">
        <Stack spacing={1.5}>
          <TextField fullWidth size="small" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField fullWidth size="small" type="datetime-local" label="Start" InputLabelProps={{ shrink: true }} value={start} onChange={(e) => setStart(e.target.value)} />
            <TextField fullWidth size="small" type="datetime-local" label="End" InputLabelProps={{ shrink: true }} value={end} onChange={(e) => setEnd(e.target.value)} />
          </Stack>
          <TextField fullWidth size="small" label="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Meeting room / video link" />
          <TextField fullWidth size="small" multiline minRows={3} label="Description" value={details} onChange={(e) => setDetails(e.target.value)} />
        </Stack>
      </ToolSection>

      <ToolSection title="Share links">
        <Stack spacing={1.25}>
          <LinkRow label="Google Calendar" href={googleUrl} onCopy={() => onCopy("g", googleUrl)} copied={copied === "g"} />
          <LinkRow label="Outlook Web" href={outlookUrl} onCopy={() => onCopy("o", outlookUrl)} copied={copied === "o"} />
          <Button variant="contained" fullWidth onClick={downloadIcs}>Download .ics (Apple Calendar, generic)</Button>
        </Stack>
      </ToolSection>
    </>
  );
}

const LinkRow = ({ label, href, onCopy, copied }) => (
  <Box sx={(theme) => ({ p: 1.25, borderRadius: 1.5, border: `1px solid ${copied ? "#22c55e" : theme.palette.divider}`, bgcolor: "background.paper" })}>
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography sx={{ fontWeight: 800, fontSize: 13, color: "text.secondary", minWidth: 130 }}>{label}</Typography>
      <Box sx={{ flex: 1, fontFamily: monoFont, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "text.disabled" }}>{href}</Box>
      <Button size="small" component="a" href={href} target="_blank" rel="noopener noreferrer">Open</Button>
      <IconButton size="small" onClick={onCopy}>{copied ? <PiCheckBold style={{ color: "#22c55e" }} /> : <PiCopyDuotone />}</IconButton>
    </Stack>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────
// Recurring Meeting Cost — frequency-aware extension of Meeting Cost
// ─────────────────────────────────────────────────────────────────────
export function RecurringMeetingCost() {
  const [people, setPeople] = useState(8);
  const [duration, setDuration] = useState(45);
  const [hourly, setHourly] = useState(2000);
  const [currency, setCurrency] = useState("INR");
  const [frequency, setFrequency] = useState("weekly");
  const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };

  const perMeeting = (people * hourly * duration) / 60;
  const perYear = useMemo(() => {
    const occ = { daily: 250, twiceWeek: 100, weekly: 50, biweekly: 26, monthly: 12 };
    return perMeeting * (occ[frequency] || 0);
  }, [perMeeting, frequency]);
  const perMonth = perYear / 12;
  const perDecade = perYear * 10;

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" }, gap: 1.5, mb: 2 }}>
        <TextField label="People" type="number" size="small" value={people} onChange={(e) => setPeople(Math.max(1, Number(e.target.value) || 1))} />
        <TextField label="Duration (min)" type="number" size="small" value={duration} onChange={(e) => setDuration(Math.max(5, Number(e.target.value) || 5))} />
        <TextField label={`Hourly (${symbols[currency]})`} type="number" size="small" value={hourly} onChange={(e) => setHourly(Math.max(0, Number(e.target.value) || 0))} />
        <TextField label="Currency" select size="small" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {["INR", "USD", "EUR", "GBP"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField label="Frequency" select size="small" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="twiceWeek">2× / week</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="biweekly">Bi-weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #0b0f1e, #1a1f3a)", color: "#fff", textAlign: "center", mb: 2 }}>
        <Typography variant="overline" sx={{ color: "rgba(255,213,74,0.85)", letterSpacing: 1.5, fontWeight: 800 }}>Per occurrence</Typography>
        <Typography sx={{ fontSize: 38, fontWeight: 900, mt: 0.5 }}>{symbols[currency]}{Math.round(perMeeting).toLocaleString()}</Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.25, mb: 2 }}>
        <CostCard label="Per month" amount={`${symbols[currency]}${Math.round(perMonth).toLocaleString()}`} />
        <CostCard label="Per year" amount={`${symbols[currency]}${Math.round(perYear).toLocaleString()}`} highlight />
        <CostCard label="Over 10 years" amount={`${symbols[currency]}${Math.round(perDecade).toLocaleString()}`} />
      </Box>

      <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
        Replace this recurring meeting with an <strong>async update in TheChatNest</strong> and your team saves
        about <strong>{symbols[currency]}{Math.round(perYear).toLocaleString()}/year</strong> — and gets their calendar back.
      </Alert>
    </>
  );
}
const CostCard = ({ label, amount, highlight }) => (
  <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, border: `1px solid ${highlight ? "#f59e0b" : theme.palette.divider}`, bgcolor: highlight ? "rgba(245,158,11,0.08)" : "background.paper", textAlign: "center" })}>
    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</Typography>
    <Typography sx={{ fontSize: 22, fontWeight: 800, mt: 0.5 }}>{amount}</Typography>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────
// Status Update Builder — Goals / Did / Blockers template
// ─────────────────────────────────────────────────────────────────────
export function StatusBuilder() {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [yesterday, setYesterday] = useState("Shipped the file-attachment readability fix\nReviewed 2 PRs on the billing pipeline");
  const [today, setToday] = useState("Wrap up SMTP test endpoint\nPair with Aarav on the Wordle clone");
  const [blockers, setBlockers] = useState("");
  const [mood, setMood] = useState("🟢");
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => {
    const lines = [];
    lines.push(`${mood} ${name ? `**${name}** — ` : ""}Status · ${date}`);
    if (yesterday.trim()) {
      lines.push("");
      lines.push("**Yesterday**");
      yesterday.split("\n").filter(Boolean).forEach((l) => lines.push(`- ${l.replace(/^[-*•]\s*/, "")}`));
    }
    if (today.trim()) {
      lines.push("");
      lines.push("**Today**");
      today.split("\n").filter(Boolean).forEach((l) => lines.push(`- ${l.replace(/^[-*•]\s*/, "")}`));
    }
    if (blockers.trim()) {
      lines.push("");
      lines.push("**Blockers**");
      blockers.split("\n").filter(Boolean).forEach((l) => lines.push(`- ${l.replace(/^[-*•]\s*/, "")}`));
    } else {
      lines.push("");
      lines.push("**Blockers** — none");
    }
    return lines.join("\n");
  }, [name, date, yesterday, today, blockers, mood]);

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" }, gap: 1.5, mb: 2 }}>
        <TextField fullWidth size="small" label="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField fullWidth size="small" type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} />
        <TextField fullWidth size="small" select label="Mood" value={mood} onChange={(e) => setMood(e.target.value)}>
          <MenuItem value="🟢">🟢 On track</MenuItem>
          <MenuItem value="🟡">🟡 Some risk</MenuItem>
          <MenuItem value="🔴">🔴 Blocked</MenuItem>
          <MenuItem value="🚀">🚀 Shipping</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5, mb: 2 }}>
        <TextField multiline minRows={4} label="Yesterday" value={yesterday} onChange={(e) => setYesterday(e.target.value)} placeholder="What you got done — one item per line" />
        <TextField multiline minRows={4} label="Today" value={today} onChange={(e) => setToday(e.target.value)} placeholder="What you're focusing on — one item per line" />
      </Box>
      <TextField fullWidth multiline minRows={2} sx={{ mb: 2 }} label="Blockers (optional)" value={blockers} onChange={(e) => setBlockers(e.target.value)} placeholder="What you need help with — leave blank for 'none'" />

      <ToolSection title="Preview" action={
        <Button size="small" startIcon={copied ? <PiCheckBold /> : <PiCopyDuotone />} onClick={() => { copy(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
          {copied ? "Copied" : "Copy markdown"}
        </Button>
      }>
        <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper", fontFamily: monoFont, fontSize: 13, whiteSpace: "pre-wrap" })}>
          {text}
        </Box>
      </ToolSection>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Standup Question Picker — random pick from curated set
// ─────────────────────────────────────────────────────────────────────
const STANDUP_QUESTIONS = [
  "If you had a magic 'no-meetings' button, which meeting would you delete first?",
  "What's one thing from this week you're proud of, however small?",
  "Pick a colour for your mood today — and a one-line reason.",
  "What's the smallest thing blocking you from finishing your top task today?",
  "What's a tiny improvement you spotted this week but haven't fixed yet?",
  "If you had to share one async update with the whole company today, what would it be?",
  "Which teammate would you publicly thank for unblocking you recently?",
  "What's a tool, shortcut, or trick you discovered this week?",
  "What's something you'd love a fresh pair of eyes on?",
  "If you could remove one ritual from the team's workflow, what would it be?",
  "What does 'a good day at work' look like for you this week?",
  "What's one question you've been afraid to ask?",
  "Share a moment in the last week where you felt 'flow'.",
  "What's the smallest experiment you could run this week?",
  "If you could pair with anyone for an hour today, who and on what?",
];
const ICE_BREAKERS = [
  "What's the weirdest item in your fridge right now?",
  "What's a movie you can watch on repeat and never get tired of?",
  "What's one app you uninstalled and immediately reinstalled?",
  "What's your hottest non-controversial opinion about food?",
  "What's a hobby you'd pick up if time and money weren't an issue?",
  "What's the song stuck in your head right now?",
  "Where was your last truly great meal?",
  "What's the most useful thing you learned in the last year?",
  "If you had a free weekend, no obligations — what do you actually do?",
  "What's a small thing that consistently makes your day better?",
  "What's a movie everyone else loves but you find boring?",
  "What's something you swore you'd never like, but now you do?",
  "If you could have dinner with any fictional character, who and where?",
  "What's a city you've never been to that you'd visit tomorrow if you could?",
  "What's the best thing you've eaten this month?",
];

export function StandupPicker() {
  const [mode, setMode] = useState("standup");
  const [picked, setPicked] = useState(null);
  const [history, setHistory] = useState([]);

  const pool = mode === "standup" ? STANDUP_QUESTIONS : ICE_BREAKERS;

  const pick = () => {
    let next;
    do { next = sample(pool); } while (history.includes(next) && history.length < pool.length - 1);
    setPicked(next);
    setHistory((h) => [next, ...h].slice(0, 10));
  };

  useEffect(() => { setPicked(null); setHistory([]); }, [mode]);

  return (
    <>
      <Stack direction="row" spacing={1.25} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Question type" value={mode} onChange={(e) => setMode(e.target.value)} sx={{ width: 220 }}>
          <MenuItem value="standup">Standup question</MenuItem>
          <MenuItem value="icebreaker">Ice-breaker</MenuItem>
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<PiArrowsClockwiseDuotone />} onClick={pick}>
          {picked ? "Pick another" : "Pick a question"}
        </Button>
      </Stack>

      <Box sx={{
        p: 4, borderRadius: 2, textAlign: "center", mb: 2, minHeight: 140,
        background: mode === "standup"
          ? "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(59,130,246,0.08))"
          : "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.05))",
        border: `1px solid ${mode === "standup" ? "rgba(99,102,241,0.35)" : "rgba(34,197,94,0.35)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>
          {picked || (mode === "standup" ? "Press the button for a thoughtful standup question." : "Press the button for an ice-breaker.")}
        </Typography>
      </Box>

      {picked && (
        <Button fullWidth startIcon={<PiCopyDuotone />} onClick={() => copy(picked)}>
          Copy to clipboard
        </Button>
      )}

      {history.length > 1 && (
        <ToolSection title={`Recent (${history.length})`}>
          <Stack spacing={0.5}>
            {history.slice(1).map((q, i) => (
              <Typography key={i} sx={{ fontSize: 13, color: "text.secondary" }}>· {q}</Typography>
            ))}
          </Stack>
        </ToolSection>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Channel / Group Name Generator
// ─────────────────────────────────────────────────────────────────────
const CHANNEL_PREFIXES = ["proj", "team", "guild", "squad", "lab", "ops", "circle", "crew", "task", "feat"];
const CHANNEL_ADJ = ["swift", "bold", "calm", "bright", "lunar", "solar", "amber", "indigo", "violet", "ember", "frost", "rapid", "atlas", "nova", "delta", "vector", "pulse", "fluent", "vivid", "stellar"];
const CHANNEL_NOUNS = ["falcon", "raven", "atlas", "kite", "river", "harbor", "rocket", "compass", "ember", "harbor", "matrix", "stream", "cascade", "orbit", "summit", "horizon", "haven", "lighthouse", "anchor", "spark"];

export function ChannelNameGenerator() {
  const [seed, setSeed] = useState("growth marketing");
  const [casing, setCasing] = useState("kebab"); // kebab | snake | camel
  const [count, setCount] = useState(10);
  const [names, setNames] = useState([]);
  const [copied, setCopied] = useState("");

  const generate = () => {
    const tokens = seed.toLowerCase().split(/\s+/).filter(Boolean);
    const out = new Set();
    let attempts = 0;
    while (out.size < count && attempts < count * 10) {
      attempts += 1;
      const style = Math.floor(Math.random() * 4);
      const parts = [];
      if (style === 0) {
        parts.push(sample(CHANNEL_PREFIXES));
        parts.push(tokens[0] || sample(CHANNEL_NOUNS));
      } else if (style === 1) {
        parts.push(sample(CHANNEL_ADJ));
        parts.push(tokens[0] || sample(CHANNEL_NOUNS));
      } else if (style === 2) {
        parts.push(tokens.join("-") || sample(CHANNEL_NOUNS));
        parts.push(sample(CHANNEL_NOUNS));
      } else {
        parts.push(sample(CHANNEL_ADJ));
        parts.push(sample(CHANNEL_NOUNS));
        if (tokens[0]) parts.push(tokens[0]);
      }
      let name = parts.flatMap((p) => p.split(/[-_\s]+/)).filter(Boolean);
      if (casing === "kebab") name = name.join("-");
      else if (casing === "snake") name = name.join("_");
      else name = name[0] + name.slice(1).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
      out.add(name);
    }
    setNames([...out]);
  };

  useEffect(() => { generate(); }, []); // eslint-disable-line

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" }, gap: 1.5, mb: 2 }}>
        <TextField fullWidth size="small" label="Seed keywords" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="e.g. design system, sales pipeline" />
        <TextField fullWidth size="small" select label="Casing" value={casing} onChange={(e) => setCasing(e.target.value)}>
          <MenuItem value="kebab">kebab-case</MenuItem>
          <MenuItem value="snake">snake_case</MenuItem>
          <MenuItem value="camel">camelCase</MenuItem>
        </TextField>
        <TextField fullWidth size="small" type="number" label="How many" value={count} onChange={(e) => setCount(Math.max(3, Math.min(50, Number(e.target.value) || 10)))} />
      </Box>

      <Button variant="contained" fullWidth onClick={generate} sx={{ mb: 2 }}>Generate names</Button>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
        {names.map((n) => (
          <Box
            key={n}
            onClick={() => { copy(n); setCopied(n); setTimeout(() => setCopied(""), 1500); }}
            sx={(theme) => ({
              p: 1.5, borderRadius: 1.5, cursor: "pointer",
              border: `1px solid ${copied === n ? "#22c55e" : theme.palette.divider}`,
              bgcolor: copied === n ? "rgba(34,197,94,0.08)" : "background.paper",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              "&:hover": { borderColor: "primary.main" },
            })}
          >
            <Typography sx={{ fontFamily: monoFont, fontWeight: 700 }}># {n}</Typography>
            {copied === n ? <PiCheckBold style={{ color: "#22c55e" }} /> : <PiCopyDuotone style={{ color: "#94a3b8" }} />}
          </Box>
        ))}
      </Box>
    </>
  );
}
