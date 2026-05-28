import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";

// ─────────────────────────────────────────────────────────────────────
// Snake — arrow keys / on-screen pad
// ─────────────────────────────────────────────────────────────────────
const SNAKE_COLS = 20;
const SNAKE_ROWS = 20;
const SNAKE_TICK = 110;

const randomCell = (snake) => {
  while (true) {
    const c = { x: Math.floor(Math.random() * SNAKE_COLS), y: Math.floor(Math.random() * SNAKE_ROWS) };
    if (!snake.some((s) => s.x === c.x && s.y === c.y)) return c;
  }
};

export function Snake() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  const turn = useCallback((nx, ny) => {
    const cur = dirRef.current;
    // Don't allow reversing into self.
    if (cur.x === -nx && cur.y === -ny) return;
    setDir({ x: nx, y: ny });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
      const m = map[e.key];
      if (m) { e.preventDefault(); turn(m[0], m[1]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turn]);

  useEffect(() => {
    if (!running || over) return undefined;
    const id = setInterval(() => {
      setSnake((cur) => {
        const head = { x: cur[0].x + dirRef.current.x, y: cur[0].y + dirRef.current.y };
        if (head.x < 0 || head.x >= SNAKE_COLS || head.y < 0 || head.y >= SNAKE_ROWS) {
          setRunning(false); setOver(true);
          return cur;
        }
        if (cur.some((s) => s.x === head.x && s.y === head.y)) {
          setRunning(false); setOver(true);
          return cur;
        }
        const ate = head.x === food.x && head.y === food.y;
        const next = [head, ...cur];
        if (!ate) next.pop();
        else {
          setScore((s) => {
            const ns = s + 1;
            setBest((b) => Math.max(b, ns));
            return ns;
          });
          setFood(randomCell(next));
        }
        return next;
      });
    }, SNAKE_TICK);
    return () => clearInterval(id);
  }, [running, over, food]);

  const start = () => {
    setSnake([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
    setDir({ x: 1, y: 0 });
    setFood({ x: 15, y: 10 });
    setScore(0);
    setOver(false);
    setRunning(true);
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} justifyContent="center">
        <Chip label={`Score: ${score}`} sx={{ fontWeight: 700, bgcolor: "rgba(34,197,94,0.18)", color: "#15803d" }} />
        <Chip label={`Best: ${best}`} sx={{ fontWeight: 700 }} />
        {!running ? (
          <Button variant="contained" onClick={start}>{over ? "Try again" : "Start"}</Button>
        ) : (
          <Button onClick={() => setRunning(false)}>Pause</Button>
        )}
      </Stack>

      <Box sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${SNAKE_COLS}, 1fr)`,
        aspectRatio: `${SNAKE_COLS} / ${SNAKE_ROWS}`,
        maxWidth: 480, mx: "auto",
        gap: 0,
        bgcolor: "#0f172a",
        borderRadius: 1.5,
        p: 0.5,
        outline: "none",
      }} tabIndex={0}>
        {Array.from({ length: SNAKE_ROWS * SNAKE_COLS }).map((_, i) => {
          const x = i % SNAKE_COLS, y = Math.floor(i / SNAKE_COLS);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;
          return (
            <Box key={i} sx={{
              aspectRatio: "1",
              bgcolor: isHead ? "#22c55e" : isBody ? "#16a34a" : isFood ? "#ef4444" : "transparent",
              borderRadius: isFood ? "50%" : 0.4,
              transition: "background-color 0.05s",
            }} />
          );
        })}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 60px)", gap: 0.5, justifyContent: "center", mt: 2 }}>
        <Box />
        <Button size="small" variant="outlined" onClick={() => turn(0, -1)}>▲</Button>
        <Box />
        <Button size="small" variant="outlined" onClick={() => turn(-1, 0)}>◀</Button>
        <Button size="small" variant="outlined" onClick={() => turn(0, 1)}>▼</Button>
        <Button size="small" variant="outlined" onClick={() => turn(1, 0)}>▶</Button>
      </Box>

      <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 1, color: "text.disabled" }}>
        Arrow keys or WASD to move.
      </Typography>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 2048 — slide-and-merge puzzle
// ─────────────────────────────────────────────────────────────────────
const T_SIZE = 4;
const empty2048 = () => Array.from({ length: T_SIZE }, () => Array(T_SIZE).fill(0));
const t_addRandom = (grid) => {
  const empties = [];
  grid.forEach((row, r) => row.forEach((v, c) => { if (!v) empties.push([r, c]); }));
  if (!empties.length) return grid;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const next = grid.map((row) => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
};
const t_compress = (row) => {
  const filtered = row.filter((v) => v);
  while (filtered.length < T_SIZE) filtered.push(0);
  return filtered;
};
const t_merge = (row) => {
  let gained = 0;
  for (let i = 0; i < T_SIZE - 1; i += 1) {
    if (row[i] !== 0 && row[i] === row[i + 1]) {
      row[i] *= 2;
      gained += row[i];
      row[i + 1] = 0;
    }
  }
  return gained;
};
const t_moveLeft = (grid) => {
  let gained = 0;
  const next = grid.map((row) => {
    let r = t_compress(row);
    gained += t_merge(r);
    r = t_compress(r);
    return r;
  });
  return { grid: next, gained };
};
const t_reverseRows = (g) => g.map((r) => [...r].reverse());
const t_transpose = (g) => g[0].map((_, c) => g.map((r) => r[c]));
const t_move = (grid, dir) => {
  if (dir === "left") return t_moveLeft(grid);
  if (dir === "right") {
    const { grid: g, gained } = t_moveLeft(t_reverseRows(grid));
    return { grid: t_reverseRows(g), gained };
  }
  if (dir === "up") {
    const { grid: g, gained } = t_moveLeft(t_transpose(grid));
    return { grid: t_transpose(g), gained };
  }
  if (dir === "down") {
    const { grid: g, gained } = t_moveLeft(t_reverseRows(t_transpose(grid)));
    return { grid: t_transpose(t_reverseRows(g)), gained };
  }
  return { grid, gained: 0 };
};
const t_equal = (a, b) => a.every((r, i) => r.every((v, j) => v === b[i][j]));
const t_canMove = (g) => {
  for (const d of ["left", "right", "up", "down"]) {
    if (!t_equal(t_move(g, d).grid, g)) return true;
  }
  return false;
};
const T_COLORS = {
  0: { bg: "#cdc1b4", fg: "transparent" },
  2: { bg: "#eee4da", fg: "#776e65" },
  4: { bg: "#ede0c8", fg: "#776e65" },
  8: { bg: "#f2b179", fg: "#fff" },
  16: { bg: "#f59563", fg: "#fff" },
  32: { bg: "#f67c5f", fg: "#fff" },
  64: { bg: "#f65e3b", fg: "#fff" },
  128: { bg: "#edcf72", fg: "#fff" },
  256: { bg: "#edcc61", fg: "#fff" },
  512: { bg: "#edc850", fg: "#fff" },
  1024: { bg: "#edc53f", fg: "#fff" },
  2048: { bg: "#edc22e", fg: "#fff" },
};

export function Game2048() {
  const [grid, setGrid] = useState(() => t_addRandom(t_addRandom(empty2048())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);

  const move = useCallback((dir) => {
    if (over) return;
    setGrid((cur) => {
      const { grid: next, gained } = t_move(cur, dir);
      if (t_equal(next, cur)) return cur;
      const withRandom = t_addRandom(next);
      setScore((s) => {
        const ns = s + gained;
        setBest((b) => Math.max(b, ns));
        return ns;
      });
      if (!t_canMove(withRandom)) setOver(true);
      return withRandom;
    });
  }, [over]);

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const reset = () => {
    setGrid(t_addRandom(t_addRandom(empty2048())));
    setScore(0);
    setOver(false);
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} justifyContent="center">
        <Chip label={`Score: ${score}`} sx={{ fontWeight: 700, bgcolor: "rgba(245,158,11,0.18)", color: "#b45309" }} />
        <Chip label={`Best: ${best}`} sx={{ fontWeight: 700 }} />
        <Button variant="outlined" onClick={reset}>{over ? "Try again" : "Reset"}</Button>
      </Stack>

      {over && (
        <Typography sx={{ textAlign: "center", fontWeight: 800, color: "#dc2626", mb: 1.5 }}>
          Game over.
        </Typography>
      )}

      <Box sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${T_SIZE}, 1fr)`,
        gap: 1,
        bgcolor: "#bbada0",
        p: 1,
        borderRadius: 2,
        maxWidth: 380, mx: "auto",
      }}>
        {grid.flat().map((v, i) => {
          const c = T_COLORS[v] || T_COLORS[2048];
          return (
            <Box key={i} sx={{
              aspectRatio: "1",
              bgcolor: c.bg,
              color: c.fg,
              borderRadius: 1.25,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: v >= 1024 ? 22 : v >= 128 ? 28 : 34,
              fontWeight: 800,
              transition: "background-color 0.15s",
            }}>{v || ""}</Box>
          );
        })}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 60px)", gap: 0.5, justifyContent: "center", mt: 2 }}>
        <Box />
        <Button size="small" variant="outlined" onClick={() => move("up")}>▲</Button>
        <Box />
        <Button size="small" variant="outlined" onClick={() => move("left")}>◀</Button>
        <Button size="small" variant="outlined" onClick={() => move("down")}>▼</Button>
        <Button size="small" variant="outlined" onClick={() => move("right")}>▶</Button>
      </Box>

      <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 1, color: "text.disabled" }}>
        Arrow keys to merge tiles. Get to 2048!
      </Typography>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Memory Match — flip pairs of cards
