import { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { ToolSection } from "./ToolShell.jsx";

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
