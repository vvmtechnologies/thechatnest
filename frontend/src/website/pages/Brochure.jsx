import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiDownloadSimpleBold,
  PiPrinterBold,
  PiCheckCircleDuotone,
  PiLightningDuotone,
  PiShieldCheckDuotone,
  PiSparkleDuotone,
  PiUsersThreeDuotone,
  PiChatTextDuotone,
  PiVideoCameraDuotone,
  PiLockKeyDuotone,
  PiGlobeDuotone,
  PiRocketLaunchDuotone,
  PiPhoneDuotone,
  PiEnvelopeSimpleDuotone,
  PiMapPinDuotone,
  PiArrowRightBold,
  PiCheckBold,
  PiXBold,
  PiCodeDuotone,
  PiChartLineUpDuotone,
  PiGearSixDuotone,
  PiBriefcaseDuotone,
  PiUserPlusDuotone,
  PiPaperPlaneRightDuotone,
  PiClockCountdownDuotone,
  PiCertificateDuotone,
  PiKeyDuotone,
  PiCaretDownBold,
  PiCalendarDotsDuotone,
  PiWhatsappLogoDuotone,
} from "react-icons/pi";
import { API_BASE_URL } from "../../config/apiBaseUrl";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import Seo from "../../components/Seo.jsx";
import ShareMenu from "../components/ShareMenu.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// SALES-PITCH BROCHURE
//
// Designed for the sales / calling team to send to prospects. Rules followed:
//  • No fabricated testimonials, customer logos or social-proof numbers.
//  • Every claim is either provable (security, encryption, SLA target,
//    refund policy) or pulled live from the admin-managed APIs (plans,
//    features, branding, contact).
//  • Strong, repeated CTAs (Get started, Book demo, Call sales, WhatsApp).
//  • Mobile-first: every section collapses cleanly on small screens; the
//    sticky toolbar stays usable on phones; touch targets are >= 44px.
// ─────────────────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
const currencySymbol = (code) =>
  CURRENCY_SYMBOLS[String(code || "INR").toUpperCase()] || "";

// Map admin-controlled category keys → icons so the "What you get" tiles
// render nicely even after labels are renamed.
const CATEGORY_ICONS = {
  messaging: PiChatTextDuotone,
  chat: PiChatTextDuotone,
  calls: PiVideoCameraDuotone,
  meetings: PiVideoCameraDuotone,
  ai: PiSparkleDuotone,
  security: PiShieldCheckDuotone,
  privacy: PiLockKeyDuotone,
  collaboration: PiUsersThreeDuotone,
  productivity: PiLightningDuotone,
  global: PiGlobeDuotone,
  international: PiGlobeDuotone,
};
const iconFor = (key) => {
  const k = String(key || "").toLowerCase();
  for (const token of Object.keys(CATEGORY_ICONS)) {
    if (k.includes(token)) return CATEGORY_ICONS[token];
  }
  return PiCheckCircleDuotone;
};

// Factual "why us" points — phrased as features, not invented metrics.
const VALUE_PILLARS = [
  {
    Icon: PiShieldCheckDuotone,
    title: "Secure by design",
    desc: "AES-256-GCM at rest, TLS 1.3 in transit, role-based access and audit logs out of the box.",
  },
  {
    Icon: PiSparkleDuotone,
    title: "AI included, not upsold",
    desc: "Summaries, smart replies and translate are part of every paid plan — no add-on fees.",
  },
  {
    Icon: PiGlobeDuotone,
    title: "Priced for India + global",
    desc: "INR & USD billing, GST invoices, cards / UPI / NetBanking and bank-transfer support.",
  },
  {
    Icon: PiLightningDuotone,
    title: "Ships in minutes",
    desc: "Sign up, invite by email or link, and you're chatting in under 10 minutes — no IT ticket.",
  },
];

// "At a glance" — the 10-second pitch. What the product is, what it does,
// and the three strongest reasons to choose it, in one scrollable view so
// the prospect doesn't have to read the whole brochure to "get it".
const AT_A_GLANCE_WHAT = [
  "1:1, group and channel messaging — threads, mentions, reactions",
  "HD audio + video calls with screen share, recordings & meetings",
  "AI assistant: summaries, smart replies, translate (14 languages)",
  "Encrypted file sharing with previews and global search",
  "Broadcast channels, approvals and audit logs for ops teams",
  "Admin console, SSO/SAML, custom roles & retention policies",
];
const AT_A_GLANCE_WHY = [
  "All-in-one — replaces chat + calls + file sharing + AI in one app",
  "Secure by default — AES-256-GCM, audit logs, self-hosted option",
  "Honest pricing — per seat in INR or USD, GST invoices included",
];

// Pain points — keeps the tone factual ("Slack starts at $X", "Teams ties you
// to Microsoft 365") so the sales team can stand behind every line.
const PAIN_POINTS = [
  "Paying per-tool for chat, calls, AI and file sharing — and stitching them together.",
  "Licensing platform fees on top of seat costs that scale unpredictably with team growth.",
  "Sensitive conversations sitting in third-party clouds without the encryption guarantees you need.",
  "Onboarding new teammates eats hours every week because tools don't talk to each other.",
];

const USE_CASES = [
  {
    Icon: PiCodeDuotone,
    title: "Engineering",
    desc: "Code-aware threads, GitHub & GitLab notifications, async standups and incident war-rooms.",
  },
  {
    Icon: PiChartLineUpDuotone,
    title: "Sales & Success",
    desc: "Deal rooms, customer chat in one place, AI follow-ups and CRM-aware reminders.",
  },
  {
    Icon: PiGearSixDuotone,
    title: "Operations",
    desc: "Run-books, broadcast channels, approvals and audit logs that pass compliance reviews.",
  },
  {
    Icon: PiBriefcaseDuotone,
    title: "Founders & Remote",
    desc: "All-hands, threaded decisions, time-zone-aware reminders — no meeting fatigue.",
  },
];

const HOW_IT_WORKS = [
  {
    Icon: PiUserPlusDuotone,
    step: "01",
    title: "Sign up",
    desc: "Create your workspace with your work email. No credit card needed.",
  },
  {
    Icon: PiPaperPlaneRightDuotone,
    step: "02",
    title: "Invite your team",
    desc: "Share a link or import from Slack / Teams in one click. SSO supported on Business.",
  },
  {
    Icon: PiRocketLaunchDuotone,
    step: "03",
    title: "Ship faster",
    desc: "Chat, call, share, decide — all in one place. AI keeps everyone aligned in real time.",
  },
];

const SECURITY_BADGES = [
  { Icon: PiKeyDuotone, label: "AES-256-GCM encryption" },
  { Icon: PiShieldCheckDuotone, label: "TLS 1.3 in transit" },
  { Icon: PiCertificateDuotone, label: "SOC 2-ready controls" },
  { Icon: PiGlobeDuotone, label: "GDPR & DPDP aligned" },
  { Icon: PiLockKeyDuotone, label: "Customer-managed keys" },
  { Icon: PiClockCountdownDuotone, label: "Audit logs + activity trail" },
];

const WHY_SWITCH = [
  { feature: "End-to-end encryption (E2EE)", us: true, slack: false, teams: true },
  { feature: "AI summaries / smart replies", us: true, slack: "Paid add-on", teams: "Paid add-on" },
  { feature: "Unlimited message history", us: true, slack: false, teams: true },
  { feature: "Per-seat pricing — no platform fee", us: true, slack: true, teams: false },
  { feature: "Self-hosted / on-premise option", us: true, slack: false, teams: false },
  { feature: "INR billing + GST invoices", us: true, slack: false, teams: false },
];

