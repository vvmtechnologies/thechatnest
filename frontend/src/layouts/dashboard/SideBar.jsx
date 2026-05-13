import React, { useEffect, useState } from "react";
import { PiChatsCircle, PiSparkle, PiUserGear, PiVideoConferenceFill, PiToolboxDuotone } from "react-icons/pi";
import {
  Box,
  Divider,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  Badge,
} from "@mui/material";
import useSettings from "../../hooks/useSettings";
import MaterialUISwitch from "../../components/ThemeSwitch";
import ToggleButton from "../../components/settings/drawer/ToggleButton.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import SettingsDrawer from "../../components/settings/drawer/index.jsx";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import useMascot from "../../hooks/useMascot";
import useCurrentUser from "../../hooks/useCurrentUser";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";

const Nav_Buttons = [
  {
    index: 0,
    icon: <PiChatsCircle size={20} />,
    title: "Chats",
  },
  // {
  //   index: 1,
  //   icon: <PiScreencast />,
  //   title: "Screen Share",
  // },
  // {
  //   index: 2,
  //   icon: <FiPhone />,
  //   title: "Call",
  // },
];

const getPath = (index) => {
  switch (index) {
    case 0:
      return "/app";
    case 1:
      return "/app/screenShare";
    case 2:
      return "/app/call";
    case 3:
      return "/app/settings";
    case 4:
      return "/app/admin";
    default:
      return "/app";
  }
};

