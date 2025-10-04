import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LogoutButton from "../components/LogoutButton";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user session from backend
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/user", { withCredentials: true });
        if (res.data.user) {
          setUser(res.data.user);
        } else {
          navigate("/login"); // Redirect if not logged in
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/api/logout", { withCredentials: true });
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Country: {user.country}</p>
      <LogoutButton />
      
    </div>
  );
}
