// admin/src/pages/Settings/Settings.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Settings.css";

const Settings = () => {
  const API = "https://campus-bite-backend.onrender.com/api/settings";

  const [deliveryFee, setDeliveryFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // Load current delivery fee
  const loadSettings = async () => {
    try {
      const res = await axios.get(`${API}/delivery-fee`);
      if (res.data.deliveryFee !== undefined) {
        setDeliveryFee(res.data.deliveryFee);
      }
    } catch {
      setSavedMessage("Failed to load settings");
    }
    setLoading(false);
  };

  // Save delivery fee
  const saveSettings = async () => {
    setSaving(true);
    setSavedMessage("");

    try {
      const res = await axios.post(`${API}/update-delivery-fee`, {
        deliveryFee: Number(deliveryFee),
      });

      if (res.data.success) {
        setSavedMessage("Delivery fee updated successfully!");
      } else {
        setSavedMessage("Failed to update delivery fee.");
      }
    } catch {
      setSavedMessage("Server error. Try again.");
    }

    setSaving(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="settings-page">

      <h2 className="settings-title">Settings</h2>

      {loading ? (
        <p className="settings-loading">Loading settings...</p>
      ) : (
        <div className="settings-card">
          
          <h3 className="settings-subtitle">Delivery Fee</h3>

          <label className="settings-label">Amount (₹)</label>
          <input
            type="number"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            className="settings-input"
          />

          <button
            className="settings-btn"
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {savedMessage && <p className="settings-success">{savedMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default Settings;
