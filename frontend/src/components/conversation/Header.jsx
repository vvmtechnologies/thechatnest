import {
  Avatar,
  Box,
  Button,
  Fade,
  IconButton,
  MenuItem,
  Popover,
  Slide,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import { getInitials } from "../../utils/initials.js";
import { agentSelfId } from "../../data/CommonData.js";
import { useTypingIndicator } from "../../contexts/TypingIndicatorContext.jsx";
import { usePresence } from "../../contexts/PresenceProvider.jsx";
import { useScreenShareContext } from "../../contexts/ScreenShareContext.jsx";
import { useCallContext } from "../../contexts/CallContext.jsx";
import { closeSidebar, openSidebar } from "../../redux/slices/app.js";
import {
  PiCopySimple,
  PiShareFat,
  PiTrashSimple,
  PiXBold,
  PiDotsThreeOutlineVertical,
  PiUserCircle,
  PiMonitor,
  PiUsersThreeBold,
  PiPhone,
  PiVideoCamera,
  PiExport,
  PiArrowCounterClockwiseBold,
  PiBellSlashBold,
  PiBellBold,
  PiSpeakerHighBold,
  PiClockCountdownBold,
  PiPhoneBold,
} from "react-icons/pi";
import { BsSearch } from "react-icons/bs";
import {
  FaAndroid,
  FaApple,
  FaDesktop,
  FaRegWindowMaximize,
} from "react-icons/fa";
import { resolveLatestDeviceIndicator } from "../../utils/deviceDetect.js";
import ExportChatDialog from "./ExportChatDialog.jsx";
import CallHistoryDialog from "../call/CallHistoryDialog.jsx";

const SELF_THREAD_ID = "thread-self";
const SELF_INITIALS = "MY";
const DEVICE_ICON_BY_KEY = {
  desktop: FaDesktop,
  browser: FaRegWindowMaximize,
  ios: FaApple,
  android: FaAndroid,
};

const ConversationHeader = ({
  thread,
  selectionActive = false,
  selectionCount = 0,
  selectionForwardDisabled = false,
  onSelectionCopy,
  onSelectionForward,
  onSelectionDelete,
  onSelectionCancel,
  onSearchToggle,
  searchOpen = false,
  onReloadChat,
  isMuted = false,
  onMenuAction,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sidebarOpen = useSelector((state) => state.app.sidebar.open);
  const { status: presenceStatus } = usePresence();
  const { requestScreenShare, status: screenShareStatus } = useScreenShareContext();
  const { startCall, status: callStatus } = useCallContext();

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [callHistoryOpen, setCallHistoryOpen] = useState(false);
  const { isActive: isTyping, summary: typingSummary } = useTypingIndicator(
    thread?.id
  );

  const displayLabel =
    thread?.label && thread.label.trim()
      ? thread.label
      : "Static Conversation Header";

  const profilePicture = useMemo(() => {
    const candidates = [
      thread?.profilePicture,
      thread?.avatar,
      thread?.contact?.avatar,
      thread?.contact?.profilePicture,
    ];
    for (const value of candidates) {
      if (typeof value === "string" && value.trim()) return value;
    }
    return null;
  }, [thread]);

  const typingLoaderColor =
    theme.palette.mode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.main;

  const isSelfThread = Boolean(
    thread?.isSelfThread ||
      thread?.id === SELF_THREAD_ID ||
      thread?.user_id === agentSelfId
  );

  const isGroupThread = useMemo(() => {
    const type = thread?.type || thread?.threadType || thread?.conversationType;
    if (!type) return Boolean(thread?.members || thread?.participants);
    return String(type).toLowerCase() === "group";
  }, [thread]);

  const groupMemberCount = useMemo(() => {
    const fromArray = Array.isArray(thread?.members)
      ? thread.members.length
      : Array.isArray(thread?.participants)
      ? thread.participants.length
      : 0;
    const fromCount = Number.isFinite(Number(thread?.memberCount))
      ? Number(thread.memberCount)
      : 0;
    return Math.max(fromArray, fromCount);
  }, [thread]);

  const initials = useMemo(() => {
    if (thread?.initialsOverride) {
      return thread.initialsOverride.slice(0, 2).toUpperCase();
    }
    if (isSelfThread) {
      return SELF_INITIALS;
    }
    return getInitials(displayLabel);
  }, [thread?.initialsOverride, isSelfThread, displayLabel]);

  const statusLabel = isSelfThread
    ? presenceStatus || "Online"
    : (thread?.status ?? "Online");

  const deviceIndicator = useMemo(
    () => resolveLatestDeviceIndicator(thread),
    [thread]
  );
  const DeviceIcon =
    DEVICE_ICON_BY_KEY[deviceIndicator.key] || DEVICE_ICON_BY_KEY.browser;
  const statusText = statusLabel;

  const handleSelectionAction = (handler) => {
    if (!selectionCount) return;
    handler?.();
  };

  const [deleteAnchorEl, setDeleteAnchorEl] = useState(null);
  const deleteConfirmOpen = Boolean(deleteAnchorEl);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleOpenSidebar = useCallback(() => {
    if (isSelfThread) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("selectedTab", "3");
      }
      navigate("/app/settings");
      return;
    }
    if (sidebarOpen) {
      dispatch(closeSidebar());
      return;
    }
    dispatch(openSidebar("CONTACT"));
  }, [dispatch, sidebarOpen, isSelfThread, navigate]);

  const openDeleteConfirm = (event) => {
    if (!selectionCount) return;
    setDeleteAnchorEl(event.currentTarget);
  };

  const closeDeleteConfirm = () => {
    setDeleteAnchorEl(null);
  };

  const openMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
  };

  const isDmThread = !isSelfThread && !isGroupThread && thread?.id?.startsWith?.("dm-");

  const canScreenShare =
    isDmThread && screenShareStatus === "idle";

  const canCall =
    isDmThread && callStatus === "idle";

  const handleMenuAction = (label) => {
    if (label === "View Profile") {
      handleOpenSidebar();
    } else if (label === "Screen Share" && canScreenShare) {
      const targetUserId = thread.id.replace("dm-", "");
      requestScreenShare(targetUserId);
    } else if (label === "Export Chat") {
      setExportDialogOpen(true);
    } else if (label === "Call History") {
      setCallHistoryOpen(true);
    } else if (label === "Reload Chat") {
      onReloadChat?.();
    } else if (label === "Mute" || label === "Unmute" || label === "NotificationSound" || label === "DisappearingMessages") {
      onMenuAction?.(label, thread);
    }
    closeMenu();
  };

  const handleConfirmDelete = () => {
    closeDeleteConfirm();
    handleSelectionAction(onSelectionDelete);
  };

  useEffect(() => {
    if (!selectionActive || !selectionCount) {
      closeDeleteConfirm();
    }
  }, [selectionActive, selectionCount]);

  const selectionToolbar = (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: 600 }}
      >
        {selectionCount} selected
      </Typography>
      <Tooltip title="Copy" placement="bottom">
        <IconButton
          disableRipple
          onClick={() => handleSelectionAction(onSelectionCopy)}
          sx={{
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: "transparent",
              color: theme.palette.primary.main,
            },
          }}
        >
          <PiCopySimple size={18} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Forward" placement="bottom">
        <IconButton
          disableRipple
          onClick={() => handleSelectionAction(onSelectionForward)}
          disabled={selectionForwardDisabled}
          sx={{
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: "transparent",
              color: theme.palette.primary.main,
            },
            "&.Mui-disabled": {
              color: theme.palette.text.disabled,
            },
          }}
        >
          <PiShareFat size={18} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete" placement="bottom">
        <IconButton
          disableRipple
          onClick={openDeleteConfirm}
          sx={{
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: "transparent",
              color: theme.palette.primary.main,
            },
          }}
        >
          <PiTrashSimple size={18} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Cancel selection" placement="bottom">
        <IconButton
          disableRipple
          onClick={() => {
            closeDeleteConfirm();
            onSelectionCancel?.();
          }}
          sx={{
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: "transparent",
              color: theme.palette.primary.main,
            },
          }}
        >
          <PiXBold size={18} />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  // Determine presence dot color
  const lowerStatus = String(statusText || "").toLowerCase();
  const isOnline = /online|active|available/.test(lowerStatus);
  const isAway = /away|idle/.test(lowerStatus);
  const presenceColor = isOnline ? "#22c55e" : isAway ? "#f59e0b" : "#8189a8";

  const brandMain = theme.palette.primary.main;
  const headerIconBtnSx = {
    color: theme.palette.text.primary,
    width: 40,
    height: 40,
    borderRadius: "12px",
    border:
      theme.palette.mode === "light"
        ? "1px solid #e5e7eb"
        : "1px solid rgba(255,255,255,0.08)",
    background:
      theme.palette.mode === "light" ? "#fff" : "rgba(255,255,255,0.02)",
    transition: "all 0.18s ease",
    "&:hover": {
      background: alpha(brandMain, theme.palette.mode === "light" ? 0.08 : 0.15),
      borderColor: brandMain,
      color: brandMain,
      transform: "translateY(-1px)",
      boxShadow: `0 4px 12px ${alpha(brandMain, 0.18)}`,
    },
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{
        px: 2.25,
        py: 1.4,
        borderBottom: 1,
        borderColor: "divider",
        background:
          theme.palette.mode === "light"
            ? "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={profilePicture ?? undefined}
            alt={displayLabel}
            onClick={handleOpenSidebar}
            sx={{
              width: 46,
              height: 46,
              borderRadius: "14px",
              cursor: "pointer",
              bgcolor: profilePicture ? "transparent" : "#6d5dfc",
              background: profilePicture
                ? "transparent"
                : "linear-gradient(135deg, #6d5dfc, #8b7cff)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              boxShadow: "0 4px 14px rgba(109,93,252,0.25)",
              transition: "transform 0.18s ease",
              "&:hover": { transform: "scale(1.04)" },
            }}
          >
            {!profilePicture ? (
              isGroupThread ? <PiUsersThreeBold size={22} /> : initials
            ) : null}
          </Avatar>
          {/* Presence dot for DMs */}
          {!isGroupThread && (
            <Box
              sx={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 14,
                height: 14,
                borderRadius: "50%",
                bgcolor: presenceColor,
                border: `2.5px solid ${theme.palette.background.paper}`,
                boxShadow: isOnline
                  ? "0 0 0 3px rgba(34,197,94,0.18)"
                  : "none",
              }}
            />
          )}
          {!isGroupThread &&
            (thread?.isGlobalMember || thread?.isGlobal || thread?.is_global) && (
              <Box
                sx={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  bgcolor: "#ffd54a",
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
              />
            )}
        </Box>

        <Box onClick={handleOpenSidebar} sx={{ cursor: "pointer", minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              color: theme.palette.mode === "light" ? "#0a0e1f" : "#fff",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayLabel}
          </Typography>
          <Box
            sx={{
              mt: 0.4,
              fontSize: 12,
              color: theme.palette.text.secondary,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            {isTyping && typingSummary ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <BeatLoader
                  size={5}
                  speedMultiplier={0.9}
                  color="#6d5dfc"
                />
                <Box component="span" sx={{ color: "#6d5dfc", fontWeight: 600 }}>
                  {typingSummary}
                </Box>
              </Stack>
            ) : isGroupThread ? (
              <>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: brandMain,
                  }}
                />
                <Box component="span">{groupMemberCount} members</Box>
              </>
            ) : (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: presenceColor,
                    boxShadow: isOnline ? "0 0 0 2.5px rgba(34,197,94,0.2)" : "none",
                  }}
                />
                <Tooltip title={deviceIndicator.label} placement="right" arrow>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <DeviceIcon size={13} />
                  </Box>
                </Tooltip>
                <Box
                  component="span"
                  sx={{
                    fontWeight: 500,
                    textTransform: "capitalize",
                    color: isOnline ? "#22c55e" : theme.palette.text.secondary,
                  }}
                >
                  {statusText}
                </Box>
              </Stack>
            )}
          </Box>
        </Box>
      </Stack>

      {/* actions when user select a message */}
      {selectionActive ? (
        selectionToolbar
      ) : (
        <Stack direction="row" spacing={0.75} alignItems="center">
          {canCall && (
            <>
              <Tooltip title="Audio call" placement="bottom">
                <IconButton
                  onClick={() => {
                    const targetUserId = thread.id.replace("dm-", "");
                    startCall(targetUserId, "audio", displayLabel);
                  }}
                  sx={headerIconBtnSx}
                >
                  <PiPhone size={17} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Video call" placement="bottom">
                <IconButton
                  onClick={() => {
                    const targetUserId = thread.id.replace("dm-", "");
                    startCall(targetUserId, "video", displayLabel);
                  }}
                  sx={headerIconBtnSx}
                >
                  <PiVideoCamera size={17} />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Search · Ctrl+F" placement="bottom">
            <IconButton
              onClick={() => onSearchToggle?.()}
              sx={{
                ...headerIconBtnSx,
                ...(searchOpen && {
                  background: "rgba(109,93,252,0.12)",
                  borderColor: "#6d5dfc",
                  color: "#6d5dfc",
                }),
              }}
            >
              <BsSearch size={15} />
            </IconButton>
          </Tooltip>
          <IconButton onClick={openMenu} sx={headerIconBtnSx}>
            <PiDotsThreeOutlineVertical size={16} />
          </IconButton>
        </Stack>
      )}
      
      {/* threedot pr open hone wala menu popover */}
      <Popover
        open={menuOpen}
        anchorEl={menuAnchorEl}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
        TransitionProps={{ direction: "top" }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 1.5,
            boxShadow: theme.shadows[6],
            minWidth: 150,
          },
        }}
      >
        <Stack>
          <MenuItem onClick={() => handleMenuAction("View Profile")}>
            <Box
              component="span"
              sx={{ display: "inline-flex", alignItems: "center", mr: 1 }}
            >
              <PiUserCircle size={16} />
            </Box>
            View Profile
          </MenuItem>
          <MenuItem
            onClick={() => handleMenuAction("Screen Share")}
            disabled={!canScreenShare}
          >
            <Box
              component="span"
              sx={{ display: "inline-flex", alignItems: "center", mr: 1 }}
            >
              <PiMonitor size={16} />
            </Box>
            Screen Share
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction("Export Chat")}>
            <Box
              component="span"
              sx={{ display: "inline-flex", alignItems: "center", mr: 1 }}
            >
              <PiExport size={16} />
            </Box>
            Export Chat
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction("Reload Chat")}>
            <Box
              component="span"
              sx={{ display: "inline-flex", alignItems: "center", mr: 1 }}
            >
              <PiArrowCounterClockwiseBold size={16} />
            </Box>
            Reload Chat
          </MenuItem>
          {isDmThread && (
            <MenuItem onClick={() => handleMenuAction("Call History")}>
              <Box
                component="span"
                sx={{ display: "inline-flex", alignItems: "center", mr: 1 }}
              >
                <PiPhoneBold size={16} />
              </Box>
              Call History
            </MenuItem>
          )}
          <MenuItem onClick={() => { handleMenuAction(isMuted ? "Unmute" : "Mute"); closeMenu(); }}>
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", mr: 1 }}>
              {isMuted ? <PiBellBold size={16} /> : <PiBellSlashBold size={16} />}
            </Box>
            {isMuted ? "Unmute Chat" : "Mute Chat"}
          </MenuItem>
          <MenuItem onClick={() => { handleMenuAction("NotificationSound"); closeMenu(); }}>
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", mr: 1 }}>
              <PiSpeakerHighBold size={16} />
            </Box>
            Notification Sound
          </MenuItem>
          <MenuItem onClick={() => { handleMenuAction("DisappearingMessages"); closeMenu(); }}>
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", mr: 1 }}>
              <PiClockCountdownBold size={16} />
            </Box>
            Disappearing Messages
          </MenuItem>
        </Stack>
      </Popover>

      <Popover
        open={deleteConfirmOpen}
        anchorEl={deleteAnchorEl}
        onClose={closeDeleteConfirm}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: "left" }}
        PaperProps={{
          sx: {
            mt: 3,
            borderRadius: 1.5,
            boxShadow: theme.shadows[6],
          },
        }}
      >
        <Stack spacing={1.25} sx={{ p: 1.5, minWidth: 240 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Delete selected messages?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This action cannot be undone.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" onClick={closeDeleteConfirm}>
              Cancel
            </Button>
            <Button
              size="small"
              color="error"
              variant="contained"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Popover>

      <ExportChatDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        threadId={thread?.id}
        threadLabel={displayLabel}
      />

      {isDmThread && (
        <CallHistoryDialog
          open={callHistoryOpen}
          onClose={() => setCallHistoryOpen(false)}
          peer={{
            id: Number((thread?.id || "").replace("dm-", "")) || null,
            name: displayLabel,
            avatar: thread?.avatar || thread?.profilePicture || null,
          }}
        />
      )}
    </Stack>
  );
};

export default ConversationHeader;
