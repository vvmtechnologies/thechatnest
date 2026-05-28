import { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";

// ─────────────────────────────────────────────────────────────────────
// Tic Tac Toe
//
// Three difficulty modes:
//   easy        — AI picks a random open cell
//   medium      — AI takes immediate wins / blocks immediate losses, else random
//   impossible  — Full minimax. Mathematically perfect. Player at best draws.
//
// Plus a Human-vs-Human pass-and-play mode.
// ─────────────────────────────────────────────────────────────────────

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],   // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],   // cols
  [0, 4, 8], [2, 4, 6],              // diagonals
];

const winnerOf = (board) => {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { mark: board[a], line: [a, b, c] };
    }
  }
  if (board.every((c) => c)) return { mark: "draw", line: [] };
  return null;
};

const openCells = (board) => board.map((c, i) => (c ? null : i)).filter((i) => i !== null);

// Minimax with alpha-beta. AI is `aiMark`, player is the other.
// Returns { score, move }. score: +10 - depth = AI win, depth - 10 = AI loss, 0 = draw.
const minimax = (board, current, aiMark, depth = 0, alpha = -Infinity, beta = Infinity) => {
  const result = winnerOf(board);
  if (result) {
    if (result.mark === aiMark) return { score: 10 - depth, move: -1 };
    if (result.mark === "draw") return { score: 0, move: -1 };
    return { score: depth - 10, move: -1 };
  }

  const maximizing = current === aiMark;
  let bestMove = -1;
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const cell of openCells(board)) {
    board[cell] = current;
    const next = current === "X" ? "O" : "X";
    const { score } = minimax(board, next, aiMark, depth + 1, alpha, beta);
    board[cell] = "";
    if (maximizing) {
      if (score > bestScore) { bestScore = score; bestMove = cell; }
      alpha = Math.max(alpha, score);
    } else {
      if (score < bestScore) { bestScore = score; bestMove = cell; }
      beta = Math.min(beta, score);
    }
    if (beta <= alpha) break;
  }
  return { score: bestScore, move: bestMove };
};

const pickAiMove = (board, aiMark, difficulty) => {
  const opens = openCells(board);
  if (!opens.length) return -1;

  if (difficulty === "easy") {
    return opens[Math.floor(Math.random() * opens.length)];
  }

  if (difficulty === "medium") {
    const playerMark = aiMark === "X" ? "O" : "X";
    // 1. Take an immediate win.
    for (const cell of opens) {
      const trial = [...board];
      trial[cell] = aiMark;
      if (winnerOf(trial)?.mark === aiMark) return cell;
    }
    // 2. Block an immediate loss.
    for (const cell of opens) {
      const trial = [...board];
      trial[cell] = playerMark;
      if (winnerOf(trial)?.mark === playerMark) return cell;
    }
    // 3. Otherwise random.
    return opens[Math.floor(Math.random() * opens.length)];
  }

  // impossible — pure minimax
  return minimax([...board], aiMark, aiMark).move;
};

