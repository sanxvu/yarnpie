import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="logo-container">
          <div className="logo-circle">🧶</div>
        </div>
        <h1 className="hero-title">Yarnpie</h1>
        <p className="hero-description">
          Track your yarn journey, organize your projects, and manage your stash
          all in one place.
        </p>
        <div className="button-container">
          <Link to="/projects" className="primary-button">
            View Your Projects
          </Link>
          <Link to="/stash" className="secondary-button">
            My Yarn Stash
          </Link>
        </div>
      </div>

      <div className="about-section">
        <h2 className="about-title">Features</h2>
        <p className="about-description">
          Everything you need to organize your yarn projects in one place.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon pink">🧶</div>
            <h3 className="feature-title">Track Projects</h3>
            <p className="feature-description">
              Keep track of all your current and completed yarn projects in one
              organized place.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">📦</div>
            <h3 className="feature-title">Organize Yarn</h3>
            <p className="feature-description">
              Manage your yarn stash with details on colors, types, and amounts
              to plan your projects.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">✨</div>
            <h3 className="feature-title">Share Creations</h3>
            <p className="feature-description">
              Show off your beautiful work and keep track of your making
              journey.
            </p>
          </div>
        </div>
        <p className="about-extra">
          Inspired by the magpie's instinct to gather beautiful things, Yarnpie
          brings a touch of charm to staying organized. <br/> No spreadsheets, no
          stress — just a more delightful way to manage your making.
        </p>
      </div>
    </div>
  );
}
