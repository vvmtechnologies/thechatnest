// Single source of truth for the in-app tools hub.
// Each tool ships as a lazy-loaded React component under ./impl/<slug>.jsx
// and is grouped into one of four categories shown on the listing page.

export const CATEGORIES = {
  document: { label: "Document & Data", tint: "#2065D1" },
  security: { label: "Security", tint: "#16a34a" },
  design: { label: "Design & Dev", tint: "#f59e0b" },
  productivity: { label: "Productivity", tint: "#a855f7" },
};

export const TOOLS = [
  // ── Document & Data ──────────────────────────────────────────────
  {
    slug: "json-formatter",
    title: "JSON Formatter",
    desc: "Pretty-print, validate, and tree-view JSON.",
    category: "document",
    icon: "PiBracketsCurlyBold",
  },
  {
    slug: "json-to-yaml",
    title: "JSON → YAML",
    desc: "Convert JSON objects to YAML.",
    category: "document",
    icon: "PiArrowsLeftRightDuotone",
  },
  {
    slug: "yaml-to-json",
    title: "YAML → JSON",
    desc: "Convert YAML back to JSON.",
    category: "document",
    icon: "PiArrowsLeftRightDuotone",
  },
  {
    slug: "json-to-csv",
    title: "JSON → CSV",
    desc: "Flatten JSON arrays into CSV rows.",
    category: "document",
    icon: "PiTableDuotone",
  },
  {
    slug: "csv-to-json",
    title: "CSV → JSON",
    desc: "Parse CSV into structured JSON.",
    category: "document",
    icon: "PiTableDuotone",
  },
  {
    slug: "base64",
    title: "Base64 Encode / Decode",
    desc: "Encode or decode text & files.",
    category: "document",
    icon: "PiKeyDuotone",
  },
  {
    slug: "url-codec",
    title: "URL Encode / Decode",
    desc: "Percent-encode or decode URL strings.",
    category: "document",
    icon: "PiLinkDuotone",
  },
  {
    slug: "markdown-html",
    title: "Markdown ↔ HTML",
    desc: "Convert between markdown and rendered HTML.",
    category: "document",
    icon: "PiMarkdownLogoDuotone",
  },
  {
    slug: "text-diff",
    title: "Text Diff",
    desc: "Compare two texts and highlight changes.",
    category: "document",
    icon: "PiGitDiffDuotone",
  },
  {
    slug: "lorem-ipsum",
    title: "Lorem Ipsum",
    desc: "Generate filler text by words, sentences, or paragraphs.",
    category: "document",
    icon: "PiTextAaDuotone",
  },

  // ── Security ─────────────────────────────────────────────────────
  {
    slug: "password-generator",
    title: "Password Generator",
    desc: "Generate strong, crypto-random passwords.",
    category: "security",
    icon: "PiShieldCheckDuotone",
  },
  {
    slug: "jwt-decoder",
    title: "JWT Decoder",
    desc: "Inspect JWT header, payload, and expiry.",
    category: "security",
    icon: "PiLockKeyDuotone",
  },
  {
    slug: "hash-generator",
    title: "Hash Generator",
    desc: "Compute MD5, SHA-1, SHA-256, SHA-512.",
    category: "security",
    icon: "PiFingerprintDuotone",
  },

  // ── Design & Dev ─────────────────────────────────────────────────
  {
    slug: "color-converter",
    title: "Color Converter",
    desc: "Pick a color, convert between HEX, RGB, HSL.",
    category: "design",
    icon: "PiPaintBrushDuotone",
  },
  {
    slug: "qr-generator",
    title: "QR Code Generator",
    desc: "Create scannable QR codes for any URL or text.",
    category: "design",
    icon: "PiQrCodeDuotone",
  },
  {
    slug: "regex-tester",
    title: "Regex Tester",
    desc: "Test patterns against input with live highlighting.",
    category: "design",
    icon: "PiAsteriskDuotone",
  },

  // ── Productivity ─────────────────────────────────────────────────
  {
    slug: "meeting-cost",
    title: "Meeting Cost Calculator",
    desc: "See how much your meeting is really costing.",
    category: "productivity",
    icon: "PiCalculatorDuotone",
  },
  {
    slug: "timezone-converter",
    title: "Timezone Converter",
    desc: "Find a meeting slot across timezones.",
    category: "productivity",
    icon: "PiGlobeDuotone",
  },
  {
    slug: "word-counter",
    title: "Word & Character Counter",
    desc: "Count words, chars, sentences, reading time.",
    category: "productivity",
    icon: "PiTextAlignLeftDuotone",
  },
  {
    slug: "timestamp-converter",
    title: "Unix Timestamp Converter",
    desc: "Convert between epoch seconds/ms and ISO dates.",
    category: "productivity",
    icon: "PiClockClockwiseDuotone",
  },
];

export const findTool = (slug) => TOOLS.find((t) => t.slug === slug) || null;
