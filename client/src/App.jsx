import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Secrets from "./pages/Secrets.jsx";
import Submit from "./pages/Submit.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/secrets" element={<Secrets />} />
        <Route path="/submit" element={<Submit />} />
      </Routes>
      <Footer />
    </Router>
  );
}
