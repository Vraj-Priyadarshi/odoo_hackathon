import React, { useState } from "react";
import axios from "axios";

export default function Submit() {
  const [secret, setSecret] = useState("");

  const submitSecret = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:3000/api/submit", { secret }, { withCredentials: true });
    window.location.href = "/secrets";
  };

  return (
    <div className="container">
      <h1>Submit a Secret</h1>
      <form onSubmit={submitSecret}>
        <input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Your secret..." />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
