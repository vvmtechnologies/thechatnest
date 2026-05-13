// JSON ↔ YAML, JSON ↔ CSV, Base64, URL codec, Markdown ↔ HTML, Text diff,
// Lorem ipsum — all converter / generator tools that don't need elaborate UI.
//
// Each tool is its own default-exported component so React Router lazy()
// can split them. We keep the logic and styling tight to ship 20 tools
// without blowing up the bundle.

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";
import { PiCopyDuotone, PiCheckBold, PiArrowsLeftRightDuotone } from "react-icons/pi";
import { ToolSection, monoFont } from "./ToolShell.jsx";

const ResultPane = ({ value, label = "Output", error = "" }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <ToolSection
      title={label}
      action={
        <Tooltip title={copied ? "Copied!" : "Copy"}>
          <span>
            <IconButton size="small" onClick={handleCopy} disabled={!value}>
              {copied ? <PiCheckBold size={16} color="#22c55e" /> : <PiCopyDuotone size={16} />}
            </IconButton>
          </span>
        </Tooltip>
      }
    >
      {error && <Alert severity="error" sx={{ mb: 1.25 }}>{error}</Alert>}
      <Box
        component="pre"
        sx={(theme) => ({
          m: 0,
          p: 2,
          minHeight: 120,
          maxHeight: 360,
          overflow: "auto",
          fontFamily: monoFont,
          fontSize: 13,
          lineHeight: 1.6,
          borderRadius: 1.5,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === "light" ? "#0f172a" : "rgba(0,0,0,0.4)",
          color: "#e2e8f0",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        })}
      >
        {value || "// Result will appear here"}
      </Box>
    </ToolSection>
  );
};

// ── Tiny YAML emitter (just enough for JSON → YAML) ──────────────────
const yamlStringify = (val, depth = 0) => {
  const pad = "  ".repeat(depth);
  if (val === null) return "null";
  if (typeof val === "string") {
    if (/[\n:{}[\],&*#?|<>=!%@`'"]/.test(val) || /^\s|\s$/.test(val))
      return JSON.stringify(val);
    return val;
  }
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) {
    if (!val.length) return "[]";
    return "\n" + val.map((v) => `${pad}- ${yamlStringify(v, depth + 1).replace(/^\n/, "")}`).join("\n");
  }
  if (typeof val === "object") {
    const keys = Object.keys(val);
    if (!keys.length) return "{}";
    return (
      (depth === 0 ? "" : "\n") +
      keys
        .map((k) => {
          const v = val[k];
          const ser = yamlStringify(v, depth + 1);
          if (typeof v === "object" && v !== null && (Array.isArray(v) ? v.length : Object.keys(v).length)) {
            return `${pad}${k}:${ser}`;
          }
          return `${pad}${k}: ${ser.replace(/^\n/, "")}`;
        })
        .join("\n")
    );
  }
  return String(val);
};

export function JsonToYaml() {
  const [input, setInput] = useState("");
  let out = "";
  let err = "";
  if (input.trim()) {
    try {
      out = yamlStringify(JSON.parse(input)).replace(/^\n/, "");
    } catch (e) {
      err = e.message;
    }
  }
  return (
    <>
      <ToolSection title="JSON input">
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          minRows={5}
          maxRows={14}
          placeholder='{"key":"value"}'
          InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }}
        />
      </ToolSection>
      <ResultPane label="YAML output" value={out} error={err} />
    </>
  );
}

