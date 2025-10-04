import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Dashboard from "./components/AdminDashboard.jsx";
import ERLogin from "./pages/ERLogin";
import ERRegister from "./pages/ERRegister";
import EmployeeDashboard from "./components/EmployeeDashboard";
import ManagerDashboard from "./components/ManagerDashboard";

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/er-login" element={<ERLogin />} />
        <Route path="/er-register" element={<ERRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
      </Routes>
      <Footer />
    </Router>
  );
}
