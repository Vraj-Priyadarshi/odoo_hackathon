import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <nav className="navbar">
      <Link to="/">Secrets</Link>
      <div>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}