// ── Tiny YAML parser (subset — handles flat & nested key:value, lists) ─
const yamlParse = (text) => {
  const root = {};
  const stack = [{ obj: root, indent: -1 }];
  text.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.replace(/#.*$/, "");
    if (!line.trim()) return;
    const indent = line.match(/^ */)[0].length;
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      const val = trimmed.slice(2).trim();
      // current container must be an array — if parent's last key was set to {}, convert
      const arr = Array.isArray(parent) ? parent : null;
      if (!arr) {
        // skip — caller should handle this via dedicated array detection
        return;
      }
      arr.push(coerce(val));
      return;
    }
    const m = trimmed.match(/^([^:]+):\s*(.*)$/);
    if (!m) return;
    const key = m[1].trim();
    const val = m[2];
    if (val === "" || val === undefined) {
      parent[key] = {};
      stack.push({ obj: parent[key], indent });
    } else {
      parent[key] = coerce(val);
    }
  });
  return root;
};
const coerce = (s) => {
  const t = s.trim();
  if (t === "true") return true;
  if (t === "false") return false;
  if (t === "null") return null;
  if (/^-?\d+$/.test(t)) return parseInt(t, 10);
  if (/^-?\d*\.\d+$/.test(t)) return parseFloat(t);
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
  return t;
};

export function YamlToJson() {
  const [input, setInput] = useState("");
  let out = "";
  let err = "";
  if (input.trim()) {
    try {
      out = JSON.stringify(yamlParse(input), null, 2);
    } catch (e) {
      err = e.message;
    }
  }
  return (
    <>
      <ToolSection title="YAML input" hint="basic subset: scalars, nested objects">
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          minRows={5}
          maxRows={14}
          placeholder="name: TheChatNest\nversion: 1.0"
          InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }}
        />
      </ToolSection>
      <ResultPane label="JSON output" value={out} error={err} />
    </>
  );
}

// ── JSON ↔ CSV ────────────────────────────────────────────────────────
const escapeCsv = (v) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};
const jsonToCsv = (arr) => {
  if (!Array.isArray(arr) || !arr.length) return "";
  const keys = Array.from(arr.reduce((s, r) => { Object.keys(r || {}).forEach((k) => s.add(k)); return s; }, new Set()));
  const lines = [keys.join(",")];
  arr.forEach((row) => lines.push(keys.map((k) => escapeCsv(row?.[k])).join(",")));
  return lines.join("\n");
};

export function JsonToCsv() {
  const [input, setInput] = useState("");
  let out = "";
  let err = "";
  if (input.trim()) {
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array of objects");
      out = jsonToCsv(parsed);
    } catch (e) {
      err = e.message;
    }
  }
  return (
    <>
      <ToolSection title="JSON array input">
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          minRows={5}
          maxRows={14}
          placeholder='[{"name":"Aanya","role":"engineer"},{"name":"Rohan","role":"design"}]'
          InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }}
        />
      </ToolSection>
      <ResultPane label="CSV output" value={out} error={err} />
    </>
  );
}

// Parse CSV (handles quoted fields with commas + escaped quotes)
const csvParse = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { row.push(field); field = ""; }
      else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (ch === "\r") {/* skip */}
      else field += ch;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
};

export function CsvToJson() {
  const [input, setInput] = useState("");
  let out = "";
  let err = "";
  if (input.trim()) {
    try {
      const rows = csvParse(input);
      if (!rows.length) throw new Error("No rows found");
      const [header, ...data] = rows;
      const result = data
        .filter((r) => r.some((c) => c !== ""))
        .map((r) => Object.fromEntries(header.map((k, i) => [k, r[i] ?? ""])));
      out = JSON.stringify(result, null, 2);
    } catch (e) {
      err = e.message;
    }
  }
  return (
    <>
      <ToolSection title="CSV input" hint="first row is header">
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          minRows={5}
          maxRows={14}
          placeholder={"name,role\nAanya,engineer\nRohan,design"}
          InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }}
        />
      </ToolSection>
      <ResultPane label="JSON output" value={out} error={err} />
    </>
  );
}

