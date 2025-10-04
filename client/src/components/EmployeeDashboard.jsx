import React, { useState, useEffect } from "react";
import axios from "axios";
import '../styles/EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "",
    category: "",
    description: "",
    date: "",
  });

  const BACKEND_URL = "http://localhost:5000"; // your backend URL

  // Fetch expenses from backend
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/expenses/user/me`, { withCredentials: true });
      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setExpenses([]);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Temporary dummy expense to show immediately
    const newExpense = { ...formData, id: Date.now(), status: "Pending" };
    setExpenses(prev => [newExpense, ...prev]);

    // Reset form
    setFormData({ amount: "", currency: "", category: "", description: "", date: "" });

    try {
      const res = await axios.post(`${BACKEND_URL}/api/expenses`, formData, { withCredentials: true });

      // Replace dummy with actual backend expense
      if (res.data && res.data.expense) {
        setExpenses(prev => prev.map(exp => exp.id === newExpense.id ? res.data.expense : exp));
      }

      alert("Expense submitted successfully!");
    } catch (err) {
      console.error("Error submitting expense:", err);
      alert("Failed to submit expense. Check console for details.");
      // Remove the dummy if backend fails
      setExpenses(prev => prev.filter(exp => exp.id !== newExpense.id));
    }
  };

  return (
    <div className="emp-dashboard-bg">
      <div className="emp-dashboard-card">
        <h2 className="emp-dashboard-title">Employee Dashboard</h2>

        <h3 className="emp-section-title">Submit Expense</h3>
        <form className="emp-expense-form" onSubmit={handleSubmit}>
          <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required className="emp-input" />
          <input type="text" name="currency" placeholder="Currency" value={formData.currency} onChange={handleChange} required className="emp-input" />
          <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required className="emp-input" />
          <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="emp-input" />
          <input type="date" name="date" value={formData.date} onChange={handleChange} required className="emp-input" />
          <button type="submit" className="emp-btn">Submit</button>
        </form>

        <h3 className="emp-section-title">Expense History</h3>
        <div className="emp-table-wrapper">
          <table className="emp-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Currency</th>
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.amount}</td>
                  <td>{exp.currency}</td>
                  <td>{exp.category}</td>
                  <td>{exp.description}</td>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>{exp.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