const SideBar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { themeMode, onToggleMode } = useSettings();
  const { brandName } = useSiteBranding();

  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  // Sync sidebar icon when assistant closes itself (via X button)
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.open === false) setAssistantOpen(false);
    };
    window.addEventListener("thechatnest:assistant", handler);
    return () => window.removeEventListener("thechatnest:assistant", handler);
  }, []);
  const [unreadCount, setUnreadCount] = useState(0); // State for unread message count
  const mascotSrc = useMascot();
  const currentUser = useCurrentUser();
  const role = Number(currentUser?.role || 3);

  const handleToggle = () => {
    setToggleOpen((prev) => !prev);
  };

  useEffect(() => {
    if (toggleOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [toggleOpen]);

  // Fetch role, selected tab, and unread message count on mount
  useEffect(() => {
    const savedTab = localStorage.getItem("selectedTab");
    const pathname = location?.pathname || "";
    const resolveIndexFromPath = () => {
      if (pathname.startsWith("/app/settings")) return 3;
      if (pathname.startsWith("/app/admin")) return 4;
      // Non-chat dashboard pages — don't highlight the Chats icon
      if (pathname.startsWith("/app/meeting")) return -1;
      if (pathname.startsWith("/app/tools")) return -1;
      if (pathname === "/app" || pathname.startsWith("/app/")) return 0;
      return null;
    };
    const pathIndex = resolveIndexFromPath();
    if (pathIndex !== null) {
      setSelected(pathIndex);
      localStorage.setItem("selectedTab", String(pathIndex));
    } else if (savedTab !== null) {
      const index = parseInt(savedTab);
      setSelected(index);
      navigate(getPath(index));
    } else {
      setSelected(0);
    }
    setLoading(false);
  }, [navigate, location?.pathname]);

  const handleChangeTab = (index) => {
    setSelected(index);
    localStorage.setItem("selectedTab", index);
    navigate(getPath(index));
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  const activePillSx = {
    background: "linear-gradient(135deg, rgba(255,213,74,0.18), rgba(109,93,252,0.18))",
    border: "1px solid rgba(255,213,74,0.4)",
    borderRadius: "12px",
    height: 44,
    width: 44,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 6px 18px rgba(255,213,74,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
    transition: "all 0.18s ease",
  };

  const idleBtnSx = {
    color: "rgba(231,233,243,0.6)",
    width: 44,
    height: 44,
    borderRadius: "12px",
    transition: "all 0.18s ease",
    "&:hover": {
      color: "#ffd54a",
      background: "rgba(255,255,255,0.05)",
      transform: "translateY(-1px)",
    },
  };

  const activeIconSx = {
    color: "#ffd54a !important",
    width: "max-content",
    "&:hover": { background: "transparent" },
  };

  return (
    <Box
      py={2}
      px={0}
      sx={{
        background:
          "radial-gradient(400px 200px at 50% 0%, rgba(109,93,252,0.2), transparent 60%), linear-gradient(180deg, #0b0f1e 0%, #11162a 100%)",
        height: "auto",
        width: 80,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset -1px 0px 0px rgba(0,0,0,0.4)",
      }}
    >
      <Stack
        direction="column"
        alignItems={"center"}
        sx={{ height: "100%", width: 80 }}
        spacing={3}
        justifyContent={"space-between"}
      >
        <Stack alignItems={"center"} spacing={2}>
          <Box
            sx={{
              height: "44px",
              minHeight: "44px",
              maxHeight: "100%",
              width: "44px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #ffd54a, #ffb74d)",
              boxShadow: "0 6px 18px rgba(255,213,74,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
              padding: "5px",
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.18s ease",
              "&:hover": { transform: "translateY(-2px) scale(1.03)" },
            }}
          >
            <img
              src={mascotSrc}
              alt={brandName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
              }}
            />
          </Box>
          {/* <Divider
            sx={{
              width: "48px",
              bgcolor: theme.palette.mode === "light" ? "#666" : "#ddd",
            }}
          /> */}
          <Stack
            spacing={2}
            direction="column"
            alignItems={"center"}
            sx={{ width: "max-content" }}
          >
            {Nav_Buttons.map((el) =>
              el.index === selected ? (
                <Box sx={activePillSx} key={el.index}>
                  <IconButton onClick={() => handleChangeTab(el.index)} sx={activeIconSx}>
                    {el.icon}
                  </IconButton>
                </Box>
              ) : (
                <Tooltip title={el.title} placement="right" key={el.index}>
                  <Badge
                    badgeContent={el.index === 0 ? unreadCount : 0}
                    max={9}
                    sx={{
                      "& .MuiBadge-badge": {
                        background: "linear-gradient(135deg, #ff5b3e, #ff7e5f)",
                        color: "#fff",
                        boxShadow: "0 2px 8px rgba(255,91,62,0.45)",
                        fontWeight: 700,
                      },
                    }}
                  >
                    <IconButton onClick={() => handleChangeTab(el.index)} sx={idleBtnSx}>
                      {el.icon}
                    </IconButton>
                  </Badge>
                </Tooltip>
              )
            )}
            {/* Meeting quick action — navigates to full-page meeting hub */}
            {location.pathname.startsWith("/app/meeting") ? (
              <Box sx={activePillSx}>
                <IconButton onClick={() => navigate("/app/meeting")} sx={activeIconSx}>
                  <PiVideoConferenceFill size={22} />
                </IconButton>
              </Box>
            ) : (
              <Tooltip title="Meeting" placement="right">
                <IconButton onClick={() => navigate("/app/meeting")} sx={idleBtnSx}>
                  <PiVideoConferenceFill size={22} />
                </IconButton>
              </Tooltip>
            )}
            {/* Tools hub — polished brand-blue gradient tile (always vibrant) */}
            {(() => {
              const isActive = location.pathname.startsWith("/app/tools");
              const tile = (
                <Box
                  onClick={() => navigate("/app/tools")}
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                    background: isActive
                      ? "linear-gradient(135deg, #2065D1 0%, #1242a3 100%)"
                      : "linear-gradient(135deg, rgba(32,101,209,0.18) 0%, rgba(32,101,209,0.08) 100%)",
                    border: isActive
                      ? "1px solid rgba(126,181,255,0.6)"
                      : "1px solid rgba(126,181,255,0.20)",
                    color: isActive ? "#ffffff" : "#7eb5ff",
                    boxShadow: isActive
                      ? "0 8px 22px rgba(32,101,209,0.50), inset 0 1px 0 rgba(255,255,255,0.18)"
                      : "0 4px 12px rgba(32,101,209,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px) scale(1.04)",
                      boxShadow: "0 10px 26px rgba(32,101,209,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
                      background: "linear-gradient(135deg, #2070e0 0%, #1242a3 100%)",
                      color: "#ffffff",
                    },
                  }}
                  aria-label="Tools"
                >
                  <PiToolboxDuotone size={22} weight="duotone" />
                  {/* tiny "new" dot to draw the eye, fades when active */}
                  {!isActive && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #ffd54a, #ffb74d)",
                        boxShadow: "0 0 0 2px #0b0f1e",
                      }}
                    />
                  )}
                </Box>
              );
              return isActive ? tile : (
                <Tooltip title="Tools" placement="right">{tile}</Tooltip>
              );
            })()}
            <Divider sx={{ width: "32px", borderColor: "rgba(255,255,255,0.08)" }} />
            {role !== 4 &&
              (selected === 4 ? (
                <Box sx={activePillSx}>
                  <IconButton sx={activeIconSx}>
                    <MdOutlineDashboardCustomize />
                  </IconButton>
                </Box>
              ) : (
                <Tooltip title="Admin" placement="right">
                  <IconButton onClick={() => handleChangeTab(4)} sx={idleBtnSx}>
                    <MdOutlineDashboardCustomize />
                  </IconButton>
                </Tooltip>
              ))}
          </Stack>
        </Stack>

        <Stack alignItems={"center"} spacing={2.5}>
          <Divider sx={{ width: "32px", borderColor: "rgba(255,255,255,0.08)" }} />
          <Tooltip title="AI Assistant" placement="right">
            {assistantOpen ? (
              <Box sx={{ ...activePillSx, borderRadius: "50%" }}>
                <IconButton
                  onClick={() => {
                    setAssistantOpen(false);
                    window.dispatchEvent(new CustomEvent("thechatnest:assistant", { detail: { open: false } }));
                  }}
                  sx={activeIconSx}
                >
                  <PiSparkle size={20} />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                onClick={() => {
                  setAssistantOpen(true);
                  window.dispatchEvent(new CustomEvent("thechatnest:assistant", { detail: { open: true } }));
                }}
                sx={{ ...idleBtnSx, borderRadius: "50%" }}
              >
                <PiSparkle size={20} />
              </IconButton>
            )}
          </Tooltip>
          <ToggleButton
            notDefault={true}
            open={toggleOpen}
            onToggle={handleToggle}
          />
          <SettingsDrawer open={toggleOpen} setOpen={setToggleOpen} />
          <Tooltip title="Profile" placement="right">
            {selected === 3 ? (
              <Box sx={{ ...activePillSx, borderRadius: "50%" }}>
                <IconButton id="profile-button" onClick={() => handleChangeTab(3)} sx={activeIconSx}>
                  <PiUserGear size={20} />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                id="profile-button"
                onClick={() => handleChangeTab(3)}
                sx={{
                  ...idleBtnSx,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <PiUserGear size={18} />
              </IconButton>
            )}
          </Tooltip>
          <MaterialUISwitch
            checked={themeMode === "dark"}
            onChange={() => {
              onToggleMode();
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

export default SideBar;
