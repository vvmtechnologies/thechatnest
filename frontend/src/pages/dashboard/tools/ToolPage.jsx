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
  // Document & Data (kept)
  "markdown-html":       lazyNamed(() => import("./impl/converters.jsx"), "MarkdownHtml"),
  "json-to-csv":         lazyNamed(() => import("./impl/converters.jsx"), "JsonToCsv"),
  "csv-to-json":         lazyNamed(() => import("./impl/converters.jsx"), "CsvToJson"),
  "case-converter":      lazyNamed(() => import("./impl/converters.jsx"), "CaseConverter"),
  "lorem-ipsum":         lazyNamed(() => import("./impl/converters.jsx"), "LoremIpsum"),

  // Security (kept)
  "password-generator":  lazyNamed(() => import("./impl/security.jsx"), "PasswordGenerator"),

  // Design (kept)
  "color-converter":     lazyNamed(() => import("./impl/design.jsx"), "ColorConverter"),
  "qr-generator":        lazyNamed(() => import("./impl/design.jsx"), "QrGenerator"),

  // Productivity (kept)
  "meeting-cost":        lazyNamed(() => import("./impl/productivity.jsx"), "MeetingCost"),
  "timezone-converter":  lazyNamed(() => import("./impl/productivity.jsx"), "TimezoneConverter"),
  "word-counter":        lazyNamed(() => import("./impl/productivity.jsx"), "WordCounter"),
  "stopwatch":           lazyNamed(() => import("./impl/productivity.jsx"), "Stopwatch"),
  "pomodoro":            lazyNamed(() => import("./impl/productivity.jsx"), "Pomodoro"),
  "age-calculator":      lazyNamed(() => import("./impl/productivity.jsx"), "AgeCalculator"),
  "percentage-calc":     lazyNamed(() => import("./impl/productivity.jsx"), "PercentageCalc"),

  // Quick Decisions (NEW — phase 1)
  "random-picker":       lazyNamed(() => import("./impl/decisions.jsx"), "RandomPicker"),
  "coin-flip":           lazyNamed(() => import("./impl/decisions.jsx"), "CoinFlip"),
  "dice-roller":         lazyNamed(() => import("./impl/decisions.jsx"), "DiceRoller"),
  "random-number":       lazyNamed(() => import("./impl/decisions.jsx"), "RandomNumber"),
  "yes-no":              lazyNamed(() => import("./impl/decisions.jsx"), "YesNo"),

  // Games (NEW — phase 1)
  "tic-tac-toe":         lazyNamed(() => import("./impl/games.jsx"), "TicTacToe"),
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
