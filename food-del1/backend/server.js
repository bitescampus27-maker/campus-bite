// ================================
// server.js (PRODUCTION READY)
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
// ✅ PRODUCTION CORS CONFIGURATION
// --------------------------------------------
// Specific origins for security (Render + Local dev)
const allowedOrigins = [
  'https://campus-bite-2.onrender.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// --------------------------------------------
// MIDDLEWARE
// --------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
// ADMIN ACCESS CODE SYSTEM
// --------------------------------------------

const ownersFilePath = path.join(__dirname, "owners.json");

// Load owners
function loadOwners() {
  try {
    if (!fs.existsSync(ownersFilePath)) {
      fs.writeFileSync(ownersFilePath, "[]");
    }
    return JSON.parse(fs.readFileSync(ownersFilePath, 'utf8'));
  } catch (error) {
    console.error("Error loading owners:", error);
    return [];
  }
}

// Save owners
function saveOwners(data) {
  try {
    fs.writeFileSync(ownersFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error saving owners:", error);
  }
}

// Generate admin code
function generateAdminCode() {
  return "ADM-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

app.post("/api/admin/generate", (req, res) => {
  const { ownerName } = req.body;

  if (!ownerName) {
    return res.status(400).json({
      success: false,
      message: "ownerName required"
    });
  }

  const owners = loadOwners();
  const code = generateAdminCode();

  owners.push({ ownerName, code });
  saveOwners(owners);

  res.json({
    success: true,
    ownerName,
    code
  });
});

// Verify admin code
app.post("/api/admin/verify", (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Code required"
    });
  }

  const owners = loadOwners();
  const match = owners.find((o) => o.code === code);

  if (!match) {
    return res.json({ success: false });
  }

  res.json({
    success: true,
    ownerName: match.ownerName
  });
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
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// --------------------------------------------
// 404 Handler
// --------------------------------------------
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// --------------------------------------------
// DATABASE
// --------------------------------------------
connectDB();

// --------------------------------------------
// TEST ROUTE
// --------------------------------------------
app.get("/", (req, res) => {
  res.json({ 
    message: "Campus Bite API 🚀", 
    status: "Online", 
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------
// START SERVER
// --------------------------------------------
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 CORS enabled for: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
