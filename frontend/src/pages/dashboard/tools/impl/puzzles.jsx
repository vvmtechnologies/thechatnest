import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Chip, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { PiArrowsClockwiseDuotone } from "react-icons/pi";

// ─────────────────────────────────────────────────────────────────────
// Wordle Clone — 6 attempts to guess a 5-letter word
// Letter coloring: green = right letter, right spot; yellow = right
// letter, wrong spot; grey = not in word.
// Includes a "share result" button that produces a grid emoji string
// ready to paste in chat.
// ─────────────────────────────────────────────────────────────────────
const WORDLE_WORDS = [
  "table","chair","plant","ocean","brave","cloud","stone","music","river","quiet",
  "smile","heart","light","earth","peace","crown","glass","flame","frost","grape",
  "honey","ivory","jolly","knife","lemon","magic","noble","piano","queen","rapid",
  "sword","tiger","unity","vivid","wheat","zebra","amber","beach","candy","dream",
  "eagle","fairy","ghost","happy","input","joker","kayak","laser","mango","ninja",
];

const wordleColor = (letter, idx, target) => {
  if (target[idx] === letter) return "green";
  if (target.includes(letter)) return "yellow";
  return "grey";
};

export function Wordle() {
  const [target, setTarget] = useState(() => WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)]);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [over, setOver] = useState(null); // null | "win" | "lose"

  const submit = useCallback(() => {
    if (current.length !== 5 || over) return;
    if (guesses.length >= 6) return;
    const guess = current.toLowerCase();
    const next = [...guesses, guess];
    setGuesses(next);
    setCurrent("");
    if (guess === target) setOver("win");
    else if (next.length >= 6) setOver("lose");
  }, [current, guesses, target, over]);

  useEffect(() => {
    const onKey = (e) => {
      if (over) return;
      if (e.key === "Enter") { submit(); return; }
      if (e.key === "Backspace") { setCurrent((c) => c.slice(0, -1)); return; }
      if (/^[a-zA-Z]$/.test(e.key) && current.length < 5) {
        setCurrent((c) => (c + e.key).toLowerCase().slice(0, 5));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, submit, over]);

  const reset = () => {
    setTarget(WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)]);
    setGuesses([]);
    setCurrent("");
    setOver(null);
  };

  const shareGrid = useMemo(() => {
    return guesses.map((g) => g.split("").map((l, i) => {
      const c = wordleColor(l, i, target);
      return c === "green" ? "🟩" : c === "yellow" ? "🟨" : "⬜";
    }).join("")).join("\n");
  }, [guesses, target]);

  const copyShare = () => {
    const text = `Wordle ${guesses.length}/${6}\n\n${shareGrid}`;
    navigator.clipboard?.writeText(text);
  };

  const rows = Array.from({ length: 6 });

  return (
    <>
      <Box sx={{ maxWidth: 360, mx: "auto" }}>
        {rows.map((_, ri) => {
          const isCurrent = ri === guesses.length && !over;
          const letters = ri < guesses.length ? guesses[ri].split("") : isCurrent ? current.padEnd(5, " ").split("") : ["", "", "", "", ""];
          return (
            <Box key={ri} sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 0.75,
              mb: 0.75,
            }}>
              {letters.map((l, ci) => {
                let bg = "transparent", fg = "inherit", border = "rgba(148,163,184,0.4)";
                if (ri < guesses.length) {
                  const c = wordleColor(l, ci, target);
                  if (c === "green") { bg = "#22c55e"; fg = "#fff"; border = "#22c55e"; }
                  else if (c === "yellow") { bg = "#eab308"; fg = "#fff"; border = "#eab308"; }
                  else { bg = "#64748b"; fg = "#fff"; border = "#64748b"; }
                }
                return (
                  <Box key={ci} sx={{
                    aspectRatio: "1",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, fontWeight: 800, textTransform: "uppercase",
                    bgcolor: bg, color: fg,
                    border: `2px solid ${border}`,
                    borderRadius: 0.75,
                    transition: "all 0.25s",
                  }}>{l.trim()}</Box>
                );
              })}
            </Box>
          );
        })}
      </Box>

      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2, flexWrap: "wrap" }}>
        {over === "win" && <Chip label={`🎉 Got it in ${guesses.length}!`} sx={{ fontWeight: 800, bgcolor: "rgba(34,197,94,0.18)", color: "#15803d" }} />}
        {over === "lose" && <Chip label={`Word was: ${target.toUpperCase()}`} sx={{ fontWeight: 800, bgcolor: "rgba(239,68,68,0.18)", color: "#b91c1c" }} />}
        {over && <Button variant="outlined" onClick={copyShare}>📋 Copy result</Button>}
        {over && <Button variant="contained" onClick={reset}>New word</Button>}
      </Stack>

      {!over && (
        <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 2, color: "text.disabled" }}>
          Type a 5-letter word and press Enter. {6 - guesses.length} guesses left.
        </Typography>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Hangman — guess the word, lives = wrong letters allowed
