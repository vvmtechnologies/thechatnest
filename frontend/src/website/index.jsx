import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import "./website.css";
import "./redesign.css";
import Footer from "./components/Footer.jsx";
import StickyCtaBar from "./components/StickyCtaBar.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import CommandPalette from "./components/CommandPalette.jsx";

// Routes inside the marketing site that should NOT show the website footer
// (and the sticky-CTA bar that sits above it). The brochure already has its
// own rich brand footer — surfacing another one below it produces an awkward
// double-footer. The navbar is kept so prospects can navigate to other pages.
const NO_FOOTER_ROUTES = new Set(["/brochure"]);

function WebsiteIndex() {
  const { pathname } = useLocation();
  const hideFooter = NO_FOOTER_ROUTES.has(pathname);

  return (
    <div>
      <a href="#main-content" className="tcn-skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      {!hideFooter && (
        <>
          <Footer />
          <StickyCtaBar />
        </>
      )}
      <CookieConsent />
      <CommandPalette />
    </div>
  );
}

export default WebsiteIndex;
