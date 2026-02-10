// src/pages/AdminPOS/AdminPOS.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPOS.css";

const AdminPOS = () => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);

  const API_BASE = "https://campus-bite-backend.onrender.com";
  const FOOD_API = `${API_BASE}/api/food/list`;
  const POS_ORDER_API = `${API_BASE}/api/pos/order`;

  // ⭐ VALIDATE 10-digit Indian phone number
  const isValidPhone = (num) => /^[6-9]\d{9}$/.test(num);

  // Load foods
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setMenuLoading(true);
        const res = await axios.get(FOOD_API);
        const data = res.data.data || res.data.foods || res.data;
        setFoods(Array.isArray(data) ? data : []);
      } catch (err) {
        alert("Error loading menu");
      } finally {
        setMenuLoading(false);
      }
    };
    fetchFoods();
  }, []);

  // Add item
  const addToCart = (food) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.foodId === food._id);
      if (exist) {
        return prev.map((i) =>
          i.foodId === food._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          foodId: food._id,
          name: food.name,
          price: Number(food.price),
          quantity: 1,
        },
      ];
    });
  };

  // Update quantity
  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.foodId !== id));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.foodId === id ? { ...i, quantity: qty } : i))
      );
    }
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce(
    (s, i) => s + (Number(i.price) || 0) * i.quantity,
    0
  );

  // PLACE ORDER
  const placeOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty");

    // ⭐ Validate phone number if provided
    if (customerPhone.trim() !== "" && !isValidPhone(customerPhone.trim())) {
      return alert("Please enter a valid 10-digit mobile number starting with 6–9.");
    }

    setLoading(true);

    try {
      await axios.post(POS_ORDER_API, {
        items: cart,
        customerName,
        customerPhone,
        orderType,
        paymentMethod,
      });

      alert("Order placed successfully!");

      clearCart();
      setCustomerName("");
      setCustomerPhone("");
      setOrderType("dine-in");
      setPaymentMethod("cash");

    } catch (err) {
      alert("Order failed.");
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter((f) =>
    f.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pos-page">
      <h1 className="pos-title">Restaurant POS</h1>

      <div className="pos-grid">
        {/* LEFT SIDE — MENU */}
        <div className="pos-menu">
          <input
            type="text"
            className="pos-search"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="pos-menu-list">
            {menuLoading && <p className="loading-text">Loading menu...</p>}

            {!menuLoading &&
              filteredFoods.map((food) => (
                <div
                  key={food._id}
                  className="pos-menu-card"
                  onClick={() => addToCart(food)}
                >
                  <div className="pos-menu-name">{food.name}</div>
                  <div className="pos-menu-price">₹{food.price}</div>
                </div>
              ))}

            {!menuLoading && filteredFoods.length === 0 && (
              <p className="no-items-text">No items found</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE — CART */}
        <div className="pos-cart">
          <h2 className="cart-title">Current Order</h2>

          <div className="cart-items">
            {cart.length === 0 && (
              <p className="empty-cart">Cart is empty</p>
            )}

            {cart.map((item) => (
              <div key={item.foodId} className="cart-row">
                <div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">
                    ₹{item.price} × {item.quantity}
                  </div>
                </div>

                <div className="qty-controls">
                  <button onClick={() => updateQty(item.foodId, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.foodId, item.quantity + 1)}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pos-total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {/* CUSTOMER INPUTS */}
          <div className="pos-input-grid">
            <input
              placeholder="Customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <input
              placeholder="Phone number"
              value={customerPhone}
              maxLength={10}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ""); // allow only digits
                setCustomerPhone(val);
              }}
            />
          </div>

          <div className="pos-input-grid">
            <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
              <option value="dine-in">Dine-In</option>
              <option value="takeaway">Takeaway</option>
            </select>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div className="pos-actions">
            <button className="btn-clear" onClick={clearCart}>Clear</button>

            <button
              className="btn-place"
              disabled={loading || cart.length === 0}
              onClick={placeOrder}
            >
              {loading ? "Placing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPOS;
