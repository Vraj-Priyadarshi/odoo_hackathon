import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="centered">
      <h1>Secrets</h1>
      <p>Don't keep your secrets — share them anonymously!</p>
      <Link to="/register" className="btn btn-light">Register</Link>
      <Link to="/login" className="btn btn-dark">Login</Link>
    </div>
  );
}
