import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/login", {
        username: email,
        password,
      }, { withCredentials: true });
      navigate("/secrets");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={loginUser}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <a href="http://localhost:3000/auth/google">Sign in with Google</a>
    </div>
  );
}
