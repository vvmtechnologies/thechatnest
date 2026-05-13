import { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { PiXBold, PiEyeDuotone, PiMarkdownLogoBold } from "react-icons/pi";

// Tiny self-contained markdown renderer — handles the markdown subset that
// makes sense in a chat-composer preview: headings, bold, italic, strike,
// inline code, fenced code, blockquote, ordered / unordered lists, links,
// horizontal rule, and paragraphs. Escapes HTML first so user content is
// always safe to render via dangerouslySetInnerHTML.

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderInline = (line) => {
  let out = escapeHtml(line);
  // inline code first, so its content isn't re-formatted
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // bold + italic combo
  out = out.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // bold
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // italic
  out = out.replace(/(^|\W)\*([^\s*][^*]*?)\*(?=\W|$)/g, '$1<em>$2</em>');
  out = out.replace(/(^|\W)_([^\s_][^_]*?)_(?=\W|$)/g, '$1<em>$2</em>');
  // strike
  out = out.replace(/~~(.+?)~~/g, '<del>$1</del>');
  // links [text](url)
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  // bare URLs
  out = out.replace(
    /(^|[^"=>])\b(https?:\/\/[^\s<]+)/g,
    '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>'
  );
  return out;
};

const renderMarkdown = (raw) => {
  if (!raw || !String(raw).trim()) return "";
  const lines = String(raw).replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let i = 0;
  let inUl = false;
  let inOl = false;
  const closeLists = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
    if (inOl) { html += "</ol>"; inOl = false; }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^```/.test(line)) {
      closeLists();
      const lang = line.replace(/^```/, "").trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(escapeHtml(lines[i]));
        i++;
      }
      i++; // skip closing fence
      html += `<pre data-lang="${escapeHtml(lang)}"><code>${buf.join("\n")}</code></pre>`;
      continue;
    }

    // Horizontal rule
    if (/^---\s*$/.test(line)) {
      closeLists();
      html += "<hr/>";
      i++;
      continue;
    }

    // Headings
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeLists();
      const level = heading[1].length;
      html += `<h${level}>${renderInline(heading[2])}</h${level}>`;
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      closeLists();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(renderInline(lines[i].replace(/^>\s?/, "")));
        i++;
      }
      html += `<blockquote>${buf.join("<br/>")}</blockquote>`;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      if (!inOl) {
        closeLists();
        html += "<ol>";
        inOl = true;
      }
      html += `<li>${renderInline(line.replace(/^\d+\.\s+/, ""))}</li>`;
      i++;
      continue;
    }

    // Unordered list
    if (/^[-*+]\s+/.test(line)) {
      if (!inUl) {
        closeLists();
        html += "<ul>";
        inUl = true;
      }
      html += `<li>${renderInline(line.replace(/^[-*+]\s+/, ""))}</li>`;
      i++;
      continue;
    }

    // Blank line — paragraph break
    if (line.trim() === "") {
      closeLists();
      i++;
      continue;
    }

    // Paragraph
    closeLists();
    const buf = [renderInline(line)];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6}\s|>\s|---|```|\d+\.\s|[-*+]\s)/.test(lines[i])
    ) {
      buf.push(renderInline(lines[i]));
      i++;
    }
    html += `<p>${buf.join("<br/>")}</p>`;
  }
  closeLists();
  return html;
};

const MarkdownPreviewDialog = ({ open, source, onClose }) => {
  const html = useMemo(() => renderMarkdown(source), [source]);
  const isEmpty = !html;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          py: 1.4,
          px: 2.25,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, #fafbff, #f3f5fc)"
              : theme.palette.background.default,
        })}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <PiEyeDuotone size={20} />
          <Typography variant="subtitle1" fontWeight={700}>
            Markdown preview
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={(theme) => ({
              ml: 1,
              px: 0.85,
              py: 0.2,
              borderRadius: 0.85,
              bgcolor:
                theme.palette.mode === "light"
                  ? "rgba(109,93,252,0.12)"
                  : "rgba(109,93,252,0.18)",
              color: theme.palette.primary.main,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.4,
            })}
          >
            <PiMarkdownLogoBold size={12} />
            <span>MD</span>
          </Stack>
        </Stack>
        <IconButton onClick={onClose} size="small" aria-label="Close preview">
          <PiXBold size={16} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box
          className="tcn-md-preview"
          sx={(theme) => ({
            p: 2.5,
            minHeight: 200,
            maxHeight: "60vh",
            overflowY: "auto",
            fontSize: 14.5,
            lineHeight: 1.6,
            color: theme.palette.text.primary,
            "& h1, & h2, & h3, & h4": {
              fontWeight: 700,
              lineHeight: 1.25,
              margin: "1rem 0 0.5rem",
              letterSpacing: "-0.01em",
            },
            "& h1": { fontSize: "1.5rem" },
            "& h2": { fontSize: "1.25rem" },
            "& h3": { fontSize: "1.1rem" },
            "& h4, & h5, & h6": { fontSize: "1rem" },
            "& p": { margin: "0.65rem 0" },
            "& strong": { fontWeight: 700 },
            "& em": { fontStyle: "italic" },
            "& del": { color: theme.palette.text.disabled },
            "& a": {
              color: theme.palette.primary.main,
              textDecoration: "underline",
            },
            "& ul, & ol": { paddingLeft: "1.5rem", margin: "0.65rem 0" },
            "& li": { marginBottom: "0.25rem" },
            "& blockquote": {
              borderLeft: `3px solid ${theme.palette.primary.main}`,
              paddingLeft: "0.85rem",
              margin: "0.85rem 0",
              color: theme.palette.text.secondary,
              fontStyle: "italic",
            },
            "& code": {
              fontFamily:
                '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
              fontSize: "0.88em",
              padding: "0.12em 0.4em",
              borderRadius: "4px",
              bgcolor:
                theme.palette.mode === "light"
                  ? "rgba(15,23,42,0.07)"
                  : "rgba(255,255,255,0.08)",
              color:
                theme.palette.mode === "light"
                  ? "#b91c1c"
                  : "#fda4af",
            },
            "& pre": {
              fontFamily:
                '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
              fontSize: "0.85em",
              padding: "0.95rem 1rem",
              borderRadius: "8px",
              overflowX: "auto",
              bgcolor:
                theme.palette.mode === "light"
                  ? "#0f172a"
                  : "rgba(0,0,0,0.4)",
              color: "#e2e8f0",
              margin: "0.85rem 0",
              position: "relative",
            },
            "& pre code": {
              bgcolor: "transparent",
              color: "inherit",
              padding: 0,
            },
            "& hr": {
              border: 0,
              borderTop: `1px solid ${theme.palette.divider}`,
              margin: "1.25rem 0",
            },
          })}
        >
          {isEmpty ? (
            <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
              Nothing to preview yet. Type a message with markdown to see it
              rendered here — try{" "}
              <code>**bold**</code>, <code>*italic*</code>,{" "}
              <code>`code`</code>, <code># heading</code>, or{" "}
              <code>[link](https://example.com)</code>.
            </Typography>
          ) : (
            <Box
              dangerouslySetInnerHTML={{ __html: html }}
              sx={{ "& > :first-of-type": { mt: 0 }, "& > :last-child": { mb: 0 } }}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

MarkdownPreviewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  source: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

MarkdownPreviewDialog.defaultProps = {
  source: "",
};

export default MarkdownPreviewDialog;