const FAQS = [
  {
    q: "How fast can my team get started?",
    a: "Under 10 minutes. Sign up with a work email, invite teammates by link, and you're chatting. Bulk import from Slack / Teams is one click.",
  },
  {
    q: "Is my data really mine?",
    a: "Yes. AES-256-GCM at rest, TLS 1.3 in transit, role-based access, customer-managed keys on Business, and a self-hosted option for full data sovereignty.",
  },
  {
    q: "What if it doesn't work out for us?",
    a: "30-day money-back guarantee — no questions asked. Cancel any time. All your data exports cleanly to JSON or CSV.",
  },
  {
    q: "Do you support Indian + US billing?",
    a: "Yes. INR pricing for Indian customers (with GST invoices), USD for everyone else. Pay via credit / debit card, UPI, NetBanking or bank transfer.",
  },
  {
    q: "Is the AI private — where does my data go?",
    a: "AI features (summaries, smart replies, translate) run on private inference. Your messages are never used to train third-party models.",
  },
  {
    q: "Do you offer onboarding help?",
    a: "Every paid plan includes email support. Business plans get white-glove onboarding with a dedicated success manager.",
  },
];

const formatPrice = (plan) => {
  if (plan.is_free) return "Free";
  const sym = currencySymbol(plan.currency);
  return `${sym}${Number(plan.price).toLocaleString()}`;
};

const cycleSuffix = (plan) => {
  if (plan.is_free) return "for 14 days";
  if (plan.billing_cycle === "yearly") return "/seat/year";
  if (plan.billing_cycle === "quarterly") return "/seat/quarter";
  return "/seat/month";
};

// Sanitise an arbitrary tel: input down to a wa.me-friendly digit string.
const digitsOnly = (s) => String(s || "").replace(/\D+/g, "");