export function TicTacToe() {
  const [mode, setMode] = useState("ai");          // "ai" | "human"
  const [difficulty, setDifficulty] = useState("impossible");
  const [playerMark, setPlayerMark] = useState("X"); // human's mark in AI mode
  const [board, setBoard] = useState(() => Array(9).fill(""));
  const [turn, setTurn] = useState("X");            // whose turn next
  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 });

  const result = useMemo(() => winnerOf(board), [board]);
  const aiMark = playerMark === "X" ? "O" : "X";
  const aiTurn = mode === "ai" && !result && turn === aiMark;

  // Whenever the AI's turn comes up, schedule its move.
  useEffect(() => {
    if (!aiTurn) return;
    const id = setTimeout(() => {
      const move = pickAiMove(board, aiMark, difficulty);
      if (move < 0) return;
      setBoard((b) => {
        const next = [...b];
        next[move] = aiMark;
        return next;
      });
      setTurn(playerMark);
    }, 320);
    return () => clearTimeout(id);
  }, [aiTurn, aiMark, difficulty, board, playerMark]);

  // When a game ends, bump the score once.
  useEffect(() => {
    if (!result) return;
    setScore((s) => ({ ...s, [result.mark]: s[result.mark] + 1 }));
  }, [result?.mark]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCell = (i) => {
    if (board[i] || result) return;
    if (mode === "ai" && turn !== playerMark) return;
    setBoard((b) => {
      const next = [...b];
      next[i] = turn;
      return next;
    });
    setTurn(turn === "X" ? "O" : "X");
  };

  const reset = (keepScore = true) => {
    setBoard(Array(9).fill(""));
    setTurn("X");
    if (!keepScore) setScore({ X: 0, O: 0, draw: 0 });
  };

  // If player switches mark mid-game with AI mode, reset board so AI doesn't make an
  // immediate move based on a half-played state from the wrong perspective.
  useEffect(() => { reset(true); }, [mode, playerMark, difficulty]);

  const statusLine = result
    ? result.mark === "draw"
      ? "Draw — cat's game."
      : mode === "ai"
        ? (result.mark === playerMark ? "You win! 🎉" : "AI wins.")
        : `${result.mark} wins! 🎉`
    : mode === "ai"
      ? (turn === playerMark ? "Your turn." : "AI is thinking…")
      : `${turn}'s turn.`;

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Mode" value={mode} onChange={(e) => setMode(e.target.value)} sx={{ width: 160 }}>
          <MenuItem value="ai">vs AI</MenuItem>
          <MenuItem value="human">2 Players</MenuItem>
        </TextField>
        {mode === "ai" && (
          <>
            <TextField select size="small" label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} sx={{ width: 170 }}>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="impossible">Impossible (perfect)</MenuItem>
            </TextField>
            <TextField select size="small" label="You play as" value={playerMark} onChange={(e) => setPlayerMark(e.target.value)} sx={{ width: 140 }}>
              <MenuItem value="X">X (goes first)</MenuItem>
              <MenuItem value="O">O (goes second)</MenuItem>
            </TextField>
          </>
        )}
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={() => reset(true)}>New round</Button>
        <Button onClick={() => reset(false)}>Reset score</Button>
      </Stack>

      <Box sx={(theme) => ({
        p: 2.5, mb: 2, borderRadius: 2,
        bgcolor: result
          ? (result.mark === "draw"
            ? "rgba(100,116,139,0.12)"
            : (mode === "ai" && result.mark !== playerMark)
              ? "rgba(239,68,68,0.12)"
              : "rgba(34,197,94,0.12)")
          : theme.palette.mode === "light" ? "#f8fafc" : "rgba(255,255,255,0.04)",
        border: `1px solid ${theme.palette.divider}`,
        textAlign: "center",
      })}>
        <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1, color: "text.secondary" }}>
          Game status
        </Typography>
        <Typography sx={{ fontSize: 22, fontWeight: 800 }}>{statusLine}</Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.25, maxWidth: 360, mx: "auto", mb: 2 }}>
        {board.map((cell, i) => {
          const isWinning = result?.line.includes(i);
          return (
            <Box
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleCell(i)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCell(i); }}
              sx={(theme) => ({
                aspectRatio: "1 / 1",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 64, fontWeight: 900, lineHeight: 1,
                color: cell === "X" ? "#2563eb" : cell === "O" ? "#dc2626" : "transparent",
                bgcolor: isWinning
                  ? "rgba(34,197,94,0.18)"
                  : theme.palette.mode === "light" ? "#fff" : "rgba(255,255,255,0.04)",
                border: `2px solid ${isWinning ? "#22c55e" : theme.palette.divider}`,
                borderRadius: 2,
                cursor: cell || result || aiTurn ? "default" : "pointer",
                userSelect: "none",
                transition: "all 0.15s ease",
                "&:hover": cell || result || aiTurn ? {} : { transform: "scale(1.04)", boxShadow: "0 4px 16px rgba(15,23,42,0.12)" },
              })}
            >
              {cell || "·"}
            </Box>
          );
        })}
      </Box>

      <Stack direction="row" spacing={1} justifyContent="center">
        <Chip
          label={mode === "ai" ? `You (${playerMark}): ${score[playerMark]}` : `X: ${score.X}`}
          sx={{ fontWeight: 700, bgcolor: "rgba(37,99,235,0.12)", color: "#1d4ed8" }}
        />
        <Chip
          label={mode === "ai" ? `AI (${aiMark}): ${score[aiMark]}` : `O: ${score.O}`}
          sx={{ fontWeight: 700, bgcolor: "rgba(220,38,38,0.12)", color: "#b91c1c" }}
        />
        <Chip label={`Draws: ${score.draw}`} sx={{ fontWeight: 700 }} />
      </Stack>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Rock Paper Scissors
