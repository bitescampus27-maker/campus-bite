// App.jsx
import React from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";

import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import AdminPOS from "./pages/AdminPOS/AdminPOS";
import Settings from "./pages/Settings/Settings";
import Kitchen from "./pages/Kitchen/Kitchen";
import MonthlyReport from "./pages/MonthlyReport/MonthlyReport"; // ⭐ NEW

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div className="app">
      <ToastContainer />

      <Navbar />
      <hr />

      <div className="app-content">
        <Sidebar />

        {/* ⭐ ALL ROUTES HERE */}
        <Routes>
          {/* Food Management */}
          <Route path="/add" element={<Add />} />
          <Route path="/list" element={<List />} />

          {/* Orders */}
          <Route path="/orders" element={<Orders />} />

          {/* POS System */}
          <Route path="/admin/pos" element={<AdminPOS />} />

          {/* Kitchen Screen */}
          <Route path="/kitchen" element={<Kitchen />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* ⭐ NEW — Monthly Report */}
          <Route path="/monthly-report" element={<MonthlyReport />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