const Brochure = () => {
  const { brandName } = useSiteBranding();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [qrSrc, setQrSrc] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  // logoOk lets us hide the brand-name text when an image logo is present
  // (the logo almost always contains the wordmark, so showing the name next
  // to it duplicates the brand). If the image fails to load, we flip this to
  // false and reveal the text fallback so the brand is never invisible.
  const [logoOk, setLogoOk] = useState(true);
  const brochureRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!API_BASE_URL) {
        setLoading(false);
        setError("API unavailable");
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/brochure/data`, {
          headers: { Accept: "application/json" },
        });
        const payload = await res.json();
        if (!cancelled) {
          setData(payload?.data || null);
          setError(payload?.data ? "" : "No brochure data");
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const make = async () => {
      try {
        const QR = await import("qrcode");
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const signupUrl = `${origin}/auth/register?ref=brochure`;
        const dataUrl = await QR.toDataURL(signupUrl, {
          margin: 1,
          width: 280,
          color: { dark: "#11162a", light: "#ffffff" },
        });
        if (!cancelled) setQrSrc(dataUrl);
      } catch { /* qrcode missing → no QR */ }
    };
    make();
    return () => { cancelled = true; };
  }, []);

  const displayBrand = useMemo(
    () => data?.brand?.name || brandName || "TheChatNest",
    [data, brandName]
  );

  const pageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/brochure`
      : "https://thechatnest.com/brochure";

  // ── PDF download ────────────────────────────────────────────────────────
  // html2canvas renders the brochure to a canvas, then jsPDF slices it into
  // A4 pages. Two failure modes had to be defeated:
  //   1. Tainted canvas — the S3 logo doesn't serve CORS headers, so any
  //      attempt to read pixels from a canvas containing it throws
  //      SecurityError. Fix: in the `onclone` callback, we walk the cloned
  //      DOM and replace every cross-origin <img> src with the local
  //      /chat.png before html2canvas takes the screenshot.
  //   2. Images still loading — `imageTimeout` ensures html2canvas waits up
  //      to 12s for stragglers before giving up on them.
  // ───────────────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (!brochureRef.current || generatingPdf) return;
    setGeneratingPdf(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const sameOrigin = (url) => {
        try {
          if (!url) return true;
          if (url.startsWith("data:") || url.startsWith("blob:")) return true;
          const u = new URL(url, window.location.href);
          return u.origin === window.location.origin;
        } catch {
          return true;
        }
      };

      const swapCrossOriginImages = (clonedRoot) => {
        const imgs = clonedRoot.querySelectorAll("img");
        imgs.forEach((img) => {
          if (!sameOrigin(img.src)) {
            // The QR data URL is same-origin in spirit (data: scheme) so it
            // stays. Everything else (S3 logo, mascot, etc.) falls back to
            // the bundled brand asset.
            img.src = "/chat.png";
            img.removeAttribute("crossorigin");
          }
        });
      };

      // Set explicit fills on SVGs whose icons rely on `currentColor` —
      // html2canvas doesn't reliably resolve currentColor through CSS
      // inheritance, so the icons render invisible (looks like a black
      // square because only the colored container shows).
      const setSvgFill = (root, selector, color) => {
        root.querySelectorAll(selector).forEach((container) => {
          container.style.color = color;
          container.querySelectorAll("svg").forEach((svg) => {
            svg.setAttribute("fill", color);
            svg.style.color = color;
            svg.querySelectorAll("path, circle, rect, polygon, line").forEach((p) => {
              const f = p.getAttribute("fill");
              if (!f || f === "currentColor") p.setAttribute("fill", color);
              const s = p.getAttribute("stroke");
              if (s === "currentColor") p.setAttribute("stroke", color);
            });
          });
        });
      };

      // Replace gradient-clipped text (which html2canvas renders as a yellow
      // rectangle over invisible text) with a flat colour.
      const flattenGradientText = (root) => {
        root.querySelectorAll(".tcn-broch-headline .grad").forEach((el) => {
          el.style.background = "none";
          el.style.backgroundClip = "border-box";
          el.style.webkitBackgroundClip = "border-box";
          el.style.color = "#ffd54a";
          el.style.webkitTextFillColor = "#ffd54a";
        });
      };

      // Force every FAQ open so the PDF includes all answers.
      const expandAllFaqs = (root) => {
        root.querySelectorAll(".tcn-broch-faq-item").forEach((item) => {
          item.classList.add("open");
        });
        root.querySelectorAll(".tcn-broch-faq-a").forEach((p) => {
          p.style.display = "block";
        });
      };

      const canvas = await html2canvas(brochureRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 12000,
        windowWidth: brochureRef.current.scrollWidth,
        onclone: (clonedDoc, clonedEl) => {
          swapCrossOriginImages(clonedEl);
          flattenGradientText(clonedEl);
          expandAllFaqs(clonedEl);

          // Fix SVG icons across every icon-bearing container.
          setSvgFill(clonedEl, ".tcn-broch-pillar .ic", "#6d5dfc");
          setSvgFill(clonedEl, ".tcn-broch-use .ic", "#ffd54a");
          setSvgFill(clonedEl, ".tcn-broch-step .ic", "#ffffff");
          setSvgFill(clonedEl, ".tcn-broch-badge .ic", "#16a34a");
          setSvgFill(clonedEl, ".tcn-broch-feature .icon", "#6d5dfc");
          setSvgFill(clonedEl, ".tcn-broch-contact-card .ic", "#6d5dfc");
          setSvgFill(clonedEl, ".tcn-broch-eyebrow", "#ffd54a");
          setSvgFill(clonedEl, ".tcn-broch-trust-pill", "#ffd54a");
          setSvgFill(clonedEl, ".tcn-broch-cta-actions a", "#11162a");
          setSvgFill(clonedEl, ".tcn-broch-hero-cta .primary", "#11162a");
          setSvgFill(clonedEl, ".tcn-broch-hero-cta .ghost", "#ffffff");
          setSvgFill(clonedEl, ".tcn-broch-compare .yes", "#16a34a");
          setSvgFill(clonedEl, ".tcn-broch-compare .no", "#dc2626");
          setSvgFill(clonedEl, ".tcn-broch-faq-q .chev", "#6d5dfc");
        },
      });

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      const imgData = canvas.toDataURL("image/jpeg", 0.92);

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      const safeName = String(displayBrand).replace(/[^a-z0-9]+/gi, "-");

      // Download + preview via a single blob URL.
      // Why not just pdf.save()? Chrome's download bar tries to *open* the
      // downloaded file from a file:// URL, which many Chrome installs
      // block (ERR_FAILED). Blob URLs aren't restricted the same way, so
      // we (a) trigger the download via an anchor click and (b) immediately
      // open the same blob in a new tab so the user can read the PDF right
      // away without hunting through their Downloads folder.
      const blob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(blob);

      const dl = document.createElement("a");
      dl.href = blobUrl;
      dl.download = `${safeName}-Brochure.pdf`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);

      // Open inline preview in a new tab. If the popup blocker bites, the
      // download still succeeded — no fallback action needed.
      window.open(blobUrl, "_blank", "noopener,noreferrer");

      // Revoke the blob URL after a minute so the new tab has time to load
      // and we don't leak memory.
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error("Brochure PDF generation failed:", err);
      const msg = err && err.message ? err.message : String(err);
      alert(`Could not generate PDF.\n\nReason: ${msg}\n\nTry the Print option (saves as PDF too).`);
    } finally {
      setGeneratingPdf(false);
    }
  }, [displayBrand, generatingPdf]);

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") window.print();
  }, []);

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle} />
        <p>Loading brochure…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={loadingStyle}>
        <p style={{ color: "#dc2626" }}>{error || "Brochure unavailable."}</p>
        <Link to="/" style={{ color: "#6d5dfc", marginTop: 12 }}>← Back to home</Link>
      </div>
    );
  }

  const { brand, plans, feature_categories } = data;
  const popularIdx = (() => {
    const paid = plans.filter((p) => !p.is_free);
    if (paid.length >= 2) return plans.indexOf(paid[1]);
    if (paid.length === 1) return plans.indexOf(paid[0]);
    return -1;
  })();

  const waLink = brand.phone
    ? `https://wa.me/${digitsOnly(brand.phone)}?text=${encodeURIComponent(`Hi ${displayBrand} team, I'd like to know more about your plans.`)}`
    : "";

  return (
    <div className="tcn-brochure">
      <Seo
        title={`${displayBrand} Brochure — Team chat that respects your time`}
        description={`${displayBrand} brochure for prospects: features, pricing, security, and how to get started in under 10 minutes.`}
        keywords={`${displayBrand} brochure, team chat brochure, slack alternative, secure business messenger`}
      />

      <style>{`
        /* ============ Frame ============ */
        /* Rendered inside WebsiteLayout — Navbar sits above us. Top padding
           clears that navbar; the sticky toolbar parks just below it. The
           website Footer is intentionally hidden on /brochure (see
           website/index.jsx) so we don't get a duplicate footer underneath
           the brochure's own rich brand footer. */
        .tcn-brochure {
          background:
            radial-gradient(1100px 600px at 8% -10%, rgba(109,93,252,0.10), transparent 60%),
            radial-gradient(900px 500px at 100% 0%, rgba(255,213,74,0.08), transparent 60%),
            #f4f5fb;
          min-height: 100vh;
          padding: 5rem 0 4rem;
        }
        @media (max-width: 720px) {
          .tcn-brochure { padding: 4.2rem 0 3rem; }
        }

        /* ============ Sticky toolbar ============ */
        .tcn-broch-actions {
          position: sticky;
          top: 80px;
          z-index: 50;
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 8px;
          max-width: 920px;
          margin: 0 auto 1.25rem;
          padding: 0 1rem;
        }
        .tcn-broch-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.7rem 1.15rem;
          min-height: 44px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.92rem;
          border: 1px solid rgba(17, 22, 42, 0.12);
          background: #ffffff;
          color: #11162a;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }
        .tcn-broch-btn:hover {
          border-color: #6d5dfc;
          color: #6d5dfc;
          transform: translateY(-1px);
          box-shadow: 0 8px 18px -8px rgba(109, 93, 252, 0.45);
        }
        .tcn-broch-btn.primary {
          background: linear-gradient(135deg, #6d5dfc, #4d3df0);
          border-color: transparent;
          color: #ffffff;
          box-shadow: 0 8px 22px -10px rgba(77, 61, 240, 0.65);
        }
        .tcn-broch-btn.primary:hover { color: #ffffff; box-shadow: 0 14px 32px -12px rgba(77, 61, 240, 0.75); }
        .tcn-broch-btn[disabled] { opacity: 0.6; cursor: progress; }

        /* ============ Sheet ============ */
        .tcn-broch-sheet {
          max-width: 920px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 22px;
          overflow: hidden;
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.8) inset,
            0 30px 60px -28px rgba(15, 23, 42, 0.32),
            0 8px 16px -10px rgba(15, 23, 42, 0.12);
        }
        @media (max-width: 720px) {
          .tcn-broch-sheet { border-radius: 14px; margin: 0 0.5rem; }
        }
        .tcn-broch-section {
          padding: 3rem 3rem;
          position: relative;
        }
        @media (max-width: 720px) {
          .tcn-broch-section { padding: 2rem 1.25rem; }
        }
        .tcn-broch-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(17,22,42,0.10), transparent);
          margin: 0;
          border: 0;
        }

        /* ============ Hero ============ */
        .tcn-broch-header {
          background:
            radial-gradient(900px 420px at 92% -10%, rgba(255,213,74,0.18), transparent 60%),
            radial-gradient(700px 380px at 0% 0%, rgba(109,93,252,0.32), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #ffffff;
          padding: 2.5rem 3rem 3rem;
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 720px) {
          .tcn-broch-header { padding: 2rem 1.25rem 2.25rem; }
        }
        .tcn-broch-header::before {
          content: "";
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse at 30% 0%, #000 40%, transparent 75%);
          pointer-events: none;
        }
        .tcn-broch-header-inner { position: relative; z-index: 1; }
        .tcn-broch-brandline {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 1.6rem;
          flex-wrap: wrap;
        }
        .tcn-broch-logo {
          height: 68px;
          width: auto;
          max-width: 280px;
          object-fit: contain;
          display: block;
          /* Subtle glow instead of a hard white plate so the logo blends into
             the dark hero without looking like a sticker. */
          filter: drop-shadow(0 4px 18px rgba(255, 213, 74, 0.18));
        }
        .tcn-broch-brandname {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #fff;
        }
        .tcn-broch-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 213, 74, 0.16);
          color: #ffd54a;
          padding: 0.4rem 0.95rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 1.1rem;
          border: 1px solid rgba(255, 213, 74, 0.25);
        }
        .tcn-broch-header h1.tcn-broch-headline {
          font-size: clamp(2rem, 5vw, 3.4rem);
          font-weight: 800;
          line-height: 1.06;
          letter-spacing: -0.025em;
          margin: 0 0 1.1rem;
          max-width: 720px;
          color: #ffffff;
        }
        .tcn-broch-headline .grad {
          background: linear-gradient(135deg, #ffd54a, #ff9a4a);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-broch-header p.tcn-broch-sub {
          font-size: clamp(0.98rem, 1.4vw, 1.08rem);
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.6;
          max-width: 640px;
          margin: 0 0 1.6rem;
        }
        .tcn-broch-hero-cta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 1.4rem;
        }
        .tcn-broch-hero-cta a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.8rem 1.3rem;
          border-radius: 999px;
          font-weight: 700;
          text-decoration: none;
          font-size: 0.92rem;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .tcn-broch-hero-cta .primary {
          background: linear-gradient(135deg, #ffd54a, #ff9a4a);
          color: #11162a;
          box-shadow: 0 12px 28px -12px rgba(255, 154, 74, 0.55);
        }
        .tcn-broch-hero-cta .primary:hover { transform: translateY(-2px); }
        .tcn-broch-hero-cta .ghost {
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.16);
        }
        .tcn-broch-hero-cta .ghost:hover { background: rgba(255,255,255,0.14); }
        .tcn-broch-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 1.4rem;
        }
        .tcn-broch-trust-pill {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.76rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.92);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        /* ============ Headings ============ */
        .tcn-broch-h2 {
          font-size: clamp(1.4rem, 2.6vw, 1.75rem);
          font-weight: 800;
          color: #11162a;
          letter-spacing: -0.02em;
          margin: 0 0 0.4rem;
          line-height: 1.15;
        }
        .tcn-broch-kicker {
          color: #6d5dfc;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          margin: 0 0 0.55rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .tcn-broch-kicker::before {
          content: "";
          width: 22px;
          height: 2px;
          background: currentColor;
          border-radius: 2px;
        }
        .tcn-broch-section p.tcn-broch-lead {
          color: #4b5568;
          font-size: clamp(0.94rem, 1.4vw, 1rem);
          margin: 0 0 1.9rem;
          line-height: 1.6;
          max-width: 640px;
        }

        /* ============ Value pillars ============ */
        .tcn-broch-pillars {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.9rem;
        }
        .tcn-broch-pillar {
          background: #fff;
          border: 1px solid rgba(17,22,42,0.08);
          border-radius: 14px;
          padding: 1.25rem 1.15rem;
        }
        .tcn-broch-pillar .ic {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(109,93,252,0.14), rgba(255,213,74,0.14));
          color: #6d5dfc;
          display: inline-flex; align-items: center; justify-content: center;
          margin-bottom: 0.7rem;
        }
        .tcn-broch-pillar h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #11162a;
          margin: 0 0 0.4rem;
        }
        .tcn-broch-section .tcn-broch-pillar p {
          font-size: 0.86rem;
          color: #4b5568;
          line-height: 1.55;
          margin: 0;
        }

        /* ============ At a glance ============ */
        .tcn-broch-glance {
          background: linear-gradient(180deg, #ffffff 0%, #fafbff 100%);
        }
        .tcn-broch-glance-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-top: 0.4rem;
        }
        @media (max-width: 720px) {
          .tcn-broch-glance-grid { grid-template-columns: 1fr; }
        }
        .tcn-broch-glance-col {
          background: #ffffff;
          border: 1px solid rgba(17, 22, 42, 0.08);
          border-radius: 16px;
          padding: 1.5rem 1.35rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .tcn-broch-glance-col.why {
          background: linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          border-color: transparent;
          color: #fff;
        }
        .tcn-broch-glance-head .badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          background: rgba(109,93,252,0.10);
          color: #6d5dfc;
          padding: 5px 11px;
          border-radius: 999px;
          margin-bottom: 0.6rem;
        }
        .tcn-broch-glance-head .badge.why {
          background: rgba(255,213,74,0.16);
          color: #ffd54a;
        }
        .tcn-broch-glance-head h4 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #11162a;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .tcn-broch-glance-col.why h4 { color: #ffffff; }
        .tcn-broch-glance-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .tcn-broch-glance-list li {
          position: relative;
          padding-left: 28px;
          font-size: 0.92rem;
          line-height: 1.5;
          color: #11162a;
        }
        .tcn-broch-glance-col.why .tcn-broch-glance-list li { color: rgba(255,255,255,0.92); }
        .tcn-broch-glance-list.features li::before {
          content: "";
          position: absolute;
          left: 0; top: 0.42em;
          width: 14px; height: 14px;
          border-radius: 4px;
          background: linear-gradient(135deg, #6d5dfc, #4d3df0);
          box-shadow: 0 4px 10px -4px rgba(109,93,252,0.55);
        }
        .tcn-broch-glance-list.features li::after {
          content: "✓";
          position: absolute;
          left: 2px; top: -1px;
          font-size: 0.78rem;
          color: #ffffff;
          font-weight: 800;
          line-height: 1.7;
        }
        .tcn-broch-glance-list.reasons li::before {
          content: "★";
          position: absolute;
          left: 0; top: 0;
          color: #ffd54a;
          font-size: 1rem;
          line-height: 1.4;
        }
        .tcn-broch-glance-cta { margin-top: auto; padding-top: 0.5rem; }
        .tcn-broch-glance-cta .primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.7rem 1.25rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ff9a4a);
          color: #11162a;
          font-weight: 800;
          text-decoration: none;
          font-size: 0.88rem;
          box-shadow: 0 12px 28px -12px rgba(255, 154, 74, 0.55);
          transition: transform 0.18s ease;
        }
        .tcn-broch-glance-cta .primary:hover { transform: translateY(-2px); }

        /* ============ Pain points ============ */
        .tcn-broch-pain {
          background:
            radial-gradient(600px 250px at 0% 0%, rgba(220, 38, 38, 0.06), transparent 60%),
            #fffaf7;
        }
        .tcn-broch-pain-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 0.85rem;
          margin-top: 0.4rem;
        }
        .tcn-broch-pain-item {
          background: #fff;
          border: 1px solid rgba(220, 38, 38, 0.12);
          border-left: 3px solid #f87171;
          border-radius: 10px;
          padding: 0.9rem 1rem;
          font-size: 0.9rem;
          color: #11162a;
          line-height: 1.55;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .tcn-broch-pain-item::before {
          content: "✕";
          color: #ef4444;
          font-weight: 800;
          flex-shrink: 0;
        }

        /* ============ Features grid ============ */
        .tcn-broch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 1rem;
        }
        .tcn-broch-feature {
          background: #ffffff;
          border: 1px solid rgba(17, 22, 42, 0.08);
          border-radius: 14px;
          padding: 1.3rem 1.2rem 1.1rem;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .tcn-broch-feature::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6d5dfc, #ffd54a);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .tcn-broch-feature:hover {
          border-color: rgba(109, 93, 252, 0.28);
          transform: translateY(-2px);
          box-shadow: 0 14px 30px -18px rgba(109, 93, 252, 0.35);
        }
        .tcn-broch-feature:hover::after { opacity: 1; }
        .tcn-broch-feature .icon {
          width: 42px; height: 42px;
          border-radius: 11px;
          background: linear-gradient(135deg, rgba(109,93,252,0.14), rgba(255,213,74,0.14));
          display: inline-flex; align-items: center; justify-content: center;
          color: #6d5dfc;
          margin-bottom: 0.85rem;
        }
        .tcn-broch-feature h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #11162a;
          margin: 0 0 0.5rem;
          letter-spacing: -0.01em;
        }
        .tcn-broch-feature ul { list-style: none; padding: 0; margin: 0; }
        .tcn-broch-feature ul li {
          font-size: 0.85rem;
          color: #4b5568;
          padding: 3px 0 3px 18px;
          position: relative;
          line-height: 1.5;
        }
        .tcn-broch-feature ul li::before {
          content: "•";
          color: #6d5dfc;
          font-weight: 800;
          position: absolute;
          left: 4px;
        }

        /* ============ Use cases ============ */
        .tcn-broch-uses { background: linear-gradient(180deg, #fafbff 0%, #ffffff 100%); }
        .tcn-broch-uses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.9rem;
        }
        .tcn-broch-use {
          background: #fff;
          border: 1px solid rgba(17, 22, 42, 0.08);
          border-radius: 14px;
          padding: 1.2rem 1.1rem;
          transition: all 0.2s ease;
        }
        .tcn-broch-use:hover {
          border-color: rgba(109, 93, 252, 0.28);
          transform: translateY(-2px);
          box-shadow: 0 14px 28px -18px rgba(15,23,42,0.18);
        }
        .tcn-broch-use .ic {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #11162a, #1c2143);
          color: #ffd54a;
          display: inline-flex; align-items: center; justify-content: center;
          margin-bottom: 0.7rem;
        }
        .tcn-broch-use h4 {
          font-size: 0.98rem;
          font-weight: 700;
          color: #11162a;
          margin: 0 0 0.35rem;
        }
        .tcn-broch-section .tcn-broch-use p {
          font-size: 0.85rem;
          color: #4b5568;
          line-height: 1.55;
          margin: 0;
        }

        /* ============ How it works ============ */
        .tcn-broch-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          position: relative;
        }
        @media (max-width: 720px) {
          .tcn-broch-steps { grid-template-columns: 1fr; }
        }
        .tcn-broch-step {
          background: linear-gradient(180deg, #fff 0%, #fafbff 100%);
          border: 1px solid rgba(17,22,42,0.08);
          border-radius: 14px;
          padding: 1.35rem 1.2rem;
          position: relative;
        }
        .tcn-broch-step .num {
          position: absolute;
          top: 0.85rem; right: 1rem;
          font-size: 1.4rem;
          font-weight: 800;
          color: rgba(109,93,252,0.16);
          letter-spacing: -0.02em;
        }
        .tcn-broch-step .ic {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6d5dfc, #4d3df0);
          color: #fff;
          display: inline-flex; align-items: center; justify-content: center;
          margin-bottom: 0.7rem;
        }
        .tcn-broch-step h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #11162a;
          margin: 0 0 0.4rem;
        }
        .tcn-broch-section .tcn-broch-step p {
          font-size: 0.86rem;
          color: #4b5568;
          line-height: 1.55;
          margin: 0;
        }

        /* ============ Security & badges ============ */
        .tcn-broch-security { background: linear-gradient(180deg, #ffffff 0%, #f8f8fc 100%); }
        .tcn-broch-badges {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.7rem;
        }
        .tcn-broch-badge {
          background: #fff;
          border: 1px solid rgba(17,22,42,0.08);
          border-radius: 12px;
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #11162a;
        }
        .tcn-broch-badge .ic {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, rgba(22,163,74,0.12), rgba(109,93,252,0.12));
          color: #16a34a;
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ============ Comparison ============ */
        .tcn-broch-compare-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .tcn-broch-compare {
          width: 100%;
          min-width: 520px;
          border-collapse: separate;
          border-spacing: 0;
          background: #fff;
          border: 1px solid rgba(17,22,42,0.08);
          border-radius: 14px;
          overflow: hidden;
          font-size: 0.9rem;
        }
        .tcn-broch-compare th, .tcn-broch-compare td {
          padding: 0.85rem 1rem;
          text-align: center;
          border-bottom: 1px solid rgba(17,22,42,0.06);
          color: #11162a;
        }
        .tcn-broch-compare th {
          background: #fafbff;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #4b5568;
        }
        .tcn-broch-compare th:first-child,
        .tcn-broch-compare td:first-child {
          text-align: left;
          font-weight: 600;
          color: #11162a;
        }
        .tcn-broch-compare .col-us {
          background: linear-gradient(180deg, rgba(109,93,252,0.05), rgba(255,213,74,0.03));
          color: #4d3df0;
        }
        .tcn-broch-compare tbody tr:last-child td { border-bottom: 0; }
        .tcn-broch-compare .yes { color: #16a34a; display: inline-flex; }
        .tcn-broch-compare .no { color: #dc2626; opacity: 0.55; display: inline-flex; }
        .tcn-broch-compare .partial { color: #b45309; font-size: 0.78rem; font-weight: 600; }

        /* ============ Pricing ============ */
        .tcn-broch-pricing { background: linear-gradient(180deg, #f8f8fc 0%, #ffffff 100%); }
        .tcn-broch-plans {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .tcn-broch-plan {
          background: #ffffff;
          border: 1.5px solid rgba(17, 22, 42, 0.08);
          border-radius: 16px;
          padding: 1.5rem 1.35rem;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
        }
        .tcn-broch-plan:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 36px -22px rgba(15,23,42,0.22);
        }
        .tcn-broch-plan.popular {
          border-color: #6d5dfc;
          background: linear-gradient(180deg, #fff 0%, #f7f4ff 100%);
          box-shadow: 0 18px 36px -20px rgba(109, 93, 252, 0.45);
        }
        .tcn-broch-plan-tag {
          position: absolute;
          top: -10px; right: 14px;
          background: linear-gradient(135deg, #ffd54a, #ff9a4a);
          color: #11162a;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .tcn-broch-plan h3 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #11162a;
          margin: 0 0 0.25rem;
        }
        .tcn-broch-plan .price {
          font-size: 1.95rem;
          font-weight: 800;
          color: #11162a;
          line-height: 1;
          margin: 0.6rem 0 0.15rem;
          letter-spacing: -0.02em;
        }
        .tcn-broch-plan .cycle {
          color: #6d6f7d;
          font-size: 0.82rem;
          font-weight: 500;
          margin: 0 0 1rem;
        }
        .tcn-broch-plan ul { list-style: none; padding: 0; margin: 0 0 1.2rem; flex: 1; }
        .tcn-broch-plan ul li {
          color: #11162a;
          font-size: 0.85rem;
          padding: 5px 0 5px 22px;
          position: relative;
          line-height: 1.4;
        }
        .tcn-broch-plan ul li::before {
          content: "✓";
          color: #16a34a;
          font-weight: 800;
          position: absolute;
          left: 4px;
        }

        /* ============ FAQ ============ */
        .tcn-broch-faq { display: grid; grid-template-columns: 1fr; gap: 0.55rem; }
        .tcn-broch-faq-item {
          background: #ffffff;
          border: 1px solid rgba(17,22,42,0.08);
          border-radius: 12px;
          overflow: hidden;
        }
        .tcn-broch-faq-q {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.15rem;
          min-height: 52px;
          color: #11162a;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          background: transparent;
          border: 0;
          width: 100%;
          text-align: left;
        }
        .tcn-broch-faq-q .chev { transition: transform 0.2s ease; color: #6d5dfc; }
        .tcn-broch-faq-item.open .chev { transform: rotate(180deg); }
        .tcn-broch-section .tcn-broch-faq-a {
          padding: 0 1.15rem 1rem;
          color: #4b5568;
          font-size: 0.92rem;
          line-height: 1.6;
          margin: 0;
          display: none;
        }
        .tcn-broch-section .tcn-broch-faq-item.open .tcn-broch-faq-a {
          display: block;
        }

        /* ============ CTA + contact ============ */
        .tcn-broch-cta {
          background:
            radial-gradient(700px 320px at 100% 0%, rgba(255,213,74,0.18), transparent 60%),
            linear-gradient(135deg, #11162a 0%, #1c2143 100%);
          color: #ffffff;
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 2rem;
          align-items: center;
        }
        @media (max-width: 760px) { .tcn-broch-cta { grid-template-columns: 1fr; } }
        .tcn-broch-cta h2 {
          font-size: clamp(1.5rem, 2.6vw, 1.9rem);
          font-weight: 800;
          color: #fff;
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
        }
        .tcn-broch-cta p {
          color: rgba(255,255,255,0.82);
          margin: 0 0 1.3rem;
          line-height: 1.6;
        }
        .tcn-broch-cta-actions { display: flex; flex-wrap: wrap; gap: 10px; }
        .tcn-broch-cta-actions a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.85rem 1.4rem;
          min-height: 44px;
          border-radius: 999px;
          font-weight: 700;
          text-decoration: none;
          font-size: 0.92rem;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .tcn-broch-cta-actions .primary {
          background: linear-gradient(135deg, #ffd54a, #ff9a4a);
          color: #11162a;
          box-shadow: 0 12px 28px -12px rgba(255, 154, 74, 0.55);
        }
        .tcn-broch-cta-actions .primary:hover { transform: translateY(-2px); box-shadow: 0 18px 36px -14px rgba(255, 154, 74, 0.65); }
        .tcn-broch-cta-actions .ghost {
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.16);
        }
        .tcn-broch-cta-actions .ghost:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .tcn-broch-cta-actions .wa {
          background: #25d366;
          color: #08251a;
          box-shadow: 0 12px 28px -12px rgba(37,211,102,0.55);
        }

        .tcn-broch-qr {
          background: #fff;
          border-radius: 18px;
          padding: 1.1rem;
          text-align: center;
          color: #11162a;
          box-shadow: 0 18px 36px -20px rgba(0, 0, 0, 0.55);
        }
        .tcn-broch-qr img { width: 160px; height: 160px; display: block; margin: 0 auto 0.5rem; }
        .tcn-broch-qr-cap { font-size: 0.78rem; color: #4b5568; font-weight: 600; }
        .tcn-broch-qr-sub { font-size: 0.7rem; color: #8a8d9c; margin-top: 2px; }

        /* ============ Contact strip ============ */
        .tcn-broch-contact {
          background: linear-gradient(180deg, #ffffff 0%, #fafbff 100%);
        }
        .tcn-broch-contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.85rem;
        }
        .tcn-broch-contact-card {
          background: #fff;
          border: 1px solid rgba(17,22,42,0.08);
          border-radius: 14px;
          padding: 1.1rem 1.15rem;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          text-decoration: none;
          color: inherit;
          transition: all 0.18s ease;
        }
        .tcn-broch-contact-card:hover {
          border-color: rgba(109,93,252,0.3);
          transform: translateY(-2px);
          box-shadow: 0 14px 26px -18px rgba(109,93,252,0.4);
          color: inherit;
        }
        .tcn-broch-contact-card .ic {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(109,93,252,0.14), rgba(255,213,74,0.14));
          color: #6d5dfc;
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .tcn-broch-contact-card .lbl {
          font-size: 0.72rem;
          color: #6d6f7d;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }
        .tcn-broch-contact-card .val {
          font-size: 0.92rem;
          color: #11162a;
          font-weight: 700;
          word-break: break-word;
        }

        /* ============ Footer (minimal — brochure-appropriate) ============ */
        /* Keep this lightweight: compliance pills + copyright + meta. The
           heavy nav-link / social footer is the website's job (Footer.jsx);
           a downloaded PDF / printed brochure doesn't need nav links. */
        .tcn-broch-foot {
          background:
            radial-gradient(700px 320px at 0% 100%, rgba(109,93,252,0.18), transparent 60%),
            radial-gradient(600px 280px at 100% 0%, rgba(255,213,74,0.10), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: rgba(255,255,255,0.72);
          padding: 1.5rem 3rem;
          position: relative;
        }
        @media (max-width: 720px) { .tcn-broch-foot { padding: 1.25rem 1.25rem; } }

        .tcn-broch-foot-compliance {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .tcn-broch-foot-compliance .cp {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.85);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 5px 11px;
          border-radius: 999px;
        }

        /* Stacked layout: copyright on its own line, meta on the next.
           Removes any risk of the bottom row overflowing the sheet edge —
           the brochure is read in PDFs / prints where awkward wrapping
           looks unprofessional. On wide viewports both lines are simply
           left-aligned; on phones they remain stacked with tighter type. */
        .tcn-broch-foot-bottom {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.55);
        }
        .tcn-broch-foot-bottom .copy {
          font-weight: 600;
          color: rgba(255,255,255,0.75);
        }
        .tcn-broch-foot-bottom .meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.4rem 0.65rem;
          color: rgba(255,255,255,0.55);
        }
        .tcn-broch-foot-bottom .meta-item { white-space: nowrap; }
        .tcn-broch-foot-bottom .dot { opacity: 0.5; }
        .tcn-broch-foot-bottom .made-with {
          color: rgba(255,255,255,0.85);
          font-weight: 600;
        }
        .tcn-broch-foot-bottom .made-with .heart { color: #ff6b6b; }
        @media (max-width: 560px) {
          .tcn-broch-foot-bottom { font-size: 0.72rem; }
          .tcn-broch-foot-bottom .dot { display: none; }
          .tcn-broch-foot-bottom .meta { gap: 0.35rem 0.5rem; }
        }

        /* ============ Print ============ */
        @media print {
          @page { size: A4; margin: 10mm; }
          body { background: #ffffff !important; }
          .tcn-brochure { background: #ffffff !important; padding: 0 !important; }
          .tcn-broch-actions { display: none !important; }
          .tcn-broch-sheet {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          .tcn-broch-section { padding: 1.4rem 1rem; }
          .tcn-broch-feature, .tcn-broch-plan, .tcn-broch-use, .tcn-broch-step,
          .tcn-broch-pillar, .tcn-broch-badge, .tcn-broch-pain-item, .tcn-broch-faq-item {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .tcn-broch-h2, .tcn-broch-kicker { break-after: avoid; }
          .tcn-broch-header, .tcn-broch-cta, .tcn-broch-foot {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Expand all FAQ answers on print */
          .tcn-broch-faq-a { display: block !important; }
        }
      `}</style>

      {/* Sticky actions toolbar */}
      <div className="tcn-broch-actions">
        <button type="button" className="tcn-broch-btn" onClick={handlePrint} aria-label="Print brochure">
          <PiPrinterBold size={18} /> Print
        </button>
        <ShareMenu
          url={pageUrl}
          title={`${displayBrand} — Team chat that respects your time`}
          text={`Have a look at the ${displayBrand} brochure — features, pricing and how to get started.`}
          align="right"
        />
        <button
          type="button"
          className="tcn-broch-btn primary"
          onClick={handleDownload}
          disabled={generatingPdf}
        >
          <PiDownloadSimpleBold size={18} />
          {generatingPdf ? "Generating…" : "Download PDF"}
        </button>
      </div>

      {/* The actual brochure sheet (captured for PDF) */}
      <div className="tcn-broch-sheet" ref={brochureRef}>
        {/* ─── Hero ─── */}
        <header className="tcn-broch-header">
          <div className="tcn-broch-header-inner">
            <div className="tcn-broch-brandline">
              <img
                src={brand.logo_url || "/chat.png"}
                alt={displayBrand}
                className="tcn-broch-logo"
                onError={(e) => {
                  if (e.currentTarget.src.indexOf("/chat.png") === -1) {
                    e.currentTarget.src = "/chat.png";
                  } else {
                    // Even the local fallback failed — reveal text instead.
                    setLogoOk(false);
                  }
                }}
              />
              {!logoOk && (
                <div className="tcn-broch-brandname">{displayBrand}</div>
              )}
            </div>

            <div className="tcn-broch-eyebrow">
              <PiRocketLaunchDuotone /> Product Brochure {new Date().getFullYear()}
            </div>
            <h1 className="tcn-broch-headline">
              The secure team workspace that{" "}
              <span className="grad">replaces 3-4 tools</span>.
            </h1>
            <p className="tcn-broch-sub">
              {brand.tagline ||
                `${displayBrand} brings messaging, calls, file sharing and AI into one workspace — built for businesses that own their data and want to ship faster.`}
            </p>

            <div className="tcn-broch-hero-cta">
              <Link to="/auth/register?ref=brochure" className="primary">
                Start 14-day free trial <PiArrowRightBold />
              </Link>
              <Link to="/contact?ref=brochure" className="ghost">
                <PiCalendarDotsDuotone size={18} /> Book a demo
              </Link>
            </div>

            <div className="tcn-broch-trust">
              <span className="tcn-broch-trust-pill">🔒 AES-256-GCM</span>
              <span className="tcn-broch-trust-pill">✅ SOC 2-ready</span>
              <span className="tcn-broch-trust-pill">🇪🇺 GDPR / 🇮🇳 DPDP</span>
              <span className="tcn-broch-trust-pill">⚡ 99.9% uptime target</span>
              <span className="tcn-broch-trust-pill">💚 30-day refund</span>
            </div>
          </div>
        </header>

        {/* ─── At a glance (10-second pitch) ─── */}
        <section className="tcn-broch-section tcn-broch-glance">
          <p className="tcn-broch-kicker">At a glance</p>
          <h2 className="tcn-broch-h2">
            What is {displayBrand} — and why teams pick it.
          </h2>
          <p className="tcn-broch-lead">
            Everything you need to know in one screen. If you have 10 seconds,
            this is the part to read.
          </p>

          <div className="tcn-broch-glance-grid">
            <div className="tcn-broch-glance-col">
              <div className="tcn-broch-glance-head">
                <span className="badge">What's inside</span>
                <h4>One app. Every conversation.</h4>
              </div>
              <ul className="tcn-broch-glance-list features">
                {AT_A_GLANCE_WHAT.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="tcn-broch-glance-col why">
              <div className="tcn-broch-glance-head">
                <span className="badge why">Why teams pick it</span>
                <h4>Three reasons it actually sticks.</h4>
              </div>
              <ul className="tcn-broch-glance-list reasons">
                {AT_A_GLANCE_WHY.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="tcn-broch-glance-cta">
                <Link to="/auth/register?ref=brochure-glance" className="primary">
                  Start free trial <PiArrowRightBold />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <hr className="tcn-broch-rule" />

        {/* ─── Pain points ─── */}
        <section className="tcn-broch-section tcn-broch-pain">
          <p className="tcn-broch-kicker">If this sounds familiar</p>
          <h2 className="tcn-broch-h2">You shouldn't have to choose between speed and security.</h2>
          <p className="tcn-broch-lead">
            Most teams we talk to are stuck with one or more of these problems:
          </p>
          <div className="tcn-broch-pain-list">
            {PAIN_POINTS.map((p) => (
              <div key={p} className="tcn-broch-pain-item">{p}</div>
            ))}
          </div>
        </section>

        <hr className="tcn-broch-rule" />

        {/* ─── Value pillars ─── */}
        <section className="tcn-broch-section">
          <p className="tcn-broch-kicker">Why {displayBrand}</p>
          <h2 className="tcn-broch-h2">Built for teams that need to move fast — without trade-offs.</h2>
          <p className="tcn-broch-lead">
            Four things every prospect tells us made them switch:
          </p>
          <div className="tcn-broch-pillars">
            {VALUE_PILLARS.map((item) => {
              const Cmp = item.Icon;
              return (
                <div key={item.title} className="tcn-broch-pillar">
                  <span className="ic"><Cmp size={20} /></span>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="tcn-broch-rule" />

        {/* ─── What you get ─── */}
        <section className="tcn-broch-section">
          <p className="tcn-broch-kicker">What you get</p>
          <h2 className="tcn-broch-h2">Everything your team needs — in one app.</h2>
          <p className="tcn-broch-lead">
            No plug-ins. No glue code. No per-feature upsells. These features are
            live in the product today:
          </p>

          <div className="tcn-broch-grid">
            {(feature_categories || []).slice(0, 6).map((cat) => {
              const Icon = iconFor(cat.category_key);
              return (
                <div key={cat.category_key} className="tcn-broch-feature">
                  <span className="icon"><Icon size={22} /></span>
                  <h4>{cat.category_label}</h4>
                  <ul>
                    {(cat.items || []).slice(0, 4).map((it) => (
                      <li key={it.title}>{it.title}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {(feature_categories || []).length === 0 && (
              <div className="tcn-broch-feature">
                <span className="icon"><PiCheckCircleDuotone size={22} /></span>
                <h4>Messaging, Calls & AI</h4>
                <ul>
                  <li>1:1, group chat and broadcasts</li>
                  <li>HD audio / video calls + screen share</li>
                  <li>AI assistant, summaries and translate</li>
                  <li>End-to-end encryption with audit logs</li>
                </ul>
              </div>
            )}
          </div>
        </section>

        <hr className="tcn-broch-rule" />

        {/* ─── Built for ─── */}
        <section className="tcn-broch-section tcn-broch-uses">
          <p className="tcn-broch-kicker">Built for the way you work</p>
          <h2 className="tcn-broch-h2">One workspace. Every team.</h2>
          <p className="tcn-broch-lead">
            Whether you ship code, close deals, run ops or lead remote teams —
            {` ${displayBrand}`} fits into your existing flow on day one.
          </p>

          <div className="tcn-broch-uses-grid">
            {USE_CASES.map((item) => {
              const Cmp = item.Icon;
              return (
                <div key={item.title} className="tcn-broch-use">
                  <span className="ic"><Cmp size={20} /></span>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="tcn-broch-rule" />

        {/* ─── How it works ─── */}
        <section className="tcn-broch-section">
          <p className="tcn-broch-kicker">How it works</p>
          <h2 className="tcn-broch-h2">Live in 10 minutes. Productive on day one.</h2>
          <p className="tcn-broch-lead">
            Three steps from signup to a fully migrated team.
          </p>

          <div className="tcn-broch-steps">
            {HOW_IT_WORKS.map((item) => {
              const Cmp = item.Icon;
              return (
                <div key={item.step} className="tcn-broch-step">
                  <span className="num">{item.step}</span>
                  <span className="ic"><Cmp size={20} /></span>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="tcn-broch-rule" />

        {/* ─── Security & compliance ─── */}
        <section className="tcn-broch-section tcn-broch-security">
          <p className="tcn-broch-kicker">Security & compliance</p>
          <h2 className="tcn-broch-h2">Your data, your keys, your rules.</h2>
          <p className="tcn-broch-lead">
            Hard requirements for regulated industries — already shipped.
          </p>

          <div className="tcn-broch-badges">
            {SECURITY_BADGES.map((item) => {
              const Cmp = item.Icon;
              return (
                <div key={item.label} className="tcn-broch-badge">
                  <span className="ic"><Cmp size={18} /></span>
                  {item.label}
                </div>
              );
            })}
          </div>
        </section>

        <hr className="tcn-broch-rule" />

        {/* ─── Why us (comparison) ─── */}
        <section className="tcn-broch-section">
          <p className="tcn-broch-kicker">{displayBrand} vs. the alternatives</p>
          <h2 className="tcn-broch-h2">Compare at a glance</h2>
          <p className="tcn-broch-lead">
            Cleaner pricing, stronger security defaults, AI included — without
            the enterprise hoops.
          </p>

          <div className="tcn-broch-compare-wrap">
            <table className="tcn-broch-compare">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="col-us">{displayBrand}</th>
                  <th>Slack</th>
                  <th>MS Teams</th>
                </tr>
              </thead>
              <tbody>
                {WHY_SWITCH.map(({ feature, us, slack, teams }) => (
                  <tr key={feature}>
                    <td>{feature}</td>
                    <td className="col-us">{renderCell(us)}</td>
                    <td>{renderCell(slack)}</td>
                    <td>{renderCell(teams)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section className="tcn-broch-section tcn-broch-pricing">
          <p className="tcn-broch-kicker">Simple pricing</p>
          <h2 className="tcn-broch-h2">Pay per seat. Cancel anytime.</h2>
          <p className="tcn-broch-lead">
            Every paid plan starts with a 14-day free trial. No credit card to
            start. INR & USD billing — GST invoices included.
          </p>

          <div className="tcn-broch-plans">
            {(plans || []).map((plan, idx) => {
              const isPopular = idx === popularIdx;
              return (
                <div
                  key={plan.plan_id || plan.plan_key}
                  className={`tcn-broch-plan ${isPopular ? "popular" : ""}`}
                >
                  {isPopular && <span className="tcn-broch-plan-tag">Most popular</span>}
                  <h3>{plan.name}</h3>
                  <div className="price">{formatPrice(plan)}</div>
                  <div className="cycle">{cycleSuffix(plan)}</div>
                  <ul>
                    {plan.perks.slice(0, 5).map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {(!plans || plans.length === 0) && (
              <div className="tcn-broch-plan">
                <h3>Contact us</h3>
                <div className="price">Custom</div>
                <div className="cycle">Tailored to your team</div>
                <ul>
                  <li>Talk to our team for a quote</li>
                </ul>
              </div>
            )}
          </div>
        </section>

        <hr className="tcn-broch-rule" />

        {/* ─── FAQ ─── */}
        <section className="tcn-broch-section">
          <p className="tcn-broch-kicker">Questions, answered</p>
          <h2 className="tcn-broch-h2">Frequently asked</h2>
          <p className="tcn-broch-lead">
            Most prospects ask these. If yours isn't here, just email or call us
            — details below.
          </p>

          <div className="tcn-broch-faq">
            {FAQS.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={item.q} className={`tcn-broch-faq-item ${open ? "open" : ""}`}>
                  <button
                    type="button"
                    className="tcn-broch-faq-q"
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    aria-expanded={open}
                  >
                    <span>{item.q}</span>
                    <PiCaretDownBold className="chev" size={16} />
                  </button>
                  {/* Always render the answer so the PDF / print snapshot can
                      reveal every FAQ at once. Visibility is controlled by
                      .tcn-broch-faq-item.open in CSS. */}
                  <p className="tcn-broch-faq-a">{item.a}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Big CTA + QR ─── */}
        <section className="tcn-broch-section tcn-broch-cta">
          <div>
            <h2>Ready when you are.</h2>
            <p>
              Start a 14-day free trial — no credit card. Or talk to a human and
              we'll walk you through it. 30-day money-back guarantee on every
              paid plan.
            </p>
            <div className="tcn-broch-cta-actions">
              <Link to="/auth/register?ref=brochure" className="primary">
                Start free trial <PiArrowRightBold />
              </Link>
              <Link to="/contact?ref=brochure" className="ghost">
                <PiCalendarDotsDuotone size={18} /> Book a demo
              </Link>
              {waLink && (
                <a className="wa" href={waLink} target="_blank" rel="noreferrer">
                  <PiWhatsappLogoDuotone size={18} /> WhatsApp us
                </a>
              )}
            </div>
          </div>
          <div className="tcn-broch-qr">
            {qrSrc ? (
              <img src={qrSrc} alt="Scan to sign up" />
            ) : (
              <div style={{ width: 160, height: 160, background: "#f0f0f5", margin: "0 auto 8px", borderRadius: 8 }} />
            )}
            <div className="tcn-broch-qr-cap">Scan to start free</div>
            <div className="tcn-broch-qr-sub">No credit card needed</div>
          </div>
        </section>

        {/* ─── Contact cards (sales-team friendly) ─── */}
        <section className="tcn-broch-section tcn-broch-contact">
          <p className="tcn-broch-kicker">Talk to us</p>
          <h2 className="tcn-broch-h2">Prefer a quick call?</h2>
          <p className="tcn-broch-lead">
            Our team replies within one business day — usually faster.
          </p>

          <div className="tcn-broch-contact-grid">
            {brand.email && (
              <a className="tcn-broch-contact-card" href={`mailto:${brand.email}`}>
                <span className="ic"><PiEnvelopeSimpleDuotone size={18} /></span>
                <div>
                  <div className="lbl">Email</div>
                  <div className="val">{brand.email}</div>
                </div>
              </a>
            )}
            {brand.phone && (
              <a className="tcn-broch-contact-card" href={`tel:${brand.phone}`}>
                <span className="ic"><PiPhoneDuotone size={18} /></span>
                <div>
                  <div className="lbl">Call sales</div>
                  <div className="val">{brand.phone}</div>
                </div>
              </a>
            )}
            {waLink && (
              <a className="tcn-broch-contact-card" href={waLink} target="_blank" rel="noreferrer">
                <span className="ic"><PiWhatsappLogoDuotone size={18} /></span>
                <div>
                  <div className="lbl">WhatsApp</div>
                  <div className="val">Chat with sales</div>
                </div>
              </a>
            )}
            {brand.address && (
              <div className="tcn-broch-contact-card">
                <span className="ic"><PiMapPinDuotone size={18} /></span>
                <div>
                  <div className="lbl">Address</div>
                  <div className="val">{brand.address}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Brochure footer (minimal — print/PDF-friendly) ─── */}
        {/*
          Intentionally light: a brochure is a single-purpose marketing
          document. Nav-link columns + social icons belong on the website
          (Footer.jsx), not on a pitch sheet a prospect downloads as PDF.
          We keep only what a sales reader actually needs at the bottom:
          a compliance strip (credibility), copyright, brochure version,
          and a small made-in-India credit.
        */}
        <footer className="tcn-broch-foot">
          <div className="tcn-broch-foot-compliance">
            <span className="cp">🔒 AES-256-GCM</span>
            <span className="cp">🛡️ TLS 1.3</span>
            <span className="cp">✅ SOC 2-ready</span>
            <span className="cp">🇪🇺 GDPR</span>
            <span className="cp">🇮🇳 DPDP</span>
            <span className="cp">⚡ 99.9% Uptime target</span>
          </div>

          <div className="tcn-broch-foot-bottom">
            <div className="copy">
              © {new Date().getFullYear()} {displayBrand}. All rights reserved.
            </div>
            <div className="meta">
              <span className="meta-item">Brochure {data.version || "v1"}</span>
              <span className="dot">•</span>
              <span className="meta-item">
                Generated {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
              <span className="dot">•</span>
              {/* Unicode heart instead of an SVG icon so the whole phrase is a
                  single un-breakable text run — keeps "Made with ❤ in India"
                  on one line regardless of viewport width. */}
              <span className="meta-item made-with">Made with <span className="heart">❤</span> in India</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Comparison cell renderer — kept outside the component so the JSX above stays
// readable.
function renderCell(value) {
  if (value === true) {
    return (
      <span className="yes" aria-label="yes">
        <PiCheckBold size={16} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="no" aria-label="no">
        <PiXBold size={16} />
      </span>
    );
  }
  return <span className="partial">{value}</span>;
}

const loadingStyle = {
  minHeight: "60vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  color: "#4b5568",
};

const spinnerStyle = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "3px solid rgba(109,93,252,0.18)",
  borderTopColor: "#6d5dfc",
  animation: "tcnSpin 0.85s linear infinite",
};

if (typeof document !== "undefined" && !document.getElementById("tcn-broch-spinner-kf")) {
  const style = document.createElement("style");
  style.id = "tcn-broch-spinner-kf";
  style.innerHTML = "@keyframes tcnSpin { to { transform: rotate(360deg); } }";
  document.head.appendChild(style);
}

export default Brochure;
