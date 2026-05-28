// Single source of truth for the in-app tools hub.
// Each tool ships as a lazy-loaded React component under ./impl/
// and is grouped into one of the categories shown on the listing page.

// Categories appear as filter chips on /app/tools. New categories get added
// to this map as later phases ship tools into them (ai, team, file, hr).
export const CATEGORIES = {
  team:         { label: "Team & Chat",      tint: "#0ea5e9" },
  hr:           { label: "HR & Decision",    tint: "#db2777" },
  file:         { label: "File & Media",     tint: "#0891b2" },
  decisions:    { label: "Quick Decisions",  tint: "#f97316" },
  games:        { label: "Games",            tint: "#22c55e" },
  productivity: { label: "Productivity",     tint: "#a855f7" },
  document:     { label: "Document & Data",  tint: "#2065D1" },
  security:     { label: "Security",         tint: "#16a34a" },
  design:       { label: "Design & Dev",     tint: "#f59e0b" },
};

export const TOOLS = [
  // ── Team & Chat ──────────────────────────────────────────────────
  { slug: "mention-formatter",  title: "Mention/Markdown Formatter", desc: "Bold, italic, code blocks, lists — pick a style, copy to chat.",  category: "team", icon: "PiTextAaDuotone" },
  { slug: "calendar-link",      title: "Calendar Link Generator",    desc: "Google Cal / Outlook links + downloadable .ics, share in chat.",   category: "team", icon: "PiCalendarPlusDuotone" },
  { slug: "recurring-cost",     title: "Recurring Meeting Cost",     desc: "Frequency-aware cost breakdown: per occurrence / month / year.",   category: "team", icon: "PiChartLineUpDuotone" },
  { slug: "status-builder",     title: "Status Update Builder",      desc: "Yesterday / Today / Blockers template with mood and markdown.",    category: "team", icon: "PiListChecksDuotone" },
  { slug: "standup-picker",     title: "Standup Question Picker",    desc: "Random thoughtful standup question or team ice-breaker.",          category: "team", icon: "PiChatTeardropDotsDuotone" },
  { slug: "channel-names",      title: "Channel Name Generator",     desc: "Seed keywords → 10 channel name suggestions (kebab/snake/camel).", category: "team", icon: "PiHashStraightDuotone" },

  // ── HR & Decision ────────────────────────────────────────────────
  { slug: "working-days",     title: "Working Days Calculator",   desc: "Business days between dates, skip weekends + your holiday list.",  category: "hr", icon: "PiBriefcaseDuotone" },
  { slug: "vacation-tracker", title: "Vacation Day Tracker",      desc: "PTO balance based on accrual, carry-over, used + pending.",        category: "hr", icon: "PiSunDuotone" },
  { slug: "salary-hourly",    title: "Salary → Hourly Converter", desc: "Annual salary → minute / hour / day / week / month equivalent.",   category: "hr", icon: "PiMoneyDuotone" },

  // ── File & Media ─────────────────────────────────────────────────
  { slug: "image-compressor", title: "Image Compressor",  desc: "Drop an image, resize + re-encode to JPEG, download smaller version.", category: "file", icon: "PiImageDuotone" },
  { slug: "ocr",              title: "Image → Text (OCR)", desc: "Extract text from screenshots & scans, 8 languages. Runs locally.",  category: "file", icon: "PiTextboxDuotone" },
  { slug: "pdf-splitter",     title: "PDF Splitter",       desc: "Split a PDF by page ranges, or one PDF per page.",                    category: "file", icon: "PiSplitHorizontalDuotone" },
  { slug: "pdf-merger",       title: "PDF Merger",         desc: "Combine multiple PDFs into one. Drag to reorder.",                    category: "file", icon: "PiArrowsInDuotone" },
  { slug: "file-size",        title: "File Size Formatter", desc: "Convert bytes ↔ KB / MB / GB / TB and back.",                         category: "file", icon: "PiFileDuotone" },

  // ── Quick Decisions ──────────────────────────────────────────────
  { slug: "random-picker",  title: "Random Picker",       desc: "Paste a list, draw a random winner (retros, lottery, raffles).",  category: "decisions", icon: "PiShuffleDuotone" },
  { slug: "coin-flip",      title: "Coin Flip",           desc: "Animated heads or tails with history.",                            category: "decisions", icon: "PiCoinDuotone" },
  { slug: "dice-roller",    title: "Dice Roller",         desc: "Roll 1–10 dice with 4–100 sides each.",                            category: "decisions", icon: "PiDiceFiveDuotone" },
  { slug: "random-number",  title: "Random Number",       desc: "Pick numbers in any range, with or without duplicates.",           category: "decisions", icon: "PiHashDuotone" },
  { slug: "yes-no",         title: "Yes or No",           desc: "Magic 8-ball style decision for the indecisive.",                  category: "decisions", icon: "PiQuestionDuotone" },

  // ── Games ────────────────────────────────────────────────────────
  { slug: "tic-tac-toe",       title: "Tic Tac Toe",         desc: "Play vs a perfect AI (minimax) or pass-and-play with a teammate.", category: "games", icon: "PiGameControllerDuotone" },
  { slug: "connect-four",      title: "Connect 4",            desc: "Drop discs vs an AI (negamax, alpha-beta) — easy / medium / hard.", category: "games", icon: "PiCirclesFourDuotone" },
  { slug: "rock-paper-scissors", title: "Rock Paper Scissors", desc: "vs an AI that learns your patterns over rounds.",                  category: "games", icon: "PiHandFistDuotone" },
  { slug: "memory-match",      title: "Memory Match",         desc: "Flip cards, find pairs — 6/9/12 pair difficulty.",                 category: "games", icon: "PiCardsDuotone" },
  { slug: "game-2048",         title: "2048",                 desc: "Slide and merge tiles, aim for 2048.",                             category: "games", icon: "PiSquaresFourDuotone" },
  { slug: "snake",             title: "Snake",                desc: "Classic snake — eat the food, don't bite yourself.",               category: "games", icon: "PiCircuitryDuotone" },
  { slug: "minesweeper",       title: "Minesweeper",          desc: "Reveal cells without hitting a mine — 3 board sizes.",             category: "games", icon: "PiGridFourDuotone" },
  { slug: "wordle",            title: "Wordle",               desc: "Guess the 5-letter word in 6 tries. Copy result to chat.",         category: "games", icon: "PiTextTDuotone" },
  { slug: "hangman",           title: "Hangman",              desc: "Guess the word before you run out of lives. Tech / animals / movies.", category: "games", icon: "PiPersonSimpleDuotone" },
  { slug: "typing-test",       title: "Typing Speed Test",    desc: "WPM + accuracy on async-work paragraphs. Compete with teammates.", category: "games", icon: "PiKeyboardDuotone" },
  { slug: "reaction-time",     title: "Reaction Time",        desc: "Click when green — measure your reflexes in milliseconds.",        category: "games", icon: "PiLightningDuotone" },
  { slug: "sudoku",            title: "Sudoku",               desc: "Classic 9×9 puzzle, 3 difficulties, hint button.",                 category: "games", icon: "PiGridNineDuotone" },

  // ── Document & Data (kept) ───────────────────────────────────────
  { slug: "markdown-html",  title: "Markdown ↔ HTML",     desc: "Convert between markdown and rendered HTML.",                      category: "document", icon: "PiMarkdownLogoDuotone" },
  { slug: "json-to-csv",    title: "JSON → CSV",          desc: "Flatten JSON arrays into CSV rows for member imports.",            category: "document", icon: "PiTableDuotone" },
  { slug: "csv-to-json",    title: "CSV → JSON",          desc: "Parse CSV into structured JSON.",                                  category: "document", icon: "PiTableDuotone" },
  { slug: "case-converter", title: "Case Converter",      desc: "UPPER, lower, Title, snake, kebab, camel.",                        category: "document", icon: "PiTextAaBold" },
  { slug: "lorem-ipsum",    title: "Lorem Ipsum",         desc: "Generate filler text by words, sentences, or paragraphs.",         category: "document", icon: "PiTextAaDuotone" },

  // ── Security (kept) ──────────────────────────────────────────────
  { slug: "password-generator", title: "Password Generator", desc: "Generate strong, crypto-random passwords.",                     category: "security", icon: "PiShieldCheckDuotone" },

  // ── Design (kept) ────────────────────────────────────────────────
  { slug: "color-converter", title: "Color Converter",    desc: "Pick a color, convert between HEX, RGB, HSL.",                     category: "design", icon: "PiPaintBrushDuotone" },
  { slug: "qr-generator",    title: "QR Code Generator",  desc: "Create scannable QR codes for any URL or text.",                   category: "design", icon: "PiQrCodeDuotone" },

  // ── Productivity (kept) ──────────────────────────────────────────
  { slug: "meeting-cost",       title: "Meeting Cost Calculator", desc: "See how much your meeting is really costing.",              category: "productivity", icon: "PiCalculatorDuotone" },
  { slug: "timezone-converter", title: "Timezone Converter",      desc: "Find a meeting slot across timezones.",                     category: "productivity", icon: "PiGlobeDuotone" },
  { slug: "word-counter",       title: "Word & Character Counter", desc: "Count words, chars, sentences, reading time.",              category: "productivity", icon: "PiTextAlignLeftDuotone" },
  { slug: "stopwatch",          title: "Stopwatch & Timer",       desc: "Standalone stopwatch and countdown timer.",                 category: "productivity", icon: "PiTimerDuotone" },
  { slug: "pomodoro",           title: "Pomodoro Focus",          desc: "25 / 5 focus cycles with audible cue.",                     category: "productivity", icon: "PiClockCountdownDuotone" },
  { slug: "age-calculator",     title: "Age Calculator",          desc: "Years, months, days between any two dates.",                category: "productivity", icon: "PiBabyDuotone" },
  { slug: "percentage-calc",    title: "Percentage Calculator",   desc: "X% of Y, increase / decrease, ratio between two values.",   category: "productivity", icon: "PiPercentDuotone" },
];

export const findTool = (slug) => TOOLS.find((t) => t.slug === slug) || null;
