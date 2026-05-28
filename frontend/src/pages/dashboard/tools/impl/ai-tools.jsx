import { useState } from "react";
import { Alert, Box, Button, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { PiCopyDuotone, PiSparkleDuotone } from "react-icons/pi";
import { ToolSection, monoFont } from "./ToolShell.jsx";
import { API_BASE_URL } from "../../../../config/apiBaseUrl";
import { fetchWithAuth } from "../../../../utils/authApi";

// Shared call to the generic /translate/run-task backend endpoint. Each
// AI tool passes its task slug + the user's input; the backend routes
// to whichever AI provider is currently active and returns plain text.
const runAi = async (task, input) => {
  const { response, payload } = await fetchWithAuth(`${API_BASE_URL}/translate/run-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, input }),
  });
  if (!response.ok) {
    throw new Error(payload?.message || `AI request failed (HTTP ${response.status})`);
  }
  return { output: payload?.data?.output || "", provider: payload?.data?.provider || "" };
};

const callExisting = async (endpoint, body) => {
  const { response, payload } = await fetchWithAuth(`${API_BASE_URL}/translate${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(payload?.message || `AI request failed (HTTP ${response.status})`);
  }
  return payload?.data || {};
};

// Single-input + single-output AI tool template.
const AiSingleTool = ({
  title,
  hint,
  inputLabel,
  inputPlaceholder,
  outputLabel = "Result",
  run,
  variant = "text", // "text" | "json"
}) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState("");

  const handleRun = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(""); setOutput("");
    try {
      const { output: text, provider: prov } = await run(input.trim());
      setOutput(text);
      setProvider(prov);
    } catch (e) {
      setError(e.message || "AI request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{hint}</Typography>
      )}

      <ToolSection title={inputLabel}>
        <TextField
          fullWidth multiline minRows={5}
          placeholder={inputPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          InputProps={{ sx: { fontSize: 14 } }}
        />
      </ToolSection>

      <Button
        variant="contained"
        fullWidth
        startIcon={<PiSparkleDuotone />}
        onClick={handleRun}
        disabled={loading || !input.trim()}
        sx={{ mb: 2 }}
      >
        {loading ? "Thinking…" : title}
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {output && (
        <ToolSection
          title={outputLabel}
          hint={provider ? `via ${provider}` : null}
          action={
            <Button size="small" startIcon={<PiCopyDuotone />} onClick={() => navigator.clipboard?.writeText(output)}>Copy</Button>
          }
        >
          <Box sx={(theme) => ({
            p: 2, borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
            fontFamily: variant === "json" ? monoFont : "inherit",
            fontSize: variant === "json" ? 13 : 14,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          })}>
            {variant === "json" ? prettyJson(output) : output}
          </Box>
        </ToolSection>
      )}
    </>
  );
};

const prettyJson = (text) => {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.stringify(JSON.parse(cleaned), null, 2);
  } catch {
    return text;
  }
};

// ─────────────────────────────────────────────────────────────────────
// 1. AI Translator — wraps existing /translate
// ─────────────────────────────────────────────────────────────────────
const LANGUAGES = [
  "English","Hindi","Spanish","French","German","Italian","Portuguese","Japanese","Chinese (simplified)","Chinese (traditional)","Korean","Arabic","Russian","Turkish","Dutch","Polish","Swedish","Vietnamese","Thai","Indonesian","Bengali","Tamil","Telugu","Marathi","Gujarati","Punjabi","Urdu","Filipino","Greek","Hebrew",
];

