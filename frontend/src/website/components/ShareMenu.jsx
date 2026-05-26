import React, { useEffect, useRef, useState } from "react";
import {
  PiWhatsappLogoDuotone,
  PiEnvelopeSimpleDuotone,
  PiLinkedinLogoDuotone,
  PiTwitterLogoDuotone,
  PiFacebookLogoDuotone,
  PiLinkSimpleDuotone,
  PiCheckBold,
  PiShareNetworkDuotone,
} from "react-icons/pi";

// Generic share popover. Tries the native Web Share API first (great on
// mobile), then falls back to a popover with WhatsApp / Email / LinkedIn /
// X / Facebook / Copy link options. Caller passes the URL + title to share.
const ShareMenu = ({
  url,
  title = "Check this out",
  text = "",
  align = "right",
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleTriggerClick = async () => {
    // Prefer native share on mobile / supported browsers
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: text || title, url });
        return;
      } catch {
        // User cancelled — fall through to popover
      }
    }
    setOpen((v) => !v);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedBody = encodeURIComponent(`${text || title}\n\n${url}`);

  const channels = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      Icon: PiWhatsappLogoDuotone,
      href: `https://wa.me/?text=${encodedBody}`,
      color: "#25d366",
    },
    {
      key: "email",
      label: "Email",
      Icon: PiEnvelopeSimpleDuotone,
      href: `mailto:?subject=${encodedTitle}&body=${encodedBody}`,
      color: "#6d5dfc",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      Icon: PiLinkedinLogoDuotone,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "#0a66c2",
    },
    {
      key: "twitter",
      label: "X / Twitter",
      Icon: PiTwitterLogoDuotone,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "#0f1419",
    },
    {
      key: "facebook",
      label: "Facebook",
      Icon: PiFacebookLogoDuotone,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "#1877f2",
    },
  ];

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <style>{`
        .tcn-share-trigger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.65rem 1.15rem;
          background: #ffffff;
          color: #11162a;
          border: 1px solid rgba(17, 22, 42, 0.12);
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .tcn-share-trigger:hover {
          border-color: #6d5dfc;
          color: #6d5dfc;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px -8px rgba(109, 93, 252, 0.45);
        }
        .tcn-share-pop {
          position: absolute;
          top: calc(100% + 10px);
          ${align === "right" ? "right: 0;" : "left: 0;"}
          min-width: 240px;
          background: #ffffff;
          border: 1px solid rgba(17, 22, 42, 0.08);
          border-radius: 14px;
          box-shadow: 0 24px 48px -16px rgba(15, 23, 42, 0.28);
          padding: 0.5rem;
          z-index: 60;
          animation: tcnSharePop 0.15s ease-out;
        }
        @keyframes tcnSharePop {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tcn-share-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.7rem 0.85rem;
          border-radius: 10px;
          font-size: 0.92rem;
          color: #11162a;
          font-weight: 500;
          text-decoration: none;
          background: transparent;
          border: 0;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: background 0.12s ease;
        }
        .tcn-share-item:hover { background: rgba(109, 93, 252, 0.08); }
        .tcn-share-item .icon-wrap {
          display: inline-flex;
          width: 32px;
          height: 32px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(17, 22, 42, 0.04);
        }
        @media print {
          .tcn-share-trigger, .tcn-share-pop { display: none !important; }
        }
      `}</style>

      {trigger ? (
        React.cloneElement(trigger, { onClick: handleTriggerClick })
      ) : (
        <button
          type="button"
          className="tcn-share-trigger"
          onClick={handleTriggerClick}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <PiShareNetworkDuotone size={18} />
          Share
        </button>
      )}

      {open && (
        <div className="tcn-share-pop" role="menu">
          {channels.map((ch) => {
            const Cmp = ch.Icon;
            return (
              <a
                key={ch.key}
                className="tcn-share-item"
                href={ch.href}
                target="_blank"
                rel="noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <span className="icon-wrap" style={{ color: ch.color }}>
                  <Cmp size={18} />
                </span>
                {ch.label}
              </a>
            );
          })}
          <button
            type="button"
            className="tcn-share-item"
            onClick={handleCopy}
            role="menuitem"
          >
            <span className="icon-wrap" style={{ color: copied ? "#16a34a" : "#11162a" }}>
              {copied ? <PiCheckBold size={18} /> : <PiLinkSimpleDuotone size={18} />}
            </span>
            {copied ? "Link copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareMenu;
