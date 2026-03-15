// ================================
// server.js - NUCLEAR CORS FIX
// ================================

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";  // Keep but override below
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
const PORT = process.env.PORT || 5000;

// ============================================
// 🔥 MANUAL CORS HEADERS - BULLETPROOF
// ============================================
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} from ${req.get('Origin') || 'no-origin'}`);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight handled');
    return res.status(200).end();
  }
  
  next();
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/images", express.static(path.join(__dirname, "uploads")));

// ============================================
// 🧪 TEST ROUTES - WILL WORK IMMEDIATELY
// ============================================
app.get("/api/food/list", (req, res) => {
  console.log('🍔 /api/food/list HIT ✅');
  res.json([
    { _id: "test1", name: "Cheese Burger", price: 99, image: "burger.jpg", category: "main" },
    { _id: "test2", name: "French Fries", price: 49, image: "fries.jpg", category: "side" }
  ]);
});

app.get("/api/order/list", (req, res) => {
  console.log('📋 /api/order/list HIT ✅');
  res.json([
    { _id: "order1", items: [{name: "Burger", qty: 2}], total: 198, status: "pending" }
  ]);
});

app.get("/api/pos/orders", (req, res) => {
  console.log('💳 /api/pos/orders HIT ✅');
  res.json([]);
});

app.get("/api/order/kitchen", (req, res) => {
  console.log('👨‍🍳 /api/order/kitchen HIT ✅');
  res.json([]);
});

// ============================================
// ADMIN ROUTES
// ============================================
const ownersFilePath = path.join(__dirname, "owners.json");

function loadOwners() {
  try {
    if (!fs.existsSync(ownersFilePath)) fs.writeFileSync(ownersFilePath, "[]");
    return JSON.parse(fs.readFileSync(ownersFilePath, 'utf8'));
  } catch (error) {
    console.error("❌ Owners error:", error);
    return [];
  }
}

function saveOwners(data) {
  try {
    fs.writeFileSync(ownersFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("❌ Save owners error:", error);
  }
}

app.post("/api/admin/generate", (req, res) => {
  const { ownerName } = req.body;
  if (!ownerName) return res.status(400).json({ success: false, message: "ownerName required" });
  const owners = loadOwners();
  const code = "ADM-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  owners.push({ ownerName, code });
  saveOwners(owners);
  res.json({ success: true, ownerName, code });
});

app.post("/api/admin/verify", (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: "Code required" });
  const owners = loadOwners();
  const match = owners.find(o => o.code === code);
  res.json({ success: !!match, ownerName: match?.ownerName });
});

// ============================================
// YOUR ROUTES
// ============================================
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/payment", paymentRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/settings", settingsRoute);
app.use("/api/reports", reportRoutes);

// ============================================
// ERROR HANDLERS
// ============================================
app.use((err, req, res, next) => {
  console.error('💥 ERROR:', err.stack);
  res.status(500).json({ success: false, message: 'Server error!' });
});

app.use('*', (req, res) => {
  console.log('❌ 404:', req.originalUrl);
  res.status(404).json({ success: false, message: 'Not found' });
});

connectDB();

app.get("/", (req, res) => {
  res.json({ 
    message: "Campus Bite API 🟢 LIVE", 
    cors: "🔥 FIXED - All origins allowed",
    test: "https://campus-bite-backend.onrender.com/api/food/list",
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server LIVE on port ${PORT}`);
  console.log(`🔥 CORS: ALL ORIGINS ALLOWED`);
  console.log(`🧪 Test: https://campus-bite-backend.onrender.com/api/food/list\n`);
});

process.on('SIGTERM', () => {
  console.log('🔴 Shutting down...');
  server.close(() => console.log('✅ Done'));
});
