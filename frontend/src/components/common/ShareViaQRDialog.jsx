import { useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  PiCopyDuotone,
  PiCheckBold,
  PiQrCodeDuotone,
  PiXBold,
  PiDownloadDuotone,
} from "react-icons/pi";

const buildQrUrl = (data, size = 300) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&qzone=2&color=0b0f1e&bgcolor=ffffff&data=${encodeURIComponent(
    data
  )}`;

const ShareViaQRDialog = ({
  open,
  onClose,
  url,
  title,
  subtitle,
  filename,
}) => {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const copyTimerRef = useRef(null);
  const qrSrc = useMemo(() => (url ? buildQrUrl(url, 320) : ""), [url]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setToast("Couldn't copy — please copy manually.");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `${filename || "thechatnest-qr"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
    } catch {
      setToast("Couldn't download — try opening the QR in a new tab.");
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            py: 1.4,
            px: 2.25,
            background:
              theme.palette.mode === "light"
                ? "linear-gradient(135deg, #0b0f1e, #1a1f3a)"
                : "linear-gradient(135deg, #0b0f1e, #2a2f44)",
            color: "#fff",
          })}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: "rgba(255,213,74,0.18)",
                color: "#ffd54a",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PiQrCodeDuotone size={18} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#fff", lineHeight: 1.2 }}>
                {title || "Share via QR"}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close"
            sx={{ color: "rgba(255,255,255,0.85)" }}
          >
            <PiXBold size={16} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, textAlign: "center" }}>
          {/* QR frame */}
          <Box
            sx={{
              width: 240,
              height: 240,
              margin: "0 auto 1.25rem",
              padding: 1.5,
              borderRadius: 2,
              bgcolor: "#fff",
              boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
              border: "1px solid rgba(15,23,42,0.08)",
              position: "relative",
            }}
          >
            {qrSrc ? (
              <img
                src={qrSrc}
                alt="QR code"
                width={200}
                height={200}
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            ) : (
              <Typography color="text.secondary">No link to share</Typography>
            )}

            {/* Corner accents */}
            {["tl", "tr", "bl", "br"].map((corner) => (
              <Box
                key={corner}
                sx={{
                  position: "absolute",
                  width: 18,
                  height: 18,
                  borderColor: "primary.main",
                  borderStyle: "solid",
                  ...(corner === "tl" && {
                    top: -2,
                    left: -2,
                    borderWidth: "3px 0 0 3px",
                    borderTopLeftRadius: 8,
                  }),
                  ...(corner === "tr" && {
                    top: -2,
                    right: -2,
                    borderWidth: "3px 3px 0 0",
                    borderTopRightRadius: 8,
                  }),
                  ...(corner === "bl" && {
                    bottom: -2,
                    left: -2,
                    borderWidth: "0 0 3px 3px",
                    borderBottomLeftRadius: 8,
                  }),
                  ...(corner === "br" && {
                    bottom: -2,
                    right: -2,
                    borderWidth: "0 3px 3px 0",
                    borderBottomRightRadius: 8,
                  }),
                }}
              />
            ))}
          </Box>

          {/* URL chip */}
          {url && (
            <Box
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                padding: "0.5rem 0.75rem 0.5rem 1rem",
                borderRadius: 1.25,
                bgcolor:
                  theme.palette.mode === "light"
                    ? "rgba(15,23,42,0.04)"
                    : "rgba(255,255,255,0.05)",
                border: `1px solid ${theme.palette.divider}`,
                mb: 2,
              })}
            >
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  textAlign: "left",
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                  color: "text.secondary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {url}
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy"} arrow>
                <IconButton size="small" onClick={handleCopy} aria-label="Copy URL">
                  {copied ? (
                    <PiCheckBold size={14} color="#22c55e" />
                  ) : (
                    <PiCopyDuotone size={14} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          )}

          <Stack direction="row" spacing={1} justifyContent="center">
            <Button
              variant="outlined"
              size="small"
              startIcon={<PiDownloadDuotone size={14} />}
              onClick={handleDownload}
              disabled={!url}
              sx={{ textTransform: "none", borderRadius: 999 }}
            >
              Download QR
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={copied ? <PiCheckBold size={14} /> : <PiCopyDuotone size={14} />}
              onClick={handleCopy}
              disabled={!url}
              sx={{ textTransform: "none", borderRadius: 999 }}
            >
              {copied ? "Copied" : "Copy link"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2500}
        onClose={() => setToast("")}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

ShareViaQRDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  url: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  filename: PropTypes.string,
};

ShareViaQRDialog.defaultProps = {
  url: "",
  title: "",
  subtitle: "",
  filename: "",
};

export default ShareViaQRDialog;
