import React, { useState } from "react";
import axios from "axios";
import "./MonthlyReport.css";

const API_MONTHLY = "http://localhost:5000/api/reports/monthly";
const API_DAILY = "http://localhost:5000/api/reports/daily";

const MonthlyReport = () => {
  const [mode, setMode] = useState("monthly");
  const [date, setDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // View Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchReport = async () => {
    if (!date) {
      alert("Please select a date or month");
      return;
    }

    setLoading(true);
    try {
      const url =
        mode === "monthly"
          ? `${API_MONTHLY}?month=${date}`
          : `${API_DAILY}?date=${date}`;

      const res = await axios.get(url);
      setReport(res.data);
    } catch (err) {
      alert("Failed to load report");
      console.error(err);
    }
    setLoading(false);
  };

  const orders = report?.orders || [];
  const totalOrders = orders.length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const rejected = orders.filter(o => o.status === "rejected").length;

  const openView = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeView = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="mr-page">
      {/* HEADER */}
      <div className="mr-header no-print">
        <h2 className="mr-title">📊 Sales Report</h2>

        <div className="mr-controls">
          <select value={mode} onChange={e => setMode(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
          </select>

          {mode === "monthly" ? (
            <input
              type="month"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          ) : (
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          )}

          <button onClick={fetchReport} disabled={loading}>
            {loading ? "Loading..." : "Load Report"}
          </button>

          {report && (
            <button className="btn-print" onClick={() => window.print()}>
              Print
            </button>
          )}
        </div>
      </div>

      {!report && !loading && (
        <p className="mr-placeholder">
          Select {mode === "monthly" ? "a month" : "a date"} to view report
        </p>
      )}

      {report && (
        <div className="mr-card">
          {/* SUMMARY */}
          <h3 className="mr-section-title">Summary</h3>
          <div className="mr-grid">
            <div className="mr-box highlight">
              <h4>Total Orders</h4>
              <p>{totalOrders}</p>
            </div>
            <div className="mr-box">
              <h4>Delivered</h4>
              <p>{delivered}</p>
            </div>
            <div className="mr-box">
              <h4>Rejected</h4>
              <p>{rejected}</p>
            </div>
            <div className="mr-box highlight">
              <h4>Total Revenue</h4>
              <p>₹{report.totalRevenue || 0}</p>
            </div>
          </div>

          {/* TOP ITEMS */}
          <h3 className="mr-section-title">Top Selling Items</h3>
          <ul className="mr-list">
            {report.topItems?.length ? (
              report.topItems.map((i, idx) => (
                <li key={idx}>
                  <span>{i.name}</span>
                  <b>{i.count} sold</b>
                </li>
              ))
            ) : (
              <li>No data</li>
            )}
          </ul>

          {/* ALL ORDERS */}
          <h3 className="mr-section-title">📋 All Orders ({orders.length})</h3>
          <div className="mr-orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-6)}</td>
                    <td>{order.paymentMethod ? "POS" : "Online"}</td>
                    <td className={`status ${order.status}`}>
                      {order.status}
                    </td>
                    <td>₹{order.totalAmount || order.amount || 0}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
  className="btn-view"
  onClick={() => openView(order)}
>
  👁 View
</button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mr-footer">
            Generated on {new Date().toLocaleString()}
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showModal && selectedOrder && (
        <div className="modal-overlay no-print">
          <div className="modal fancy-modal">
            <div className="modal-header">
              <h3>🧾 Order Details</h3>
              <button className="modal-close" onClick={closeView}>✕</button>
            </div>

            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p>
                <strong>Type:</strong>{" "}
                {selectedOrder.paymentMethod ? "POS Order" : "Online Order"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Amount:</strong> ₹
                {selectedOrder.totalAmount || selectedOrder.amount || 0}
              </p>

              <hr />

              <h4>👤 Customer</h4>
              <p>
                <strong>Name:</strong>{" "}
                {selectedOrder.customerName ||
                  selectedOrder.address?.fullName ||
                  "Walk-in"}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {selectedOrder.customerPhone ||
                  selectedOrder.address?.phone ||
                  "—"}
              </p>

              {selectedOrder.address && (
                <>
                  <hr />
                  <h4>📍 Delivery</h4>
                  <p><strong>Block:</strong> {selectedOrder.address.block}</p>
                  <p><strong>Room:</strong> {selectedOrder.address.roomNo}</p>
                  <p><strong>Break Time:</strong> {selectedOrder.address.breakTime}</p>
                  <p><strong>User Type:</strong> {selectedOrder.address.userType}</p>
                </>
              )}

              <hr />
              <h4>🍽 Items</h4>
              <ul>
                {selectedOrder.items.map((i, idx) => (
                  <li key={idx}>
                    {i.name} × {i.quantity}
                  </li>
                ))}
              </ul>

              <div className="instructions-box">
                <strong>⚠ Special Instructions</strong>
                <p>
                  {selectedOrder.specialInstructions ||
                    selectedOrder.address?.specialInstructions ||
                    "None"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReport;