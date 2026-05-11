import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import {
  PiArrowClockwiseDuotone,
  PiArrowUpRightDuotone,
  PiBriefcaseDuotone,
  PiCheckSquareDuotone,
  PiCodeDuotone,
  PiColumnsDuotone,
  PiFileTextDuotone,
  PiFlameDuotone,
  PiHandPointingDuotone,
  PiImageDuotone,
  PiListDuotone,
  PiMicrophoneDuotone,
  PiPenDuotone,
  PiPencilDuotone,
  PiSlidersDuotone,
  PiUserDuotone,
  PiUsersDuotone,
  PiArrowRightBold,
} from "react-icons/pi";

const features = [
  {
    Icon: PiBriefcaseDuotone,
    accent: "#6d5dfc",
    title: "File Deck",
    description: "Every file shared in your workspace, in one searchable place. Drop your own files too.",
  },
  {
    Icon: PiArrowClockwiseDuotone,
    accent: "#ec4899",
    title: "Recall",
    description: "Sent the wrong message? Pull it back from both sides — up to ten minutes later.",
  },
  {
    Icon: PiListDuotone,
    accent: "#0ea5e9",
    title: "Quick Response Panel",
    description: "Save snippets, links, images, and replies. Drop them into any chat in one click.",
  },
  {
    Icon: PiColumnsDuotone,
    accent: "#22c55e",
    title: "Layout",
    description: "Reshape your chat workspace. Drag the member list aside for a wider, focused view.",
  },
  {
    Icon: PiPencilDuotone,
    accent: "#f59e0b",
    title: "Message Edit",
    description: "Fix a typo after sending. Edit without deleting — your readers see the latest version.",
  },
  {
    Icon: PiMicrophoneDuotone,
    accent: "#14b8a6",
    title: "Audio Messaging",
    description: "Quick voice notes when typing is slow. Plays back across web, desktop, and mobile.",
  },
  {
    Icon: PiHandPointingDuotone,
    accent: "#a855f7",
    title: "Join Now",
    description: "Walked in late on a group call? Hop into the live session with a single tap.",
  },
  {
    Icon: PiFileTextDuotone,
    accent: "#0ea5e9",
    title: "Attachment Preview",
    description: "Open Docs, Sheets, PDFs, images, and videos inline — no third-party app needed.",
  },
  {
    Icon: PiUsersDuotone,
    accent: "#ec4899",
    title: "Airtime Groups",
    description: "Broadcast company-wide updates without the noise — admins post, members read.",
  },
  {
    Icon: PiFlameDuotone,
    accent: "#f97316",
    title: "Burnout",
    description: "Self-destructing private chats for sensitive material — no backups, no trace.",
  },
  {
    Icon: PiArrowUpRightDuotone,
    accent: "#22c55e",
    title: "Forkout",
    description: "Send one message to many groups and people at once — no copy-paste marathon.",
  },
  {
    Icon: PiCheckSquareDuotone,
    accent: "#6d5dfc",
    title: "Read Receipts",
    description: "Know exactly when each recipient opened your message — opt-in per chat.",
  },
  {
    Icon: PiUserDuotone,
    accent: "#14b8a6",
    title: "Guest Members",
    description: "Invite clients, vendors, and contractors to focused channels — without full access.",
  },
  {
    Icon: PiCodeDuotone,
    accent: "#a855f7",
    title: "Jointly Code",
    description: "A live code editor inside calls. Pair-program with built-in audio and screen share.",
  },
  {
    Icon: PiPenDuotone,
    accent: "#f59e0b",
    title: "Self Message",
    description: "A private notepad inside chat — bookmarks, links, drafts — synced everywhere.",
  },
  {
    Icon: PiSlidersDuotone,
    accent: "#0ea5e9",
    title: "Chat Filters",
    description: "Slice any conversation by files, images, videos, or links — find what you need fast.",
  },
  {
    Icon: PiImageDuotone,
    accent: "#ec4899",
    title: "Wallpapers",
    description: "Personalize your chat backdrop with curated wallpapers or upload your own.",
  },
];

const settings = {
  centerMode: false,
  dots: true,
  autoplay: true,
  autoplaySpeed: 3500,
  pauseOnHover: true,
  infinite: true,
  speed: 600,
  slidesToShow: 3,
  arrows: false,
  slidesToScroll: 1,
  responsive: [
    { breakpoint: 1200, settings: { slidesToShow: 3 } },
    { breakpoint: 992, settings: { slidesToShow: 2 } },
    { breakpoint: 700, settings: { slidesToShow: 1, dots: true } },
  ],
};

const FeaturesCarousel = () => {
  return (
    <section className="section-dark tcn-carousel-section" style={{ padding: "6rem 0", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(800px 400px at 80% 10%, rgba(109,93,252,0.22), transparent 60%), radial-gradient(700px 350px at 10% 90%, rgba(255,213,74,0.08), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="section-title" style={{ textAlign: "center" }}>
          <span
            className="eyebrow"
            style={{
              background: "rgba(255,213,74,0.12)",
              color: "#ffd54a",
            }}
          >
            Productivity superpowers
          </span>
          <h2 style={{ marginTop: "1rem", color: "#fff", textAlign: "center" }}>
            17 little features that save your team hours
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", textAlign: "center", marginLeft: "auto", marginRight: "auto" }}>
            Quick wins, baked right into chat — so your team spends less time switching tools
            and more time shipping work.
          </p>
        </div>

        <Slider {...settings}>
          {features.map((f, idx) => (
            <div key={idx} style={{ padding: "0.75rem" }}>
              <div className="tcn-feature-slide">
                <div
                  className="tcn-feature-icon"
                  style={{
                    background: `${f.accent}1a`,
                    color: f.accent,
                  }}
                >
                  <f.Icon size={28} />
                </div>
                <h3 className="tcn-feature-title">{f.title}</h3>
                <p className="tcn-feature-desc">{f.description}</p>
              </div>
            </div>
          ))}
        </Slider>

        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link
            to="/features"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0.7rem 1.4rem",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.95rem",
              backdropFilter: "blur(8px)",
              textDecoration: "none",
            }}
          >
            Explore all features <PiArrowRightBold size={14} />
          </Link>
        </div>
      </div>

      <style>{`
        .tcn-feature-slide {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--tcn-radius-lg);
          padding: 1.75rem;
          height: 100%;
          min-height: 220px;
          transition: background 0.22s ease, border-color 0.22s ease, transform 0.22s ease;
          backdrop-filter: blur(8px);
        }
        .tcn-feature-slide:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,213,74,0.25);
          transform: translateY(-4px);
        }
        .tcn-feature-icon {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          margin-bottom: 1.1rem;
        }
        .tcn-feature-title {
          color: #fff;
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0 0 0.45rem;
        }
        .tcn-feature-desc {
          color: rgba(255,255,255,0.65);
          font-size: 0.92rem;
          line-height: 1.6;
          margin: 0;
        }
        .tcn-carousel-section .slick-dots {
          bottom: -2.5rem;
        }
        .tcn-carousel-section .slick-dots li button:before {
          color: rgba(255,255,255,0.4);
          font-size: 9px;
        }
        .tcn-carousel-section .slick-dots li.slick-active button:before {
          color: #ffd54a;
          opacity: 1;
        }
      `}</style>
    </section>
  );
};

export default FeaturesCarousel;
