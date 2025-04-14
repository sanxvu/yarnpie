import React from "react";
import projectsScreenshot from "../assets/projects-screenshot.png";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-header">
        <h2>🧶 Welcome to Yarnpie</h2>
        <p>
          Yarnpie is a simple, cozy tool for yarn lovers to keep track of their
          yarn stash and projects — all in one place. Whether you're the type to
          hoard the softest skeins, start ten projects at once, or you're just
          starting out, Yarnpie helps you:
          <ul>
            <li>
              🌸 <b>Organize your yarn stash</b> with photos, fiber details, and
              yardage.
            </li>
            <li>🧵 <b>Track your projects</b> and how much yarn you've used. </li>
          </ul>
          Inspired by the magpie's instinct to gather beautiful things, Yarnpie
          brings a touch of charm to staying organized. No spreadsheets, no
          stress — just a more delightful way to manage your making.
        </p>
      </div>
      <p>Example of the Projects page:</p>
      <img src={projectsScreenshot} alt="projects screenshot" />
    </div>
  );
}