// ─────────────────────────────────────────────────────────────────────
const HANGMAN_WORDS = {
  tech:    ["algorithm","bandwidth","cookies","database","encryption","firewall","gigabyte","javascript","kubernetes","latency","microservice","network","optimize","protocol","quantum","router","server","terminal","upload","virtual"],
  animals: ["elephant","giraffe","kangaroo","penguin","octopus","crocodile","dolphin","mongoose","platypus","squirrel"],
  movies:  ["inception","gladiator","interstellar","matrix","avatar","goodfellas","casablanca","titanic","jurassic","starwars"],
};

export function Hangman() {
  const [category, setCategory] = useState("tech");
  const [word, setWord] = useState(() => HANGMAN_WORDS.tech[Math.floor(Math.random() * HANGMAN_WORDS.tech.length)]);
  const [guesses, setGuesses] = useState(new Set());
  const wrongCount = useMemo(
    () => [...guesses].filter((l) => !word.includes(l)).length,
    [guesses, word]
  );
  const lives = 6 - wrongCount;
  const won = word.split("").every((l) => guesses.has(l));
  const lost = lives <= 0;

  const guess = (letter) => {
    if (won || lost) return;
    setGuesses((s) => new Set([...s, letter]));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (won || lost) return;
      if (/^[a-z]$/.test(e.key.toLowerCase())) guess(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [won, lost]); // eslint-disable-line

  const reset = (nextCat = category) => {
    const pool = HANGMAN_WORDS[nextCat];
    setWord(pool[Math.floor(Math.random() * pool.length)]);
    setGuesses(new Set());
  };

  useEffect(() => { reset(category); }, [category]); // eslint-disable-line

  const display = word.split("").map((l) => (guesses.has(l) || lost ? l : "_")).join(" ");

  const stages = ["", "😐", "😬", "😰", "😨", "💀", "☠️"];

  return (
    <>
      <Stack direction="row" spacing={1.25} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Category" value={category}
          onChange={(e) => setCategory(e.target.value)} sx={{ width: 160 }}>
          <MenuItem value="tech">Tech</MenuItem>
          <MenuItem value="animals">Animals</MenuItem>
          <MenuItem value="movies">Movies</MenuItem>
        </TextField>
        <Chip label={`Lives: ${"❤️".repeat(Math.max(0, lives))}${"🖤".repeat(Math.max(0, 6 - lives))}`} sx={{ alignSelf: "center", fontWeight: 700 }} />
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={() => reset()}>New word</Button>
      </Stack>

      <Box sx={{ textAlign: "center", py: 3 }}>
        <Typography sx={{ fontSize: 80, lineHeight: 1 }}>{stages[wrongCount]}</Typography>
        <Typography sx={{ fontFamily: "monospace", fontSize: 32, fontWeight: 800, letterSpacing: 6, mt: 2, color: lost ? "#dc2626" : "inherit" }}>
          {display.toUpperCase()}
        </Typography>
        {won && <Typography sx={{ fontWeight: 800, color: "#15803d", mt: 2, fontSize: 20 }}>🎉 You got it!</Typography>}
        {lost && <Typography sx={{ fontWeight: 800, color: "#dc2626", mt: 2, fontSize: 20 }}>💀 Out of lives — word was: {word.toUpperCase()}</Typography>}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, justifyContent: "center", maxWidth: 480, mx: "auto" }}>
        {"abcdefghijklmnopqrstuvwxyz".split("").map((l) => {
          const used = guesses.has(l);
          const inWord = word.includes(l);
          return (
            <Button
              key={l}
              size="small"
              disabled={used || won || lost}
              variant={used ? "contained" : "outlined"}
              color={used ? (inWord ? "success" : "error") : "primary"}
              onClick={() => guess(l)}
              sx={{ minWidth: 32, fontWeight: 800, p: 0.5 }}
            >
              {l.toUpperCase()}
            </Button>
          );
        })}
      </Box>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Typing Speed Test — WPM + accuracy on a sample paragraph
// ─────────────────────────────────────────────────────────────────────
const TYPING_TEXTS = [
  "The best meetings are the ones you didn't have. A clear async update beats a thirty-minute call every time. Write it once, share it widely, and let your team read it when they are actually focused.",
  "Distributed teams win when async-by-default becomes a habit. Document decisions, post a daily status, and trust people to pick up context on their own time without needing a real-time interruption.",
  "Writing precisely is harder than writing quickly, but the time you save the reader compounds across every person who opens the message. Five extra minutes editing can save fifty across a team.",
  "Async voice notes carry tone in a way text can never match. A ninety-second message can do the work of a thirty-minute meeting, and your teammates can replay it when they actually need to.",
];

export function TypingTest() {
  const [target, setTarget] = useState(() => TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)]);
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [finishedAt, setFinishedAt] = useState(null);
  const [best, setBest] = useState(null);
  const inputRef = useRef(null);

  const onChange = (e) => {
    const val = e.target.value;
    if (!startedAt && val.length > 0) setStartedAt(performance.now());
    setTyped(val);
    if (val === target) {
      const end = performance.now();
      setFinishedAt(end);
    }
  };

  const elapsed = startedAt ? ((finishedAt || performance.now()) - startedAt) / 1000 : 0;
  const wpm = elapsed > 0 ? Math.round((typed.length / 5) / (elapsed / 60)) : 0;
  const correctChars = typed.split("").filter((c, i) => c === target[i]).length;
  const accuracy = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100;

  useEffect(() => {
    if (!finishedAt) return;
    setBest((b) => (b === null || wpm > b ? wpm : b));
  }, [finishedAt]); // eslint-disable-line

  const reset = () => {
    setTarget(TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)]);
    setTyped("");
    setStartedAt(null);
    setFinishedAt(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} justifyContent="center" flexWrap="wrap">
        <Chip label={`WPM: ${wpm}`} sx={{ fontWeight: 800, bgcolor: "rgba(99,102,241,0.18)", color: "#4338ca" }} />
        <Chip label={`Accuracy: ${accuracy}%`} sx={{ fontWeight: 700 }} />
        <Chip label={`Time: ${elapsed.toFixed(1)}s`} sx={{ fontWeight: 700 }} />
        {best !== null && <Chip label={`Best: ${best} WPM`} sx={{ fontWeight: 700, bgcolor: "rgba(34,197,94,0.18)", color: "#15803d" }} />}
        <IconButton size="small" onClick={reset}><PiArrowsClockwiseDuotone /></IconButton>
      </Stack>

      <Box sx={(theme) => ({
        p: 2.5, mb: 2, borderRadius: 2,
        bgcolor: theme.palette.mode === "light" ? "#f8fafc" : "rgba(255,255,255,0.04)",
        border: `1px solid ${theme.palette.divider}`,
        fontFamily: "monospace",
        fontSize: 17,
        lineHeight: 1.7,
      })}>
        {target.split("").map((ch, i) => {
          let color = "text.disabled";
          if (i < typed.length) color = typed[i] === ch ? "#15803d" : "#dc2626";
          if (i === typed.length && !finishedAt) {
            return <Box key={i} component="span" sx={{ color: "text.primary", borderBottom: "2px solid #6366f1", animation: "ttBlink 1s infinite", "@keyframes ttBlink": { "50%": { borderColor: "transparent" } } }}>{ch}</Box>;
          }
          return <Box key={i} component="span" sx={{ color, textDecoration: i < typed.length && typed[i] !== ch ? "underline" : "none" }}>{ch}</Box>;
        })}
      </Box>

      <TextField
        inputRef={inputRef}
        fullWidth
        autoFocus
        size="small"
        placeholder="Start typing here…"
        value={typed}
        onChange={onChange}
        disabled={Boolean(finishedAt)}
        InputProps={{ sx: { fontFamily: "monospace", fontSize: 16 } }}
      />

      {finishedAt && (
        <Typography sx={{ textAlign: "center", fontWeight: 800, fontSize: 20, color: "#15803d", mt: 2 }}>
          🎉 {wpm} WPM at {accuracy}% accuracy!
        </Typography>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sudoku — pre-built puzzles, 3 difficulties, hint button
// ─────────────────────────────────────────────────────────────────────
// Each puzzle is { puzzle, solution } as 81-char strings ('.' = blank).
const SUDOKU_BANK = {
  easy: [
    { puzzle: "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79",
      solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179" },
    { puzzle: ".94...13..............76..2.8..1.....32.........2...6...5.4.......8..7..63.4..8",
      solution: "294581376586379421317246589821453967435967812769128634178694253652831947943752168" },
    { puzzle: "1...4..6...7.....2....3...946....9..2..1.6..1..4....385...7....3.....4...8..6...9",
      solution: "153247869978165432624839157469783521285416793714592638541378296396521748872964315" },
  ],
  medium: [
    { puzzle: ".2.6.8...58...97......4....37....5..6.......4..8....13....2......98...36...3.6.9.",
      solution: "123678945584239761967145328372461589691583274458792613836924157219857436745316892" },
    { puzzle: "1.5.4.9....62...8...4..7....8...2..7.5.....3.2..3...8....1..8...4...62....3.5.9.4",
      solution: "175243968346295187924867513851629347459718632267354821632981475418572396793416254" },
  ],
  hard: [
    { puzzle: ".....6....59.....82....8....45........3........6..3.54...325..6..................",
      solution: "813725469759348621246918375485697132137254896926183754371482569598761243264539187" },
  ],
};

export function Sudoku() {
  const [difficulty, setDifficulty] = useState("easy");
  const [puzzle, setPuzzle] = useState(SUDOKU_BANK.easy[0]);
  const [grid, setGrid] = useState(() => puzzle.puzzle.split(""));
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState(new Set());

  const newPuzzle = useCallback((diff = difficulty) => {
    const bank = SUDOKU_BANK[diff];
    const p = bank[Math.floor(Math.random() * bank.length)];
    setPuzzle(p);
    setGrid(p.puzzle.split(""));
    setSelected(null);
    setErrors(new Set());
  }, [difficulty]);

  useEffect(() => { newPuzzle(difficulty); }, [difficulty]); // eslint-disable-line

  const setCell = (i, val) => {
    if (puzzle.puzzle[i] !== ".") return; // pre-filled cell, can't edit
    setGrid((g) => {
      const next = [...g];
      next[i] = val;
      return next;
    });
  };

  const check = () => {
    const errs = new Set();
    grid.forEach((v, i) => {
      if (v !== "." && v !== puzzle.solution[i]) errs.add(i);
    });
    setErrors(errs);
  };

  const hint = () => {
    if (selected === null) return;
    if (puzzle.puzzle[selected] !== ".") return;
    setCell(selected, puzzle.solution[selected]);
  };

  const solved = grid.join("") === puzzle.solution;

  return (
    <>
      <Stack direction="row" spacing={1.25} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Difficulty" value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)} sx={{ width: 160 }}>
          <MenuItem value="easy">Easy</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
        </TextField>
        <Button onClick={check}>Check</Button>
        <Button onClick={hint} disabled={selected === null}>💡 Hint</Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={() => newPuzzle()}>New puzzle</Button>
      </Stack>

      {solved && (
        <Typography sx={{ textAlign: "center", fontWeight: 800, fontSize: 20, color: "#15803d", mb: 2 }}>
          🎉 Solved!
        </Typography>
      )}

      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(9, 1fr)",
        gap: 0,
        maxWidth: 400,
        mx: "auto",
        border: "3px solid #0f172a",
      }}>
        {grid.map((cell, i) => {
          const row = Math.floor(i / 9), col = i % 9;
          const isFixed = puzzle.puzzle[i] !== ".";
          const isSelected = selected === i;
          const isError = errors.has(i);
          return (
            <Box
              key={i}
              onClick={() => setSelected(i)}
              sx={(theme) => ({
                aspectRatio: "1",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: isFixed ? 900 : 600,
                color: isError ? "#dc2626" : isFixed ? "text.primary" : "#2563eb",
                bgcolor: isSelected
                  ? "rgba(59,130,246,0.25)"
                  : (Math.floor(row / 3) + Math.floor(col / 3)) % 2 === 0
                    ? theme.palette.mode === "light" ? "#fff" : "rgba(255,255,255,0.04)"
                    : theme.palette.mode === "light" ? "#f1f5f9" : "rgba(255,255,255,0.08)",
                borderTop: row % 3 === 0 ? "2px solid #0f172a" : "1px solid rgba(0,0,0,0.15)",
                borderLeft: col % 3 === 0 ? "2px solid #0f172a" : "1px solid rgba(0,0,0,0.15)",
                cursor: isFixed ? "default" : "pointer",
                userSelect: "none",
              })}
            >
              {cell !== "." ? cell : ""}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", mt: 2, flexWrap: "wrap" }}>
        {"123456789".split("").map((n) => (
          <Button
            key={n}
            variant="outlined"
            disabled={selected === null || puzzle.puzzle[selected] !== "."}
            onClick={() => { setCell(selected, n); setErrors(new Set()); }}
            sx={{ minWidth: 40, fontWeight: 800 }}
          >
            {n}
          </Button>
        ))}
        <Button
          variant="outlined"
          disabled={selected === null || puzzle.puzzle[selected] !== "."}
          onClick={() => { setCell(selected, "."); setErrors(new Set()); }}
        >
          ⌫
        </Button>
      </Box>
    </>
  );
}