// ─────────────────────────────────────────────────────────────────────
const MEMORY_EMOJI = ["🐶","🐱","🦊","🐼","🐯","🦁","🐮","🐷","🐸","🐵","🦄","🐔","🐧","🐦","🦅","🦉","🦋","🐝"];

const buildDeck = (pairs) => {
  const picks = [...MEMORY_EMOJI].sort(() => Math.random() - 0.5).slice(0, pairs);
  const deck = [...picks, ...picks].map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
  return deck.sort(() => Math.random() - 0.5);
};

export function MemoryMatch() {
  const [difficulty, setDifficulty] = useState("medium");
  const pairs = difficulty === "easy" ? 6 : difficulty === "medium" ? 9 : 12;
  const cols = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 6;
  const [deck, setDeck] = useState(() => buildDeck(pairs));
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState({ easy: null, medium: null, hard: null });

  const reset = useCallback(() => {
    setDeck(buildDeck(pairs));
    setFlipped([]);
    setMoves(0);
  }, [pairs]);

  useEffect(() => { reset(); }, [reset]);

  const onCard = (idx) => {
    if (flipped.length === 2) return;
    const card = deck[idx];
    if (card.flipped || card.matched) return;
    const next = deck.map((c, i) => i === idx ? { ...c, flipped: true } : c);
    setDeck(next);
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped;
      if (next[a].emoji === next[b].emoji) {
        setTimeout(() => {
          setDeck((d) => d.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
          setFlipped([]);
        }, 350);
      } else {
        setTimeout(() => {
          setDeck((d) => d.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
          setFlipped([]);
        }, 800);
      }
    }
  };

  const won = deck.length > 0 && deck.every((c) => c.matched);
  useEffect(() => {
    if (!won) return;
    setBest((b) => {
      const cur = b[difficulty];
      if (cur === null || moves < cur) return { ...b, [difficulty]: moves };
      return b;
    });
  }, [won]); // eslint-disable-line

  return (
    <>
      <Stack direction="row" spacing={1.25} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Difficulty" value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)} sx={{ width: 160 }}>
          <MenuItem value="easy">Easy (6 pairs)</MenuItem>
          <MenuItem value="medium">Medium (9 pairs)</MenuItem>
          <MenuItem value="hard">Hard (12 pairs)</MenuItem>
        </TextField>
        <Chip label={`Moves: ${moves}`} sx={{ alignSelf: "center", fontWeight: 700 }} />
        {best[difficulty] !== null && (
          <Chip label={`Best: ${best[difficulty]}`} sx={{ alignSelf: "center", fontWeight: 700, bgcolor: "rgba(34,197,94,0.18)", color: "#15803d" }} />
        )}
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={reset}>New game</Button>
      </Stack>

      {won && (
        <Typography sx={{ textAlign: "center", fontWeight: 800, color: "#15803d", mb: 1.5, fontSize: 18 }}>
          🎉 Solved in {moves} moves!
        </Typography>
      )}

      <Box sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 1,
        maxWidth: cols * 70,
        mx: "auto",
      }}>
        {deck.map((card, i) => (
          <Box
            key={card.id}
            onClick={() => onCard(i)}
            sx={(theme) => ({
              aspectRatio: "1",
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              cursor: card.flipped || card.matched ? "default" : "pointer",
              bgcolor: card.matched
                ? "rgba(34,197,94,0.2)"
                : card.flipped ? (theme.palette.mode === "light" ? "#fff" : "rgba(255,255,255,0.06)") : "#3b82f6",
              border: `2px solid ${card.matched ? "#22c55e" : theme.palette.divider}`,
              transition: "all 0.2s",
              userSelect: "none",
            })}
          >
            {card.flipped || card.matched ? card.emoji : ""}
          </Box>
        ))}
      </Box>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Minesweeper
// ─────────────────────────────────────────────────────────────────────
const MS_PRESETS = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 12, cols: 12, mines: 22 },
  expert: { rows: 14, cols: 18, mines: 40 },
};

