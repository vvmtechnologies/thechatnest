import React, { useMemo, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Drawer,
  Button,
  InputAdornment,
  Chip,
  Box,
} from "@mui/material";
import {
  PiCaretDown,
  PiFunnelSimple,
  PiMagnifyingGlass,
  PiBookOpenDuotone,
} from "react-icons/pi";

// Comprehensive FAQ catalog — real product behavior, written like a human.
// Categories align with the product surfaces in the app.
const FAQS = [
  // ── Getting Started ─────────────────────────────────────────────
  {
    feature: "Getting Started",
    q: "How do I create my TheChatNest workspace?",
    a: "Visit thechatnest.com, click Free trial, enter your work email, and verify with the OTP we send. Your workspace is provisioned in under 30 seconds — no credit card required.",
  },
  {
    feature: "Getting Started",
    q: "How do I invite teammates after signup?",
    a: "Open the Admin panel → Users → Add User. You can invite one by one or upload a CSV with name, email, role and department in one shot. Each invitee receives a magic-link email.",
  },
  {
    feature: "Getting Started",
    q: "What's the difference between Owner, Admin, and User roles?",
    a: "Owner has billing + full workspace control. Admin manages users, groups, and settings but not billing. User is a regular member. You can also create custom Department Admins with scoped permissions.",
  },
  {
    feature: "Getting Started",
    q: "Is there a free trial? Do I need to enter a card?",
    a: "Yes — 14 days, full feature access, zero credit card. You'll get a reminder 3 days before the trial ends.",
  },

  // ── Account & Login ─────────────────────────────────────────────
  {
    feature: "Account & Login",
    q: "I forgot my password — how do I reset it?",
    a: "On the login screen click Forgot password. Enter your email, we'll send a 6-digit code valid for 10 minutes, then you can set a new password.",
  },
  {
    feature: "Account & Login",
    q: "Can I log in with Face ID / fingerprint?",
    a: "Yes — on iOS and Android, after your first login, enable Biometric in Settings → Security. Trusted devices can skip OTP on subsequent logins.",
  },
  {
    feature: "Account & Login",
    q: "How do I scan a QR code to log in?",
    a: "On the web login page, click 'Login via QR Code'. A QR appears. Open the mobile app, tap menu → Linked Devices → Scan QR. Done in 2 seconds.",
  },
  {
    feature: "Account & Login",
    q: "How many devices can I log into simultaneously?",
    a: "Up to 3 active sessions per user by default. You can manage and revoke devices any time from Settings → Trusted Devices.",
  },

  // ── Messaging ───────────────────────────────────────────────────
  {
    feature: "Messaging",
    q: "How do I format text in messages?",
    a: "Use the toolbar above the composer for bold, italic, underline, and code. You can also use markdown shortcuts — **bold**, *italic*, `code`, and our Preview button shows you how it'll render before you send.",
  },
  {
    feature: "Messaging",
    q: "Can I send a message and have it delete itself later?",
    a: "Yes. In any chat, open the conversation header → Disappearing Messages → pick a timer (1 hr, 24 hr, 7 days, custom). New messages auto-delete after that.",
  },
  {
    feature: "Messaging",
    q: "How do I schedule a message for later?",
    a: "Type your message, click the clock icon in the toolbar, pick date and time, and Send. It'll deliver at the chosen moment — even if you're offline.",
  },
  {
    feature: "Messaging",
    q: "How does Broadcast work?",
    a: "Open the ⋯ menu above the chat list → Broadcast. Pick recipients (users, groups, or both), type your message, attach files if needed, and send. Everyone receives it as a 1-on-1 message — replies stay private.",
  },
  {
    feature: "Messaging",
    q: "What's the max file size I can send?",
    a: "Up to 2 GB per file. Documents, images, video, audio — all welcome. Files are encrypted at rest and you can preview most formats inline.",
  },
  {
    feature: "Messaging",
    q: "Can I edit or unsend a message after I send it?",
    a: "Yes. Long-press (or right-click) any message you sent → Edit or Delete. Edited messages show an 'edited' label. Deleted messages remove for everyone, with a 'Message deleted' placeholder.",
  },

  // ── Groups ──────────────────────────────────────────────────────
  {
    feature: "Groups",
    q: "How do I create a group?",
    a: "Click the + button above the chat list → Create Group. Add a name, optional icon, then pick members. You can also create groups by department for automatic membership.",
  },
  {
    feature: "Groups",
    q: "What's the max group size?",
    a: "Standard plan: 100 members per group. Premium: 500. Enterprise: unlimited. Performance stays smooth across all tiers because we use server-side fan-out.",
  },
  {
    feature: "Groups",
    q: "Can I make a group read-only / announcement-only?",
    a: "Yes — group admin → Settings → who can send messages → Admins only. Useful for company-wide announcements.",
  },
  {
    feature: "Groups",
    q: "How do I leave or delete a group?",
    a: "Any member: open the group → top-right menu → Exit Group. Group admins: same menu → Delete Group (removes for everyone, irreversible).",
  },

  // ── Meetings & Calls ────────────────────────────────────────────
  {
    feature: "Meetings & Calls",
    q: "How do I start a meeting?",
    a: "From the sidebar, click Meeting. Choose Instant (start now), Schedule (pick a date/time), or Join (paste a meeting ID). Each meeting has a unique join URL you can share via QR or copy.",
  },
  {
    feature: "Meetings & Calls",
    q: "Can I record a meeting?",
    a: "Yes — host clicks Record in the meeting controls. Recording is saved to the host's My Recordings folder and can be shared back to chat with one click.",
  },
  {
    feature: "Meetings & Calls",
    q: "How does the Waiting Room work?",
    a: "When enabled, joiners land in a waiting screen until the host admits them. Useful for client calls, interviews, and gated meetings.",
  },
  {
    feature: "Meetings & Calls",
    q: "What's the max meeting duration?",
    a: "No hard limit on paid plans. Free trial: 40 minutes per meeting (you can rejoin instantly).",
  },

  // ── AI Features ─────────────────────────────────────────────────
  {
    feature: "AI Features",
    q: "How do I use the AI Tone Adjuster?",
    a: "Type your message, click the AI Magic Wand icon → Adjust Tone. Pick Formal, Friendly, or Diplomatic. The AI rewrites in place. Accept or keep editing.",
  },
  {
    feature: "AI Features",
    q: "Is Smart Compose available for everyone?",
    a: "Yes, on all paid plans. As you type, AI suggests the next phrase in light grey. Press Tab to accept, keep typing to ignore.",
  },
  {
    feature: "AI Features",
    q: "Can the AI summarize a long thread?",
    a: "Yes — open any thread → top-right menu → AI Summarize. You'll get the gist, key decisions, and action items in 3-5 bullet points.",
  },
  {
    feature: "AI Features",
    q: "Which languages does Auto-Translate support?",
    a: "14 languages including English, Hindi, Spanish, French, German, Portuguese, Japanese, Korean, Chinese (Simplified), Arabic, Russian, Turkish, Italian, and Dutch.",
  },

  // ── Privacy & Security ──────────────────────────────────────────
  {
    feature: "Privacy & Security",
    q: "How do I lock individual chats behind a PIN?",
    a: "Settings → Security → Set chat PIN (4 digits). Then in any chat, top-right menu → Lock chat. Even on a shared device, locked chats stay hidden until you enter the PIN.",
  },
  {
    feature: "Privacy & Security",
    q: "Are my messages encrypted?",
    a: "Yes — AES-256-GCM at rest, TLS 1.3 in transit. End-to-end encryption is also available on Enterprise plans.",
  },
  {
    feature: "Privacy & Security",
    q: "How do I enable 2FA?",
    a: "Settings → Security → Two-Factor Authentication → choose Authenticator App (Google / Authy / 1Password). Scan the QR, enter the 6-digit code, and you're set.",
  },
  {
    feature: "Privacy & Security",
    q: "Can I see who's logged into my account?",
    a: "Settings → Trusted Devices shows every active session with device name, OS, IP, and last activity. You can revoke any session with one click.",
  },

  // ── Notifications ───────────────────────────────────────────────
  {
    feature: "Notifications",
    q: "How do I customize notification sounds?",
    a: "Settings → Notifications → Sounds. Pick from 8 built-in tones or upload your own. You can also set different sounds for different chats from each chat's settings.",
  },
  {
    feature: "Notifications",
    q: "How do I set Do Not Disturb hours?",
    a: "Settings → Notifications → Do Not Disturb. Set quiet hours (e.g., 8 PM - 8 AM). Notifications pause but you'll see a digest summary when DND lifts.",
  },
  {
    feature: "Notifications",
    q: "Why am I not receiving push notifications?",
    a: "Check: (1) OS notification permission for TheChatNest, (2) Settings → Notifications is enabled, (3) the chat isn't muted, (4) DND isn't active. If all OK, try logging out and back in to refresh the device token.",
  },

  // ── Admin ───────────────────────────────────────────────────────
  {
    feature: "Admin & Management",
    q: "How do I bulk-import users via CSV?",
    a: "Admin → Users → Add User → Bulk Upload. Download our template (name, email, role, department, designation). Fill it, upload, review the preview, confirm. Auto-sends invites.",
  },
  {
    feature: "Admin & Management",
    q: "How do I set up departments?",
    a: "Admin → Departments → Add. Each department can have its own admins, default channels, and member-add rules. Useful for HR / Engineering / Sales separation.",
  },
  {
    feature: "Admin & Management",
    q: "Can I export all chat history for compliance?",
    a: "Yes — Owner / Super Admin only. Admin → Export → Workspace History → choose date range and format (JSON / CSV). Encrypted ZIP delivered by email.",
  },
  {
    feature: "Admin & Management",
    q: "How do I check OTP logs?",
    a: "Super Admin only — Admin → OTP Logs. See every OTP issued, attempts, IP, device, success/failure. Great for forensics and compliance audits.",
  },

  // ── Billing ─────────────────────────────────────────────────────
  {
    feature: "Billing",
    q: "How do I upgrade my plan?",
    a: "Admin → Billing → Change Plan. Pick a tier, confirm, pay via Stripe (cards, UPI, NetBanking) or PayPal. Upgrade is instant; new license count applies immediately.",
  },
  {
    feature: "Billing",
    q: "Can I get a refund?",
    a: "Yes — within 14 days of the original payment for first-time subscribers, no questions asked. See /refund-policy for the full terms. Email billing@thechatnest.com to start.",
  },
  {
    feature: "Billing",
    q: "How do I download invoices?",
    a: "Admin → Billing → Payment History → click any entry → Download Invoice. Every invoice has GST details, address, and the unique INV-TCN ID for accounting.",
  },
  {
    feature: "Billing",
    q: "Do prices change when I add more users?",
    a: "You pay per active seat. Adding a seat mid-cycle is prorated based on remaining days. Removing one credits the unused portion to your next invoice.",
  },

  // ── Mobile App ──────────────────────────────────────────────────
  {
    feature: "Mobile App",
    q: "Where can I download the mobile app?",
    a: "iOS on the App Store, Android on Google Play — search 'TheChatNest'. Or visit thechatnest.com/downloads for direct links.",
  },
  {
    feature: "Mobile App",
    q: "How does swipe-to-reply work?",
    a: "On any message, swipe right (or left if you're a leftie). The composer auto-fills with a reply quote. Haptic feedback confirms the swipe.",
  },
  {
    feature: "Mobile App",
    q: "Can I use TheChatNest offline?",
    a: "Yes — read messages cached on your device. Compose new messages and they queue locally. The moment you reconnect, the queue flushes with retry logic. No data loss.",
  },
];

