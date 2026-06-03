import {
  Avatar,
  Box,
  ButtonBase,
  Checkbox,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import {
  PiCaretDownBold,
  PiChatCircleTextBold,
  PiPushPinBold,
  PiShareFatBold,
  PiUserCircleBold,
  PiPencilSimpleLineDuotone,
} from "react-icons/pi";
import { RiReplyLine } from "react-icons/ri";
import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";
import { LuClock3 } from "react-icons/lu";
import { PiWarningCircleBold } from "react-icons/pi";
import MessageContent from "./MessageContent.jsx";
import { sanitizeComposerHtml } from "../../../utils/richTextSanitizer.js";
import ReplyPreview from "./ReplyPreview.jsx";
import {
  formatTime,
  isOwnMessage,
  isSystemEventMessage,
  normalizeMessage,
} from "./helpers.js";
import { getInitials } from "../../../utils/initials.js";
import { alpha, lighten, darken } from "@mui/material/styles";
import { summariseReactions } from "./reactions.js";
import EmojiMsg from "./EmojiMsg.jsx";
import { LuSmilePlus } from "react-icons/lu";
import SystemEventMsg from "./SystemEventMsg.jsx";

// Map of delivery states → icon factories so we can render per-theme colours.
const READ_STATUS_COLOR = "#3AA00B";

const clockStatusIcon = (theme) => (
  <LuClock3 size={12} color={theme.palette.text.secondary} />
);

const ACTION_LOCKED_STATUSES = new Set([
  "pending",
  "sending",
  "uploading",
  "queued",
  "error",
  "failed",
]);

const statusIcons = {
  read: () => <IoCheckmarkDone size={16} color={READ_STATUS_COLOR} />,
  delivered: (theme) => (
    <IoCheckmarkDone size={16} color={theme.palette.text.secondary} />
  ),
  sent: (theme) => (
    <IoCheckmark size={16} color={theme.palette.text.secondary} />
  ),
  pending: clockStatusIcon,
  sending: clockStatusIcon,
  uploading: clockStatusIcon,
  queued: clockStatusIcon,
  error: (theme) => (
    <PiWarningCircleBold size={15} color={theme.palette.error.main} />
  ),
  failed: (theme) => (
    <PiWarningCircleBold size={15} color={theme.palette.error.main} />
  ),
};

// Returns the icon React node for a given delivery status.
const getStatusIcon = (status, theme) => {
  const factory = statusIcons[status?.toLowerCase?.()] ?? null;
  if (!factory) return null;
  return factory(theme);
};

// Shared speech-bubble surface. Modern violet-gradient outgoing /
// glass-card incoming. Designed to feel fresh against legacy chat apps.
const bubbleStyles = (theme, own, { isEmojiOnly = false } = {}) => {
  const isLight = theme.palette.mode === "light";

  if (isEmojiOnly) {
    return {
      position: "relative",
      px: 0,
      py: 0,
      pb: 0,
      borderRadius: 0,
      backgroundColor: "transparent",
      border: "none",
      maxWidth: "min(45vw, 75vw)",
    };
  }

  // Outgoing — uses the user's brand colour (Settings → Brand Color) so
  // the bubble matches the rest of the brand surface. theme.palette.primary
  // is reactive to the Setting drawer's picker, so changing the brand color
  // updates every outgoing bubble instantly.
  if (own) {
    const brandMain = theme.palette.primary.main;
    const brandDark = theme.palette.primary.dark || brandMain;
    const brandContrast = theme.palette.primary.contrastText || "#fff";
    // Shadow tint should match the bubble so it doesn't look like a stuck-on
    // purple glow when the brand color is, say, green. alpha() keeps the
    // exact hue while dropping it to 28% opacity.
    const shadowTint = alpha(brandMain, 0.28);
    return {
      position: "relative",
      px: 1.4,
      py: 1,
      pb: 0.4,
      borderRadius: "18px 18px 4px 18px",
      background: `linear-gradient(135deg, ${brandMain} 0%, ${brandDark} 100%)`,
      color: brandContrast,
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow:
        `0 8px 22px ${shadowTint}, inset 0 1px 0 rgba(255,255,255,0.14)`,
      minWidth: 110,
      maxWidth: "min(45vw, 75vw)",
      // Children text/links should also adopt white — except meeting invite
      // card which has its own light/dark surface inside the bubble.
      "& a": { color: "#ffd54a", textDecoration: "underline" },
      "& .MuiTypography-root": { color: "inherit" },
      // Use explicit theme palette values, NOT CSS keywords `initial` /
      // `unset` — those resolve to `canvastext` which adapts to the OS dark
      // mode and goes white even when the app is in light mode, making the
      // child text invisible on the inner card.
      "& [data-meeting-invite-card]": { color: theme.palette.text.primary },
      "& [data-meeting-invite-card] .MuiTypography-root": { color: "inherit" },
      "& [data-meeting-invite-card] .MuiTypography-caption": {
        color: theme.palette.text.secondary,
      },
      // File attachment tile renders its own light/dark surface inside the
      // bubble — without this opt-out the bubble's color:inherit forces the
      // filename / size to white, making them invisible on the white card.
      "& [data-file-attachment-tile]": { color: theme.palette.text.primary },
      "& [data-file-attachment-tile] .MuiTypography-root": { color: "inherit" },
      "& [data-file-attachment-tile] .MuiTypography-caption": {
        color: theme.palette.text.secondary,
      },
    };
  }

  // Incoming — soft surface with hairline border + subtle shadow
  return {
    position: "relative",
    px: 1.4,
    py: 1,
    pb: 0.4,
    borderRadius: "18px 18px 18px 4px",
    background: isLight ? "#ffffff" : "rgba(255,255,255,0.04)",
    color: theme.palette.text.primary,
    border: isLight
      ? "1px solid rgba(15,23,42,0.08)"
      : "1px solid rgba(255,255,255,0.08)",
    boxShadow: isLight
      ? "0 4px 14px rgba(15,23,42,0.06)"
      : "0 4px 14px rgba(0,0,0,0.3)",
    minWidth: 110,
    maxWidth: "min(45vw, 75vw)",
  };
};

// Wrapper around each bubble that reveals the kebab menu on hover/focus.
const bubbleWrapperStyles = {
  position: "relative",
  display: "inline-flex",
  "&:hover .message-menu-trigger, &:focus-within .message-menu-trigger": {
    opacity: 1,
    visibility: "visible",
  },
  "& .message-quick-actions": {
    opacity: 0,
    visibility: "hidden",
    transform: "translateY(-6px)",
    transition: "opacity 120ms ease, transform 120ms ease",
  },
};

// Renders sender avatar + name for group chats. Falls back to plain bubble in 1:1 threads.
// Meta block (avatar + sender name) shown above inbound messages in groups.
const SenderMeta = ({
  visible,
  authorAvatar,
  authorInitials,
  authorName,
  bubble,
  own,
  onAvatarClick,
  onAvatarKeyDown,
  avatarMenuId,
  avatarMenuOpen,
}) => {
  if (!visible) {
    return (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          justifyContent: own ? "flex-end" : "flex-start",
        }}
      >
        {bubble}
      </Box>
    );
  }

  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Avatar
        src={authorAvatar || undefined}
        alt={authorName || "Member"}
        onClick={onAvatarClick}
        onKeyDown={onAvatarKeyDown}
        role={onAvatarClick ? "button" : undefined}
        tabIndex={onAvatarClick ? 0 : undefined}
        aria-haspopup={onAvatarClick ? "menu" : undefined}
        aria-controls={onAvatarClick ? avatarMenuId : undefined}
        aria-expanded={onAvatarClick ? avatarMenuOpen : undefined}
        sx={{
          width: 40,
          height: 40,
          bgcolor: (theme) =>
            theme.palette.mode === "light"
              ? "rgba(0,0,0,0.04)"
              : "rgba(255,255,255,0.12)",
          color: (theme) => theme.palette.text.primary,
          fontSize: 14,
          fontWeight: 600,
          cursor: onAvatarClick ? "pointer" : "default",
          "& .MuiAvatar-img": { objectFit: "cover" },
        }}
      >
        {!authorAvatar ? authorInitials : null}
      </Avatar>
      <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: "text.primary",
            fontWeight: 600,
            letterSpacing: "0.3px",
          }}
        >
          {authorName || "Member"}
        </Typography>
        <Box sx={{ alignSelf: "flex-start" }}>{bubble}</Box>
      </Stack>
    </Stack>
  );
};

