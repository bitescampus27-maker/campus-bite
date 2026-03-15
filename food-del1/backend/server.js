```javascript
// ================================
// server.js (FULL CORRECTED VERSION)
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
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

// --------------------------------------------
// PORT
// --------------------------------------------
const PORT = process.env.PORT || 5000;

// --------------------------------------------
// Resolve __dirname for ES modules
// --------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------
// CORS CONFIG (FIXED FOR RENDER)
// --------------------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173", // frontend local
      "http://localhost:5174", // admin local
      "https://campus-bite-2.onrender.com" // deployed admin
    ],
    credentials: true,
  })
);

app.use(express.json());

// --------------------------------------------
// STATIC FILES (UPLOADS)
// --------------------------------------------
app.use("/images", express.static(path.join(__dirname, "uploads")));

// --------------------------------------------
// ADMIN ACCESS CODE SYSTEM
// --------------------------------------------

// Path to owners.json
const ownersFilePath = path.join(__dirname, "owners.json");

// Load owners.json or create if missing
function loadOwners() {
  try {
    if (!fs.existsSync(ownersFilePath)) {
      fs.writeFileSync(ownersFilePath, "[]");
    }
    return JSON.parse(fs.readFileSync(ownersFilePath));
  } catch (error) {
    console.error("Error loading owners:", error);
    return [];
  }
}

// Save owners
function saveOwners(data) {
  try {
    fs.writeFileSync(ownersFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving owners:", error);
  }
}

// Generate admin code
function generateAdminCode() {
  return "ADM-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Generate admin code API
app.post("/api/admin/generate", (req, res) => {
  const { ownerName } = req.body;

  if (!ownerName) {
    return res
      .status(400)
      .json({ success: false, message: "ownerName required" });
  }

  const owners = loadOwners();
  const code = generateAdminCode();

  owners.push({ ownerName, code });

  saveOwners(owners);

  res.json({
    success: true,
    ownerName,
    code,
  });
});

// Verify admin login code
app.post("/api/admin/verify", (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res
      .status(400)
      .json({ success: false, message: "Code required" });
  }

  const owners = loadOwners();

  const match = owners.find((o) => o.code === code);

  if (!match) {
    return res.json({ success: false });
  }

  res.json({
    success: true,
    ownerName: match.ownerName,
  });
});

// --------------------------------------------
// API ROUTES
// --------------------------------------------

app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/payment", paymentRoutes);
app.use("/api/pos", posRoutes);

// Delivery settings
app.use("/api/settings", settingsRoute);

// Monthly reports
app.use("/api/reports", reportRoutes);

// --------------------------------------------
// DATABASE CONNECTION
// --------------------------------------------
connectDB();

// --------------------------------------------
// TEST ROUTE
// --------------------------------------------
app.get("/", (req, res) => {
  res.send("API Working — Server Online ✔");
});

// --------------------------------------------
// START SERVER
// --------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```
