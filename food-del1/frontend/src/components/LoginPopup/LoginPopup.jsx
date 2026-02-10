import React, { useContext, useEffect } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPopup = ({ setShowLogin }) => {
  const { setToken, url, loadCartData } = useContext(StoreContext);

  // HANDLE GOOGLE RESPONSE
  const handleGoogleResponse = async (response) => {
    const googleToken = response.credential;

    try {
      const res = await axios.post(`${url}/api/user/google-login`, {
        token: googleToken,
      });

      if (res.data.success) {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);

        // Load cart automatically
        loadCartData({ token: res.data.token });

        setShowLogin(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Google login failed");
    }
  };

  // INITIALIZE GOOGLE LOGIN BUTTON
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            "800915697216-e1melaunt3rna55vmfa18e0v50e2ta5m.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-login"),
          {
            theme: "outline",
            size: "large",
            width: 300, // must be number
          }
        );
      }
    }, 300); // small delay ensures element exists

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="login-popup">
      <div className="login-popup-container">
        <div className="login-popup-title">
          <h2>Sign in</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>

        {/* GOOGLE LOGIN BUTTON */}
        <div
          id="google-login"
          style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}
        ></div>

      </div>
    </div>
  );
};

export default LoginPopup;
