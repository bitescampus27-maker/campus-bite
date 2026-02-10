import express from "express";
import { razorpayInstance } from "../config/razorpay.js";
import crypto from "crypto";

const router = express.Router();

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body; // amount in Rs

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt#1",
    };

    const order = await razorpayInstance.orders.create(options);
    res.json(order);

  } catch (error) {
    res.status(500).json({ message: "Order creation failed", error });
  }
});

export default router;