//
// AI learns from your last 3 moves. After ~10 rounds it'll start
// counter-predicting your patterns — so random play wins more than
// "always rock".
// ─────────────────────────────────────────────────────────────────────
const RPS_OPTIONS = [
  { key: "rock",     label: "Rock",     icon: "🪨", beats: "scissors" },
  { key: "paper",    label: "Paper",    icon: "📄", beats: "rock" },
  { key: "scissors", label: "Scissors", icon: "✂️", beats: "paper" },
];
const RPS_BY_KEY = Object.fromEntries(RPS_OPTIONS.map((o) => [o.key, o]));

export function RockPaperScissors() {
  const [history, setHistory] = useState([]); // [{ player, ai, result }]
  const [score, setScore] = useState({ win: 0, lose: 0, draw: 0 });
  const [animating, setAnimating] = useState(false);

  const aiPredict = () => {
    // After 3+ rounds, count last 5 player moves; counter the most common.
    const recent = history.slice(0, 5).map((r) => r.player);
    if (recent.length < 3) {
      return RPS_OPTIONS[Math.floor(Math.random() * 3)].key;
    }
    const counts = { rock: 0, paper: 0, scissors: 0 };
    recent.forEach((m) => { counts[m] += 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    // AI plays whatever beats the player's most-common move.
    const counter = RPS_OPTIONS.find((o) => o.beats === top);
    // 25% noise so it isn't 100% predictable.
    if (Math.random() < 0.25) return RPS_OPTIONS[Math.floor(Math.random() * 3)].key;
    return counter.key;
  };

  const play = (playerKey) => {
    setAnimating(true);
    setTimeout(() => {
      const aiKey = aiPredict();
      let result;
      if (playerKey === aiKey) result = "draw";
      else if (RPS_BY_KEY[playerKey].beats === aiKey) result = "win";
      else result = "lose";
      setHistory((h) => [{ player: playerKey, ai: aiKey, result }, ...h].slice(0, 20));
      setScore((s) => ({ ...s, [result]: s[result] + 1 }));
      setAnimating(false);
    }, 350);
  };

  const last = history[0];
  const lastTint = last?.result === "win" ? "#22c55e" : last?.result === "lose" ? "#ef4444" : "#64748b";

  return (
    <>
      <Box sx={(theme) => ({
        p: 3, mb: 2, borderRadius: 2,
        bgcolor: theme.palette.mode === "light" ? "#f8fafc" : "rgba(255,255,255,0.04)",
        border: `2px solid ${last ? lastTint : theme.palette.divider}`,
        transition: "border-color 0.3s",
        textAlign: "center",
      })}>
        <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1 }}>You</Typography>
            <Box sx={{ fontSize: 64, lineHeight: 1, transform: animating ? "rotate(-15deg) scale(0.9)" : "rotate(0)", transition: "transform 0.3s" }}>
              {animating ? "❓" : last ? RPS_BY_KEY[last.player].icon : "❔"}
            </Box>
          </Box>
          <Typography sx={{ fontSize: 32, fontWeight: 800, color: lastTint }}>vs</Typography>
          <Box>
            <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1 }}>AI</Typography>
            <Box sx={{ fontSize: 64, lineHeight: 1, transform: animating ? "rotate(15deg) scale(0.9)" : "rotate(0)", transition: "transform 0.3s" }}>
              {animating ? "❓" : last ? RPS_BY_KEY[last.ai].icon : "❔"}
            </Box>
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: lastTint, mt: 1 }}>
          {animating ? "…" : last ? (last.result === "win" ? "You win!" : last.result === "lose" ? "AI wins" : "Draw") : "Pick your move"}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 2 }}>
        {RPS_OPTIONS.map((o) => (
          <Button
            key={o.key}
            variant="outlined"
            size="large"
            disabled={animating}
            onClick={() => play(o.key)}
            sx={{ fontSize: 32, minWidth: 90, py: 1.5 }}
          >
            {o.icon}
          </Button>
        ))}
      </Stack>

      <Stack direction="row" spacing={1} justifyContent="center">
        <Chip label={`Wins: ${score.win}`} sx={{ fontWeight: 700, bgcolor: "rgba(34,197,94,0.12)", color: "#15803d" }} />
        <Chip label={`Losses: ${score.lose}`} sx={{ fontWeight: 700, bgcolor: "rgba(239,68,68,0.12)", color: "#b91c1c" }} />
        <Chip label={`Draws: ${score.draw}`} sx={{ fontWeight: 700 }} />
        <Button size="small" onClick={() => { setHistory([]); setScore({ win: 0, lose: 0, draw: 0 }); }}>Reset</Button>
      </Stack>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Reaction Time — "Click when the box turns green"
