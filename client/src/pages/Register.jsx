import React, { useState } from "react";
import axios from "axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const registerUser = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:3000/api/register", {
      username: email,
      password,
    }, { withCredentials: true });
    setMessage(res.data.message);
  };

  return (
    <div className="container">
      <h1>Register</h1>
      {message && <p>{message}</p>}
      <form onSubmit={registerUser}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
      <a href="http://localhost:3000/auth/google">Sign up with Google</a>
    </div>
  );
}
