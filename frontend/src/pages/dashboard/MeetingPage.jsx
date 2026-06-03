import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Stack,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Checkbox,
  Avatar,
  Chip,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  PiVideoConferenceFill,
  PiVideoCameraBold,
  PiCalendarBold,
  PiLinkBold,
  PiMagnifyingGlassBold,
  PiCopyBold,
  PiUsersBold,
  PiEnvelopeBold,
  PiXBold,
  PiArrowLeftBold,
} from "react-icons/pi";
import { createMeeting, joinByCode as joinByCodeApi } from "../../services/meetingApi.js";
import useCurrentUser from "../../hooks/useCurrentUser.js";
import { useSocket } from "../../contexts/SocketContext.jsx";
import { useMeetingContext } from "../../contexts/MeetingContext.jsx";
import MeetingRoom from "../../components/meeting/MeetingRoom.jsx";
import MeetingsList from "../../components/meeting/MeetingsList.jsx";
import { fetchWithAuth } from "../../utils/authApi.js";
import { API_BASE_URL } from "../../config/apiBaseUrl.js";
import { useNavigate } from "react-router-dom";

const MAX_EXTERNAL_GUESTS = 2;
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Small grouped sub-card used inside the form. Replaces the previous
// bare-Divider + Title pattern, which made the long form look like an
// undifferentiated stack. Each SectionCard groups one concern (Defaults,
// Invite, External guests) with a header + content area.
const SectionCard = ({ theme, children }) => (
  <Box sx={{
    p: 1.75,
    borderRadius: 2,
    border: `1px solid ${theme.palette.divider}`,
    bgcolor: theme.palette.mode === "light" ? "#fcfcfe" : "rgba(255,255,255,0.02)",
  }}>
    {children}
  </Box>
);

const SectionHeader = ({ icon, title, hint, action }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
    <Box sx={{
      width: 26, height: 26, borderRadius: "8px",
      background: "rgba(109,93,252,0.12)", color: "#6d5dfc",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.15 }}>{title}</Typography>
      {hint && <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{hint}</Typography>}
    </Box>
    {action}
  </Stack>
);

const MeetingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const socket = useSocket();
  const meeting = useMeetingContext();

  const [tab, setTab] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [enableVideo, setEnableVideo] = useState(true);
  const [enableAudio, setEnableAudio] = useState(true);
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestEmails, setGuestEmails] = useState([]);
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [meetingRoomOpen, setMeetingRoomOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  const orgId = useMemo(() => {
    const candidates = [currentUser?.organization_id, currentUser?.org];
    for (const c of candidates) {
      const n = Number(c);
      if (Number.isFinite(n) && n > 0 && Number.isInteger(n)) return n;
    }
    return undefined;
  }, [currentUser]);

  // Fetch org users for invite picker
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { response, payload } = await fetchWithAuth(`${API_BASE_URL}/users/directory`);
        if (!response.ok) return;
        // Controller returns { data: { count, rows } } via success() wrapper
        const rows =
          payload?.data?.rows ||
          payload?.data?.users ||
          payload?.rows ||
          payload?.users ||
          (Array.isArray(payload?.data) ? payload.data : []);
        if (cancelled) return;
        const selfId = Number(currentUser?.id || currentUser?.user_id);
        const list = (Array.isArray(rows) ? rows : []).map((u) => {
          const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
          const name = u.name || fullName || u.email || `User #${u.user_id || u.id}`;
          return {
            id: Number(u.user_id || u.id),
            user_id: Number(u.user_id || u.id),
            name,
            label: name,
            email: u.email,
            avatar: u.profile_url || u.avatar || "",
          };
        }).filter((u) => u.id && u.id !== selfId);
        setMembers(list);
      } catch (err) {
        console.warn("[MeetingPage] load users failed", err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentUser]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) => (m.name || "").toLowerCase().includes(q) || (m.email || "").toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const toggleMember = (m) => {
    setSelectedMembers((prev) => {
      const exists = prev.find((x) => x.id === m.id);
      return exists ? prev.filter((x) => x.id !== m.id) : [...prev, m];
    });
  };

  const addGuestEmail = () => {
    const v = guestEmail.trim().toLowerCase();
    if (!v) return;
    if (!emailRx.test(v)) {
      setToast({ open: true, message: "Invalid email address", severity: "error" });
      return;
    }
    if (guestEmails.includes(v)) {
      setToast({ open: true, message: "Already added", severity: "warning" });
      return;
    }
    if (guestEmails.length >= MAX_EXTERNAL_GUESTS) {
      setToast({ open: true, message: `Max ${MAX_EXTERNAL_GUESTS} external guests allowed`, severity: "warning" });
      return;
    }
    setGuestEmails((prev) => [...prev, v]);
    setGuestEmail("");
  };

  const removeGuestEmail = (email) => {
    setGuestEmails((prev) => prev.filter((e) => e !== email));
  };

  const userName = currentUser?.name
    || `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim()
    || "User";

  const buildParticipants = () => selectedMembers
    .map((m) => {
      const uid = Number(m.user_id || m.id);
      if (!uid) return null;
      return { user_id: uid, display_name: m.label || m.name, email: m.email };
    })
    .filter(Boolean);

  const sendInvites = (data) => {
    if (!socket) return;
    const participantIds = (data.participants || [])
      .map((p) => p.user_id)
      .filter((id) => id && String(id) !== String(currentUser?.id));
    if (participantIds.length > 0) {
      socket.emit("meeting:invite", {
        targetUserIds: participantIds,
        meetingId: data.meeting_id,
        meetingTitle: data.title,
        hostName: userName,
        scheduledAt: data.scheduled_at || null,
      });
    }
  };

  const handleCreate = async (type) => {
    setLoading(true);
    try {
      const payload = {
        organization_id: orgId,
        title: title.trim() || (type === "scheduled" ? "Scheduled Meeting" : "Quick Meeting"),
        description,
        meeting_type: type,
        settings: {
          video: enableVideo, audio: enableAudio, screenShare: true,
          chat: true, whiteboard: true, waitingRoom: enableWaitingRoom,
          maxParticipants: 50,
        },
        participants: buildParticipants(),
        guest_emails: guestEmails,
      };
      if (type === "scheduled") {
        if (!scheduledDate || !scheduledTime) {
          setToast({ open: true, message: "Pick date and time", severity: "error" });
          return;
        }
        payload.scheduled_at = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }
      const result = await createMeeting(payload);
      const m = { ...result.meeting, participants: result.participants };
      setCreatedMeeting(m);

      if (type === "instant") {
        sendInvites(m);
        meeting.joinMeeting({
          meetingRoomId: m.meeting_id,
          meetingData: m,
          userName,
          enableVideo: true,
          enableAudio: true,
        });
        setMeetingRoomOpen(true);
      } else {
        sendInvites(m);
        setToast({ open: true, message: "Meeting scheduled!", severity: "success" });
      }
    } catch (err) {
      console.error("Create meeting failed:", err);
      setToast({ open: true, message: err.message || "Failed to create meeting", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    // Validate first — backend returns 410 for ended/cancelled meetings, 404
    // for unknown codes. Only proceed to socket join if the meeting is live.
    try {
      const data = await joinByCodeApi(code);
      const meetingData = data?.meeting || data;
      meeting.joinMeeting({
        meetingRoomId: code,
        meetingData: meetingData || { meeting_id: code, title: "Meeting" },
        userName,
        enableVideo: true,
        enableAudio: true,
      });
      setMeetingRoomOpen(true);
    } catch (err) {
      const msg = err?.message || "Failed to join";
      // joinByCode throws with the backend's failure() message — for ended/
      // cancelled meetings that's "Meeting has ended". Surface it directly.
      const friendly = /ended|cancel|not\s*found/i.test(msg)
        ? "This meeting link has expired."
        : msg;
      setToast({ open: true, message: friendly, severity: "error" });
    }
  };

  const copyCode = useCallback(() => {
    if (createdMeeting?.meeting_id) {
      navigator.clipboard.writeText(createdMeeting.meeting_id).catch(() => {});
      setToast({ open: true, message: "Meeting ID copied", severity: "success" });
    }
  }, [createdMeeting]);

  const resetForm = () => {
    setCreatedMeeting(null);
    setTitle(""); setDescription("");
    setScheduledDate(""); setScheduledTime("");
    setJoinCode("");
    setSelectedMembers([]); setGuestEmails([]); setGuestEmail("");
    setSearchQuery("");
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", bgcolor: theme.palette.mode === "light" ? "#fafbff" : theme.palette.background.default, overflow: "auto" }}>
      {/* Hero header. Single-row flex layout: back-button → icon chip →
          title block. Each child has flex-shrink:0 except the title block
          (flex:1 + minWidth:0) so the page header never wraps onto two
          lines and the title is the only thing that ellipsises on narrow
          screens. Background tints the hero in the chosen brand colour. */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 1.25, sm: 1.75 }}
          sx={{ width: "100%" }}
        >
          <IconButton
            onClick={() => navigate("/app")}
            size="small"
            aria-label="Back"
            sx={{
              borderRadius: "10px",
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
              flexShrink: 0,
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.08),
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
              },
            }}
          >
            <PiArrowLeftBold />
          </IconButton>

          <Box
            sx={{
              width: { xs: 40, sm: 46 },
              height: { xs: 40, sm: 46 },
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.primary.contrastText || "#fff",
              boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.32)}`,
              flexShrink: 0,
            }}
          >
            <PiVideoConferenceFill size={22} />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              component="h1"
              fontWeight={800}
              sx={{
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                fontSize: { xs: 20, sm: 24 },
                color: theme.palette.text.primary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Meetings
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: 11.5, sm: 12.5 },
                mt: 0.25,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: { xs: "none", sm: "block" },
              }}
            >
              Start an instant call, schedule for later, or join by code
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, p: 3, maxWidth: 1400, width: "100%", mx: "auto", alignItems: "flex-start" }}>
        {/* Left: form */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, sm: 3 },
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "20px",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 1px 3px rgba(15,23,42,0.04), 0 4px 14px rgba(15,23,42,0.04)"
                : "none",
          }}
        >
          {createdMeeting ? (
            <Stack spacing={2} alignItems="center" textAlign="center">
              <PiVideoConferenceFill size={56} color={theme.palette.success.main} />
              <Typography variant="h6" fontWeight={700}>Meeting Created!</Typography>
              <Box sx={{ bgcolor: theme.palette.action.hover, borderRadius: 2, p: 2, width: "100%" }}>
                <Typography variant="caption" color="text.secondary">Meeting ID</Typography>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                  <Typography variant="h5" fontWeight={700} color="primary" sx={{ letterSpacing: 2 }}>
                    {createdMeeting.meeting_id}
                  </Typography>
                  <IconButton size="small" onClick={copyCode}><PiCopyBold /></IconButton>
                </Stack>
              </Box>
              {createdMeeting.meeting_type === "scheduled" && (
                <Typography variant="body2" color="text.secondary">
                  Scheduled: {new Date(createdMeeting.scheduled_at).toLocaleString()}
                </Typography>
              )}
              <Stack direction="row" spacing={2}>
                {createdMeeting.meeting_type === "instant" && (
                  <Button variant="contained" startIcon={<PiVideoCameraBold />} onClick={() => {
                    meeting.joinMeeting({
                      meetingRoomId: createdMeeting.meeting_id,
                      meetingData: createdMeeting,
                      userName, enableVideo: true, enableAudio: true,
                    });
                    setMeetingRoomOpen(true);
                  }}>Join Now</Button>
                )}
                <Button variant="outlined" onClick={resetForm}>New Meeting</Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  mb: 3,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  "& .MuiTab-root": {
                    minHeight: 48,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 14,
                    color: theme.palette.text.secondary,
                  },
                  "& .MuiTab-root.Mui-selected": { color: "#6d5dfc" },
                  "& .MuiTabs-indicator": {
                    background: "linear-gradient(90deg, #6d5dfc, #ffd54a)",
                    height: 3,
                    borderRadius: 3,
                  },
                }}
              >
                <Tab icon={<PiVideoCameraBold size={17} />} iconPosition="start" label="Instant" />
                <Tab icon={<PiCalendarBold size={17} />} iconPosition="start" label="Schedule" />
                <Tab icon={<PiLinkBold size={17} />} iconPosition="start" label="Join" />
              </Tabs>

              {tab === 2 ? (
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">Enter a meeting ID to join an existing meeting</Typography>
                  <TextField
                    fullWidth label="Meeting ID" placeholder="e.g. MTG-AB12CD"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    inputProps={{ style: { letterSpacing: 2, fontWeight: 600 } }}
                  />
                  <Button variant="contained" startIcon={<PiLinkBold />} onClick={handleJoinByCode} disabled={!joinCode.trim()}>
                    Join Meeting
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <TextField fullWidth label="Meeting Title" placeholder={tab === 0 ? "Quick Meeting" : "Team Standup"}
                    value={title} onChange={(e) => setTitle(e.target.value)} />
                  <TextField fullWidth label="Description (optional)" multiline minRows={2} maxRows={3}
                    value={description} onChange={(e) => setDescription(e.target.value)} />

                  {tab === 1 && (
                    <Stack direction="row" spacing={2}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Date"
                        InputLabelProps={{ shrink: true }}
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        sx={(t) => ({
                          "& input[type='date']::-webkit-calendar-picker-indicator": {
                            filter: t.palette.mode === "light" ? "invert(0.45)" : "invert(0.85)",
                            cursor: "pointer",
                            opacity: 1,
                          },
                          "& input[type='date']": { color: t.palette.text.primary },
                          "& input[type='date']::-webkit-datetime-edit-fields-wrapper": {
                            color: t.palette.text.primary,
                          },
                        })}
                      />
                      <TextField
                        fullWidth
                        type="time"
                        label="Time"
                        InputLabelProps={{ shrink: true }}
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        sx={(t) => ({
                          "& input[type='time']::-webkit-calendar-picker-indicator": {
                            filter: t.palette.mode === "light" ? "invert(0.45)" : "invert(0.85)",
                            cursor: "pointer",
                            opacity: 1,
                          },
                          "& input[type='time']": { color: t.palette.text.primary },
                          "& input[type='time']::-webkit-datetime-edit-fields-wrapper": {
                            color: t.palette.text.primary,
                          },
                        })}
                      />
                    </Stack>
                  )}

                  {/* Settings sub-card */}
                  <SectionCard theme={theme}>
                    <SectionHeader icon={<PiVideoCameraBold size={16} />} title="Defaults" hint="What's on when participants join" />
                    <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 0.5 }}>
                      <FormControlLabel control={<Switch size="small" checked={enableVideo} onChange={(e) => setEnableVideo(e.target.checked)} />} label="Video" />
                      <FormControlLabel control={<Switch size="small" checked={enableAudio} onChange={(e) => setEnableAudio(e.target.checked)} />} label="Audio" />
                      <FormControlLabel control={<Switch size="small" checked={enableWaitingRoom} onChange={(e) => setEnableWaitingRoom(e.target.checked)} />} label="Waiting Room" />
                    </Stack>
                  </SectionCard>

                  {/* Invite Participants sub-card */}
                  <SectionCard theme={theme}>
                    <SectionHeader
                      icon={<PiUsersBold size={16} />}
                      title="Invite from your organization"
                      hint={selectedMembers.length ? `${selectedMembers.length} selected` : "Search and pick teammates"}
                      action={selectedMembers.length > 0 && <Chip label={selectedMembers.length} size="small" color="primary" sx={{ fontWeight: 700 }} />}
                    />

                    {selectedMembers.length > 0 && (
                      <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1.25 }}>
                        {selectedMembers.map((m) => (
                          <Chip key={m.id} label={m.label || m.name} size="small"
                            avatar={<Avatar src={m.avatar} sx={{ width: 20, height: 20 }} />}
                            onDelete={() => toggleMember(m)} />
                        ))}
                      </Stack>
                    )}

                    <TextField fullWidth size="small" placeholder="Search org members…"
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><PiMagnifyingGlassBold size={16} /></InputAdornment>,
                      }}
                      sx={{ mb: 1 }} />

                    <List dense sx={{
                      maxHeight: 240,
                      overflow: "auto",
                      bgcolor: theme.palette.mode === "light" ? "#f8fafc" : "rgba(255,255,255,0.03)",
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      p: 0,
                    }}>
                      {filteredMembers.map((m) => {
                        const checked = !!selectedMembers.find((s) => s.id === m.id);
                        return (
                          <ListItem key={m.id} disablePadding>
                            <ListItemButton onClick={() => toggleMember(m)} dense sx={{ borderRadius: 1, mx: 0.5, my: 0.25 }}>
                              <Checkbox edge="start" checked={checked} size="small" />
                              <ListItemAvatar sx={{ minWidth: 36 }}>
                                <Avatar src={m.avatar} sx={{ width: 28, height: 28 }} />
                              </ListItemAvatar>
                              <ListItemText primary={m.label || m.name} secondary={m.email}
                                primaryTypographyProps={{ variant: "body2", fontWeight: checked ? 700 : 500 }}
                                secondaryTypographyProps={{ variant: "caption" }} />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                      {filteredMembers.length === 0 && (
                        <Stack alignItems="center" sx={{ py: 3 }}>
                          <PiUsersBold size={26} color={theme.palette.text.disabled} />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                            {searchQuery ? `No matches for "${searchQuery}"` : "No teammates in your org yet"}
                          </Typography>
                        </Stack>
                      )}
                    </List>
                  </SectionCard>

                  {/* External guests sub-card */}
                  <SectionCard theme={theme}>
                    <SectionHeader
                      icon={<PiEnvelopeBold size={16} />}
                      title="External guests"
                      hint={`Email-only invites · ${guestEmails.length}/${MAX_EXTERNAL_GUESTS} used`}
                      action={
                        <Chip
                          label={`${guestEmails.length}/${MAX_EXTERNAL_GUESTS}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: guestEmails.length >= MAX_EXTERNAL_GUESTS ? "rgba(245,158,11,0.18)" : "transparent",
                            color: guestEmails.length >= MAX_EXTERNAL_GUESTS ? "#b45309" : "text.secondary",
                            border: "1px solid",
                            borderColor: guestEmails.length >= MAX_EXTERNAL_GUESTS ? "rgba(245,158,11,0.4)" : theme.palette.divider,
                          }}
                        />
                      }
                    />
                    <Stack direction="row" spacing={1} sx={{ mb: guestEmails.length ? 1 : 0 }}>
                      <TextField fullWidth size="small" placeholder="guest@example.com"
                        value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGuestEmail(); } }}
                        disabled={guestEmails.length >= MAX_EXTERNAL_GUESTS} />
                      <Button variant="outlined" onClick={addGuestEmail}
                        disabled={guestEmails.length >= MAX_EXTERNAL_GUESTS || !guestEmail.trim()}>
                        Add
                      </Button>
                    </Stack>
                    {guestEmails.length > 0 && (
                      <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {guestEmails.map((e) => (
                          <Chip key={e} label={e} size="small" onDelete={() => removeGuestEmail(e)}
                            icon={<PiEnvelopeBold />} />
                        ))}
                      </Stack>
                    )}
                  </SectionCard>

                  <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ pt: 1 }}>
                    {tab === 0 && (
                      <Button
                        size="large"
                        startIcon={<PiVideoCameraBold />}
                        onClick={() => handleCreate("instant")}
                        disabled={loading}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: "999px",
                          px: 3,
                          py: 1.1,
                          background: "linear-gradient(135deg, #6d5dfc, #4d3eff)",
                          color: "#fff",
                          boxShadow: "0 8px 22px rgba(109,93,252,0.4)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #8b7cff, #6d5dfc)",
                            transform: "translateY(-1px)",
                          },
                          "&.Mui-disabled": { background: "#e5e7eb", color: "#b4bacf", boxShadow: "none" },
                        }}
                      >
                        {loading ? "Creating..." : "Start meeting"}
                      </Button>
                    )}
                    {tab === 1 && (
                      <Button
                        size="large"
                        startIcon={<PiCalendarBold />}
                        onClick={() => handleCreate("scheduled")}
                        disabled={loading || !scheduledDate || !scheduledTime}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: "999px",
                          px: 3,
                          py: 1.1,
                          background: "linear-gradient(135deg, #ffd54a, #ffb74d)",
                          color: "#1a1f3a",
                          boxShadow: "0 8px 22px rgba(255,213,74,0.4)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #ffe082, #ffd54a)",
                            transform: "translateY(-1px)",
                          },
                          "&.Mui-disabled": { background: "#e5e7eb", color: "#b4bacf", boxShadow: "none" },
                        }}
                      >
                        {loading ? "Scheduling..." : "Schedule meeting"}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              )}
            </>
          )}
        </Paper>

        {/* Right: meetings sidebar (sticky on desktop). Renders MeetingsList
            in `embedded` mode so it shares this Paper rather than nesting
            its own card + header. */}
        <Box sx={{
          flex: { xs: "0 0 auto", md: "0 0 360px" },
          minWidth: 0,
          width: { xs: "100%", md: 360 },
          position: { md: "sticky" },
          top: { md: 24 },
          alignSelf: "flex-start",
        }}>
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 1px 3px rgba(15,23,42,0.04), 0 4px 14px rgba(15,23,42,0.04)"
                  : "none",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={{
                px: 2.25,
                py: 1.75,
                borderBottom: `1px solid ${theme.palette.divider}`,
                background: theme.palette.mode === "light"
                  ? "linear-gradient(135deg, rgba(109,93,252,0.04), rgba(255,213,74,0.03))"
                  : "linear-gradient(135deg, rgba(109,93,252,0.10), rgba(255,213,74,0.04))",
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #6d5dfc, #4d3eff)",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(109,93,252,0.35)",
                }}
              >
                <PiCalendarBold size={16} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                  Your meetings
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                  Switch between upcoming and past
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
              <MeetingsList
                embedded
                onJoinMeeting={async (m) => {
                  try {
                    const fresh = await joinByCodeApi(m.meeting_id);
                    const meetingData = fresh?.meeting || m;
                    meeting.joinMeeting({
                      meetingRoomId: m.meeting_id,
                      meetingData,
                      userName, enableVideo: true, enableAudio: true,
                    });
                    setMeetingRoomOpen(true);
                  } catch (err) {
                    const msg = err?.message || "Failed to join";
                    const friendly = /ended|cancel|not\s*found/i.test(msg)
                      ? "This meeting has ended."
                      : msg;
                    setToast({ open: true, message: friendly, severity: "error" });
                  }
                }}
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      {meetingRoomOpen && (
        <MeetingRoom
          userName={userName}
          userId={currentUser?.id}
          onLeave={() => setMeetingRoomOpen(false)}
        />
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeetingPage;
