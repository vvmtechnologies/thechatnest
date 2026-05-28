// Single source of truth for the in-app tools hub.
// Each tool ships as a lazy-loaded React component under ./impl/
// and is grouped into one of the categories shown on the listing page.

// Categories appear as filter chips on /app/tools. New categories get added
// to this map as later phases ship tools into them (ai, team, file, hr).
export const CATEGORIES = {
  ai:           { label: "AI Tools",         tint: "#6366f1" },
  team:         { label: "Team & Chat",      tint: "#0ea5e9" },
  hr:           { label: "HR & Decision",    tint: "#db2777" },
  file:         { label: "File & Media",     tint: "#0891b2" },
  decisions:    { label: "Quick Decisions",  tint: "#f97316" },
  games:        { label: "Games",            tint: "#22c55e" },
  productivity: { label: "Productivity",     tint: "#a855f7" },
  web:          { label: "Web & Network",    tint: "#0284c7" },
  document:     { label: "Document & Data",  tint: "#2065D1" },
  security:     { label: "Security",         tint: "#16a34a" },
  design:       { label: "Design & Dev",     tint: "#f59e0b" },
};

export const TOOLS = [
  // ── AI Tools ─────────────────────────────────────────────────────
  { slug: "ai-translator",   title: "AI Translator",          desc: "Translate text to any of 30 languages via your configured AI provider.", category: "ai", icon: "PiTranslateDuotone" },
  { slug: "ai-summarizer",   title: "AI Summarizer",          desc: "Paste long text → clean bullet summary.",                                category: "ai", icon: "PiNotePencilDuotone" },
  { slug: "ai-rewriter",     title: "AI Message Rewriter",    desc: "Rewrite messages: Friendly / Formal / Concise / Assertive.",             category: "ai", icon: "PiPencilSimpleLineDuotone" },
  { slug: "ai-reply",        title: "AI Reply Suggester",     desc: "Paste a message → 3 ready-to-send reply suggestions.",                   category: "ai", icon: "PiArrowBendUpLeftDuotone" },
  { slug: "ai-email",        title: "AI Email Drafter",       desc: "Bullet points → polished email with subject line.",                      category: "ai", icon: "PiEnvelopeDuotone" },
  { slug: "ai-grammar",      title: "AI Grammar & Spell",     desc: "Paste text → grammar + spell-corrected version.",                        category: "ai", icon: "PiCheckCircleDuotone" },
  { slug: "ai-tone",         title: "AI Tone Detector",       desc: "See how your message will land + a softer rewrite suggestion.",          category: "ai", icon: "PiSmileyDuotone" },
  { slug: "ai-jargon",       title: "AI Jargon Simplifier",   desc: "Technical text → plain English for non-technical teammates.",            category: "ai", icon: "PiBookOpenDuotone" },
  { slug: "ai-acronyms",     title: "AI Acronym Decoder",     desc: "Find every acronym in text and explain it with context.",                category: "ai", icon: "PiAtDuotone" },
  { slug: "ai-actions",      title: "AI Action Items",        desc: "Meeting notes → list of tasks with owners + due dates.",                 category: "ai", icon: "PiListBulletsDuotone" },
  { slug: "ai-sentiment",    title: "AI Sentiment",           desc: "Analyse the sentiment of a thread or batch of messages.",                category: "ai", icon: "PiSmileySadDuotone" },
  { slug: "ai-alt-text",      title: "AI Alt-Text Writer",     desc: "Describe an image → accessibility-ready alt text (≤120 chars).",         category: "ai", icon: "PiEyeDuotone" },
  // Phase 7B additions
  { slug: "ai-meeting-sum",   title: "AI Meeting Summarizer",  desc: "Transcript → TL;DR + decisions + action items + open questions.",        category: "ai", icon: "PiVideoCameraDuotone" },
  { slug: "ai-jd",            title: "AI Job Description",     desc: "Role brief → polished, inclusive JD with all standard sections.",        category: "ai", icon: "PiBriefcaseMetalDuotone" },
  { slug: "ai-proposal",      title: "AI Proposal Writer",     desc: "Project brief → client-ready proposal with phases + investment.",        category: "ai", icon: "PiSealCheckDuotone" },
  { slug: "ai-newsletter",    title: "AI Newsletter Writer",   desc: "Bullet your updates → scannable, friendly team newsletter.",             category: "ai", icon: "PiNewspaperDuotone" },
  { slug: "ai-pr",            title: "AI Press Release",       desc: "Announcement brief → properly formatted press release.",                 category: "ai", icon: "PiMegaphoneDuotone" },
  { slug: "ai-faq",           title: "AI FAQ Generator",       desc: "Product description → 8–12 Q&A pairs for support / docs.",               category: "ai", icon: "PiQuestionDuotone" },
  { slug: "ai-blog-titles",   title: "AI Blog Title Generator", desc: "Topic → 10 catchy titles in varied styles (listicle, how-to, etc).",     category: "ai", icon: "PiLightbulbFilamentDuotone" },
  { slug: "ai-palette",       title: "AI Color Palette",       desc: "Brand brief → 5-color JSON palette with usage hints.",                   category: "ai", icon: "PiPaletteDuotone" },
  // Phase 8B additions
  { slug: "ai-hashtag",       title: "AI Hashtag Generator",   desc: "Topic → 15 hashtags (popular + niche + brand mix).",                     category: "ai", icon: "PiHashDuotone" },
  { slug: "ai-ig-caption",    title: "AI Instagram Caption",   desc: "Post brief → IG-ready caption with hook, body, CTA, hashtags.",          category: "ai", icon: "PiInstagramLogoDuotone" },
  { slug: "ai-quiz",          title: "AI Quiz Generator",      desc: "Source text → 5-question multiple-choice quiz with explanations.",       category: "ai", icon: "PiExamDuotone" },
  { slug: "ai-code-explain",  title: "AI Code Explainer",      desc: "Paste code → plain-English breakdown for non-engineers.",                category: "ai", icon: "PiCodeBlockDuotone" },
  { slug: "ai-domain",        title: "AI Domain Name Brainstorm", desc: "Product brief → 12 brandable .com name ideas.",                       category: "ai", icon: "PiGlobeSimpleDuotone" },

  // ── Team & Chat ──────────────────────────────────────────────────
  { slug: "spin-the-wheel",     title: "Spin the Wheel",             desc: "Animated wheel of names — visual upgrade to Random Picker.",       category: "team", icon: "PiAtomDuotone" },
  { slug: "truth-or-dare",      title: "Truth or Dare",              desc: "Team-safe truth questions + work-friendly dares.",                 category: "team", icon: "PiQuestionDuotone" },
  { slug: "would-you-rather",   title: "Would You Rather",           desc: "Curated work + life dilemmas for breakout discussions.",           category: "team", icon: "PiArrowsLeftRightDuotone" },
  { slug: "never-have-i-ever",  title: "Never Have I Ever",          desc: "Work-themed confession prompts. Use for retro warm-ups.",          category: "team", icon: "PiHandPalmDuotone" },
  { slug: "emoji-picker",       title: "Emoji Picker",               desc: "Searchable emoji with one-tap copy. 80+ work-relevant emojis.",    category: "team", icon: "PiSmileyMehDuotone" },
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
  { slug: "image-converter",  title: "Image Converter",    desc: "Convert PNG ↔ JPG ↔ WebP, quality slider, side-by-side preview.",     category: "file", icon: "PiArrowsLeftRightDuotone" },
  { slug: "image-resizer",    title: "Image Resizer",      desc: "Exact pixel dimensions with optional aspect-ratio lock.",            category: "file", icon: "PiFrameCornersDuotone" },
  { slug: "social-resizer",   title: "Social Media Image Resizer", desc: "11 presets — Instagram, X, LinkedIn, YouTube thumbnail, OG.",         category: "file", icon: "PiInstagramLogoDuotone" },
  { slug: "image-watermark",  title: "Image Watermark",    desc: "Add text watermark — position, opacity, font size, color.",          category: "file", icon: "PiCopyrightDuotone" },
  { slug: "image-to-pdf",     title: "Image → PDF",        desc: "Multiple images → one PDF, A4/Letter/A5, auto-orientation.",          category: "file", icon: "PiFilePdfDuotone" },
  { slug: "meme-generator",   title: "Meme Generator",     desc: "Top + bottom text overlay on any image — classic Impact font.",      category: "file", icon: "PiSmileyXEyesDuotone" },
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

  // ── Games — extras ───────────────────────────────────────────────
  { slug: "whack-a-mole",     title: "Whack-a-Mole",       desc: "30-second timed reflex game — 3×3 grid, beat your best.",            category: "games", icon: "PiHammerDuotone" },
  { slug: "trivia-quiz",      title: "Trivia Quiz",        desc: "Multiple-choice from Open Trivia DB — 8 categories, 3 difficulties.", category: "games", icon: "PiQuestionDuotone" },

  // ── Web & Network (new — phase 8) ────────────────────────────────
  { slug: "url-shortener",    title: "URL Shortener",      desc: "Shorten long URLs via is.gd, with a history of recent shortens.",     category: "web", icon: "PiLinkSimpleDuotone" },
  { slug: "og-preview",       title: "OG Preview",         desc: "See how a URL will render when shared (title / image / description).", category: "web", icon: "PiBrowsersDuotone" },
  { slug: "public-holidays",  title: "Public Holidays",    desc: "National holidays for 20 countries, current or future year.",         category: "web", icon: "PiCalendarHeartDuotone" },
  { slug: "currency-conv",    title: "Currency Converter", desc: "Live ECB rates via frankfurter.app — 20 currencies.",                 category: "web", icon: "PiCurrencyDollarDuotone" },
  { slug: "website-status",   title: "Website Status",     desc: "Is the site up? Independent check via isitup.org.",                   category: "web", icon: "PiGlobeHemisphereWestDuotone" },
  { slug: "ip-lookup",        title: "IP Address Lookup",  desc: "Geolocation + ISP + ASN for any IP (defaults to yours).",             category: "web", icon: "PiMapPinDuotone" },
  { slug: "browser-info",     title: "Browser & Device Info", desc: "Browser, OS, CPU/RAM, viewport, timezone, user agent — all client-side.", category: "web", icon: "PiDeviceMobileCameraDuotone" },
  { slug: "http-codes",       title: "HTTP Status Codes",  desc: "Searchable reference — click to copy '404 Not Found'.",                category: "web", icon: "PiNumberCircleFourDuotone" },
  { slug: "slug-generator",   title: "Slug Generator",     desc: "Text → URL-safe slug (kebab / snake / dot).",                          category: "web", icon: "PiLinkBreakDuotone" },
  { slug: "yt-thumbnail",     title: "YouTube Thumbnail",  desc: "Extract all thumbnail sizes from any YouTube URL or ID.",              category: "web", icon: "PiYoutubeLogoDuotone" },

  // ── Productivity (kept) ──────────────────────────────────────────
  { slug: "loan-emi",         title: "Loan EMI Calculator", desc: "EMI + total interest from principal, annual rate, months.",          category: "productivity", icon: "PiBankDuotone" },
  { slug: "compound-interest", title: "Compound Interest",  desc: "Lump sum + monthly contributions over N years, any frequency.",      category: "productivity", icon: "PiTrendUpDuotone" },
  { slug: "discount-calc",    title: "Discount Calculator", desc: "Original price × discount % → final price, savings, breakdown.",      category: "productivity", icon: "PiTagDuotone" },
  { slug: "aspect-ratio",     title: "Aspect Ratio Calculator", desc: "Compute ratio, solve for new dimensions at the same ratio.",       category: "productivity", icon: "PiResizeDuotone" },
  { slug: "unit-converter",   title: "Unit Converter",     desc: "Length, weight, volume, area, speed, time, data, temperature.",      category: "productivity", icon: "PiArrowsLeftRightDuotone" },
  { slug: "tip-calculator",   title: "Tip Calculator",     desc: "Bill + tip % + split N ways, with slider for common tips.",          category: "productivity", icon: "PiReceiptDuotone" },
  { slug: "date-difference",  title: "Date Difference",    desc: "Days, weeks, months, hours between any two dates.",                  category: "productivity", icon: "PiCalendarBlankDuotone" },
  { slug: "countdown-timer",  title: "Countdown Timer",    desc: "Live countdown to a target datetime — launches, deadlines.",         category: "productivity", icon: "PiHourglassMediumDuotone" },
  { slug: "meeting-cost",       title: "Meeting Cost Calculator", desc: "See how much your meeting is really costing.",              category: "productivity", icon: "PiCalculatorDuotone" },
  { slug: "timezone-converter", title: "Timezone Converter",      desc: "Find a meeting slot across timezones.",                     category: "productivity", icon: "PiGlobeDuotone" },
  { slug: "word-counter",       title: "Word & Character Counter", desc: "Count words, chars, sentences, reading time.",              category: "productivity", icon: "PiTextAlignLeftDuotone" },
  { slug: "stopwatch",          title: "Stopwatch & Timer",       desc: "Standalone stopwatch and countdown timer.",                 category: "productivity", icon: "PiTimerDuotone" },
  { slug: "pomodoro",           title: "Pomodoro Focus",          desc: "25 / 5 focus cycles with audible cue.",                     category: "productivity", icon: "PiClockCountdownDuotone" },
  { slug: "age-calculator",     title: "Age Calculator",          desc: "Years, months, days between any two dates.",                category: "productivity", icon: "PiBabyDuotone" },
  { slug: "percentage-calc",    title: "Percentage Calculator",   desc: "X% of Y, increase / decrease, ratio between two values.",   category: "productivity", icon: "PiPercentDuotone" },
];

export const findTool = (slug) => TOOLS.find((t) => t.slug === slug) || null;
