import PropTypes from "prop-types";
import { useMemo, useState, useRef } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Tooltip,
  Typography,
  LinearProgress,
} from "@mui/material";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import {
  PiCopyDuotone,
  PiCheckBold,
  PiSparkleDuotone,
  PiShieldCheckDuotone,
} from "react-icons/pi";

// ─── Strong password generator ─────────────────────────────────────────────
// Builds a 16-char password guaranteed to satisfy upper/lower/digit/symbol
// requirements that most servers enforce. Uses crypto.getRandomValues for
// real entropy (Math.random is NOT safe for this).
const PASSWORD_LENGTH = 16;
const CHARS = {
  lower: "abcdefghijkmnopqrstuvwxyz",  // no l
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",   // no I, O
  digit: "23456789",                    // no 0, 1
  symbol: "!@#$%^&*()-_=+[]{}",
};
const pickFrom = (set) => {
  const buf = new Uint32Array(1);
  window.crypto.getRandomValues(buf);
  return set[buf[0] % set.length];
};
const generateStrongPassword = () => {
  const all = CHARS.lower + CHARS.upper + CHARS.digit + CHARS.symbol;
  const out = [
    pickFrom(CHARS.lower),
    pickFrom(CHARS.upper),
    pickFrom(CHARS.digit),
    pickFrom(CHARS.symbol),
  ];
  while (out.length < PASSWORD_LENGTH) out.push(pickFrom(all));
  // Fisher-Yates shuffle with crypto randoms
  for (let i = out.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join("");
};

// Score 0-4 with descriptive label
const scorePassword = (pw) => {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  score = Math.min(score, 4);
  const map = {
    0: { label: "Too weak", color: "#dc2626" },
    1: { label: "Weak", color: "#f97316" },
    2: { label: "Fair", color: "#f59e0b" },
    3: { label: "Good", color: "#22c55e" },
    4: { label: "Strong", color: "#16a34a" },
  };
  return { score, ...map[score] };
};

const ChangePasswordTab = ({ onSubmit, onPinSubmit, hasExistingPin }) => {
  const [submitting, setSubmitting] = useState(false);
  const [pinSubmitting, setPinSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  const strength = useMemo(() => scorePassword(newPasswordValue), [newPasswordValue]);

  const handleGenerate = () => {
    const fresh = generateStrongPassword();
    setNewPasswordValue(fresh);
    setConfirmPasswordValue(fresh);
    setShowNewPassword(true);
    setShowConfirmPassword(true);
  };

  const handleCopy = async () => {
    if (!newPasswordValue) return;
    try {
      await navigator.clipboard.writeText(newPasswordValue);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard not available — ignore */
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      current: formData.get("currentPassword") ?? "",
      next: newPasswordValue,
      confirm: confirmPasswordValue,
    };

    setSubmitting(true);
    try {
      const result = await onSubmit(payload);
      if (result !== false) {
        form.reset();
        setNewPasswordValue("");
        setConfirmPasswordValue("");
        setCopied(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      currentPin: formData.get("currentPin") ?? "",
      newPin: formData.get("newPin") ?? "",
      confirmPin: formData.get("confirmPin") ?? "",
    };

    setPinSubmitting(true);
    try {
      const result = await onPinSubmit(payload);
      if (result !== false) {
        event.currentTarget.reset();
      }
    } finally {
      setPinSubmitting(false);
    }
  };

  return (
    <Box maxWidth={520}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Change Password
      </Typography>

      <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
        <TextField
          name="currentPassword"
          label="Old Password"
          type={showCurrentPassword ? "text" : "password"}
          fullWidth
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={showCurrentPassword ? "Hide old password" : "Show old password"}
                >
                  {showCurrentPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Box>
          <TextField
            name="newPassword"
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            value={newPasswordValue}
            onChange={(e) => setNewPasswordValue(e.target.value)}
            fullWidth
            required
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={copied ? "Copied!" : "Copy password"} arrow>
                    <span>
                      <IconButton
                        edge="end"
                        onClick={handleCopy}
                        disabled={!newPasswordValue}
                        aria-label="Copy password"
                        size="small"
                      >
                        {copied ? (
                          <PiCheckBold size={16} color="#22c55e" />
                        ) : (
                          <PiCopyDuotone size={16} />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <IconButton
                    edge="end"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  >
                    {showNewPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Generator + strength meter */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mt: 1, flexWrap: "wrap", gap: 0.75 }}
          >
            <MuiLink
              component="button"
              type="button"
              underline="hover"
              onClick={handleGenerate}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: 13,
                fontWeight: 600,
                color: "primary.main",
                cursor: "pointer",
                border: 0,
                background: "transparent",
                p: 0,
              }}
            >
              <PiSparkleDuotone size={14} />
              Generate strong password
            </MuiLink>

            {newPasswordValue && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ ml: "auto" }}
              >
                <Box sx={{ width: 120 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(strength.score / 4) * 100}
                    sx={{
                      height: 5,
                      borderRadius: 999,
                      bgcolor: "rgba(0,0,0,0.08)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: strength.color,
                        transition: "background-color 0.25s ease",
                      },
                    }}
                  />
                </Box>
                <Chip
                  size="small"
                  icon={<PiShieldCheckDuotone size={12} />}
                  label={strength.label}
                  sx={{
                    bgcolor: `${strength.color}1a`,
                    color: strength.color,
                    fontWeight: 700,
                    fontSize: 11,
                    height: 22,
                    "& .MuiChip-icon": { color: strength.color, ml: 0.5 },
                  }}
                />
              </Stack>
            )}
          </Stack>
        </Box>

        <TextField
          name="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPasswordValue}
          onChange={(e) => setConfirmPasswordValue(e.target.value)}
          fullWidth
          required
          autoComplete="new-password"
          error={Boolean(
            confirmPasswordValue &&
              newPasswordValue &&
              confirmPasswordValue !== newPasswordValue
          )}
          helperText={
            confirmPasswordValue &&
            newPasswordValue &&
            confirmPasswordValue !== newPasswordValue
              ? "Passwords don't match"
              : " "
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          sx={{ alignSelf: "flex-start", px: 4 }}
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save"}
        </Button>
      </Stack>

      <Divider sx={{ my: 5 }} />

      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        Update Chat Lock PIN
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {hasExistingPin
          ? "Update the 4-digit PIN used to lock and unlock your chats."
          : "Set a new 4-digit PIN to lock and unlock your chats."}
      </Typography>

      <Stack component="form" spacing={2.5} onSubmit={handlePinSubmit}>
        {hasExistingPin && (
          <TextField
            name="currentPin"
            label="Current PIN"
            type="password"
            fullWidth
            required
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 4 }}
          />
        )}
        <TextField
          name="newPin"
          label="New PIN"
          type="password"
          fullWidth
          required
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 4 }}
        />
        <TextField
          name="confirmPin"
          label="Confirm PIN"
          type="password"
          fullWidth
          required
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 4 }}
        />

        <Button
          type="submit"
          variant="outlined"
          sx={{ alignSelf: "flex-start", px: 4 }}
          disabled={pinSubmitting}
        >
          {pinSubmitting
            ? "Saving..."
            : hasExistingPin
            ? "Update PIN"
            : "Set PIN"}
        </Button>
      </Stack>
    </Box>
  );
};

ChangePasswordTab.propTypes = {
  onSubmit: PropTypes.func,
  onPinSubmit: PropTypes.func,
  hasExistingPin: PropTypes.bool,
};

ChangePasswordTab.defaultProps = {
  onSubmit: () => {},
  onPinSubmit: () => {},
  hasExistingPin: false,
};

export default ChangePasswordTab;
