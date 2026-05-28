import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Card,
  CardActionArea,
  IconButton,
} from "@mui/material";
import {
  PiToolboxDuotone,
  PiMagnifyingGlassDuotone,
  PiXBold,
  PiCaretRightBold,
  PiTableDuotone,
  PiMarkdownLogoDuotone,
  PiTextAaDuotone,
  PiShieldCheckDuotone,
  PiPaintBrushDuotone,
  PiQrCodeDuotone,
  PiCalculatorDuotone,
  PiGlobeDuotone,
  PiTextAlignLeftDuotone,
  PiTextAaBold,
  PiTimerDuotone,
  PiClockCountdownDuotone,
  PiBabyDuotone,
  PiPercentDuotone,
  PiHashDuotone,
  // ── Phase 1 additions ─────────────────────────────────────────────
  PiShuffleDuotone,
  PiCoinDuotone,
  PiDiceFiveDuotone,
  PiQuestionDuotone,
  PiGameControllerDuotone,
  // ── Phase 2 additions (games) ─────────────────────────────────────
  PiCirclesFourDuotone,
  PiHandFistDuotone,
  PiCardsDuotone,
  PiSquaresFourDuotone,
  PiCircuitryDuotone,
  PiGridFourDuotone,
  PiTextTDuotone,
  PiPersonSimpleDuotone,
  PiKeyboardDuotone,
  PiLightningDuotone,
  PiGridNineDuotone,
  // ── Phase 3 additions (file & media) ──────────────────────────────
  PiImageDuotone,
  PiTextboxDuotone,
  PiSplitHorizontalDuotone,
  PiArrowsInDuotone,
  PiFileDuotone,
  // ── Phase 4 additions (team & chat) ───────────────────────────────
  PiCalendarPlusDuotone,
  PiChartLineUpDuotone,
  PiListChecksDuotone,
  PiChatTeardropDotsDuotone,
  PiHashStraightDuotone,
  // ── Phase 5 additions (HR) ────────────────────────────────────────
  PiBriefcaseDuotone,
  PiSunDuotone,
  PiMoneyDuotone,
  // ── Phase 6 additions (AI) ────────────────────────────────────────
  PiTranslateDuotone,
  PiNotePencilDuotone,
  PiPencilSimpleLineDuotone,
  PiArrowBendUpLeftDuotone,
  PiEnvelopeDuotone,
  PiCheckCircleDuotone,
  PiSmileyDuotone,
  PiBookOpenDuotone,
  PiAtDuotone,
  PiListBulletsDuotone,
  PiSmileySadDuotone,
  PiEyeDuotone,
  // ── Phase 7A additions ────────────────────────────────────────────
  PiAtomDuotone,
  PiArrowsLeftRightDuotone,
  PiHandPalmDuotone,
  PiSmileyMehDuotone,
  PiFrameCornersDuotone,
  PiInstagramLogoDuotone,
  PiCopyrightDuotone,
  PiFilePdfDuotone,
  PiSmileyXEyesDuotone,
  PiHammerDuotone,
  PiReceiptDuotone,
  PiCalendarBlankDuotone,
  PiHourglassMediumDuotone,
  // ── Phase 7B additions (more AI tools) ────────────────────────────
  PiVideoCameraDuotone,
  PiBriefcaseMetalDuotone,
  PiSealCheckDuotone,
  PiNewspaperDuotone,
  PiMegaphoneDuotone,
  PiLightbulbFilamentDuotone,
  PiPaletteDuotone,
} from "react-icons/pi";
import { TOOLS, CATEGORIES } from "./registry.js";

const ICON_MAP = {
  PiTableDuotone,
  PiMarkdownLogoDuotone,
  PiTextAaDuotone,
  PiShieldCheckDuotone,
  PiPaintBrushDuotone,
  PiQrCodeDuotone,
  PiCalculatorDuotone,
  PiGlobeDuotone,
  PiTextAlignLeftDuotone,
  PiTextAaBold,
  PiTimerDuotone,
  PiClockCountdownDuotone,
  PiBabyDuotone,
  PiPercentDuotone,
  PiHashDuotone,
  PiShuffleDuotone,
  PiCoinDuotone,
  PiDiceFiveDuotone,
  PiQuestionDuotone,
  PiGameControllerDuotone,
  PiCirclesFourDuotone,
  PiHandFistDuotone,
  PiCardsDuotone,
  PiSquaresFourDuotone,
  PiCircuitryDuotone,
  PiGridFourDuotone,
  PiTextTDuotone,
  PiPersonSimpleDuotone,
  PiKeyboardDuotone,
  PiLightningDuotone,
  PiGridNineDuotone,
  PiImageDuotone,
  PiTextboxDuotone,
  PiSplitHorizontalDuotone,
  PiArrowsInDuotone,
  PiFileDuotone,
  PiCalendarPlusDuotone,
  PiChartLineUpDuotone,
  PiListChecksDuotone,
  PiChatTeardropDotsDuotone,
  PiHashStraightDuotone,
  PiBriefcaseDuotone,
  PiSunDuotone,
  PiMoneyDuotone,
  PiTranslateDuotone,
  PiNotePencilDuotone,
  PiPencilSimpleLineDuotone,
  PiArrowBendUpLeftDuotone,
  PiEnvelopeDuotone,
  PiCheckCircleDuotone,
  PiSmileyDuotone,
  PiBookOpenDuotone,
  PiAtDuotone,
  PiListBulletsDuotone,
  PiSmileySadDuotone,
  PiEyeDuotone,
  PiAtomDuotone,
  PiArrowsLeftRightDuotone,
  PiHandPalmDuotone,
  PiSmileyMehDuotone,
  PiFrameCornersDuotone,
  PiInstagramLogoDuotone,
  PiCopyrightDuotone,
  PiFilePdfDuotone,
  PiSmileyXEyesDuotone,
  PiHammerDuotone,
  PiReceiptDuotone,
  PiCalendarBlankDuotone,
  PiHourglassMediumDuotone,
  PiVideoCameraDuotone,
  PiBriefcaseMetalDuotone,
  PiSealCheckDuotone,
  PiNewspaperDuotone,
  PiMegaphoneDuotone,
  PiLightbulbFilamentDuotone,
  PiPaletteDuotone,
};

