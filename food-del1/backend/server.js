// ================================
// server.js (🚀 FULLY FIXED - ALL FRONTENDS)
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
// ✅ SUPER CORS - ALL YOUR FRONTENDS + LOCAL
// --------------------------------------------
const allowedOrigins = [
  'https://campus-bite-1.onrender.com',    // ← NEW FRONTEND
  'https://campus-bite-2.onrender.com',    // ← OLD FRONTEND
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3001',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    console.log('🌐 CORS Request from:', origin);
    
    // Allow no origin (mobile/postman)
    if (!origin) {
      console.log('✅ Allowing no-origin request');
      return callback(null, true);
    }
    
    // Allow your domains
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS Allowed:', origin);
      return callback(null, true);
    }
    
    console.log('🚫 CORS Blocked:', origin);
    callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle ALL preflight requests
app.options('*', cors());

// --------------------------------------------
// MIDDLEWARE
// --------------------------------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --------------------------------------------
// Resolve __dirname (ES Modules)
// --------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------
// STATIC FILES (UPLOADS)
// --------------------------------------------
app.use("/images", express.static(path.join(__dirname, "uploads")));

// --------------------------------------------
// 🧪 EMERGENCY TEST ROUTES (Remove after testing)
// --------------------------------------------
app.get("/api/food/list", (req, res) => {
  console.log('🍔 Test /api/food/list hit');
  res.json([
    { _id: "1", name: "Test Burger", price: 50, image: "/images/test.jpg" }
  ]);
});

app.get("/api/order/list", (req, res) => {
  console.log('📋 Test /api/order/list hit');
  res.json([]);
});

app.get("/api/pos/orders", (req, res) => {
  console.log('💳 Test /api/pos/orders hit');
  res.json([]);
});

app.get("/api/order/kitchen", (req, res) => {
  console.log('👨‍🍳 Test /api/order/kitchen hit');
  res.json([]);
});

// --------------------------------------------
// ADMIN ACCESS CODE SYSTEM
// --------------------------------------------
const ownersFilePath = path.join(__dirname, "owners.json");

function loadOwners() {
  try {
    if (!fs.existsSync(ownersFilePath)) {
      fs.writeFileSync(ownersFilePath, "[]");
    }
    return JSON.parse(fs.readFileSync(ownersFilePath, 'utf8'));
  } catch (error) {
    console.error("❌ Error loading owners:", error);
    return [];
  }
}

function saveOwners(data) {
  try {
    fs.writeFileSync(ownersFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("❌ Error saving owners:", error);
  }
}

function generateAdminCode() {
  return "ADM-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

app.post("/api/admin/generate", (req, res) => {
  const { ownerName } = req.body;
  if (!ownerName) {
    return res.status(400).json({ success: false, message: "ownerName required" });
  }
  const owners = loadOwners();
  const code = generateAdminCode();
  owners.push({ ownerName, code });
  saveOwners(owners);
  res.json({ success: true, ownerName, code });
});

app.post("/api/admin/verify", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: "Code required" });
  }
  const owners = loadOwners();
  const match = owners.find((o) => o.code === code);
  if (!match) return res.json({ success: false });
  res.json({ success: true, ownerName: match.ownerName });
});

// --------------------------------------------
// ROUTES
// --------------------------------------------
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/payment", paymentRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/settings", settingsRoute);
app.use("/api/reports", reportRoutes);

// --------------------------------------------
// ERROR HANDLING
// --------------------------------------------
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Server error occurred!' });
});

// --------------------------------------------
// 404 Handler
// --------------------------------------------
app.use('*', (req, res) => {
  console.log('❌ 404:', req.originalUrl);
  res.status(404).json({ success: false, message: 'Route not found' });
});

// --------------------------------------------
// DATABASE
// --------------------------------------------
connectDB();

// --------------------------------------------
// 🧪 HEALTH CHECK
// --------------------------------------------
app.get("/", (req, res) => {
  res.json({ 
    message: "Campus Bite API 🚀", 
    status: "🟢 Online", 
    corsOrigins: allowedOrigins,
    timestamp: new Date().toISOString(),
    testEndpoints: [
      "/api/food/list",
      "/api/order/list", 
      "/api/pos/orders"
    ]
  });
});

// --------------------------------------------
// START SERVER
// --------------------------------------------
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 CORS enabled for:`);
  allowedOrigins.forEach(origin => console.log(`   ${origin}`));
  console.log(`\n🧪 Test URLs:`);
  console.log(`   https://campus-bite-backend.onrender.com/api/food/list`);
  console.log(`   https://campus-bite-backend.onrender.com/api/order/list\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔴 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});
