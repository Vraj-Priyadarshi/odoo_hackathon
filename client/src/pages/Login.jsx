import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginUser = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      "http://localhost:3000/api/login",
      { email, password },
      { withCredentials: true } 
    );
    console.log("Login success:", response.data); // Success data
    navigate("/dashboard");
  } catch (err) {
    console.log("Login error:", err.response); // Full response from backend
    if (err.response) {
      // Backend responded with error
      alert(`Error: ${err.response.status} - ${err.response.data.message || err.response.data.error}`);
    } else {
      // Network or other error
      alert(`Error: ${err.message}`);
    }
  }
};


  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={loginUser}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>

      <div className="options">
        <p>
          Don’t have an account? <Link to="/register">Sign Up</Link>
        </p>
        <p>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>

      {/* <a href="http://localhost:3000/auth/google">Sign in with Google</a> */}
    </div>
  );
}