const ToolsHub = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      if (activeCategory !== "all" && t.category !== activeCategory) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.slug.includes(q)
      );
    });
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      (map[t.category] = map[t.category] || []).push(t);
    });
    return map;
  }, [filtered]);

  return (
    <Box
      sx={(theme) => ({
        flex: 1,
        height: "100%",
        overflow: "auto",
        backgroundColor: theme.palette.background.default,
      })}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3.5 } }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ mb: 0.5 }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              background: "linear-gradient(135deg, #2065D1, #1e3a8a)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 22px rgba(32,101,209,0.35)",
            }}
          >
            <PiToolboxDuotone size={24} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.015em",
                lineHeight: 1.1,
                color: "text.primary",
              }}
            >
              Tools
            </Typography>
            <Typography color="text.secondary" fontSize={13.5}>
              {TOOLS.length} utilities — converters, generators, calculators. Runs locally in your browser.
            </Typography>
          </Box>
        </Stack>

        {/* Search + filters */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 3, mb: 3 }}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search tools by name or what they do…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ maxWidth: { sm: 420 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PiMagnifyingGlassDuotone size={16} />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setQuery("")} aria-label="Clear search">
                    <PiXBold size={12} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Chip
              label="All"
              size="small"
              variant={activeCategory === "all" ? "filled" : "outlined"}
              color={activeCategory === "all" ? "primary" : "default"}
              onClick={() => setActiveCategory("all")}
              sx={{ fontWeight: 600, cursor: "pointer" }}
            />
            {Object.entries(CATEGORIES).map(([key, c]) => (
              <Chip
                key={key}
                label={c.label}
                size="small"
                variant={activeCategory === key ? "filled" : "outlined"}
                onClick={() => setActiveCategory(key)}
                sx={{
                  fontWeight: 600,
                  cursor: "pointer",
                  ...(activeCategory === key
                    ? { bgcolor: c.tint, color: "#fff", borderColor: c.tint }
                    : { borderColor: `${c.tint}55`, color: c.tint }),
                }}
              />
            ))}
          </Stack>
        </Stack>

        {/* Tools grid grouped by category */}
        {filtered.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">
              No tools matched <strong>"{query}"</strong>. Try a different keyword.
            </Typography>
          </Box>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <Box key={cat} sx={{ mb: 4 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1.25 }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 16,
                    borderRadius: 0.5,
                    bgcolor: CATEGORIES[cat].tint,
                  }}
                />
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 800,
                    color: "text.secondary",
                    letterSpacing: 0.6,
                  }}
                >
                  {CATEGORIES[cat].label}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  · {items.length}
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1fr 1fr 1fr",
                    lg: "1fr 1fr 1fr 1fr",
                  },
                  gap: 1.25,
                }}
              >
                {items.map((t) => {
                  const Icon = ICON_MAP[t.icon] || PiToolboxDuotone;
                  const tint = CATEGORIES[t.category].tint;
                  return (
                    <Card
                      key={t.slug}
                      sx={(theme) => ({
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: "background.paper",
                        transition: "all 0.18s ease",
                        "&:hover": {
                          borderColor: tint,
                          transform: "translateY(-2px)",
                          boxShadow: `0 10px 24px ${tint}26`,
                        },
                      })}
                    >
                      <CardActionArea
                        onClick={() => navigate(`/app/tools/${t.slug}`)}
                        sx={{ p: 1.75, borderRadius: 2, height: "100%" }}
                      >
                        <Stack direction="row" spacing={1.25} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: 1.25,
                              bgcolor: `${tint}14`,
                              color: tint,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={20} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              spacing={0.5}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  letterSpacing: "-0.005em",
                                  color: "text.primary",
                                  lineHeight: 1.2,
                                }}
                              >
                                {t.title}
                              </Typography>
                              <PiCaretRightBold size={12} style={{ color: "var(--mui-palette-text-disabled, #9ca3af)" }} />
                            </Stack>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.25, lineHeight: 1.5 }}
                            >
                              {t.desc}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardActionArea>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default ToolsHub;
