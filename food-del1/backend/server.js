// ================================
// server.js (UPDATED FULL VERSION)
// ================================

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Database + Routes
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import posRoutes from "./routes/posRoutes.js";
import settingsRoute from "./routes/settingsRoute.js";  
import reportRoutes from "./routes/reportRoutes.js";   // ⭐ NEW — Monthly Reports

const app = express();

// Port number
const PORT = process.env.PORT || 5000;

// Allow admin panel + frontend to access backend
app.use(
  cors({
    origin: [
      "http://localhost:5173", // main frontend
      "http://localhost:5174", // admin panel
    ],
    credentials: true,
  })
);

app.use(express.json());

// --------------------------------------------
// ⭐ ADMIN ACCESS CODE SYSTEM (as you added)
// --------------------------------------------

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to owners.json
const ownersFilePath = path.join(__dirname, "owners.json");

// Load owners.json or create it if missing
function loadOwners() {
  if (!fs.existsSync(ownersFilePath)) {
    fs.writeFileSync(ownersFilePath, "[]");
  }
  return JSON.parse(fs.readFileSync(ownersFilePath));
}

// Save owners.json
function saveOwners(data) {
  fs.writeFileSync(ownersFilePath, JSON.stringify(data, null, 2));
}

// Generate unique admin access code
function generateAdminCode() {
  return "ADM-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// API: Generate admin code
app.post("/api/admin/generate", (req, res) => {
  const { ownerName } = req.body;

  if (!ownerName)
    return res.status(400).json({ success: false, message: "ownerName required" });

  const owners = loadOwners();
  const code = generateAdminCode();

  owners.push({ ownerName, code });
  saveOwners(owners);

  res.json({ success: true, ownerName, code });
});

// API: Verify admin login code
app.post("/api/admin/verify", (req, res) => {
  const { code } = req.body;

  if (!code)
    return res.status(400).json({ success: false, message: "Code required" });

  const owners = loadOwners();
  const match = owners.find((o) => o.code === code);

  if (!match) return res.json({ success: false });

  res.json({ success: true });
});

// --------------------------------------------
// ⭐ APP ROUTES
// --------------------------------------------

app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/payment", paymentRoutes);
app.use("/api/pos", posRoutes);

// Serve food images
app.use("/images", express.static("uploads"));

// ⭐ Delivery Fee Settings Route
app.use("/api/settings", settingsRoute);

// ⭐ Monthly Reports Route (NEW)
app.use("/api/reports", reportRoutes);

// --------------------------------------------
// Connect DB
// --------------------------------------------
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.send("API Working — Server Online ✔");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
