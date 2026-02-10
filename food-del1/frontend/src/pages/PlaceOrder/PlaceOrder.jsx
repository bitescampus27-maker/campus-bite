import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

// ============ Razorpay Payment Handler ============
const handlePayment = async (amount, address, items, token) => {
  try {
    const { data } = await axios.post(
      "https://campus-bite-backend.onrender.com/api/payment/create-order",
      { amount },
      { headers: token ? { token } : {} }
    );

    const options = {
      key: "rzp_test_RgtrTPFx3l7yG9",
      amount: data.amount,
      currency: data.currency,
      name: "Campus Bites",
      description: "Food Order Payment",
      order_id: data.id,
      handler: function () {
        alert("Payment Successful!");
      },
      theme: { color: "#3399cc" }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    console.error(error);
    alert("Payment Failed. Try Again.");
  }
};

// -------- Helper: format "HH:MM" -> "10:00 AM - 10:10 AM" --------
const formatBreakWindow = (timeStr) => {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10);

  // start
  const startMinutesTotal = h * 60 + m;

  // end = start + 10 minutes
  const endMinutesTotal = startMinutesTotal + 10;
  const endH = Math.floor(endMinutesTotal / 60) % 24;
  const endM = endMinutesTotal % 60;

  const format12 = (hour24, minutes) => {
    const ampm = hour24 >= 12 ? "PM" : "AM";
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    const minStr = minutes.toString().padStart(2, "0");
    return `${hour12}:${minStr} ${ampm}`;
  };

  return `${format12(h, m)} - ${format12(endH, endM)}`;
};