// Shared timestamp/status row displayed beneath each bubble.
// Time + status indicator row rendered under every bubble.
const TimestampRow = ({ alignEnd, message, statusIcon }) => {
  const edited = Boolean(message?.metadata?.editedAt);
  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      mt={0.5}
      gap={0.5}
      justifyContent={alignEnd ? "flex-end" : "flex-start"}
    >
      <Stack direction="row" spacing={1} alignItems="center" gap={0.5}>
        <Typography variant="caption" color="text.secondary">
          {formatTime(message?.createdAt)}
        </Typography>
        {edited ? (
          <Stack direction="row" spacing={0.25} alignItems="center">
            <PiPencilSimpleLineDuotone size={11} color="currentColor" />
            <Typography variant="caption" color="text.secondary">
              Edited
            </Typography>
          </Stack>
        ) : null}
      </Stack>
      {statusIcon}
    </Stack>
  );
};

// Renders one chat bubble + metadata and handles context menu interactions.
const MessageItem = React.memo(
  ({
    message,
    currentUserId,
    onMenuToggle,
    onContextMenu,
    onReact,
    onAction,
    onReplyJump,
    onAuthorAction,
    isGroupConversation = false,
    multiCopyActive = false,
    multiCopySelected = false,
    onMultiCopyToggle,
  }) => {
    const theme = useTheme();
    // Normalize every message so renderer, menu etc. consume a single shape.
    const normalizedMessage = useMemo(() => {
      if (!message) return message;
      return message.__normalized ? message : normalizeMessage(message);
    }, [message]);
    const isSystemEvent = isSystemEventMessage(normalizedMessage);
    if (isSystemEvent) {
      return (
        <Box
          sx={{ width: "100%" }}
          data-message-id={`message-${normalizedMessage?.id ?? message?.id ?? ""}`}
        >
          <SystemEventMsg message={normalizedMessage} />
        </Box>
      );
    }
    const own = isOwnMessage(normalizedMessage, currentUserId);
    const normalizedStatus = normalizedMessage?.status?.toLowerCase?.() ?? "";
    const statusIcon = getStatusIcon(normalizedStatus, theme);
    const isEmojiOnly = Boolean(normalizedMessage?.content?.isEmojiOnly);
    const showGroupMeta = isGroupConversation && !own;
    const authorName = showGroupMeta
      ? normalizedMessage?.author?.name ||
        normalizedMessage?.authorName ||
        normalizedMessage?.senderName ||
        normalizedMessage?.metadata?.senderName ||
        ""
      : "";
    const authorAvatar = showGroupMeta
      ? normalizedMessage?.author?.avatar ||
        normalizedMessage?.author?.profilePicture ||
        normalizedMessage?.author?.photo ||
        normalizedMessage?.avatar ||
        normalizedMessage?.metadata?.avatar ||
        null
      : null;
    const authorId = showGroupMeta
      ? normalizedMessage?.author?.id ||
        normalizedMessage?.sender_id ||
        normalizedMessage?.senderId ||
        normalizedMessage?.authorId ||
        normalizedMessage?.metadata?.senderId ||
        normalizedMessage?.metadata?.sender_id ||
        ""
      : "";
    const authorInitials = showGroupMeta
      ? getInitials(authorName || "Member")
      : "";
    const reactionSummaries = useMemo(
      () => summariseReactions(normalizedMessage, currentUserId),
      [normalizedMessage, currentUserId]
    );
    const showReactions = reactionSummaries.length > 0;
    const replyContext = normalizedMessage?.metadata?.replyTo ?? null;
    const caption =
      normalizedMessage?.content?.caption &&
      normalizedMessage.content.caption.trim()
        ? normalizedMessage.content.caption
        : "";
    // Sanitize server-supplied caption HTML before piping it into
    // dangerouslySetInnerHTML below — defense-in-depth so a compromised
    // upstream can't inject scripts via captions on media messages.
    const captionHtml =
      normalizedMessage?.content?.captionHtml &&
      normalizedMessage.content.captionHtml.trim()
        ? sanitizeComposerHtml(normalizedMessage.content.captionHtml)
        : "";
    const showCaption =
      Boolean(caption) &&
      normalizedMessage?.type &&
      normalizedMessage.type !== "text" &&
      normalizedMessage.type !== "message";

    const pinnedForViewer =
      normalizedMessage?.metadata?.pinned &&
      normalizedMessage?.metadata?.pinnedBy === currentUserId;
    const forwardedLabelRaw =
      normalizedMessage?.metadata?.forwardedFrom ||
      normalizedMessage?.metadata?.forwardedBy ||
      normalizedMessage?.metadata?.forwardedLabel ||
      "";
    const forwardedTooltip = forwardedLabelRaw
      ? `Forwarded from ${forwardedLabelRaw}`
      : "Forwarded message";
    const isForwarded = Boolean(
      normalizedMessage?.metadata?.forwarded ||
        normalizedMessage?.metadata?.isForwarded ||
        forwardedLabelRaw
    );
    const messageBadges = [];
    if (pinnedForViewer) {
      messageBadges.push({
        key: "pinned",
        icon: PiPushPinBold,
        color: theme.palette.error.main,
        tooltip: "Pinned message",
      });
    }
    if (isForwarded) {
      messageBadges.push({
        key: "forwarded",
        icon: PiShareFatBold,
        color: theme.palette.info.main,
        tooltip: forwardedTooltip,
      });
    }

    const actionsLocked = own && ACTION_LOCKED_STATUSES.has(normalizedStatus);

    // Toggle kebab menu via click without propagating to bubble (prevents reply select).
    const handleMenuClick = (event) => {
      event.stopPropagation();
      if (actionsLocked) return;
      onMenuToggle?.(event, normalizedMessage);
    };

    // Right-click handler to open the same menu at cursor position.
    const handleContextMenu = (event) => {
      event.preventDefault();
      if (actionsLocked) return;
      onContextMenu?.(event, normalizedMessage);
    };

    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const profileMenuOpen = Boolean(profileAnchorEl);
    const profileMenuId = normalizedMessage?.id
      ? `author-menu-${normalizedMessage.id}`
      : "author-menu";

    const handleAvatarClick = useCallback(
      (event) => {
        if (!showGroupMeta) return;
        event.stopPropagation();
        setProfileAnchorEl(event.currentTarget);
      },
      [showGroupMeta]
    );

    const handleAvatarKeyDown = useCallback(
      (event) => {
        if (!showGroupMeta) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setProfileAnchorEl(event.currentTarget);
        }
      },
      [showGroupMeta]
    );

    const closeProfileMenu = useCallback(() => {
      setProfileAnchorEl(null);
    }, []);

    const handleProfileAction = useCallback(
      (actionKey) => {
        closeProfileMenu();
        onAuthorAction?.(actionKey, normalizedMessage, {
          author: {
            id: authorId,
            name: authorName,
            avatar: authorAvatar,
          },
        });
      },
      [
        authorAvatar,
        authorId,
        authorName,
        closeProfileMenu,
        normalizedMessage,
        onAuthorAction,
      ]
    );

    const openTrayViaButton = (event) => {
      event?.stopPropagation?.();
      onReact?.(normalizedMessage, null, {
        intent: "tray",
        anchorEl: event?.currentTarget ?? null,
      });
    };

    const handleMultiCopyCheckbox = (event) => {
      event.stopPropagation();
      onMultiCopyToggle?.(normalizedMessage, event.target.checked);
    };

    const handleBubbleSelection = (event) => {
      if (!multiCopyActive) return;
      event.stopPropagation();
      onMultiCopyToggle?.(normalizedMessage, !multiCopySelected);
    };

    // IconButton that appears on hover to expose message actions.
    const menuButton =
      !multiCopyActive && !actionsLocked ? (
        <IconButton
          className="message-menu-trigger"
          size="small"
          onClick={handleMenuClick}
          sx={{
            position: "absolute",
            top: 4,
            right: 6,
            width: 24,
            height: 24,
            color: theme.palette.text.primary,
            opacity: 0,
            visibility: "hidden",
            transition: "opacity 0.15s ease",
            "&:hover": {
              backgroundColor: own
                ? "rgba(255,255,255,0.2)"
                : theme.palette.action.hover,
            },
          }}
        >
          <PiCaretDownBold size={14} />
        </IconButton>
      ) : null;

    const quickActions = [
      {
        key: "reply",
        icon: RiReplyLine,
        label: "Reply",
        handler: () =>
          onAction?.("reply", normalizedMessage, {
            source: "quick-action",
          }),
      },
      {
        key: "react",
        icon: LuSmilePlus,
        label: "React",
        handler: (event) => openTrayViaButton(event),
      },
      {
        key: "forward",
        icon: PiShareFatBold,
        label: "Forward",
        handler: () =>
          onAction?.("forward", normalizedMessage, {
            source: "quick-action",
          }),
      },
    ];

    // Actual speech bubble body + hover menu container.
    const bubble = (
      <Box sx={bubbleWrapperStyles} onContextMenu={handleContextMenu}>
        <Box
          sx={bubbleStyles(theme, own, { isEmojiOnly })}
          onClick={multiCopyActive ? handleBubbleSelection : undefined}
          data-message-bubble="true"
        >
          {messageBadges.length ? (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                position: "absolute",
                top: -12,
                left: own ? undefined : 8,
                right: own ? 8 : undefined,
              }}
            >
              {messageBadges.map((badge) => {
                const BadgeIcon = badge.icon;
                return (
                  <Tooltip key={badge.key} title={badge.tooltip}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: theme.palette.background.default,
                        // border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        boxShadow: theme.shadows[1],
                        color: badge.color,
                      }}
                    >
                      <BadgeIcon size={12} />
                    </Box>
                  </Tooltip>
                );
              })}
            </Stack>
          ) : null}
          {!multiCopyActive && !actionsLocked ? (
            <Stack
              direction="row"
              spacing={0.25}
              className="message-quick-actions"
              sx={{
                position: "absolute",
                bottom: 0,
                right: own ? "102%" : undefined,
                left: own ? undefined : "102%",
                zIndex: 2,
              }}
            >
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Tooltip key={action.key} title={action.label}>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (action.handler) {
                          action.handler(event);
                        } else {
                          onAction?.(action.key, normalizedMessage, {
                            source: "quick-action",
                          });
                        }
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "background.default",
                        border: (theme) =>
                          `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                        transition: "transform 0.15s ease, background-color 0.15s ease",
                        "&:hover": {
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          transform: "scale(1.08)",
                        },
                      }}
                    >
                      <ActionIcon size={15} />
                    </IconButton>
                  </Tooltip>
                );
              })}
            </Stack>
          ) : null}
          {replyContext ? (
            <ReplyPreview
              data={replyContext}
              onClick={
                replyContext.messageId
                  ? () => onReplyJump?.(replyContext.messageId)
                  : undefined
              }
            />
          ) : null}
          <MessageContent
            message={normalizedMessage}
            currentUserId={currentUserId}
            own={own}
            onAction={(actionKey, payload = {}) =>
              onAction?.(actionKey, normalizedMessage, payload)
            }
          />
          {showCaption ? (
            captionHtml ? (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.75,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  minWidth: 100,
                  maxWidth: "20vw",
                  lineHeight: 0.6,
                }}
                dangerouslySetInnerHTML={{ __html: captionHtml }}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.75,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  minWidth: 100,
                  maxWidth: "20vw",
                  lineHeight: 1,
                }}
              >
                {caption}
              </Typography>
            )
          ) : null}
          <TimestampRow
            alignEnd={!showGroupMeta && own}
            message={normalizedMessage}
            statusIcon={own ? statusIcon : null}
          />
        </Box>
        {menuButton}
      </Box>
    );

    const handleReactionChipClick = (emoji) => {
      if (!emoji) return;
      onReact?.(normalizedMessage, emoji);
    };

    const messageBody = (
      <Stack
        spacing={0.75}
        sx={{
          width: "100%",
          "&:hover .message-quick-actions, &:focus-within .message-quick-actions":
            {
              opacity: 1,
              visibility: "visible",
              transform: "translateY(0)",
            },
        }}
      >
        <SenderMeta
          visible={showGroupMeta}
          authorAvatar={authorAvatar}
          authorInitials={authorInitials}
          authorName={authorName}
          bubble={bubble}
          own={own}
          onAvatarClick={showGroupMeta ? handleAvatarClick : undefined}
          onAvatarKeyDown={showGroupMeta ? handleAvatarKeyDown : undefined}
          avatarMenuId={profileMenuId}
          avatarMenuOpen={profileMenuOpen}
        />
        <Menu
          id={profileMenuId}
          anchorEl={profileAnchorEl}
          open={profileMenuOpen}
          onClose={closeProfileMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{ paper: { sx: { minWidth: 150, borderRadius: 2 } } }}
        >
          <MenuItem
            onClick={() => handleProfileAction("view-profile")}
            sx={{ py: 0.5, fontSize: 14 }}
          >
            <ListItemIcon sx={{"&.MuiListItemIcon-root": { minWidth: 20 } }}>
              <PiUserCircleBold size={16} />
            </ListItemIcon>
            <ListItemText primary="View info" sx={{fontSize: 14}} />
          </MenuItem>
          <MenuItem
            onClick={() => handleProfileAction("send-dm")}
            sx={{ py: 0.5, fontSize: 14 }}
          >
            <ListItemIcon sx={{  "&.MuiListItemIcon-root": { minWidth: 20 } }}>
              <PiChatCircleTextBold size={16} />
            </ListItemIcon>
            <ListItemText primary="Direct message" sx={{fontSize: 14}} />
          </MenuItem>
        </Menu>

        {showReactions ? (
          <Stack
            direction="row"
            spacing={0.5}
            flexWrap="wrap"
            alignItems="center"
            justifyContent={!showGroupMeta && own ? "flex-end" : "flex-start"}
            sx={{
              pl: showGroupMeta ? 5.5 : 0,
              gap: 0.75,
              minHeight: 26,
            }}
          >
            {reactionSummaries.map((reaction) => (
              <Tooltip
                key={`${normalizedMessage.id}-${reaction.emoji}`}
                title={reaction.tooltip}
                placement="top"
              >
                <ButtonBase
                  onClick={() => handleReactionChipClick(reaction.emoji)}
                  sx={{
                    borderRadius: 1,
                    px: 1,
                    py: 0.25,
                    display: "inline-flex",
                    alignItems: "center",
                    width: reaction.count > 1 ? 42 : 28,
                    height: 26,
                    border: `1px solid ${
                      reaction.viewerReacted
                        ? alpha(theme.palette.primary.main, 0.5)
                        : alpha(theme.palette.text.secondary, 0.25)
                    }`,
                    backgroundColor: reaction.viewerReacted
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.text.primary, 0.08),
                    color: reaction.viewerReacted
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                  }}
                >
                  <EmojiMsg emoji={reaction.emoji} size={20} />
                  {reaction.count > 1 ? (
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, lineHeight: 1, width: 10 }}
                    >
                      {reaction.count}
                    </Typography>
                  ) : null}
                </ButtonBase>
              </Tooltip>
            ))}
          </Stack>
        ) : null}
      </Stack>
    );

    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-start"
        sx={{ width: "100%" }}
        data-message-id={`message-${normalizedMessage?.id ?? message?.id ?? ""}`}
      >
        {multiCopyActive ? (
          <Box
            sx={{
              pt: showGroupMeta ? 4 : 1,
              animation: "messageSelectCheckboxIn 160ms ease-out",
              "@keyframes messageSelectCheckboxIn": {
                from: { opacity: 0, transform: "translateX(-6px)" },
                to: { opacity: 1, transform: "translateX(0)" },
              },
            }}
          >
            <Checkbox
              size="small"
              checked={multiCopySelected}
              onChange={handleMultiCopyCheckbox}
              sx={{ p: 0 }}
            />
          </Box>
        ) : null}
        <Box sx={{ flexGrow: 1 }}>{messageBody}</Box>
      </Stack>
    );
  }
);

export default MessageItem;