const buildMineBoard = ({ rows, cols, mines }) => {
  const board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, revealed: false, flag: false, count: 0 }))
  );
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) { board[r][c].mine = true; placed += 1; }
  }
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (board[r][c].mine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (board[nr][nc].mine) n += 1;
      }
      board[r][c].count = n;
    }
  }
  return board;
};

const MS_NUM_COLOR = { 1: "#1d4ed8", 2: "#15803d", 3: "#b91c1c", 4: "#6d28d9", 5: "#9a3412", 6: "#0e7490", 7: "#000", 8: "#71717a" };

export function Minesweeper() {
  const [difficulty, setDifficulty] = useState("beginner");
  const cfg = MS_PRESETS[difficulty];
  const [board, setBoard] = useState(() => buildMineBoard(cfg));
  const [over, setOver] = useState(null); // null | "win" | "lose"
  const [flags, setFlags] = useState(0);

  const reset = useCallback(() => {
    setBoard(buildMineBoard(cfg));
    setOver(null);
    setFlags(0);
  }, [cfg.rows, cfg.cols, cfg.mines]); // eslint-disable-line

  useEffect(() => { reset(); }, [reset]);

  const flood = (b, r, c) => {
    const stack = [[r, c]];
    while (stack.length) {
      const [cr, cc] = stack.pop();
      const cell = b[cr][cc];
      if (cell.revealed || cell.flag) continue;
      cell.revealed = true;
      if (cell.count === 0 && !cell.mine) {
        for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
          const nr = cr + dr, nc = cc + dc;
          if (nr < 0 || nr >= cfg.rows || nc < 0 || nc >= cfg.cols) continue;
          if (!b[nr][nc].revealed) stack.push([nr, nc]);
        }
      }
    }
  };

  const checkWin = (b) => {
    let revealed = 0;
    for (const row of b) for (const cell of row) if (cell.revealed) revealed += 1;
    return revealed === cfg.rows * cfg.cols - cfg.mines;
  };

  const reveal = (r, c) => {
    if (over) return;
    const cell = board[r][c];
    if (cell.revealed || cell.flag) return;
    if (cell.mine) {
      const next = board.map((row) => row.map((cl) => ({ ...cl })));
      for (const row of next) for (const cl of row) if (cl.mine) cl.revealed = true;
      setBoard(next);
      setOver("lose");
      return;
    }
    const next = board.map((row) => row.map((cl) => ({ ...cl })));
    flood(next, r, c);
    setBoard(next);
    if (checkWin(next)) setOver("win");
  };

  const flag = (e, r, c) => {
    e.preventDefault();
    if (over) return;
    setBoard((cur) => {
      const next = cur.map((row) => row.map((cl) => ({ ...cl })));
      const cell = next[r][c];
      if (cell.revealed) return cur;
      cell.flag = !cell.flag;
      setFlags((f) => f + (cell.flag ? 1 : -1));
      return next;
    });
  };

  return (
    <>
      <Stack direction="row" spacing={1.25} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="Difficulty" value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)} sx={{ width: 180 }}>
          <MenuItem value="beginner">Beginner (9×9, 10)</MenuItem>
          <MenuItem value="intermediate">Intermediate (12×12, 22)</MenuItem>
          <MenuItem value="expert">Expert (14×18, 40)</MenuItem>
        </TextField>
        <Chip label={`🚩 ${flags} / ${cfg.mines}`} sx={{ alignSelf: "center", fontWeight: 700 }} />
        {over === "win" && <Chip label="🎉 Cleared!" sx={{ alignSelf: "center", bgcolor: "rgba(34,197,94,0.2)", color: "#15803d", fontWeight: 800 }} />}
        {over === "lose" && <Chip label="💥 Boom!" sx={{ alignSelf: "center", bgcolor: "rgba(239,68,68,0.2)", color: "#b91c1c", fontWeight: 800 }} />}
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={reset}>New game</Button>
      </Stack>

      <Box sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`,
        gap: 0.3,
        maxWidth: cfg.cols * 32,
        mx: "auto",
      }}>
        {board.flatMap((row, r) => row.map((cell, c) => (
          <Box
            key={`${r}-${c}`}
            onClick={() => reveal(r, c)}
            onContextMenu={(e) => flag(e, r, c)}
            sx={(theme) => ({
              aspectRatio: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              cursor: over ? "default" : "pointer",
              userSelect: "none",
              bgcolor: cell.revealed
                ? (cell.mine ? "#ef4444" : theme.palette.mode === "light" ? "#e5e7eb" : "rgba(255,255,255,0.08)")
                : "#94a3b8",
              color: cell.mine ? "#fff" : MS_NUM_COLOR[cell.count] || "transparent",
              border: cell.revealed ? "1px solid rgba(0,0,0,0.05)" : "1px outset rgba(255,255,255,0.4)",
              borderRadius: 0.4,
            })}
          >
            {cell.flag ? "🚩" : cell.revealed ? (cell.mine ? "💣" : cell.count || "") : ""}
          </Box>
        )))}
      </Box>

      <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 1, color: "text.disabled" }}>
        Left-click to reveal, right-click to flag.
      </Typography>
    </>
  );
}
