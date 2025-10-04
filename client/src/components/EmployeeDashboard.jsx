import React, { useState, useEffect } from "react";
import axios from "axios";
import '../styles/EmployeeDashboard.css';
export default function EmployeeDashboard() {
  // Dummy data for testing
  const dummyExpenses = [
    {
      id: 1,
      amount: 100,
      currency: "USD",
      category: "Travel",
      description: "Taxi fare",
      date: "2025-10-01",
      status: "Pending",
    },
    {
      id: 2,
      amount: 250,
      currency: "USD",
      category: "Food",
      description: "Team lunch",
      date: "2025-09-28",
      status: "Approved",
    },
    {
      id: 3,
      amount: 50,
      currency: "USD",
      category: "Supplies",
      description: "Office stationery",
      date: "2025-09-25",
      status: "Rejected",
    },
  ];

  const [expenses, setExpenses] = useState(dummyExpenses);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "",
    category: "",
    description: "",
    date: "",
  });

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("/api/expenses/user/me");
      setExpenses(Array.isArray(res.data) ? res.data : dummyExpenses);
    } catch (err) {
      console.error(err);
      // fallback to dummy data
      setExpenses(dummyExpenses);
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
    try {
      // Frontend-only temporary addition with static status
      const newExpense = { ...formData, id: Date.now(), status: "Pending" };
      setExpenses([newExpense, ...expenses]);

      await axios.post("/api/expenses", formData);
      alert("Expense submitted successfully!");
      setFormData({ amount: "", currency: "", category: "", description: "", date: "" });
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert("Failed to submit expense");
    }
  };

  return (
    <div className="emp-dashboard-bg">
      <div className="emp-dashboard-card">
        <h2 className="emp-dashboard-title">Employee Dashboard</h2>

        <h3 className="emp-section-title">Submit Expense</h3>
        <form className="emp-expense-form" onSubmit={handleSubmit}>
          <input className="emp-input" type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
          <input className="emp-input" type="text" name="currency" placeholder="Currency" value={formData.currency} onChange={handleChange} required />
          <input className="emp-input" type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
          <input className="emp-input" type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
          <input className="emp-input" type="date" name="date" value={formData.date} onChange={handleChange} required />
          <button className="emp-btn" type="submit">Submit</button>
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
