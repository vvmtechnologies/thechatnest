import React from "react";
import V2Hero from "../components/home-v2/V2Hero.jsx";
import V2Field from "../components/home-v2/V2Field.jsx";
import V2Marquee from "../components/home-v2/V2Marquee.jsx";
import V2Stack from "../components/home-v2/V2Stack.jsx";
import V2Anatomy from "../components/home-v2/V2Anatomy.jsx";
import V2Day from "../components/home-v2/V2Day.jsx";
import V2Quote from "../components/home-v2/V2Quote.jsx";
import V2Vault from "../components/home-v2/V2Vault.jsx";
import V2Cta from "../components/home-v2/V2Cta.jsx";
import Seo from "../../components/Seo.jsx";
import "../components/home-v2/home-v2.css";

const Home = () => {
  return (
    <div className="v2">
      <Seo
        title={null}
        description="One workspace to chat, meet, share, and create — built for teams that ship before lunch and sleep at night. Free 14-day trial."
        keywords="team chat, business messaging, slack alternative, secure messaging, self-hosted chat, on-premise messaging, video calls, AI assistant, GDPR compliant"
      />
      <V2Hero />
      <V2Field />
      <V2Marquee />
      <V2Stack />
      <V2Anatomy />
      <V2Day />
      <V2Quote />
      <V2Vault />
      <V2Cta />
    </div>
  );
};

export default Home;
