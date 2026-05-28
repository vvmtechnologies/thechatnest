import { useMemo, useState } from "react";
import { Box, Button, Chip, IconButton, Stack, TextField, Typography } from "@mui/material";
import { PiCopyDuotone, PiTrashDuotone } from "react-icons/pi";
import { ToolSection, monoFont } from "./ToolShell.jsx";

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Random Picker ─────────────────────────────────────────────────────
// Paste a newline / comma separated list, draw winners. Designed for
// retro raffles, lottery draws, naming "who reviews this PR", etc.
export function RandomPicker() {
  const [raw, setRaw] = useState("Aarav\nIsha\nKabir\nMira\nNoah\nPriya\nRohan\nSaanvi");
  const [count, setCount] = useState(1);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [winners, setWinners] = useState([]);
  const [animating, setAnimating] = useState(false);

  const items = useMemo(
    () => raw.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
    [raw]
  );

  const draw = () => {
    if (!items.length) return;
    setAnimating(true);
    let ticks = 0;
    const tick = () => {
      ticks += 1;
      const picks = [];
      const pool = [...items];
      for (let i = 0; i < count && (allowRepeat ? items : pool).length > 0; i += 1) {
        if (allowRepeat) picks.push(sample(items));
        else picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      }
      setWinners(picks);
      if (ticks < 12) setTimeout(tick, 60 + ticks * 18);
      else setAnimating(false);
    };
    tick();
  };

  return (
    <>
      <ToolSection title="Candidates" hint={`${items.length} entries`}>
        <TextField
          fullWidth multiline minRows={5} value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="One name per line, or comma-separated"
          InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }}
        />
      </ToolSection>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          label="How many winners" type="number" size="small" value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(items.length || 1, Number(e.target.value) || 1)))}
          sx={{ width: 170 }}
        />
        <Chip
          label={allowRepeat ? "Repeats allowed" : "Each pick unique"}
          onClick={() => setAllowRepeat((v) => !v)}
          color={allowRepeat ? "warning" : "default"}
          variant={allowRepeat ? "filled" : "outlined"}
          sx={{ cursor: "pointer" }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={draw} disabled={!items.length || animating}>
          {animating ? "Drawing…" : "🎲 Draw"}
        </Button>
      </Stack>

      <Box sx={(theme) => ({
        p: 3, borderRadius: 2, minHeight: 120,
        background: theme.palette.mode === "light"
          ? "linear-gradient(135deg, #fef3c7, #fde68a)"
          : "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.05))",
        border: "1px solid rgba(245,158,11,0.35)",
      })}>
        {winners.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            Press Draw — your winner shows here.
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
            {winners.map((w, i) => (
              <Chip
                key={`${w}-${i}`}
                label={`🏆 ${w}`}
                sx={{ fontSize: 18, height: 40, fontWeight: 800, px: 1.5, bgcolor: "rgba(245,158,11,0.95)", color: "#fff" }}
              />
            ))}
          </Stack>
        )}
      </Box>
    </>
  );
}

