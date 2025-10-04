import React, { useEffect, useState } from "react";
import axios from "axios";
import LogoutButton from "../components/LogoutButton";

export default function Secrets() {
  const [secret, setSecret] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3000/api/secrets", { withCredentials: true })
      .then((res) => setSecret(res.data.secret))
      .catch(() => window.location.href = "/login");
  }, []);

  return (
    <div className="container">
      <h1>Your Secret</h1>
      <p>{secret}</p>
      <a href="/submit">Submit a new one</a>
      <LogoutButton />
      
    </div>
  );
}
