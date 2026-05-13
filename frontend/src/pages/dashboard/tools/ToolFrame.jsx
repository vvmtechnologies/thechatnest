import PropTypes from "prop-types";
import { Box, Breadcrumbs, Link, Stack, Typography, Chip } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PiCaretRightBold, PiToolboxDuotone } from "react-icons/pi";
import { CATEGORIES } from "./registry.js";

// Wraps every individual tool page with a consistent header (breadcrumb,
// title, description, category chip) plus a scrollable content area.
const ToolFrame = ({ tool, children }) => {
  const tint = CATEGORIES[tool.category]?.tint || "#2065D1";

  return (
    <Box
      sx={(theme) => ({
        flex: 1,
        height: "100%",
        overflow: "auto",
        backgroundColor: theme.palette.background.default,
      })}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 3.5 } }}>
        <Breadcrumbs
          separator={<PiCaretRightBold size={11} />}
          sx={{ fontSize: 13, mb: 1.5 }}
          aria-label="breadcrumb"
        >
          <Link
            component={RouterLink}
            to="/app/tools"
            underline="hover"
            color="text.secondary"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
          >
            <PiToolboxDuotone size={14} />
            Tools
          </Link>
          <Typography color="text.primary" fontSize={13} fontWeight={600}>
            {tool.title}
          </Typography>
        </Breadcrumbs>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ mb: 0.75, flexWrap: "wrap" }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.015em",
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            {tool.title}
          </Typography>
          <Chip
            label={CATEGORIES[tool.category]?.label || "Tool"}
            size="small"
            sx={{
              height: 22,
              bgcolor: `${tint}1a`,
              color: tint,
              border: `1px solid ${tint}55`,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.3,
            }}
          />
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 3, fontSize: 14 }}>
          {tool.desc}
        </Typography>

        <Box>{children}</Box>
      </Box>
    </Box>
  );
};

ToolFrame.propTypes = {
  tool: PropTypes.shape({
    slug: PropTypes.string,
    title: PropTypes.string,
    desc: PropTypes.string,
    category: PropTypes.string,
  }).isRequired,
  children: PropTypes.node,
};

export default ToolFrame;
