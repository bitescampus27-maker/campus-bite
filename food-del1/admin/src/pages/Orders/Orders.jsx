import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Orders.css";

const Orders = () => {
  /* ================= ONLINE ORDERS (UNCHANGED) ================= */
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [rejectingOrders, setRejectingOrders] = useState([]);
  const rejectTimers = useRef({});

  /* ================= POS ORDERS (NEW, ISOLATED) ================= */
  const [posOrders, setPosOrders] = useState([]);

  /* ================= MODAL ================= */
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalType, setModalType] = useState("online"); // online | pos

  const API_BASE = "http://localhost:5000";

  // ONLINE APIs (UNCHANGED)
  const LIST_API = `${API_BASE}/api/order/list`;
  const ACCEPT_API = `${API_BASE}/api/order/accept`;
  const REJECT_API = `${API_BASE}/api/order/reject`;
  const DELIVERED_API = `${API_BASE}/api/order/delivered`;

  // POS APIs (NEW)
  const POS_LIST_API = `${API_BASE}/api/pos/orders`;
  const POS_STATUS_API = `${API_BASE}/api/pos/update-status`;

  /* ================= LOAD ONLINE ORDERS (UNCHANGED) ================= */
  const loadOrders = async () => {
    try {
      const res = await axios.get(LIST_API);

      const orders =
        res.data.data?.filter(
          (o) => o.status !== "rejected" && o.status !== "delivered"
        ) || [];

      setOnlineOrders(orders);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  /* ================= LOAD POS ORDERS (NEW) ================= */
  const loadPosOrders = async () => {
    try {
      const res = await axios.get(POS_LIST_API);

      const orders =
        res.data.orders?.filter(
          (o) => o.status !== "rejected" && o.status !== "delivered"
        ) || [];

      setPosOrders(orders);
    } catch (err) {
      console.error("Failed to load POS orders", err);
    }
  };

  useEffect(() => {
    loadOrders();
    loadPosOrders();

    const interval = setInterval(() => {
      loadOrders();
      loadPosOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* ================= ONLINE ACTIONS (UNCHANGED) ================= */
  const acceptOrder = async (id) => {
    if (rejectTimers.current[id]) {
      clearTimeout(rejectTimers.current[id]);
      delete rejectTimers.current[id];
      setRejectingOrders((prev) => prev.filter((x) => x !== id));
    }

    await axios.post(ACCEPT_API, { orderId: id });
    loadOrders();
    closeModal();
  };

  const rejectOrder = (id) => {
    if (rejectTimers.current[id]) return;

    setRejectingOrders((prev) => [...prev, id]);

    rejectTimers.current[id] = setTimeout(async () => {
      await axios.post(REJECT_API, { orderId: id });

      delete rejectTimers.current[id];
      setRejectingOrders((prev) => prev.filter((x) => x !== id));
      setOnlineOrders((prev) => prev.filter((o) => o._id !== id));
    }, 15000);
  };

  const deliverOrder = async (id) => {
    await axios.post(DELIVERED_API, { orderId: id });
    setOnlineOrders((prev) => prev.filter((o) => o._id !== id));
    closeModal();
  };

  /* ================= POS ACTIONS (NEW) ================= */
  const updatePosStatus = async (id, status) => {
    await axios.post(POS_STATUS_API, { orderId: id, status });
    loadPosOrders();
  };

  /* ================= MODAL ================= */
  const openViewModal = (order, type = "online") => {
    setSelectedOrder(order);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  /* ================= HELPERS ================= */
  const renderItems = (order) =>
    order.items?.map((i) => `${i.name} x ${i.quantity}`).join(", ") ||
    "No items";

  const statusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === "pending") return "status-pill status-pending";
    if (s === "preparing") return "status-pill status-processing";
    if (s === "prepared") return "status-pill status-prepared";
    return "status-pill status-default";
  };

  /* ================= RENDER ================= */
  return (
    <div className="orders-page">
      <h2 className="orders-title">Orders Dashboard</h2>

      {/* ================= ONLINE ORDERS (UNCHANGED UI) ================= */}
      <div className="orders-table-wrapper">
        <table className="orders-table modern-table">
          <thead>
            <tr>
              <th>Items</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="col-action">Action</th>
            </tr>
          </thead>

          <tbody>
            {onlineOrders.map((order) => (
              <tr key={order._id}>
                <td>{renderItems(order)}</td>
                <td className="bold">
                  {order.address?.fullName || "No Name"}
                </td>
                <td className="bold price">
                  ₹{(order.totalAmount || order.amount).toFixed(2)}
                </td>
                <td>
                  <span className={statusClass(order.status)}>
                    {rejectingOrders.includes(order._id)
                      ? "Rejecting (15s)"
                      : order.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-small"
                      onClick={() => openViewModal(order, "online")}
                    >
                      View
                    </button>
                    {order.status !== "prepared" ? (
                      <>
                        <button
                          className="btn-small btn-accept"
                          onClick={() => acceptOrder(order._id)}
                        >
                          Accept
                        </button>
                        <button
                          className="btn-small btn-reject"
                          onClick={() => rejectOrder(order._id)}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-small btn-delivered"
                        onClick={() => deliverOrder(order._id)}
                      >
                        Delivered
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= POS ORDERS (NEW SECTION ONLY) ================= */}
      <h3 style={{ marginTop: 40 }}>POS Orders</h3>

      <div className="orders-table-wrapper">
        <table className="orders-table modern-table pos-table">
          <thead>
            <tr>
              <th>Items</th>
              <th>Customer</th>
              <th>Order Type</th>
              <th>Payment</th>
              <th>Status</th>
              <th className="col-action">Action</th>
            </tr>
          </thead>

          <tbody>
            {posOrders.map((order) => (
              <tr key={order._id}>
                <td>{renderItems(order)}</td>
                <td>
                  {order.customerName || "Walk-in"}
                  <br />
                  {order.customerPhone || "—"}
                </td>
                <td>{order.orderType}</td>
                <td>{order.paymentMethod}</td>
                <td>
                  <span className={statusClass(order.status)}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-small"
                      onClick={() => openViewModal(order, "pos")}
                    >
                      View
                    </button>

                    {order.status !== "prepared" ? (
                      <button
                        className="btn-small btn-accept"
                        onClick={() =>
                          updatePosStatus(order._id, "prepared")
                        }
                      >
                        Mark Prepared
                      </button>
                    ) : (
                      <button
                        className="btn-small btn-delivered"
                        onClick={() =>
                          updatePosStatus(order._id, "delivered")
                        }
                      >
                        Delivered
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal fancy-modal">
            <div className="modal-header">
              <h3>🧾 Order Details</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
  {modalType === "online" ? (
    <>
      <div className="modal-body">
  {modalType === "online" ? (
    <>
      <div className="modal-section">
        <h4>Customer Info</h4>
        <p><strong>Name:</strong> {selectedOrder.address?.fullName}</p>
        <p><strong>Phone:</strong> {selectedOrder.address?.phone}</p>
        <p><strong>User Type:</strong> {selectedOrder.address?.userType}</p>
      </div>

      <div className="modal-section">
        <h4>Delivery Details</h4>
        <p><strong>Break Time:</strong> {selectedOrder.address?.breakTime || "—"}</p>
        {selectedOrder.address?.block && (
          <p><strong>Block:</strong> {selectedOrder.address.block}</p>
        )}
        {selectedOrder.address?.roomNo && (
          <p><strong>Room No:</strong> {selectedOrder.address.roomNo}</p>
        )}
        {selectedOrder.address?.facultyCode && (
          <p><strong>Faculty Code:</strong> {selectedOrder.address.facultyCode}</p>
        )}
      </div>

   <div className="modal-section instructions-box">
  <h4>⚠ Special Instructions</h4>
  <p>
    {selectedOrder.address?.specialInstructions &&
    selectedOrder.address.specialInstructions.trim() !== ""
      ? selectedOrder.address.specialInstructions
      : "None"}
  </p>
</div>



    </>
  ) : (
    <>
      <div className="modal-section">
        <h4>Customer Info (POS)</h4>
        <p><strong>Name:</strong> {selectedOrder.customerName || "Walk-in"}</p>
        <p><strong>Phone:</strong> {selectedOrder.customerPhone || "—"}</p>
      </div>

      <div className="modal-section">
        <h4>Order Details</h4>
        <p><strong>Order Type:</strong> {selectedOrder.orderType}</p>
        <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
        <p><strong>Status:</strong> {selectedOrder.status}</p>
      </div>

      <div className="modal-section instructions-box">
        <h4>⚠ Special Instructions</h4>
        <p>{selectedOrder.instructions || "None"}</p>
      </div>
    </>
  )}

  <div className="modal-section">
    <h4>Items</h4>
    <p>{renderItems(selectedOrder)}</p>
  </div>
</div>

    </>
  ) : (
    <>
      <div className="modal-section">
        <h4>Customer Info (POS)</h4>
        <p><strong>Name:</strong> {selectedOrder.customerName || "Walk-in"}</p>
        <p><strong>Phone:</strong> {selectedOrder.customerPhone || "—"}</p>
      </div>

      <div className="modal-section">
        <h4>Order Details</h4>
        <p><strong>Order Type:</strong> {selectedOrder.orderType}</p>
        <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
        <p><strong>Status:</strong> {selectedOrder.status}</p>
      </div>
    </>
  )}

  <div className="modal-section">
    <h4>Items</h4>
    <p>{renderItems(selectedOrder)}</p>
  </div>
</div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
