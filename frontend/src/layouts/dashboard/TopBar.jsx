// src/layouts/dashboard/TopBar.js
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Divider,
  Stack,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  PiDesktop,
  PiLockKey,
  PiLockKeyOpen,
  PiSignOut,
  PiWifiSlash,
  PiWarningCircleDuotone,
  PiClockCountdownDuotone,
  PiSparkleDuotone,
  PiCrownSimpleDuotone,
} from "react-icons/pi";
import authStore from "../../utils/auth";
import secureStorage from "../../utils/secureStorage";
import { fetchWithAuth } from "../../utils/authApi";
import { SETTINGS_STORAGE_KEYS } from "../../pages/dashboard/settings/storageKeys";
import { DEFAULT_WALLPAPER_SELECTION } from "../../pages/dashboard/settings/defaults";
import { useConnectivity } from "../../contexts/ConnectivityContext.jsx";
import DownloadToasts from "../../components/DownloadToasts.jsx";
import useCurrentUser from "../../hooks/useCurrentUser.js";
import usePlanStatus from "../../hooks/usePlanStatus.js";
import { API_BASE_URL } from "../../config/apiBaseUrl";
import { getOrCreateClientDeviceId } from "../../utils/deviceId.js";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";

const TopBar = () => {
  const { brandName } = useSiteBranding();
  const theme = useTheme();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const plan = usePlanStatus();
  const displayName = String(currentUser?.displayName || "Myself").trim() || "Myself";

  const { online } = useConnectivity();

  // Browser vs Electron
  const [isBrowser, setIsBrowser] = useState(true);
  useEffect(() => {
    const isElectron = !!window?.electron?.isElectron;
    setIsBrowser(!isElectron);
  }, []);

  // Desktop app URL (no API calls): take from env or fallback
  const [appUrl, setAppUrl] = useState("/");
  useEffect(() => {
    const envUrl = (import.meta.env.VITE_DESKTOP_APP_URL ?? "").trim();
    setAppUrl(envUrl || "/");
  }, []);

  const [lockState, setLockState] = useState({ locked: false, hasPin: false });
  useEffect(() => {
    const readLockState = () => {
      if (typeof window === "undefined") return;
      const hasPin = Boolean(localStorage.getItem("chatx.pinHash"));
      const locked = hasPin
        ? localStorage.getItem("chatx.lockState") !== "unlocked"
        : false;
      setLockState({ locked, hasPin });
    };

    const handleStateEvent = (event) => {
      if (!event?.detail) return;
      setLockState({
        locked: Boolean(event.detail.locked),
        hasPin: Boolean(event.detail.hasPin),
      });
    };

    readLockState();

    window.addEventListener("chat-lock:state-changed", handleStateEvent);
    window.addEventListener("storage", readLockState);
    return () => {
      window.removeEventListener("chat-lock:state-changed", handleStateEvent);
      window.removeEventListener("storage", readLockState);
    };
  }, []);

  const handleLockToggle = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("chat-lock:toggle"));
  };

  const lockLabel = !lockState.hasPin
    ? "Set PIN"
    : lockState.locked
      ? "Unlock"
      : "Lock";

  const netOK = online;
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!netOK) {
      wasOfflineRef.current = true;
      return;
    }

    if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      try {
        if (window?.electron?.ipcRenderer) {
          window.electron.ipcRenderer.send("network:reconnect");
        }
      } catch {}
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("chatx:reconnected"));
      }
    }
  }, [netOK]);

  // Logout (client-only; no API, no sockets)
  const handleLogout = async () => {
    try {
      const clientDeviceId = getOrCreateClientDeviceId();

      await fetchWithAuth(
        `${API_BASE_URL}/auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(clientDeviceId ? { "X-Device-Id": clientDeviceId } : {}),
          },
          body: JSON.stringify({
            client_device_id: clientDeviceId || undefined,
          }),
        },
        { refreshIfNeeded: false, retryOnUnauthorized: false }
      ).catch(() => null);
    } catch {}

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("chatx.displayName");
      window.dispatchEvent(new Event("chatx:display-name"));
    }
    window.dispatchEvent(new Event("chatx:logout"));
    await secureStorage.setItem(
      SETTINGS_STORAGE_KEYS.wallpaper,
      JSON.stringify(DEFAULT_WALLPAPER_SELECTION)
    );
    authStore.logout({
      keepKeys: [
        "selectedUser",
        "selectedTab",
        "selectedNotificationSound",
        "notificationsAllowed",
        "notificationPermission",
        "fontType",
        SETTINGS_STORAGE_KEYS.wallpaper,
      ],
    });
    navigate("/auth/login", { replace: true });
  };

  const dragRegionSx = isBrowser ? {} : { WebkitAppRegion: "drag" };
  const noDragRegionSx = isBrowser ? {} : { WebkitAppRegion: "no-drag" };

  const pillBtnSx = {
    fontSize: "12px",
    color: "#e6e6ea",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "999px",
    px: 1.4,
    py: 0.5,
    minHeight: 0,
    textTransform: "none",
    fontWeight: 600,
    letterSpacing: 0.02,
    transition: "all 0.18s ease",
    "&:hover": {
      background: "rgba(255,213,74,0.1)",
      borderColor: "rgba(255,213,74,0.35)",
      color: "#ffd54a",
    },
    ...noDragRegionSx,
  };

  return (
    <Box
      sx={{
        background:
          "radial-gradient(600px 200px at 80% 0%, rgba(109,93,252,0.25), transparent 60%), linear-gradient(180deg, #0b0f1e 0%, #11162a 100%)",
        height: "100%",
        width: "100%",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.4)",
        ...dragRegionSx,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        px={2}
        py="6px"
        height="100%"
        justifyContent="space-between"
        width={isBrowser ? "100%" : "calc(100vw - 150px)"}
        sx={dragRegionSx}
      >
        {/* Left chunk */}
        <Stack
          spacing={1.25}
          direction="row"
          alignItems="center"
          sx={{
            flexWrap: { xs: "wrap", md: "nowrap" },
            rowGap: 0.75,
            minWidth: 0,
            flex: 1,
          }}
        >
          {/* Branded chip */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 1.2,
              py: 0.5,
              borderRadius: "999px",
              background: "rgba(255,213,74,0.08)",
              border: "1px solid rgba(255,213,74,0.18)",
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "7px",
                background: "linear-gradient(135deg, #ffd54a, #ffb74d)",
                color: "#1a1f3a",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 0.5,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(255,213,74,0.4)",
              }}
            >
              TCN
            </Box>
            <Typography
              sx={{
                color: "#fff",
                fontSize: "12.5px",
                fontWeight: 700,
                letterSpacing: 0.4,
                display: { xs: "none", sm: "inline" },
              }}
            >
              {brandName}
            </Typography>
          </Stack>

          {/* User identity */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.85}
            sx={{
              pl: 1.5,
              borderLeft: "1px solid rgba(255,255,255,0.1)",
              ml: 1,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: netOK ? "#22c55e" : "#ef4444",
                boxShadow: netOK
                  ? "0 0 0 3px rgba(34,197,94,0.2)"
                  : "0 0 0 3px rgba(239,68,68,0.2)",
              }}
            />
            <Typography
              sx={{
                color: "rgba(231,233,243,0.85)",
                fontSize: "12.5px",
                fontWeight: 500,
                whiteSpace: "nowrap",
                maxWidth: { xs: 100, md: 180 },
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: { xs: "none", sm: "inline-block" },
              }}
            >
              {displayName}
            </Typography>
          </Stack>

          {/* Plan countdown chip */}
          {plan.loaded && plan.status !== "unknown" && (() => {
            const r = plan.remainingDays;
            const isExpired = plan.expired || plan.status === "expired";
            const isExpiring = plan.status === "expiring";
            const isTrial = plan.status === "trial";

            const tone = isExpired
              ? {
                  bg: "rgba(239,68,68,0.22)",
                  border: "rgba(239,68,68,0.6)",
                  color: "#ffffff",
                  iconBg: "linear-gradient(135deg, #ef4444, #dc2626)",
                  iconColor: "#ffffff",
                  Icon: PiWarningCircleDuotone,
                  label: "Plan expired",
                  sub: "Renew now",
                  pulse: true,
                }
              : isExpiring
                ? {
                    bg: "rgba(245,158,11,0.22)",
                    border: "rgba(245,158,11,0.6)",
                    color: "#ffffff",
                    iconBg: "linear-gradient(135deg, #f59e0b, #d97706)",
                    iconColor: "#ffffff",
                    Icon: PiClockCountdownDuotone,
                    label: `${r} day${r === 1 ? "" : "s"} left`,
                    sub: plan.planName,
                    pulse: true,
                  }
                : isTrial
                  ? {
                      bg: "rgba(109,93,252,0.22)",
                      border: "rgba(109,93,252,0.6)",
                      color: "#ffffff",
                      iconBg: "linear-gradient(135deg, #8b7cff, #6d5dfc)",
                      iconColor: "#ffffff",
                      Icon: PiSparkleDuotone,
                      label:
                        r !== null && r >= 0 ? `Trial · ${r}d left` : "Trial",
                      sub: plan.planName,
                      pulse: false,
                    }
                  : {
                      bg: "rgba(255,213,74,0.2)",
                      border: "rgba(255,213,74,0.55)",
                      color: "#ffffff",
                      iconBg: "linear-gradient(135deg, #ffd54a, #ffb74d)",
                      iconColor: "#1a1f3a",
                      Icon: PiCrownSimpleDuotone,
                      label: plan.planName,
                      sub:
                        r !== null && r >= 0 ? `${r} days left` : "Active",
                      pulse: false,
                    };

            return (
              <Box
                onClick={() => navigate("/app/admin?tab=billing")}
                sx={{
                  ml: 1,
                  pl: 1.1,
                  pr: 1.3,
                  py: 0.45,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.85,
                  flexShrink: 0,
                  borderRadius: 9999,
                  background: tone.bg,
                  border: `1px solid ${tone.border}`,
                  color: tone.color,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "transform 0.18s ease, background 0.18s ease",
                  ...noDragRegionSx,
                  "&:hover": {
                    transform: "translateY(-1px)",
                    background: tone.bg
                      .replace("0.16", "0.24")
                      .replace("0.12", "0.2"),
                  },
                  ...(tone.pulse && {
                    animation: "tcnPlanPulse 2.2s ease-in-out infinite",
                    "@keyframes tcnPlanPulse": {
                      "0%, 100%": {
                        boxShadow: `0 0 0 0 ${tone.border}`,
                      },
                      "50%": { boxShadow: `0 0 0 5px transparent` },
                    },
                  }),
                }}
                title={
                  plan.endDate
                    ? `${plan.planName} · ends ${new Date(
                        plan.endDate
                      ).toLocaleDateString()}`
                    : plan.planName
                }
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: tone.iconBg,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: tone.iconColor,
                    flexShrink: 0,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                  }}
                >
                  <tone.Icon size={14} weight="fill" />
                </Box>
                <Stack
                  spacing={0}
                  direction="row"
                  alignItems="baseline"
                  sx={{ minWidth: 0, gap: 0.6 }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 11.5,
                      lineHeight: 1,
                      letterSpacing: 0.04,
                      whiteSpace: "nowrap",
                      color: "#ffffff",
                      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                    }}
                  >
                    {tone.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                      color: "rgba(255,255,255,0.85)",
                      fontWeight: 500,
                      display: { xs: "none", md: "inline" },
                    }}
                  >
                    · {tone.sub}
                  </Typography>
                </Stack>
              </Box>
            );
          })()}

          {/* No Internet pill */}
          {!netOK && (
            <Box
              sx={{
                ml: 1,
                px: 1.3,
                py: 0.5,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.6,
                borderRadius: 9999,
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.35)",
                color: "#fca5a5",
              }}
              title="You are offline"
            >
              <PiWifiSlash size={13} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, lineHeight: 1, fontSize: 10.5 }}
              >
                Offline
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Right chunk */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <Box sx={{ ...noDragRegionSx, display: { xs: "none", md: "block" } }}>
            <DownloadToasts />
          </Box>

          <Button
            startIcon={lockState.locked ? <PiLockKeyOpen size={14} /> : <PiLockKey size={14} />}
            onClick={handleLockToggle}
            sx={{
              ...pillBtnSx,
              minWidth: { xs: 34, md: "auto" },
              "& .MuiButton-startIcon": {
                marginRight: { xs: 0, md: "8px" },
                marginLeft: { xs: 0, md: 0 },
              },
              ...(lockState.locked && {
                background: "rgba(34,197,94,0.12)",
                borderColor: "rgba(34,197,94,0.35)",
                color: "#4ade80",
                "&:hover": {
                  background: "rgba(34,197,94,0.18)",
                  borderColor: "rgba(34,197,94,0.5)",
                  color: "#4ade80",
                },
              }),
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
              {lockLabel}
            </Box>
          </Button>

          {/* Desktop App CTA (browser only) */}
          {isBrowser && (
            <Button
              startIcon={<PiDesktop size={14} />}
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                ...pillBtnSx,
                minWidth: { xs: 34, md: "auto" },
                "& .MuiButton-startIcon": {
                  marginRight: { xs: 0, md: "8px" },
                  marginLeft: { xs: 0, md: 0 },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
                Desktop App
              </Box>
            </Button>
          )}

          <Button
            endIcon={<PiSignOut size={14} />}
            onClick={handleLogout}
            sx={{
              ...noDragRegionSx,
              fontSize: "12px",
              color: "#fff",
              textTransform: "none",
              fontWeight: 700,
              letterSpacing: 0.02,
              background: "linear-gradient(135deg, #ff5b3e, #ff7e5f)",
              borderRadius: "999px",
              px: { xs: 1, md: 1.6 },
              py: 0.5,
              minHeight: 0,
              minWidth: { xs: 34, md: "auto" },
              ml: 0.5,
              boxShadow: "0 4px 14px rgba(255,91,62,0.35)",
              transition: "all 0.18s ease",
              "& .MuiButton-endIcon": {
                marginLeft: { xs: 0, md: "8px" },
                marginRight: 0,
              },
              "&:hover": {
                background: "linear-gradient(135deg, #ff7e5f, #ff5b3e)",
                transform: "translateY(-1px)",
                boxShadow: "0 6px 18px rgba(255,91,62,0.5)",
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
              Logout
            </Box>
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TopBar;
