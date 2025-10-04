import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ManagerDashboard() {
  const [pending, setPending] = useState([]);
  const [processed, setProcessed] = useState([]);

  const fetchPending = async () => {
    try {
      const res = await axios.get("/api/expenses/pending");
      setPending(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProcessed = async () => {
    try {
      const res = await axios.get("/api/expenses/processed");
      setProcessed(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
    fetchProcessed();
  }, []);

  const handleApproval = async (id, action, comment) => {
    try {
      await axios.post(`/api/expenses/${id}/${action}`, { comment });
      fetchPending();
      fetchProcessed();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  return (
    <div className="manager-dashboard-bg">
      <div className="manager-dashboard-card">
        <h2 className="manager-dashboard-title">Manager Dashboard</h2>

        <h3 className="manager-section-title">Pending Approvals</h3>
        {pending.map(exp => (
          <div key={exp.id} className="manager-pending-card">
            <p><b>Amount:</b> {exp.amount} {exp.currency}</p>
            <p><b>Category:</b> {exp.category}</p>
            <p><b>Description:</b> {exp.description}</p>
            <p><b>Date:</b> {new Date(exp.date).toLocaleDateString()}</p>
            <input className="manager-input" type="text" placeholder="Comment" id={`comment-${exp.id}`} />
            <div className="manager-btn-group">
              <button className="manager-btn approve" onClick={() => handleApproval(exp.id, "approve", document.getElementById(`comment-${exp.id}`).value)}>Approve</button>
              <button className="manager-btn reject" onClick={() => handleApproval(exp.id, "reject", document.getElementById(`comment-${exp.id}`).value)}>Reject</button>
            </div>
          </div>
        ))}

        <h3 className="manager-section-title">Processed Expenses</h3>
        <div className="manager-table-wrapper">
          <table className="manager-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Currency</th>
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {processed.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.amount}</td>
                  <td>{exp.currency}</td>
                  <td>{exp.category}</td>
                  <td>{exp.description}</td>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>{exp.status}</td>
                  <td>{exp.comments || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}