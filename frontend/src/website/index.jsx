import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import "./website.css";
import "./redesign.css";
import Footer from "./components/Footer.jsx";

function WebsiteIndex() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default WebsiteIndex;
