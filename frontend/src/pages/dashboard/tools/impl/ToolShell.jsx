import PropTypes from "prop-types";
import { Box, Stack, Typography } from "@mui/material";

// Small helpers shared by every tool — keeps the per-tool files terse.
export const ToolSection = ({ title, hint, children, action }) => (
  <Box sx={{ mb: 2.5 }}>
    {(title || hint) && (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 0.85 }}
      >
        <Box>
          {title && (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "text.secondary",
                letterSpacing: 0.6,
                textTransform: "uppercase",
                fontSize: 11,
              }}
            >
              {title}
            </Typography>
          )}
          {hint && (
            <Typography color="text.disabled" sx={{ fontSize: 12, ml: title ? 1 : 0, display: "inline" }}>
              {hint}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
    )}
    {children}
  </Box>
);
ToolSection.propTypes = {
  title: PropTypes.node,
  hint: PropTypes.node,
  children: PropTypes.node,
  action: PropTypes.node,
};

export const monoFont = '"JetBrains Mono", "Fira Code", ui-monospace, monospace';