// ─────────────────────────────────────────────────────────────────────
export function ReactionTime() {
  const [state, setState] = useState("idle"); // idle | waiting | go | tooSoon | result
  const [waitStart, setWaitStart] = useState(0);
  const [time, setTime] = useState(null);
  const [best, setBest] = useState(null);
  const [history, setHistory] = useState([]);

  const start = () => {
    setState("waiting");
    setTime(null);
    const delay = 1200 + Math.random() * 2800;
    setTimeout(() => {
      setWaitStart(performance.now());
      setState("go");
    }, delay);
  };

  const click = () => {
    if (state === "idle") return start();
    if (state === "waiting") { setState("tooSoon"); return; }
    if (state === "go") {
      const ms = Math.round(performance.now() - waitStart);
      setTime(ms);
      setHistory((h) => [ms, ...h].slice(0, 10));
      if (best === null || ms < best) setBest(ms);
      setState("result");
    } else if (state === "result" || state === "tooSoon") {
      start();
    }
  };

  const colors = {
    idle:    { bg: "#3b82f6", fg: "#fff", label: "Click to start" },
    waiting: { bg: "#dc2626", fg: "#fff", label: "Wait for green…" },
    go:      { bg: "#22c55e", fg: "#fff", label: "CLICK!" },
    tooSoon: { bg: "#f59e0b", fg: "#fff", label: "Too soon — click to retry" },
    result:  { bg: "#6366f1", fg: "#fff", label: `${time} ms — click to try again` },
  };
  const c = colors[state];

  const avg = history.length ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : null;
  const rating = time === null ? "" : time < 200 ? "⚡ Lightning" : time < 280 ? "🔥 Fast" : time < 350 ? "👌 Good" : time < 450 ? "🙂 OK" : "🐢 Slow";

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        onClick={click}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") click(); }}
        sx={{
          minHeight: 280,
          borderRadius: 3,
          bgcolor: c.bg,
          color: c.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 1,
          cursor: "pointer",
          userSelect: "none",
          transition: "background-color 0.15s",
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: 36, fontWeight: 900, textAlign: "center", px: 2 }}>{c.label}</Typography>
        {state === "result" && (
          <Typography sx={{ fontSize: 20, fontWeight: 600 }}>{rating}</Typography>
        )}
      </Box>

      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
        <Chip label={best !== null ? `Best: ${best} ms` : "Best: —"} sx={{ fontWeight: 700, bgcolor: "rgba(99,102,241,0.12)", color: "#4338ca" }} />
        <Chip label={avg !== null ? `Avg (last ${history.length}): ${avg} ms` : "Avg: —"} sx={{ fontWeight: 700 }} />
        {history.length > 0 && (
          <Button size="small" onClick={() => { setHistory([]); setBest(null); setTime(null); setState("idle"); }}>Reset</Button>
        )}
      </Stack>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Connect 4 — vs AI (negamax with alpha-beta, depth 5 by default)
// AI is strong but not always perfect at depth 5 — increases to depth 7
// on "Hard". 6 rows × 7 cols, drop a disc into a column.
// ─────────────────────────────────────────────────────────────────────
const C4_ROWS = 6;
const C4_COLS = 7;
const c4_empty = () => Array.from({ length: C4_ROWS }, () => Array(C4_COLS).fill(""));

const c4_drop = (grid, col, mark) => {
  for (let r = C4_ROWS - 1; r >= 0; r -= 1) {
    if (!grid[r][col]) {
      const next = grid.map((row) => [...row]);
      next[r][col] = mark;
      return { grid: next, row: r };
    }
  }
  return null;
};

const c4_winner = (grid) => {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < C4_ROWS; r += 1) {
    for (let c = 0; c < C4_COLS; c += 1) {
      const mark = grid[r][c];
      if (!mark) continue;
      for (const [dr, dc] of dirs) {
        const cells = [[r, c]];
        for (let k = 1; k < 4; k += 1) {
          const nr = r + dr * k, nc = c + dc * k;
          if (nr < 0 || nr >= C4_ROWS || nc < 0 || nc >= C4_COLS) break;
          if (grid[nr][nc] !== mark) break;
          cells.push([nr, nc]);
        }
        if (cells.length === 4) return { mark, cells };
      }
    }
  }
  if (grid.every((row) => row.every((c) => c))) return { mark: "draw", cells: [] };
  return null;
};

