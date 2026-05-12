import React from "react";
import V2Hero from "../components/home-v2/V2Hero.jsx";
import V2Marquee from "../components/home-v2/V2Marquee.jsx";
import V2Stack from "../components/home-v2/V2Stack.jsx";
import V2Anatomy from "../components/home-v2/V2Anatomy.jsx";
import V2Quote from "../components/home-v2/V2Quote.jsx";
import V2Vault from "../components/home-v2/V2Vault.jsx";
import V2Cta from "../components/home-v2/V2Cta.jsx";
import "../components/home-v2/home-v2.css";

const Home = () => {
  return (
    <div className="v2">
      <V2Hero />
      <V2Marquee />
      <V2Stack />
      <V2Anatomy />
      <V2Quote />
      <V2Vault />
      <V2Cta />
    </div>
  );
};

export default Home;
