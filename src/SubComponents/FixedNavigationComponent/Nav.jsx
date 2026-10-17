
import { useState } from "react";
import "./nav.css";


import "./nav.css";

export default function FixedNav() {
  return (
    <nav className="fixed-nav">
      <div className="nav-brand">
        <div className="nav-logo">A</div>
        <span>MyApp</span>
      </div>

      <div className="mode-toggle">
        <button className="mode-btn active" type="button">
          <span className="mode-icon">✦</span>
          AI
        </button>
      </div>

      <div className="nav-status">
        AI mode
      </div>
    </nav>
  );
}

