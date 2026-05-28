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

  // Games — phase 2
  "connect-four":          lazyNamed(() => import("./impl/games.jsx"), "ConnectFour"),
  "rock-paper-scissors":   lazyNamed(() => import("./impl/games.jsx"), "RockPaperScissors"),
  "reaction-time":         lazyNamed(() => import("./impl/games.jsx"), "ReactionTime"),
  "memory-match":          lazyNamed(() => import("./impl/arcade.jsx"), "MemoryMatch"),
  "game-2048":             lazyNamed(() => import("./impl/arcade.jsx"), "Game2048"),
  "snake":                 lazyNamed(() => import("./impl/arcade.jsx"), "Snake"),
  "minesweeper":           lazyNamed(() => import("./impl/arcade.jsx"), "Minesweeper"),
  "wordle":                lazyNamed(() => import("./impl/puzzles.jsx"), "Wordle"),
  "hangman":               lazyNamed(() => import("./impl/puzzles.jsx"), "Hangman"),
  "typing-test":           lazyNamed(() => import("./impl/puzzles.jsx"), "TypingTest"),
  "sudoku":                lazyNamed(() => import("./impl/puzzles.jsx"), "Sudoku"),

  // File & Media — phase 3
  "image-compressor":      lazyNamed(() => import("./impl/file-media.jsx"), "ImageCompressor"),
  "ocr":                   lazyNamed(() => import("./impl/file-media.jsx"), "Ocr"),
  "pdf-splitter":          lazyNamed(() => import("./impl/file-media.jsx"), "PdfSplitter"),
  "pdf-merger":            lazyNamed(() => import("./impl/file-media.jsx"), "PdfMerger"),
  "file-size":             lazyNamed(() => import("./impl/file-media.jsx"), "FileSizeFormatter"),

  // Team & Chat — phase 4
  "mention-formatter":     lazyNamed(() => import("./impl/team-chat.jsx"), "MentionFormatter"),
  "calendar-link":         lazyNamed(() => import("./impl/team-chat.jsx"), "CalendarLink"),
  "recurring-cost":        lazyNamed(() => import("./impl/team-chat.jsx"), "RecurringMeetingCost"),
  "status-builder":        lazyNamed(() => import("./impl/team-chat.jsx"), "StatusBuilder"),
  "standup-picker":        lazyNamed(() => import("./impl/team-chat.jsx"), "StandupPicker"),
  "channel-names":         lazyNamed(() => import("./impl/team-chat.jsx"), "ChannelNameGenerator"),

  // HR — phase 5
  "working-days":          lazyNamed(() => import("./impl/hr.jsx"), "WorkingDays"),
  "vacation-tracker":      lazyNamed(() => import("./impl/hr.jsx"), "VacationTracker"),
  "salary-hourly":         lazyNamed(() => import("./impl/hr.jsx"), "SalaryToHourly"),

  // AI Tools — phase 6 (all call the active configured AI provider)
  "ai-translator":         lazyNamed(() => import("./impl/ai-tools.jsx"), "AiTranslator"),
  "ai-summarizer":         lazyNamed(() => import("./impl/ai-tools.jsx"), "AiSummarizer"),
  "ai-rewriter":           lazyNamed(() => import("./impl/ai-tools.jsx"), "AiRewriter"),
  "ai-reply":              lazyNamed(() => import("./impl/ai-tools.jsx"), "AiReplySuggester"),
  "ai-email":              lazyNamed(() => import("./impl/ai-tools.jsx"), "AiEmailDrafter"),
  "ai-grammar":            lazyNamed(() => import("./impl/ai-tools.jsx"), "AiGrammarCheck"),
  "ai-tone":               lazyNamed(() => import("./impl/ai-tools.jsx"), "AiToneDetector"),
  "ai-jargon":             lazyNamed(() => import("./impl/ai-tools.jsx"), "AiJargonSimplifier"),
  "ai-acronyms":           lazyNamed(() => import("./impl/ai-tools.jsx"), "AiAcronymDecoder"),
  "ai-actions":            lazyNamed(() => import("./impl/ai-tools.jsx"), "AiActionItems"),
  "ai-sentiment":          lazyNamed(() => import("./impl/ai-tools.jsx"), "AiSentiment"),
  "ai-alt-text":           lazyNamed(() => import("./impl/ai-tools.jsx"), "AiAltText"),
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