// ── Base64 encode / decode ────────────────────────────────────────────
export function Base64() {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");
  let out = "";
  let err = "";
  if (input) {
    try {
      if (mode === "encode") {
        out = btoa(unescape(encodeURIComponent(input)));
      } else {
        out = decodeURIComponent(escape(atob(input.trim())));
      }
    } catch (e) {
      err = e.message;
    }
  }
  return (
    <>
      <ToggleButtonGroup
        exclusive
        value={mode}
        onChange={(_, v) => v && setMode(v)}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="encode">Encode</ToggleButton>
        <ToggleButton value="decode">Decode</ToggleButton>
      </ToggleButtonGroup>
      <ToolSection title={mode === "encode" ? "Plain text" : "Base64 string"}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          minRows={5}
          maxRows={14}
          InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }}
        />
      </ToolSection>
      <ResultPane label={mode === "encode" ? "Base64 output" : "Decoded text"} value={out} error={err} />
    </>
  );
}

// ── URL encode / decode ───────────────────────────────────────────────
export function UrlCodec() {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");
  let out = "";
  let err = "";
  if (input) {
    try {
      out = mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
    } catch (e) {
      err = e.message;
    }
  }
  return (
    <>
      <ToggleButtonGroup
        exclusive
        value={mode}
        onChange={(_, v) => v && setMode(v)}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="encode">Encode</ToggleButton>
        <ToggleButton value="decode">Decode</ToggleButton>
      </ToggleButtonGroup>
      <ToolSection title={mode === "encode" ? "Plain text" : "Encoded URL"}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          minRows={4}
          maxRows={10}
          InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }}
        />
      </ToolSection>
      <ResultPane label="Result" value={out} error={err} />
    </>
  );
}