// ── Coin Flip ─────────────────────────────────────────────────────────
export function CoinFlip() {
  const [face, setFace] = useState("H");
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState([]);

  const flip = () => {
    setSpinning(true);
    setTimeout(() => {
      const next = Math.random() < 0.5 ? "H" : "T";
      setFace(next);
      setHistory((h) => [next, ...h].slice(0, 30));
      setSpinning(false);
    }, 700);
  };

  const heads = history.filter((f) => f === "H").length;
  const tails = history.length - heads;

  return (
    <>
      <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 160, height: 160, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 64, fontWeight: 900, color: "#fff",
            background: face === "H"
              ? "linear-gradient(135deg, #f59e0b, #d97706)"
              : "linear-gradient(135deg, #94a3b8, #475569)",
            boxShadow: "0 24px 50px rgba(15,23,42,0.25)",
            transform: spinning ? "rotateY(720deg) scale(0.85)" : "rotateY(0) scale(1)",
            transition: "transform 0.7s cubic-bezier(.5,2,.5,1)",
            transformStyle: "preserve-3d",
          }}
        >
          {face === "H" ? "H" : "T"}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {spinning ? "Flipping…" : face === "H" ? "Heads" : "Tails"}
        </Typography>
        <Button variant="contained" size="large" onClick={flip} disabled={spinning} sx={{ px: 4 }}>
          Flip the coin
        </Button>
      </Stack>

      {history.length > 0 && (
        <ToolSection
          title={`History (${history.length})`}
          hint={`H: ${heads} · T: ${tails}`}
          action={
            <IconButton size="small" onClick={() => setHistory([])}><PiTrashDuotone /></IconButton>
          }
        >
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {history.map((f, i) => (
              <Chip
                key={i}
                label={f}
                size="small"
                sx={{
                  fontWeight: 800,
                  bgcolor: f === "H" ? "rgba(245,158,11,0.18)" : "rgba(100,116,139,0.18)",
                  color: f === "H" ? "#b45309" : "#475569",
                }}
              />
            ))}
          </Stack>
        </ToolSection>
      )}
    </>
  );
}

// ── Dice Roller ───────────────────────────────────────────────────────
export function DiceRoller() {
  const [count, setCount] = useState(2);
  const [sides, setSides] = useState(6);
  const [rolls, setRolls] = useState([]);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    setRolling(true);
    let ticks = 0;
    const tick = () => {
      ticks += 1;
      const next = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
      setRolls(next);
      if (ticks < 10) setTimeout(tick, 50 + ticks * 18);
      else setRolling(false);
    };
    tick();
  };

  const total = rolls.reduce((a, b) => a + b, 0);
  const diceFaces = { 1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅" };

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField label="Dice" type="number" size="small" value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
          sx={{ width: 100 }} />
        <TextField label="Sides each" type="number" size="small" value={sides}
          onChange={(e) => setSides(Math.max(4, Math.min(100, Number(e.target.value) || 6)))}
          sx={{ width: 130 }} />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={roll} disabled={rolling}>
          {rolling ? "Rolling…" : "🎲 Roll"}
        </Button>
      </Stack>

      <Box sx={(theme) => ({
        p: 3, borderRadius: 2, minHeight: 160, textAlign: "center",
        bgcolor: theme.palette.mode === "light" ? "#f8fafc" : "rgba(255,255,255,0.04)",
        border: `1px solid ${theme.palette.divider}`,
      })}>
        {rolls.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3 }}>Click Roll.</Typography>
        ) : (
          <>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center" sx={{ mb: 2 }}>
              {rolls.map((r, i) => (
                <Box
                  key={i}
                  sx={(theme) => ({
                    width: 64, height: 64, borderRadius: 2,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: sides === 6 ? 44 : 24, fontWeight: 800,
                    bgcolor: "background.paper",
                    border: `2px solid ${theme.palette.divider}`,
                    boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                    transform: rolling ? "rotate(15deg)" : "rotate(0)",
                    transition: "transform 0.1s",
                  })}
                >
                  {sides === 6 ? diceFaces[r] : r}
                </Box>
              ))}
            </Stack>
            <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1 }}>Total</Typography>
            <Typography sx={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>{total}</Typography>
          </>
        )}
      </Box>
    </>
  );
}

