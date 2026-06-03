import { Box, Link, Stack, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";


const getYouTubeVideoId = (value = "") => {
  if (!value) return null;
  try {
    const normalized = value.startsWith("http") ? value : `https://${value}`;
    const parsed = new URL(normalized);
    const hostname = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    if (hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (hostname.endsWith("youtube.com")) {
      if (parsed.searchParams.get("v")) {
        return parsed.searchParams.get("v");
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] || null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2] || null;
      }
    }
  } catch {
    return null;
  }
  return null;
};

const buildYouTubeEmbedUrl = (videoId) =>
  `https://www.youtube.com/embed/${videoId}`;


const LinkMsg = ({ message, own = false }) => {
  const { url, title, description, thumbnail } =
    message?.content ?? {};
  const theme = useTheme();

  const youTubeId = getYouTubeVideoId(url);
  const isYouTubeLink = Boolean(youTubeId);
  const youTubeEmbedUrl = isYouTubeLink ? buildYouTubeEmbedUrl(youTubeId) : "";
  const resolvedThumbnail =
    thumbnail ||
    (youTubeId ? `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg` : "");

  // Outgoing bubbles use brand color background — dark text is invisible there,
  // so we mirror the bubble's contrast text (white) for link/title/description
  // and use a translucent white card for the preview shell.
  const cardBg = own
    ? alpha("#ffffff", 0.14)
    : theme.palette.background.default;
  const titleColor = own
    ? theme.palette.primary.contrastText || "#fff"
    : theme.palette.text.primary;
  const descColor = own
    ? alpha(theme.palette.primary.contrastText || "#fff", 0.78)
    : theme.palette.text.secondary;
  const linkColor = own
    ? theme.palette.primary.contrastText || "#fff"
    : theme.palette.text.primary;

  return (
    <Stack spacing={1.25} sx={{ maxWidth: !isYouTubeLink ? 400 : null }}>
      <Box
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          background: cardBg,
          border: own ? `1px solid ${alpha("#ffffff", 0.18)}` : "none",
        }}
      >
        {isYouTubeLink ? (
          <Box
            component="iframe"
            title={title || `YouTube video ${youTubeId}`}
            src={youTubeEmbedUrl}
            width="100%"
            minWidth={"550px"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            sx={{
              border: 0,
              display: "block",
              width: "100%",
              aspectRatio: "16 / 9",
              backgroundColor: theme.palette.background.default,
            }}
          />
        ) : resolvedThumbnail ? (
          <Box
            component="img"
            src={resolvedThumbnail}
            alt={title || url}
            sx={{
              width: "100%",
              display: "block",
              objectFit: "cover",
              aspectRatio: "16 / 9",
            }}
          />
        ) : null}
        {!isYouTubeLink ? (
          <Box sx={{ padding: !isYouTubeLink && 1 }}>
            {title ? (
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: titleColor,
                  wordBreak: "break-word",
                  my: 0.5,
                }}
              >
                {title}
              </Typography>
            ) : null}
            {description ? (
              <Typography
                variant="caption"
                sx={{
                  color: descColor,
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {description}
              </Typography>
            ) : null}
            
          </Box>
        ) : null}
      </Box>
    
      {url ? (
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          underline="always"
          sx={{
            wordBreak: "break-all",
            color: linkColor,
            textDecorationColor: own
              ? alpha("#ffffff", 0.6)
              : alpha(theme.palette.text.primary, 0.4),
            display: "inline-block",
            fontSize: "14px",
            fontWeight: 500,
            maxWidth: "98%",
            "&:hover": {
              color: linkColor,
              textDecorationColor: linkColor,
            },
          }}
        >
          {url}
        </Link>
      ) : null}
      {/* Intentionally showing only a single footer link to avoid duplicates */}
    </Stack>
  );
};

export default LinkMsg;
