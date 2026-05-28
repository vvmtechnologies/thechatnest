import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Chip, IconButton, Stack, TextField, Typography } from "@mui/material";
import { PiArrowsClockwiseDuotone, PiCopyDuotone } from "react-icons/pi";
import { ToolSection } from "./ToolShell.jsx";

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
const copy = (text) => navigator.clipboard?.writeText(text);

// ─────────────────────────────────────────────────────────────────────
// Spin the Wheel — visual upgrade of Random Picker
// ─────────────────────────────────────────────────────────────────────
const WHEEL_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#0ea5e9","#10b981","#a855f7","#f59e0b"];

export function SpinTheWheel() {
  const [raw, setRaw] = useState("Aarav\nIsha\nKabir\nMira\nNoah\nPriya\nRohan\nSaanvi");
  const [winner, setWinner] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const items = useMemo(() => raw.split(/[\n,]/).map((s) => s.trim()).filter(Boolean), [raw]);

  const spin = () => {
    if (!items.length || spinning) return;
    setSpinning(true);
    setWinner(null);
    const seg = 360 / items.length;
    const target = Math.floor(Math.random() * items.length);
    // 6 full spins + land so the pointer (top, 0°) lines up on the chosen segment
    const final = rotation + 360 * 6 + (360 - target * seg) - seg / 2;
    setRotation(final);
    setTimeout(() => {
      setWinner(items[target]);
      setSpinning(false);
    }, 4200);
  };

  const size = 320;
  const cx = size / 2;
  const seg = items.length ? (Math.PI * 2) / items.length : 0;

  return (
    <>
      <ToolSection title="Entries" hint={`${items.length}`}>
        <TextField fullWidth multiline minRows={3} value={raw} onChange={(e) => { setRaw(e.target.value); setWinner(null); }} placeholder="One per line, or comma-separated" />
      </ToolSection>

      <Box sx={{ position: "relative", width: size, height: size + 30, mx: "auto", mb: 2 }}>
        <Box sx={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", zIndex: 2, fontSize: 26 }}>▼</Box>
        <Box
          component="svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          sx={{ mt: "20px", transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4s cubic-bezier(.17,.67,.21,1)" : "none", display: "block" }}
        >
          {items.map((label, i) => {
            const a0 = i * seg - Math.PI / 2;
            const a1 = (i + 1) * seg - Math.PI / 2;
            const r = size / 2 - 4;
            const x0 = cx + r * Math.cos(a0), y0 = cx + r * Math.sin(a0);
            const x1 = cx + r * Math.cos(a1), y1 = cx + r * Math.sin(a1);
            const large = seg > Math.PI ? 1 : 0;
            const path = `M ${cx},${cx} L ${x0},${y0} A ${r},${r} 0 ${large} 1 ${x1},${y1} Z`;
            const mid = (a0 + a1) / 2;
            const tr = r * 0.62;
            const tx = cx + tr * Math.cos(mid), ty = cx + tr * Math.sin(mid);
            const deg = ((mid + Math.PI / 2) * 180) / Math.PI;
            return (
              <g key={i}>
                <path d={path} fill={WHEEL_COLORS[i % WHEEL_COLORS.length]} stroke="#fff" strokeWidth="2" />
                <text x={tx} y={ty} textAnchor="middle" alignmentBaseline="middle" fill="#fff" fontWeight="800" fontSize={items.length > 10 ? 11 : 14} transform={`rotate(${deg} ${tx} ${ty})`}>
                  {label.length > 12 ? `${label.slice(0, 11)}…` : label}
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={cx} r="20" fill="#fff" stroke="#0f172a" strokeWidth="3" />
        </Box>
      </Box>

      <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
        <Button variant="contained" size="large" onClick={spin} disabled={spinning || !items.length} sx={{ px: 4 }}>
          {spinning ? "Spinning…" : "Spin"}
        </Button>
      </Stack>

      {winner && (
        <Box sx={{ p: 2, borderRadius: 2, textAlign: "center", bgcolor: "rgba(34,197,94,0.15)", border: "2px solid #22c55e" }}>
          <Typography variant="overline" sx={{ fontWeight: 800, color: "#15803d" }}>Winner</Typography>
          <Typography sx={{ fontSize: 32, fontWeight: 900, color: "#15803d" }}>🏆 {winner}</Typography>
        </Box>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Truth or Dare — curated team-safe banks
// ─────────────────────────────────────────────────────────────────────
const TRUTHS = [
  "What's the most embarrassing thing that happened to you on a work call?",
  "What's a skill everyone seems to think you have but you don't?",
  "What's the last show you binge-watched in one sitting?",
  "What's a hobby you tried, were terrible at, and quit immediately?",
  "What's a guilty-pleasure song on your playlist?",
  "What's the strangest food combination you actually love?",
  "What's your weirdest pet peeve at work?",
  "What's something you wish more people knew about your job?",
  "What's the most useless gadget you've ever bought?",
  "What's a movie you pretend to like but secretly hate?",
  "What's a comfort food that's totally unhealthy?",
  "What's the last lie you told?",
  "What's something everyone in this team does that you find annoying (anonymously)?",
  "What's a skill you'd swap with a teammate if you could?",
  "What's your phone's screen-time average?",
];
const DARES = [
  "Send a teammate a sincere thank-you message right now.",
  "Tell the team your favourite emoji and why.",
  "Show what's on your desk right now.",
  "Read the next message you receive in a dramatic voice.",
  "Change your status emoji to something random for 10 minutes.",
  "Send a GIF that describes your day so far.",
  "Tell a one-sentence story using only emojis.",
  "Share your most-recent screenshot (work-appropriate only).",
  "Do your best impression of someone famous in chat (in words).",
  "Write a haiku about your current project.",
  "Confess a (mild) work mistake from this week.",
  "Compliment the teammate to your left in the seating order.",
  "Make up a new acronym for your team and pitch it.",
  "Recommend a song you've been playing on repeat.",
  "Change your display photo to something silly for 24h.",
];

export function TruthOrDare() {
  const [mode, setMode] = useState("truth");
  const [picked, setPicked] = useState(null);
  const pool = mode === "truth" ? TRUTHS : DARES;
  const pick = () => setPicked(sample(pool));
  useEffect(() => { setPicked(null); }, [mode]);

  return (
    <>
      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
        <Button variant={mode === "truth" ? "contained" : "outlined"} color="primary" onClick={() => setMode("truth")} sx={{ fontWeight: 800, minWidth: 140 }}>Truth</Button>
        <Button variant={mode === "dare" ? "contained" : "outlined"} color="error" onClick={() => setMode("dare")} sx={{ fontWeight: 800, minWidth: 140 }}>Dare</Button>
      </Stack>

      <Box sx={{
        p: 4, borderRadius: 2, minHeight: 180,
        background: mode === "truth"
          ? "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.08))"
          : "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(245,158,11,0.08))",
        border: `2px solid ${mode === "truth" ? "rgba(59,130,246,0.4)" : "rgba(239,68,68,0.4)"}`,
        textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", mb: 2,
      }}>
        <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3 }}>
          {picked || `Press the button for a ${mode}.`}
        </Typography>
      </Box>

      <Button variant="contained" fullWidth startIcon={<PiArrowsClockwiseDuotone />} onClick={pick}>
        {picked ? "Another" : `Give me a ${mode}`}
      </Button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Would You Rather
// ─────────────────────────────────────────────────────────────────────
const WYR_PROMPTS = [
  ["Work only in meetings (no async)", "Work only async (no meetings ever)"],
  ["Have unlimited PTO but it must be in 1-day chunks", "Have 20 days PTO but can take a 3-week block"],
  ["A perfect inbox with 200 unread emails", "Inbox-zero but every email is urgent"],
  ["Have to give a 30-min talk tomorrow on your area", "Have to answer Q&A for 2 hours but no prepared talk"],
  ["Lead a team of 100 strangers", "Be an IC at a 3-person team you love"],
  ["A laptop that's 10× faster but battery dies in 1 hour", "Normal laptop, 14-hour battery"],
  ["Pair-program every day for a week", "Work alone in deep silence for a week"],
  ["Speak every language fluently", "Code in every programming language fluently"],
  ["Always work from a beach (with bad wifi)", "Work from a co-working space with gigabit fibre"],
  ["Skip every Monday but work every Saturday", "Standard Mon–Fri"],
  ["Annual on-site that lasts 2 weeks", "Quarterly on-sites of 3 days each"],
  ["Get every Slack notification on your watch", "Check Slack twice a day, max"],
  ["Have a personal assistant who's slow", "Have AI assistant that's fast but wrong 20% of the time"],
];

export function WouldYouRather() {
  const [pair, setPair] = useState(WYR_PROMPTS[0]);
  const pick = () => setPair(sample(WYR_PROMPTS));
  return (
    <>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        {pair.map((opt, i) => (
          <Box key={i} sx={{
            flex: 1, p: 3, borderRadius: 2, minHeight: 140,
            background: i === 0 ? "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(99,102,241,0.05))" : "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.05))",
            border: `2px solid ${i === 0 ? "rgba(99,102,241,0.4)" : "rgba(245,158,11,0.4)"}`,
            display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
          }}>
            <Box>
              <Chip label={i === 0 ? "Option A" : "Option B"} size="small" sx={{ mb: 1, fontWeight: 800 }} />
              <Typography sx={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>{opt}</Typography>
            </Box>
          </Box>
        ))}
      </Stack>
      <Button variant="contained" fullWidth startIcon={<PiArrowsClockwiseDuotone />} onClick={pick}>Next question</Button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Never Have I Ever
// ─────────────────────────────────────────────────────────────────────
const NHIE = [
  "Never have I ever fallen asleep in a meeting.",
  "Never have I ever sent a Slack message to the wrong channel.",
  "Never have I ever pretended to know what an acronym meant.",
  "Never have I ever cried at work.",
  "Never have I ever lied about my screen-share quality.",
  "Never have I ever clicked 'Reply All' by mistake.",
  "Never have I ever taken a sick day when I wasn't sick.",
  "Never have I ever Googled something my own teammate asked about during a call.",
  "Never have I ever forgotten the name of someone I work with.",
  "Never have I ever wished a meeting would just be an email.",
  "Never have I ever finished a task and immediately taken a long break.",
  "Never have I ever pretended my mic was broken to avoid speaking.",
  "Never have I ever taken credit for someone else's idea.",
  "Never have I ever joined a meeting from bed.",
  "Never have I ever procrastinated by reorganising my desk.",
];

export function NeverHaveIEver() {
  const [picked, setPicked] = useState(NHIE[0]);
  return (
    <>
      <Box sx={{
        p: 4, borderRadius: 2, minHeight: 180,
        background: "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.08))",
        border: "2px solid rgba(168,85,247,0.4)",
        textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", mb: 2,
      }}>
        <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>{picked}</Typography>
      </Box>
      <Button variant="contained" fullWidth startIcon={<PiArrowsClockwiseDuotone />} onClick={() => setPicked(sample(NHIE))}>Next</Button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Emoji Picker — searchable, copy on click
// ─────────────────────────────────────────────────────────────────────
const EMOJIS = [
  { e: "👍", k: "thumbs up like approve yes" },
  { e: "👎", k: "thumbs down dislike no" },
  { e: "👏", k: "clap applause" },
  { e: "🙌", k: "raise hands celebrate" },
  { e: "🤝", k: "handshake deal" },
  { e: "💪", k: "strong arm muscle" },
  { e: "🙏", k: "pray thanks please" },
  { e: "🤞", k: "fingers crossed hope" },
  { e: "🫡", k: "salute respect" },
  { e: "🧠", k: "brain smart" },
  { e: "❤️", k: "heart love red" },
  { e: "🧡", k: "orange heart" },
  { e: "💛", k: "yellow heart" },
  { e: "💚", k: "green heart" },
  { e: "💙", k: "blue heart" },
  { e: "💜", k: "purple heart" },
  { e: "🖤", k: "black heart" },
  { e: "🤍", k: "white heart" },
  { e: "💔", k: "broken heart" },
  { e: "✨", k: "sparkles magic shine" },
  { e: "🎉", k: "party confetti celebrate launch" },
  { e: "🎊", k: "confetti ball party" },
  { e: "🥳", k: "party face celebrate" },
  { e: "🚀", k: "rocket launch ship" },
  { e: "🔥", k: "fire hot lit" },
  { e: "⚡", k: "lightning fast power" },
  { e: "💥", k: "explosion boom" },
  { e: "💯", k: "100 hundred perfect" },
  { e: "⭐", k: "star favourite" },
  { e: "🌟", k: "glowing star shine" },
  { e: "🌈", k: "rainbow pride" },
  { e: "☀️", k: "sun sunny" },
  { e: "☁️", k: "cloud weather" },
  { e: "🌧️", k: "rain weather" },
  { e: "❄️", k: "snow cold winter" },
  { e: "✅", k: "check done complete green" },
  { e: "❌", k: "cross wrong fail" },
  { e: "⚠️", k: "warning alert" },
  { e: "🟢", k: "green circle online" },
  { e: "🟡", k: "yellow circle warn" },
  { e: "🔴", k: "red circle blocked" },
  { e: "⏰", k: "alarm clock time" },
  { e: "⏳", k: "hourglass time wait" },
  { e: "📅", k: "calendar date" },
  { e: "📆", k: "calendar tearoff" },
  { e: "🗓️", k: "spiral calendar" },
  { e: "📝", k: "memo note pencil" },
  { e: "📋", k: "clipboard list" },
  { e: "📌", k: "pin pinned" },
  { e: "📍", k: "location pin map" },
  { e: "📎", k: "paperclip attachment" },
  { e: "🔗", k: "link url" },
  { e: "💬", k: "speech bubble chat" },
  { e: "💭", k: "thought bubble" },
  { e: "📣", k: "megaphone announce" },
  { e: "📢", k: "loudspeaker announce" },
  { e: "🔔", k: "bell notify" },
  { e: "🔕", k: "muted bell silence" },
  { e: "📞", k: "phone call" },
  { e: "📱", k: "mobile phone" },
  { e: "💻", k: "laptop computer" },
  { e: "🖥️", k: "desktop monitor" },
  { e: "⌨️", k: "keyboard" },
  { e: "🖱️", k: "mouse computer" },
  { e: "🎯", k: "target goal bullseye" },
  { e: "🏆", k: "trophy winner award" },
  { e: "🥇", k: "gold medal first" },
  { e: "🥈", k: "silver medal second" },
  { e: "🥉", k: "bronze medal third" },
  { e: "📈", k: "chart growth up" },
  { e: "📉", k: "chart down decline" },
  { e: "💡", k: "lightbulb idea" },
  { e: "🛠️", k: "tools fix" },
  { e: "🔧", k: "wrench fix repair" },
  { e: "🐛", k: "bug issue" },
  { e: "🤔", k: "thinking hmm" },
  { e: "😅", k: "sweat smile awkward" },
  { e: "🙂", k: "slight smile" },
  { e: "😊", k: "smile happy" },
  { e: "😂", k: "laugh joy tears" },
  { e: "🤣", k: "rofl laugh" },
  { e: "😎", k: "cool sunglasses" },
  { e: "😴", k: "sleep zzz tired" },
  { e: "😡", k: "angry mad" },
  { e: "🥲", k: "smiling tear emotional" },
  { e: "🙃", k: "upside down" },
  { e: "😇", k: "angel innocent" },
];

export function EmojiPicker() {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return EMOJIS;
    return EMOJIS.filter((e) => e.k.includes(term));
  }, [q]);

  return (
    <>
      <TextField
        fullWidth size="small" autoFocus
        placeholder="Search… (e.g. 'celebrate', 'ship', 'bug')"
        value={q} onChange={(e) => setQ(e.target.value)} sx={{ mb: 2 }}
      />
      <Box sx={{
        display: "grid", gridTemplateColumns: { xs: "repeat(8, 1fr)", sm: "repeat(12, 1fr)" }, gap: 0.5,
      }}>
        {filtered.map(({ e }) => (
          <Box
            key={e}
            onClick={() => { copy(e); setCopied(e); setTimeout(() => setCopied(""), 1000); }}
            sx={(theme) => ({
              fontSize: 32, p: 0.5, textAlign: "center", cursor: "pointer", borderRadius: 1,
              bgcolor: copied === e ? "rgba(34,197,94,0.2)" : "transparent",
              "&:hover": { bgcolor: theme.palette.mode === "light" ? "#eff6ff" : "rgba(255,255,255,0.06)" },
              transition: "background-color 0.1s",
            })}
            title={`Copy ${e}`}
          >
            {e}
          </Box>
        ))}
      </Box>
      {filtered.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No emoji matched "{q}". Try a different word.
        </Typography>
      )}
      {copied && (
        <Box sx={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", px: 2.5, py: 1, borderRadius: 2, bgcolor: "#15803d", color: "#fff", fontWeight: 700, boxShadow: "0 10px 30px rgba(0,0,0,0.25)", zIndex: 1500 }}>
          Copied {copied}
        </Box>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Whack-a-Mole
// ─────────────────────────────────────────────────────────────────────
export function WhackAMole() {
  const HOLES = 9;
  const [active, setActive] = useState(-1);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(0);
  const timerRef = useRef(null);
  const moleRef = useRef(null);

  const stop = () => {
    setRunning(false);
    clearInterval(timerRef.current);
    clearInterval(moleRef.current);
    setActive(-1);
  };

  const start = () => {
    setScore(0); setTime(30); setRunning(true);
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) { stop(); return 0; }
        return t - 1;
      });
    }, 1000);
    moleRef.current = setInterval(() => {
      setActive(Math.floor(Math.random() * HOLES));
    }, 700);
  };

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(moleRef.current); }, []);

  useEffect(() => {
    if (!running && score > best) setBest(score);
  }, [running, score, best]);

  const whack = (i) => {
    if (!running || i !== active) return;
    setScore((s) => s + 1);
    setActive(-1);
  };

  return (
    <>
      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2, flexWrap: "wrap" }}>
        <Chip label={`Score: ${score}`} sx={{ fontWeight: 800, bgcolor: "rgba(34,197,94,0.18)", color: "#15803d" }} />
        <Chip label={`Time: ${time}s`} sx={{ fontWeight: 700 }} />
        <Chip label={`Best: ${best}`} sx={{ fontWeight: 700 }} />
        {!running
          ? <Button variant="contained" onClick={start}>{score > 0 || time === 0 ? "Restart" : "Start"}</Button>
          : <Button onClick={stop}>Stop</Button>}
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5, maxWidth: 360, mx: "auto" }}>
        {Array.from({ length: HOLES }).map((_, i) => (
          <Box
            key={i}
            onClick={() => whack(i)}
            sx={{
              aspectRatio: "1",
              borderRadius: "50%",
              bgcolor: "#78350f",
              border: "4px solid #451a03",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 56, cursor: running ? "pointer" : "default",
              userSelect: "none",
              boxShadow: "inset 0 8px 18px rgba(0,0,0,0.35)",
              transition: "transform 0.1s",
              "&:active": running ? { transform: "scale(0.95)" } : {},
            }}
          >
            {active === i ? "🐹" : ""}
          </Box>
        ))}
      </Box>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Trivia Quiz — Open Trivia DB (no auth)
// ─────────────────────────────────────────────────────────────────────
export function TriviaQuiz() {
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [revealed, setRevealed] = useState(null);
  const [score, setScore] = useState({ right: 0, wrong: 0 });
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [error, setError] = useState("");

  const decode = (str) => str.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&eacute;/g, "é").replace(/&rsquo;/g, "'");

  const load = async () => {
    setError(""); setLoading(true); setRevealed(null);
    try {
      const params = new URLSearchParams({ amount: "1", type: "multiple", difficulty });
      if (category) params.set("category", category);
      const res = await fetch(`https://opentdb.com/api.php?${params.toString()}`);
      const data = await res.json();
      if (data.response_code !== 0) throw new Error("No question available — try a different category.");
      const q = data.results[0];
      setQuestion(q);
      const opts = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
      setOptions(opts);
    } catch (e) {
      setError(e.message || "Couldn't load trivia.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const answer = (opt) => {
    if (revealed) return;
    setRevealed(opt);
    if (opt === question.correct_answer) setScore((s) => ({ ...s, right: s.right + 1 }));
    else setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
  };

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ width: 200 }} SelectProps={{ native: true }}>
          <option value="">Any</option>
          <option value="9">General Knowledge</option>
          <option value="18">Computers</option>
          <option value="17">Science & Nature</option>
          <option value="21">Sports</option>
          <option value="23">History</option>
          <option value="22">Geography</option>
          <option value="11">Film</option>
          <option value="12">Music</option>
        </TextField>
        <TextField select size="small" label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} sx={{ width: 140 }} SelectProps={{ native: true }}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Chip label={`✓ ${score.right} · ✗ ${score.wrong}`} sx={{ fontWeight: 700 }} />
        <Button variant="outlined" onClick={load}>Skip</Button>
      </Stack>

      {error && <Box sx={{ p: 2, mb: 2, borderRadius: 1.5, bgcolor: "rgba(239,68,68,0.1)", color: "#b91c1c", fontWeight: 700 }}>{error}</Box>}
      {loading && <Box sx={{ textAlign: "center", py: 4 }}>Loading…</Box>}
      {!loading && question && (
        <>
          <Chip label={`${decode(question.category)} · ${question.difficulty}`} size="small" sx={{ mb: 1.5 }} />
          <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, mb: 2 }}>{decode(question.question)}</Typography>
          <Stack spacing={1}>
            {options.map((opt) => {
              const isCorrect = opt === question.correct_answer;
              const isChosen = revealed === opt;
              let bg = "background.paper", border = "divider", color = "text.primary";
              if (revealed) {
                if (isCorrect) { bg = "rgba(34,197,94,0.15)"; border = "#22c55e"; color = "#15803d"; }
                else if (isChosen) { bg = "rgba(239,68,68,0.15)"; border = "#ef4444"; color = "#b91c1c"; }
              }
              return (
                <Box
                  key={opt}
                  onClick={() => answer(opt)}
                  sx={(theme) => ({
                    p: 1.75, borderRadius: 1.5, cursor: revealed ? "default" : "pointer",
                    border: `2px solid ${border === "divider" ? theme.palette.divider : border}`,
                    bgcolor: bg, color, fontWeight: 700,
                    "&:hover": revealed ? {} : { borderColor: "primary.main" },
                  })}
                >
                  {decode(opt)}
                </Box>
              );
            })}
          </Stack>
          {revealed && (
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={load}>Next question</Button>
          )}
        </>
      )}
    </>
  );
}