export function AiTranslator() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState("");

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(""); setOutput("");
    try {
      const data = await callExisting("/", { text: input, targetLanguage: language });
      setOutput(data.translated || "");
      setProvider(data.provider || "");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <TextField select fullWidth size="small" label="Translate to" value={language} onChange={(e) => setLanguage(e.target.value)}>
          {LANGUAGES.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
        </TextField>
      </Stack>

      <ToolSection title="Source text">
        <TextField fullWidth multiline minRows={5} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste text in any language…" />
      </ToolSection>

      <Button variant="contained" fullWidth startIcon={<PiSparkleDuotone />} onClick={run} disabled={loading || !input.trim()} sx={{ mb: 2 }}>
        {loading ? "Translating…" : `Translate → ${language}`}
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {output && (
        <ToolSection
          title={`${language} translation`}
          hint={provider ? `via ${provider}` : null}
          action={<Button size="small" startIcon={<PiCopyDuotone />} onClick={() => navigator.clipboard?.writeText(output)}>Copy</Button>}
        >
          <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper", whiteSpace: "pre-wrap" })}>
            {output}
          </Box>
        </ToolSection>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 2. AI Summarizer — wraps existing /translate/summarize
// ─────────────────────────────────────────────────────────────────────
export function AiSummarizer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState("");

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(""); setOutput("");
    try {
      const data = await callExisting("/summarize", { content: input });
      setOutput(data.summary || data.output || "");
      setProvider(data.provider || "");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Paste a long article, meeting notes, or thread → get a clean bullet summary.
      </Typography>
      <ToolSection title="Text to summarize">
        <TextField fullWidth multiline minRows={8} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste up to a few thousand words…" />
      </ToolSection>
      <Button variant="contained" fullWidth startIcon={<PiSparkleDuotone />} onClick={run} disabled={loading || !input.trim()} sx={{ mb: 2 }}>
        {loading ? "Summarizing…" : "Summarize"}
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {output && (
        <ToolSection
          title="Summary"
          hint={provider ? `via ${provider}` : null}
          action={<Button size="small" startIcon={<PiCopyDuotone />} onClick={() => navigator.clipboard?.writeText(output)}>Copy</Button>}
        >
          <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper", whiteSpace: "pre-wrap" })}>{output}</Box>
        </ToolSection>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 3. AI Message Rewriter — 4 tone variants via run-task
// ─────────────────────────────────────────────────────────────────────
export function AiRewriter() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("friendly");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState("");

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(""); setOutput("");
    try {
      const { output: text, provider: prov } = await runAi(`rewrite-${tone}`, input.trim());
      setOutput(text);
      setProvider(prov);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Paste a message, pick a tone, get a rewritten version ready to paste in chat.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        {[
          { key: "friendly", label: "🌞 Friendly" },
          { key: "formal", label: "👔 Formal" },
          { key: "concise", label: "✂️ Concise" },
          { key: "assertive", label: "💪 Assertive" },
        ].map((t) => (
          <Chip
            key={t.key}
            label={t.label}
            onClick={() => setTone(t.key)}
            color={tone === t.key ? "primary" : "default"}
            variant={tone === t.key ? "filled" : "outlined"}
            sx={{ cursor: "pointer", fontWeight: 700 }}
          />
        ))}
      </Stack>

      <ToolSection title="Your message">
        <TextField fullWidth multiline minRows={4} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste the message you want to rewrite…" />
      </ToolSection>

      <Button variant="contained" fullWidth startIcon={<PiSparkleDuotone />} onClick={run} disabled={loading || !input.trim()} sx={{ mb: 2 }}>
        {loading ? "Rewriting…" : `Rewrite — ${tone}`}
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {output && (
        <ToolSection
          title="Rewritten"
          hint={provider ? `via ${provider}` : null}
          action={<Button size="small" startIcon={<PiCopyDuotone />} onClick={() => navigator.clipboard?.writeText(output)}>Copy</Button>}
        >
          <Box sx={{ p: 2, borderRadius: 1.5, border: `2px solid ${tone === "friendly" ? "#f59e0b" : tone === "formal" ? "#2563eb" : tone === "concise" ? "#16a34a" : "#dc2626"}`, bgcolor: "background.paper", whiteSpace: "pre-wrap" }}>
            {output}
          </Box>
        </ToolSection>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 4. AI Reply Suggester — uses /translate/smart-reply
// ─────────────────────────────────────────────────────────────────────
export function AiReplySuggester() {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(-1);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(""); setSuggestions([]);
    try {
      const data = await callExisting("/smart-reply", { lastMessage: input, context: [] });
      const arr = Array.isArray(data.suggestions) ? data.suggestions : [];
      setSuggestions(arr);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Paste a message you received → get 3 reply suggestions ready to send.
      </Typography>
      <ToolSection title="Message you received">
        <TextField fullWidth multiline minRows={4} value={input} onChange={(e) => setInput(e.target.value)} placeholder='e.g. "Can you push back the launch by a week?"' />
      </ToolSection>
      <Button variant="contained" fullWidth startIcon={<PiSparkleDuotone />} onClick={run} disabled={loading || !input.trim()} sx={{ mb: 2 }}>
        {loading ? "Thinking…" : "Suggest 3 replies"}
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {suggestions.length > 0 && (
        <Stack spacing={1}>
          {suggestions.map((s, i) => (
            <Box
              key={i}
              onClick={() => { navigator.clipboard?.writeText(s); setCopied(i); setTimeout(() => setCopied(-1), 1500); }}
              sx={(theme) => ({
                p: 1.75, borderRadius: 1.5, cursor: "pointer",
                border: `1px solid ${copied === i ? "#22c55e" : theme.palette.divider}`,
                bgcolor: copied === i ? "rgba(34,197,94,0.08)" : "background.paper",
                "&:hover": { borderColor: "primary.main" },
              })}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Chip label={`Option ${i + 1}`} size="small" />
                <Typography variant="caption" color={copied === i ? "success.main" : "text.disabled"}>
                  {copied === i ? "Copied" : "Click to copy"}
                </Typography>
              </Stack>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>{s}</Typography>
            </Box>
          ))}
        </Stack>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 5. Email Drafter / 6. Grammar / 7. Tone / 8. Jargon / 9. Acronyms /
// 10. Action Items / 11. Sentiment / 12. Alt-Text — all via run-task
// ─────────────────────────────────────────────────────────────────────
export const AiEmailDrafter = () => (
  <AiSingleTool
    title="Draft email"
    hint="Type bullet points → AI builds a polished email with a subject line."
    inputLabel="Bullet points"
    inputPlaceholder={"e.g.\n- thank Priya for the design review\n- ship date moves to next Friday\n- need final assets by Wednesday"}
    outputLabel="Email draft"
    run={(input) => runAi("email-draft", input)}
  />
);

export const AiGrammarCheck = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(""); setOutput("");
    try {
      const data = await callExisting("/grammar", { text: input });
      setOutput(data.corrected || data.output || "");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Paste your text → get a grammar + spell-corrected version.
      </Typography>
      <ToolSection title="Your text">
        <TextField fullWidth multiline minRows={5} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste a message, paragraph, or email…" />
      </ToolSection>
      <Button variant="contained" fullWidth startIcon={<PiSparkleDuotone />} onClick={run} disabled={loading || !input.trim()} sx={{ mb: 2 }}>
        {loading ? "Checking…" : "Check grammar"}
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {output && (
        <ToolSection title="Corrected" action={<Button size="small" startIcon={<PiCopyDuotone />} onClick={() => navigator.clipboard?.writeText(output)}>Copy</Button>}>
          <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper", whiteSpace: "pre-wrap" })}>{output}</Box>
        </ToolSection>
      )}
    </>
  );
};

export const AiToneDetector = () => (
  <AiSingleTool
    title="Detect tone"
    hint="Paste a message → see how it's likely to land + a softer rewrite."
    inputLabel="Message"
    inputPlaceholder='e.g. "Can we hop on a quick call to discuss this? I think there are some issues."'
    outputLabel="Tone analysis"
    variant="json"
    run={(input) => runAi("tone-detect", input)}
  />
);

export const AiJargonSimplifier = () => (
  <AiSingleTool
    title="Simplify"
    hint="Paste technical text → get a plain-English version for non-tech teammates."
    inputLabel="Technical text"
    inputPlaceholder="e.g. an architecture note, RFC, or PR description full of jargon…"
    outputLabel="Plain English"
    run={(input) => runAi("jargon-simplify", input)}
  />
);

export const AiAcronymDecoder = () => (
  <AiSingleTool
    title="Decode acronyms"
    hint="Paste text → AI extracts every acronym with its meaning + context."
    inputLabel="Text with acronyms"
    inputPlaceholder="e.g. 'We need to align on the OKRs before the QBR — make sure CTAs match the SLA.'"
    outputLabel="Acronyms"
    variant="json"
    run={(input) => runAi("acronym-decode", input)}
  />
);

export const AiActionItems = () => (
  <AiSingleTool
    title="Extract action items"
    hint="Paste meeting notes / chat log → get a clean list of tasks with owners and due dates."
    inputLabel="Meeting notes or chat log"
    inputPlaceholder="Paste the full transcript or notes here…"
    outputLabel="Action items"
    variant="json"
    run={(input) => runAi("action-items", input)}
  />
);

export const AiSentiment = () => (
  <AiSingleTool
    title="Analyse sentiment"
    hint="Paste a thread or batch of messages → overall sentiment + highlights."
    inputLabel="Thread / messages"
    inputPlaceholder="Paste a chat thread or feedback batch…"
    outputLabel="Sentiment"
    variant="json"
    run={(input) => runAi("sentiment", input)}
  />
);

export const AiAltText = () => (
  <AiSingleTool
    title="Write alt-text"
    hint="Describe an image in your own words → AI compresses it into accessibility-ready alt text (≤120 chars)."
    inputLabel="Image description"
    inputPlaceholder="e.g. 'A team of 5 engineers around a whiteboard with sprint sticky notes — Aarav writing on it'"
    outputLabel="Alt text"
    run={(input) => runAi("alt-text", input)}
  />
);