const PlaceOrder = () => {
  // ========= USER TYPE =========
  const [userType, setUserType] = useState(
    localStorage.getItem("userType") || "student"
  );

  // ========= USER DATA =========
  const [data, setData] = useState({
    fullName: "",
    block: "",
    roomNo: "",
    phone: "",
    breakTime: "",
    specialInstructions: "",
    facultyCode: ""
  });

  const [tableNumber, setTableNumber] = useState(null);

  const { getTotalCartAmount, placeOrder, cartItems, token, deliveryFee } =
    useContext(StoreContext);

  const navigate = useNavigate();

  // ========= LOAD SAVED DATA =========
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("checkoutData"));
    if (saved) {
      setUserType(saved.userType || "student");
      setData(prev => ({ ...prev, ...saved }));
    }
  }, []);

  // ========= SAVE DATA =========
  useEffect(() => {
    localStorage.setItem("checkoutData", JSON.stringify({ ...data, userType }));
  }, [data, userType]);

  // ========= FORM HANDLER =========
  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  // ========= GET TABLE NUMBER =========
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("table");
    if (t) setTableNumber(t);
  }, []);

  // ========= PREVENT EMPTY CART =========
  useEffect(() => {
    if (getTotalCartAmount() === 0) navigate('/');
  }, [getTotalCartAmount, navigate]);

  // ========= BASIC FORM VALIDATION =========
  const validateForm = () => {
    if (!data.fullName.trim()) {
      alert("Please enter your full name.");
      return false;
    }

    if (!/^\d{10}$/.test(data.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (!data.breakTime) {
      alert("Please select your break time.");
      return false;
    }

    if (userType === "faculty") {
      if (!data.block) {
        alert("Please select your block.");
        return false;
      }
      if (!data.roomNo.trim()) {
        alert("Please enter your room number.");
        return false;
      }
    }

    return true;
  };

  // ========= COD (FACULTY ONLY) =========
  const handlePlaceOrderCOD = async () => {
    if (userType === "student") {
      alert("Students cannot use Cash on Delivery.");
      return;
    }

    if (!validateForm()) return;

    // store nice break window string for backend / display
    const address = {
      ...data,
      breakTimeWindow: formatBreakWindow(data.breakTime),
      table: tableNumber
    };

    try {
      const resp = await placeOrder({ address, paymentMethod: "COD" });

      if (resp && resp.success) {
        alert("Order placed successfully!");
        navigate('/');
      } else {
        alert("Failed to place order. Try again.");
      }

    } catch (err) {
      console.error(err);
      alert("Error placing order.");
    }
  };

  // ========= ONLINE PAYMENT =========
  const handlePayOnline = async () => {
    if (!validateForm()) return;

    const address = {
      ...data,
      breakTimeWindow: formatBreakWindow(data.breakTime),
      table: tableNumber
    };

    const subtotal = getTotalCartAmount();
    const amount = subtotal === 0 ? 0 : subtotal + deliveryFee;

    await handlePayment(amount, address, cartItems, token);
  };

  return (
    <div className='place-order'>

      {/* LEFT SIDE FORM */}
      <div className="place-order-left">

        <p className='title'>Delivery Information</p>

        {/* USER TYPE SELECT */}
        <div className="user-type-boxes">

          <div
            className={`type-box ${userType === "student" ? "active" : ""}`}
            onClick={() => setUserType("student")}
          >
            Student
          </div>

          <div
            className={`type-box ${userType === "faculty" ? "active" : ""}`}
            onClick={() => setUserType("faculty")}
          >
            Faculty
          </div>

        </div>

        {/* TABLE NUMBER */}
        {tableNumber && (
          <div style={{
            marginBottom: 12,
            padding: 8,
            background: "#f6f6f6",
            borderRadius: 6
          }}>
            <strong>Ordering for Table:</strong> {tableNumber}
          </div>
        )}

        {/* FULL NAME */}
        <input
          type="text"
          name="fullName"
          value={data.fullName}
          onChange={onChangeHandler}
          placeholder="Full Name"
          required
        />

        {/* PHONE NUMBER (10-digit validation + digits only) */}
        <input
          type="tel"
          name="phone"
          value={data.phone}
          placeholder="10-digit Phone Number"
          maxLength={10}
          required
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 10) {
              setData(prev => ({ ...prev, phone: value }));
            }
          }}
        />

        {/* BREAK TIME (time picker; 10-minute window) */}
        <div style={{ marginTop: "10px", marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}>
            Select your break start time
          </label>
          <input
            type="time"
            name="breakTime"
            value={data.breakTime}
            onChange={onChangeHandler}
            step={600} // 600s = 10 minutes
            required
          />
          {data.breakTime && (
            <p style={{ marginTop: "6px", fontSize: "13px", color: "#555" }}>
              Delivery window: <b>{formatBreakWindow(data.breakTime)}</b>
            </p>
          )}
        </div>

        {/* FACULTY ONLY FIELDS */}
        {userType === "faculty" && (
          <>

            <select
              name='block'
              onChange={onChangeHandler}
              value={data.block}
            >
              <option value="">Select Block</option>
              <option value="A">Block A</option>
              <option value="B">Block B</option>
              <option value="C">Block C</option>
              <option value="D">Block D</option>
              <option value="E">Block E</option>
            </select>

            <input
              type="text"
              name='roomNo'
              value={data.roomNo}
              onChange={onChangeHandler}
              placeholder='Room No.'
            />

            <input
              type="text"
              name='facultyCode'
              value={data.facultyCode}
              onChange={onChangeHandler}
              placeholder='Faculty Verification Code'
            />

          </>
        )}

        {/* SPECIAL INSTRUCTIONS */}
        <textarea
          name="specialInstructions"
          value={data.specialInstructions}
          onChange={onChangeHandler}
          placeholder="Any special instructions? (optional)"
          style={{
            width: "100%",
            minHeight: "80px",
            marginTop: "10px",
            padding: "10px",
            borderRadius: "6px"
          }}
        ></textarea>

      </div>

      {/* RIGHT SIDE - TOTAL & PAYMENT */}
      <div className="place-order-right">

        {/* CART TOTALS */}
        <div className="cart-total">
          <h2>Cart Totals</h2>

          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>₹{getTotalCartAmount() === 0 ? 0 : deliveryFee}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <b>Total</b>
            <b>
              ₹
              {getTotalCartAmount() === 0
                ? 0
                : getTotalCartAmount() + deliveryFee}
            </b>
          </div>

        </div>

        {/* PAYMENT OPTIONS */}
        <div className="payment-options">
          <h2>Select Payment Method</h2>

          {/* COD ONLY FOR FACULTY */}
          {userType === "faculty" && (
            <>
              <div className="payment-option">
                <img src={assets.selector_icon} alt="" />
                <p>COD (Cash On Delivery)</p>
              </div>

              <button onClick={handlePlaceOrderCOD}>
                PLACE ORDER (COD)
              </button>

              <hr />
            </>
          )}

          {/* RAZORPAY */}
          <div className="payment-option">
            <img src={assets.selector_icon} alt="" />
            <p>Pay Online (Razorpay)</p>
          </div>

          <button onClick={handlePayOnline} className="razorpay-btn">
            PAY WITH RAZORPAY
          </button>

        </div>

      </div>

    </div>
  );
};

export default PlaceOrder;
