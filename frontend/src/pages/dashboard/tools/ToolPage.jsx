import { lazy, Suspense } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { findTool } from "./registry.js";
import ToolFrame from "./ToolFrame.jsx";

// Each impl chunk has named exports; we map slug → the React component
// at module load time. Loaded lazily per chunk so individual tools don't
// pay for siblings.

const lazyNamed = (loader, name) =>
  lazy(async () => {
    const mod = await loader();
    return { default: mod[name] };
  });

const REGISTRY = {
  "json-formatter":      lazy(() => import("./impl/json-formatter.jsx")),
  "json-to-yaml":        lazyNamed(() => import("./impl/converters.jsx"), "JsonToYaml"),
  "yaml-to-json":        lazyNamed(() => import("./impl/converters.jsx"), "YamlToJson"),
  "json-to-csv":         lazyNamed(() => import("./impl/converters.jsx"), "JsonToCsv"),
  "csv-to-json":         lazyNamed(() => import("./impl/converters.jsx"), "CsvToJson"),
  "base64":              lazyNamed(() => import("./impl/converters.jsx"), "Base64"),
  "url-codec":           lazyNamed(() => import("./impl/converters.jsx"), "UrlCodec"),
  "markdown-html":       lazyNamed(() => import("./impl/converters.jsx"), "MarkdownHtml"),
  "text-diff":           lazyNamed(() => import("./impl/converters.jsx"), "TextDiff"),
  "lorem-ipsum":         lazyNamed(() => import("./impl/converters.jsx"), "LoremIpsum"),
  "password-generator":  lazyNamed(() => import("./impl/security.jsx"), "PasswordGenerator"),
  "jwt-decoder":         lazyNamed(() => import("./impl/security.jsx"), "JwtDecoder"),
  "hash-generator":      lazyNamed(() => import("./impl/security.jsx"), "HashGenerator"),
  "color-converter":     lazyNamed(() => import("./impl/design.jsx"), "ColorConverter"),
  "qr-generator":        lazyNamed(() => import("./impl/design.jsx"), "QrGenerator"),
  "regex-tester":        lazyNamed(() => import("./impl/design.jsx"), "RegexTester"),
  "meeting-cost":        lazyNamed(() => import("./impl/productivity.jsx"), "MeetingCost"),
  "timezone-converter":  lazyNamed(() => import("./impl/productivity.jsx"), "TimezoneConverter"),
  "word-counter":        lazyNamed(() => import("./impl/productivity.jsx"), "WordCounter"),
  "timestamp-converter": lazyNamed(() => import("./impl/productivity.jsx"), "TimestampConverter"),
};

const ToolPage = () => {
  const { slug } = useParams();
  const tool = findTool(slug);
  const Component = tool ? REGISTRY[slug] : null;

  if (!tool || !Component) return <Navigate to="/app/tools" replace />;

  return (
    <ToolFrame tool={tool}>
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        }
      >
        <Component />
      </Suspense>
    </ToolFrame>
  );
};

export default ToolPage;