// ── Random Number ─────────────────────────────────────────────────────
export function RandomNumber() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(true);
  const [result, setResult] = useState([]);
  const [error, setError] = useState("");

  const generate = () => {
    setError("");
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const range = hi - lo + 1;
    if (unique && count > range) {
      setError(`Range ${lo}–${hi} only fits ${range} unique numbers. Reduce count or disable unique.`);
      return;
    }
    const out = [];
    const used = new Set();
    while (out.length < count) {
      const n = lo + Math.floor(Math.random() * range);
      if (unique && used.has(n)) continue;
      used.add(n);
      out.push(n);
    }
    setResult(out);
  };

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField label="Min" type="number" size="small" value={min}
          onChange={(e) => setMin(Number(e.target.value) || 0)} sx={{ width: 110 }} />
        <TextField label="Max" type="number" size="small" value={max}
          onChange={(e) => setMax(Number(e.target.value) || 0)} sx={{ width: 110 }} />
        <TextField label="How many" type="number" size="small" value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))} sx={{ width: 120 }} />
        <Chip
          label={unique ? "Unique only" : "Repeats OK"}
          onClick={() => setUnique((v) => !v)}
          color={unique ? "primary" : "default"}
          variant={unique ? "filled" : "outlined"}
          sx={{ cursor: "pointer", alignSelf: "center" }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={generate}>Generate</Button>
      </Stack>

      {error && (
        <Typography color="error" variant="caption" sx={{ display: "block", mb: 1 }}>{error}</Typography>
      )}

      {result.length > 0 && (
        <Box sx={(theme) => ({
          p: 2.5, borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
        })}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.6, textTransform: "uppercase" }}>
              Results · {result.length}
            </Typography>
            <Button size="small" startIcon={<PiCopyDuotone />} onClick={() => navigator.clipboard?.writeText(result.join(", "))}>
              Copy
            </Button>
          </Stack>
          <Box sx={{ fontFamily: monoFont, fontSize: 16, lineHeight: 1.8, wordBreak: "break-all" }}>
            {result.join(", ")}
          </Box>
        </Box>
      )}
    </>
  );
}

// ── Yes / No (Magic 8-ball style) ──────────────────────────────────────
const YES_NO_ANSWERS = [
  { label: "Yes — go for it",        weight: "yes" },
  { label: "Definitely yes",          weight: "yes" },
  { label: "Signs point to yes",      weight: "yes" },
  { label: "Most likely yes",         weight: "yes" },
  { label: "Outlook good",            weight: "yes" },
  { label: "No — don't",              weight: "no" },
  { label: "Definitely no",           weight: "no" },
  { label: "Outlook not so good",     weight: "no" },
  { label: "Better not tell you now", weight: "maybe" },
  { label: "Ask again later",         weight: "maybe" },
  { label: "Cannot predict now",      weight: "maybe" },
  { label: "Concentrate and ask again", weight: "maybe" },
];

export function YesNo() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [shaking, setShaking] = useState(false);

  const ask = () => {
    setShaking(true);
    setTimeout(() => {
      setAnswer(sample(YES_NO_ANSWERS));
      setShaking(false);
    }, 600);
  };

  const tint = answer?.weight === "yes" ? "#16a34a" : answer?.weight === "no" ? "#dc2626" : "#6366f1";

  return (
    <>
      <TextField
        fullWidth size="small" placeholder="Type your question (optional)…"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") ask(); }}
        sx={{ mb: 2 }}
      />

      <Box sx={{ textAlign: "center", py: 4 }}>
        <Box
          sx={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 220, height: 220, borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #1e293b 0%, #0b0f1e 70%, #000 100%)",
            color: "#fff", boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
            transform: shaking ? "rotate(-4deg) scale(1.02)" : "rotate(0) scale(1)",
            animation: shaking ? "yn-shake 0.6s" : "none",
            "@keyframes yn-shake": {
              "0%,100%": { transform: "rotate(0)" },
              "20%": { transform: "rotate(-8deg) scale(1.05)" },
              "40%": { transform: "rotate(8deg) scale(1.05)" },
              "60%": { transform: "rotate(-6deg)" },
              "80%": { transform: "rotate(6deg)" },
            },
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: 130, height: 130, borderRadius: "50%",
              bgcolor: tint, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background-color 0.3s",
              textAlign: "center", p: 1.5,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>
              {shaking ? "•••" : answer?.label || "Ask me"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Stack direction="row" justifyContent="center">
        <Button variant="contained" size="large" onClick={ask} disabled={shaking} sx={{ px: 4 }}>
          {answer ? "Ask again" : "Shake the ball"}
        </Button>
      </Stack>
    </>
  );
}
