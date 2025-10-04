// src/components/LogoutButton.jsx
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await fetch("http://localhost:3000/api/logout", {
      method: "GET",
      credentials: "include", // important for session cookies
    });

    const data = await res.json();
    if (data.success) {
      navigate("/"); // redirect to home page
    }
  };

  return (
    <button onClick={handleLogout} className="btn btn-dark">
      Logout
    </button>
  );
}
