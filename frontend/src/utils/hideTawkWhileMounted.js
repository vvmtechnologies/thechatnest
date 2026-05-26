import { useEffect } from "react";

// Custom hook: hides the Tawk.to support widget for as long as the calling
// component is mounted. Used inside the signed-in app surfaces (DashboardLayout,
// OwnerDashboard) so the marketing chat widget doesn't appear over the user's
// own in-app messenger. When the component unmounts (user navigates back to
// the public website) the widget is restored.
//
// Belt-and-braces approach:
//   - Inject a global CSS rule to hide any iframe/div Tawk injects.
//     Effective even if Tawk_API hasn't initialised yet.
//   - Call Tawk_API.hideWidget() once now and again from onLoad to cover
//     the late-injection case.
const STYLE_ID = "tcn-hide-tawk-in-app";

export default function useHideTawkWhileMounted() {
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const styleTag = document.createElement("style");
      styleTag.id = STYLE_ID;
      styleTag.textContent = `
        iframe[title*="chat" i],
        iframe[id*="tawk" i],
        iframe[src*="tawk.to" i],
        div[id*="tawk" i] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(styleTag);
    }

    const hide = () => {
      try {
        if (window.Tawk_API && typeof window.Tawk_API.hideWidget === "function") {
          window.Tawk_API.hideWidget();
        }
      } catch { /* tawk not loaded yet — onLoad below catches the late case */ }
    };
    hide();

    window.Tawk_API = window.Tawk_API || {};
    const prevOnLoad = window.Tawk_API.onLoad;
    window.Tawk_API.onLoad = function onLoadHideForApp() {
      try { if (typeof prevOnLoad === "function") prevOnLoad.call(this); } catch { /* noop */ }
      hide();
    };

    return () => {
      const tag = document.getElementById(STYLE_ID);
      if (tag) tag.remove();
      try {
        if (window.Tawk_API && typeof window.Tawk_API.showWidget === "function") {
          window.Tawk_API.showWidget();
        }
      } catch { /* noop */ }
    };
  }, []);
}
