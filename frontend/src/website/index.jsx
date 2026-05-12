import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import "./website.css";
import "./redesign.css";
import Footer from "./components/Footer.jsx";

function WebsiteIndex() {
  return (
    <div>
      <a href="#main-content" className="tcn-skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default WebsiteIndex;