const c4_score = (grid, aiMark) => {
  const w = c4_winner(grid);
  if (w?.mark === aiMark) return 1000;
  if (w?.mark && w.mark !== "draw") return -1000;
  // Heuristic: center column control + 3-in-a-rows.
  let s = 0;
  for (let r = 0; r < C4_ROWS; r += 1) {
    if (grid[r][3] === aiMark) s += 3;
    else if (grid[r][3]) s -= 3;
  }
  return s;
};

const c4_negamax = (grid, mark, aiMark, depth, alpha, beta) => {
  const w = c4_winner(grid);
  if (w || depth === 0) {
    return { score: c4_score(grid, aiMark) * (mark === aiMark ? 1 : -1), col: -1 };
  }
  let bestScore = -Infinity;
  let bestCol = -1;
  // Try center first for better pruning.
  const order = [3, 2, 4, 1, 5, 0, 6];
  for (const c of order) {
    if (grid[0][c]) continue;
    const dropped = c4_drop(grid, c, mark);
    if (!dropped) continue;
    const child = c4_negamax(dropped.grid, mark === "R" ? "Y" : "R", aiMark, depth - 1, -beta, -alpha);
    const score = -child.score;
    if (score > bestScore) { bestScore = score; bestCol = c; }
    alpha = Math.max(alpha, score);
    if (alpha >= beta) break;
  }
  return { score: bestScore, col: bestCol };
};

