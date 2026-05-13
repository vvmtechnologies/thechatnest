import { useState } from "react";
import { Box, Button, Stack, TextField, Alert, IconButton, Tooltip } from "@mui/material";
import { PiCopyDuotone, PiCheckBold, PiTrashDuotone } from "react-icons/pi";
import { ToolSection, monoFont } from "./ToolShell.jsx";

const SAMPLE = '{"team":"shipping","members":[{"name":"Aanya","online":true},{"name":"Rohan","online":false}],"updated":"2026-05-13T10:42:00Z"}';

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  let formatted = "";
  let error = "";
  if (input.trim()) {
    try {
      formatted = JSON.stringify(JSON.parse(input), null, indent);
    } catch (e) {
      error = e.message;
    }
  }

  const handleCopy = async () => {
    if (!formatted) return;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <>
      <ToolSection
        title="Input"
        hint="paste raw JSON"
        action={
          <Stack direction="row" spacing={0.5}>
            <Button size="small" onClick={() => setInput(SAMPLE)}>Try sample</Button>
            <Tooltip title="Clear">
              <IconButton size="small" onClick={() => setInput("")}><PiTrashDuotone size={16} /></IconButton>
            </Tooltip>
          </Stack>
        }
      >
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          minRows={6}
          maxRows={16}
          placeholder='{"hello":"world"}'
          InputProps={{ sx: { fontFamily: monoFont, fontSize: 13 } }}
        />
      </ToolSection>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ToolSection
        title="Formatted"
        hint={`indent: ${indent} spaces`}
        action={
          <Stack direction="row" spacing={0.75} alignItems="center">
            {[2, 4].map((n) => (
              <Button key={n} size="small" variant={indent === n ? "contained" : "outlined"} onClick={() => setIndent(n)} sx={{ minWidth: 36, px: 1 }}>{n}</Button>
            ))}
            <Tooltip title={copied ? "Copied!" : "Copy"}>
              <span>
                <IconButton size="small" onClick={handleCopy} disabled={!formatted}>
                  {copied ? <PiCheckBold size={16} color="#22c55e" /> : <PiCopyDuotone size={16} />}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        }
      >
        <Box
          component="pre"
          sx={(theme) => ({
            m: 0,
            p: 2,
            minHeight: 120,
            maxHeight: 400,
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
          {formatted || (error ? "// Fix the errors above" : "// Result will appear here")}
        </Box>
      </ToolSection>
    </>
  );
}
