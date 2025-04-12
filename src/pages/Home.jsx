import React from "react";
import projectsScreenshot from "../assets/projects-screenshot.png";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-header">
        <h2>Welcome to</h2>
        <div className="home-logo">yarnies</div>
        <p>
          Keep track of your bajillion WIPs and all the yarn you keep buying.
        </p>
      </div>
      <img src={projectsScreenshot} alt="projects screenshot" />
    </div>
  );
}