export function ConnectFour() {
  const [grid, setGrid] = useState(c4_empty);
  const [turn, setTurn] = useState("R");
  const [aiTurn, setAiTurn] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [score, setScore] = useState({ R: 0, Y: 0, draw: 0 });
  const result = useMemo(() => c4_winner(grid), [grid]);
  const aiMark = "Y";

  // AI move
  useEffect(() => {
    if (result || turn !== aiMark) return;
    setAiTurn(true);
    const depth = difficulty === "easy" ? 1 : difficulty === "medium" ? 4 : 6;
    const id = setTimeout(() => {
      const { col } = c4_negamax(grid, aiMark, aiMark, depth, -Infinity, Infinity);
      if (col >= 0) {
        const dropped = c4_drop(grid, col, aiMark);
        if (dropped) {
          setGrid(dropped.grid);
          setTurn("R");
        }
      }
      setAiTurn(false);
    }, 250);
    return () => clearTimeout(id);
  }, [turn, grid, result, difficulty]);

  useEffect(() => {
    if (!result) return;
    setScore((s) => ({ ...s, [result.mark]: s[result.mark] + 1 }));
  }, [result?.mark]); // eslint-disable-line

  const dropPlayer = (col) => {
    if (result || aiTurn || turn !== "R") return;
    const dropped = c4_drop(grid, col, "R");
    if (!dropped) return;
    setGrid(dropped.grid);
    setTurn("Y");
  };

  const reset = (keepScore = true) => {
    setGrid(c4_empty());
    setTurn("R");
    if (!keepScore) setScore({ R: 0, Y: 0, draw: 0 });
  };

  useEffect(() => { reset(true); }, [difficulty]);

  const winCellSet = new Set(result?.cells.map(([r, c]) => `${r},${c}`) || []);

  return (
    <>
      <Stack direction="row" spacing={1.25} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Difficulty" value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)} sx={{ width: 180 }}>
          <MenuItem value="easy">Easy</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={() => reset(true)}>New round</Button>
        <Button onClick={() => reset(false)}>Reset score</Button>
      </Stack>

      <Box sx={(theme) => ({
        p: 2, mb: 2, borderRadius: 2, textAlign: "center",
        bgcolor: result
          ? (result.mark === "draw" ? "rgba(100,116,139,0.12)" : result.mark === "R" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)")
          : theme.palette.mode === "light" ? "#f8fafc" : "rgba(255,255,255,0.04)",
        border: `1px solid ${theme.palette.divider}`,
      })}>
        <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
          {result
            ? (result.mark === "draw" ? "Draw!" : result.mark === "R" ? "🎉 You win!" : "AI wins.")
            : aiTurn ? "AI is thinking…" : "Your turn — drop a red disc."}
        </Typography>
      </Box>

      <Box sx={{
        p: 1, borderRadius: 2,
        bgcolor: "#1e40af",
        display: "grid",
        gridTemplateColumns: `repeat(${C4_COLS}, 1fr)`,
        gap: 0.5,
        maxWidth: 420,
        mx: "auto",
      }}>
        {grid.flatMap((row, r) => row.map((cell, c) => {
          const isWin = winCellSet.has(`${r},${c}`);
          return (
            <Box
              key={`${r}-${c}`}
              onClick={() => dropPlayer(c)}
              sx={{
                aspectRatio: "1",
                borderRadius: "50%",
                bgcolor: cell === "R" ? "#dc2626" : cell === "Y" ? "#facc15" : "#1e3a8a",
                border: isWin ? "3px solid #22c55e" : "none",
                cursor: result || aiTurn ? "default" : "pointer",
                transition: "transform 0.2s",
                "&:hover": result || aiTurn ? {} : { transform: "scale(1.05)" },
              }}
            />
          );
        }))}
      </Box>

      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
        <Chip label={`You (R): ${score.R}`} sx={{ fontWeight: 700, bgcolor: "rgba(220,38,38,0.12)", color: "#b91c1c" }} />
        <Chip label={`AI (Y): ${score.Y}`} sx={{ fontWeight: 700, bgcolor: "rgba(234,179,8,0.18)", color: "#854d0e" }} />
        <Chip label={`Draws: ${score.draw}`} sx={{ fontWeight: 700 }} />
      </Stack>
    </>
  );
}