const ALL_FEATURES = Array.from(new Set(FAQS.map((f) => f.feature)));

const Faq = () => {
  const [selectedFeature, setSelectedFeature] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredFeatures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_FEATURES;
    return ALL_FEATURES.filter((f) => f.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredFAQs = useMemo(() => {
    let base = FAQS;
    if (selectedFeature !== "All") {
      base = base.filter((f) => f.feature === selectedFeature);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      base = base.filter(
        (f) =>
          f.q.toLowerCase().includes(q) ||
          f.a.toLowerCase().includes(q) ||
          f.feature.toLowerCase().includes(q)
      );
    }
    return base;
  }, [selectedFeature, searchQuery]);

  const countFor = (feat) =>
    feat === "All" ? FAQS.length : FAQS.filter((f) => f.feature === feat).length;

  const renderFilterContent = () => (
    <Paper
      elevation={0}
      sx={(t) => ({
        width: "100%",
        p: 1.5,
        borderRadius: 2,
        backgroundColor: t.palette.mode === "light" ? "#fafbff" : "rgba(255,255,255,0.04)",
        border: `1px solid ${t.palette.divider}`,
      })}
    >
      <TextField
        variant="outlined"
        size="small"
        fullWidth
        placeholder="Search FAQs…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PiMagnifyingGlass size={16} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1.5 }}
      />

      <List dense disablePadding>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedFeature === "All"}
            onClick={() => {
              setSelectedFeature("All");
              setDrawerOpen(false);
            }}
            sx={(t) => ({
              borderRadius: 1.5,
              mb: 0.5,
              "&.Mui-selected": {
                backgroundColor: "rgba(32,101,209,0.1)",
                color: "#2065D1",
                "& .MuiListItemText-secondary": { color: "#2065D1", fontWeight: 700 },
              },
            })}
          >
            <ListItemText
              primary="All"
              secondary={`${FAQS.length}`}
              primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
              secondaryTypographyProps={{ fontSize: 11, fontWeight: 600 }}
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: 0 }}
            />
          </ListItemButton>
        </ListItem>
        {filteredFeatures.map((feature) => {
          const isSelected = selectedFeature === feature;
          return (
            <ListItem key={feature} disablePadding>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  setSelectedFeature(feature);
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: "rgba(32,101,209,0.1)",
                    color: "#2065D1",
                    "& .MuiListItemText-secondary": { color: "#2065D1", fontWeight: 700 },
                  },
                }}
              >
                <ListItemText
                  primary={feature}
                  secondary={`${countFor(feature)}`}
                  primaryTypographyProps={{ fontSize: 13.5, fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: 11, fontWeight: 600 }}
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: 0, gap: 1 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );

  return (
    <Box sx={{ display: "flex", gap: 2.5, position: "relative" }}>
      {/* Mobile filter button */}
      <Button
        variant="contained"
        size="small"
        startIcon={<PiFunnelSimple size={16} />}
        sx={{
          display: { md: "none" },
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 2,
        }}
        onClick={() => setDrawerOpen(true)}
      >
        Topics
      </Button>

      {/* Sidebar */}
      <Box sx={{ width: 260, flexShrink: 0, display: { xs: "none", md: "block" } }}>
        {renderFilterContent()}
      </Box>

      {/* Drawer for mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ "& .MuiDrawer-paper": { width: 280, p: 2 } }}
      >
        {renderFilterContent()}
      </Drawer>

      {/* FAQ content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Result header */}
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PiBookOpenDuotone size={18} style={{ color: "#2065D1" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {selectedFeature}
            </Typography>
            <Chip
              size="small"
              label={`${filteredFAQs.length} ${filteredFAQs.length === 1 ? "answer" : "answers"}`}
              sx={{ bgcolor: "rgba(32,101,209,0.1)", color: "#2065D1", fontWeight: 700, fontSize: 11 }}
            />
          </Box>
        </Box>

        {filteredFAQs.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              No FAQs matched your filter.
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setSelectedFeature("All");
                setSearchQuery("");
              }}
            >
              Clear filters
            </Button>
          </Box>
        ) : (
          filteredFAQs.map((faq, index) => (
            <Accordion
              key={`${faq.feature}-${index}`}
              expanded={expandedAccordion === index}
              onChange={() => setExpandedAccordion(expandedAccordion === index ? null : index)}
              elevation={0}
              sx={(t) => ({
                mb: 1,
                borderRadius: "12px !important",
                border: `1px solid ${t.palette.divider}`,
                "&:before": { display: "none" },
                "&.Mui-expanded": { borderColor: "#2065D1" },
              })}
            >
              <AccordionSummary
                expandIcon={<PiCaretDown size={18} />}
                sx={(t) => ({
                  borderRadius: "12px",
                  bgcolor: expandedAccordion === index
                    ? (t.palette.mode === "light" ? "rgba(32,101,209,0.06)" : "rgba(32,101,209,0.12)")
                    : "transparent",
                  "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1, my: 1.25 },
                })}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 10,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      color: "text.secondary",
                      mb: 0.25,
                    }}
                  >
                    {faq.feature}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: expandedAccordion === index ? "#2065D1" : "text.primary",
                      lineHeight: 1.4,
                    }}
                  >
                    {faq.q}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails
                sx={(t) => ({
                  bgcolor: t.palette.mode === "light" ? "#fafbff" : "rgba(255,255,255,0.02)",
                  px: 2.5,
                  py: 2,
                  borderTop: `1px solid ${t.palette.divider}`,
                })}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.65, color: "text.secondary" }}>
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Faq;