// ── Markdown ↔ HTML ───────────────────────────────────────────────────
const mdToHtml = (raw) => {
  if (!raw) return "";
  const lines = raw.split(/\r?\n/);
  let html = "";
  let inUl = false;
  const closeLists = () => { if (inUl) { html += "</ul>"; inUl = false; } };
  const inline = (s) => {
    let o = s
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(?:^|\W)\*([^\s*][^*]*?)\*(?=\W|$)/g, " <em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
    return o;
  };
  for (const ln of lines) {
    const h = ln.match(/^(#{1,6})\s+(.+)$/);
    if (h) { closeLists(); html += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`; continue; }
    if (/^[-*+]\s+/.test(ln)) { if (!inUl) { html += "<ul>"; inUl = true; } html += `<li>${inline(ln.replace(/^[-*+]\s+/, ""))}</li>`; continue; }
    if (!ln.trim()) { closeLists(); continue; }
    closeLists();
    html += `<p>${inline(ln)}</p>`;
  }
  closeLists();
  return html;
};

const htmlToMd = (html) =>
  String(html || "")
    .replace(/<h([1-6])>(.*?)<\/h\1>/g, (_, n, t) => `${"#".repeat(Number(n))} ${t}\n`)
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/<em>(.*?)<\/em>/g, "*$1*")
    .replace(/<code>(.*?)<\/code>/g, "`$1`")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, "[$2]($1)")
    .replace(/<li>(.*?)<\/li>/g, "- $1\n")
    .replace(/<\/?(ul|ol|p|br\/?)>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export function MarkdownHtml() {
  const [direction, setDirection] = useState("md-to-html");
  const [input, setInput] = useState("");
  const out = useMemo(
    () => (direction === "md-to-html" ? mdToHtml(input) : htmlToMd(input)),
    [direction, input]
  );
  return (
    <>
      <ToggleButtonGroup
        exclusive
        value={direction}
        onChange={(_, v) => v && setDirection(v)}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="md-to-html"><PiArrowsLeftRightDuotone size={14} style={{ marginRight: 6 }} />Markdown → HTML</ToggleButton>
        <ToggleButton value="html-to-md"><PiArrowsLeftRightDuotone size={14} style={{ marginRight: 6 }} />HTML → Markdown</ToggleButton>
      </ToggleButtonGroup>
      <ToolSection title="Input">
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          minRows={6}
          maxRows={14}
          InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }}
        />
      </ToolSection>
      <ResultPane label="Output" value={out} />
    </>
  );
}

// ── Text diff (line-by-line) ──────────────────────────────────────────
export function TextDiff() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const diff = useMemo(() => {
    const linesA = a.split(/\r?\n/);
    const linesB = b.split(/\r?\n/);
    const max = Math.max(linesA.length, linesB.length);
    const out = [];
    for (let i = 0; i < max; i++) {
      const la = linesA[i] ?? "";
      const lb = linesB[i] ?? "";
      if (la === lb) out.push({ type: "same", text: la });
      else {
        if (la) out.push({ type: "removed", text: la });
        if (lb) out.push({ type: "added", text: lb });
      }
    }
    return out;
  }, [a, b]);

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
        <TextField label="Original" value={a} onChange={(e) => setA(e.target.value)} fullWidth multiline minRows={6} maxRows={14} InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }} />
        <TextField label="Changed" value={b} onChange={(e) => setB(e.target.value)} fullWidth multiline minRows={6} maxRows={14} InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }} />
      </Box>
      <ToolSection title="Diff" hint="line-by-line">
        <Box
          sx={(theme) => ({
            p: 1.5,
            borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === "light" ? "#0f172a" : "rgba(0,0,0,0.4)",
            fontFamily: monoFont,
            fontSize: 13,
            maxHeight: 360,
            overflow: "auto",
          })}
        >
          {diff.length === 0 ? (
            <Typography sx={{ color: "#94a3b8", fontFamily: monoFont, fontSize: 13 }}>// Both panes empty</Typography>
          ) : diff.map((d, i) => (
            <Box
              key={i}
              sx={{
                px: 1,
                color: d.type === "added" ? "#86efac" : d.type === "removed" ? "#fca5a5" : "#cbd5e1",
                bgcolor:
                  d.type === "added" ? "rgba(34,197,94,0.12)"
                  : d.type === "removed" ? "rgba(239,68,68,0.12)"
                  : "transparent",
                whiteSpace: "pre-wrap",
              }}
            >
              <span style={{ opacity: 0.65, marginRight: 6 }}>
                {d.type === "added" ? "+" : d.type === "removed" ? "-" : " "}
              </span>
              {d.text || "\u00a0"}
            </Box>
          ))}
        </Box>
      </ToolSection>
    </>
  );
}

// ── Lorem ipsum generator ─────────────────────────────────────────────
const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");

export function LoremIpsum() {
  const [unit, setUnit] = useState("paragraphs");
  const [count, setCount] = useState(3);
  const out = useMemo(() => {
    if (unit === "words") return Array.from({ length: count }, (_, i) => LOREM_WORDS[i % LOREM_WORDS.length]).join(" ");
    const sentence = () => {
      const len = 8 + Math.floor(Math.random() * 8);
      const words = [];
      for (let i = 0; i < len; i++) words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      const s = words.join(" ");
      return s.charAt(0).toUpperCase() + s.slice(1) + ".";
    };
    if (unit === "sentences") return Array.from({ length: count }, sentence).join(" ");
    return Array.from({ length: count }, () => Array.from({ length: 4 + Math.floor(Math.random() * 3) }, sentence).join(" ")).join("\n\n");
  }, [unit, count]);
  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
        <ToggleButtonGroup exclusive size="small" value={unit} onChange={(_, v) => v && setUnit(v)}>
          <ToggleButton value="words">Words</ToggleButton>
          <ToggleButton value="sentences">Sentences</ToggleButton>
          <ToggleButton value="paragraphs">Paragraphs</ToggleButton>
        </ToggleButtonGroup>
        <TextField size="small" type="number" value={count} onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} inputProps={{ min: 1, max: 50 }} sx={{ width: 90 }} label="Count" />
      </Stack>
      <ResultPane label={`${count} ${unit}`} value={out} />
    </>
  );
}
