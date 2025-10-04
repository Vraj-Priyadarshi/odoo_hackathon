import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ManagerDropdown from "../components/ManagerDropdown";
import api from "../utils/api";

const ERRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [managerId, setManagerId] = useState("");
  const [managers, setManagers] = useState([]);
  const navigate = useNavigate();

  const dummyManagers = [
    { id: 1, name: "Alice Johnson" },
    { id: 2, name: "Bob Smith" },
    { id: 3, name: "Charlie Williams" },
  ];

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await api.get("/api/admin/managers");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setManagers(res.data);
        } else {
          setManagers(dummyManagers);
        }
      } catch (err) {
        console.error("Manager fetch failed:", err);
        setManagers(dummyManagers);
      }
    };
    if (role === "Employee") fetchManagers();
  }, [role]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/er-register", {
        name,
        email,
        password,
        role: role.toLowerCase(), // backend expects lowercase
        manager_id: managerId || null,
      });
      alert("Registration successful! You can now login.");
      navigate("/er-login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Employee / Manager Registration</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
        </select>

        {role === "Employee" && (
          <ManagerDropdown
            managers={managers}
            managerId={managerId}
            setManagerId={setManagerId}
          />
        )}

        <button type="submit">Register</button>
      </form>
      <p style={{ marginTop: "10px" }}>
        Already have an account? <Link to="/er-login">Login here</Link>
      </p>
    </div>
  );
};

export default ERRegister;
