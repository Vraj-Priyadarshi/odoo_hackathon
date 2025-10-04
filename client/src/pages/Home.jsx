import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";
export default function Home() {
  return (
    <div className="home-bg">
      <div className="home-card">
        <h1 className="home-title">Welcome to Secrets App</h1>
        <p className="home-desc">
          Manage your organization with secure authentication for <span className="home-highlight">Admins</span>, <span className="home-highlight">Managers</span>, and <span className="home-highlight">Employees</span>.
          <br /><br />
          Choose your role below to get started!
        </p>
        <div className="home-section">
          <h2 className="home-section-title">Admin</h2>
          <div className="home-btn-group">
            <Link to="/register" className="home-btn admin-btn">Register</Link>
            <Link to="/login" className="home-btn admin-btn">Login</Link>
          </div>
        </div>
        <div className="home-section">
          <h2 className="home-section-title">Employee / Manager</h2>
          <div className="home-btn-group">
            <Link to="/er-register" className="home-btn emp-btn">Register</Link>
            <Link to="/er-login" className="home-btn emp-btn">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}