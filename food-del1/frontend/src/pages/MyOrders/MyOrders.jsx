import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';

const MyOrders = () => {

  const [data, setData] = useState([]);
  const [bill, setBill] = useState(null);
  const { url, token, currency } = useContext(StoreContext);

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        { headers: { token } }
      );

      // latest orders first
      const sorted = response.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setData(sorted);
    } catch (err) {
      console.error("ORDER FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Fetch bill (ONLY for delivered orders)
  const viewBill = async (order) => {
    if (order.status !== "delivered") {
      alert("Bill is available only for delivered orders.");
      return;
    }

    try {
      const res = await axios.get(
        `${url}/api/order/bill/${order._id}`,
        { headers: { token } }
      );

      if (res.data.success && res.data.bill) {
        setBill(res.data.bill);
      } else {
        alert("Bill not found for this order.");
      }
    } catch (err) {
      console.error("BILL FETCH ERROR:", err.response?.data || err.message);
      alert("Unable to load bill. Please try again later.");
    }
  };

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>

      <div className="container">
        {data.map((order, index) => (
          <div key={index} className='my-orders-order'>

            <img src={assets.parcel_icon} alt="order" />

            <p>
              {order.items.map((item, i) =>
                i === order.items.length - 1
                  ? `${item.name} x ${item.quantity}`
                  : `${item.name} x ${item.quantity}, `
              )}
            </p>

            <p>{currency}{order.amount}.00</p>

            <p>Items: {order.items.length}</p>

            <p>
              <span>&#x25cf;</span> <b>{order.status}</b>
            </p>

            <button
              className="view-bill-btn"
              disabled={order.status !== "delivered"}
              onClick={() => viewBill(order)}
              style={{
                opacity: order.status !== "delivered" ? 0.5 : 1,
                cursor: order.status !== "delivered" ? "not-allowed" : "pointer"
              }}
            >
              View Bill
            </button>

          </div>
        ))}
      </div>

      {/* BILL MODAL */}
      {bill && (
        <div className="bill-modal">
          <div className="bill-box">

            <h2 className="bill-title">Order Invoice</h2>

            <p><b>Order ID:</b> {bill.orderId}</p>
            <p><b>Name:</b> {bill.customerName}</p>
            <p><b>Date:</b> {new Date(bill.createdAt).toLocaleString()}</p>

            <hr />

            <h3>Items</h3>
            {bill.items.map((item, i) => (
              <p key={i}>
                {item.name} x {item.quantity} — ₹{item.price * item.quantity}
              </p>
            ))}

            <hr />

            <p><b>Subtotal:</b> ₹{bill.amount}</p>
            <p><b>Delivery Fee:</b> ₹{bill.deliveryFee}</p>

            <h3>Total: ₹{bill.totalAmount}</h3>

            <hr />

            <p><b>Status:</b> {bill.status}</p>

            <button
              className="close-bill-btn"
              onClick={() => setBill(null)}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyOrders;
