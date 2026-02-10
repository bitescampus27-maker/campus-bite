import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const currency = "inr";
const deliveryCharge = 50;
const frontend_URL = "http://localhost:5173";

/* ================= PLACE ORDER (ONLINE) ================= */
const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      specialInstructions: req.body.specialInstructions || "",
      status: "pending",
      deliveryFee: deliveryCharge
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Delivery Charge" },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (err) {
    console.error("PLACE ORDER ERROR:", err);
    res.json({ success: false, message: "Order failed" });
  }
};

/* ================= PLACE ORDER (COD) ================= */
const placeOrderCod = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      specialInstructions: req.body.specialInstructions || "",
      payment: true,
      status: "pending",
      deliveryFee: deliveryCharge
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    res.json({ success: true });
  } catch (err) {
    console.error("COD ORDER ERROR:", err);
    res.json({ success: false });
  }
};

/* ================= LIST ORDERS ================= */
const listOrders = async (req, res) => {
  const orders = await orderModel.find().sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
};

/* ================= USER ORDERS ================= */
const userOrders = async (req, res) => {
  const orders = await orderModel.find({ userId: req.body.userId });
  res.json({ success: true, data: orders });
};

/* ================= ACCEPT ================= */
const acceptOrder = async (req, res) => {
  await orderModel.findByIdAndUpdate(req.body.orderId, {
    status: "preparing",
  });
  res.json({ success: true });
};

/* ================= REJECT ================= */
const rejectOrder = async (req, res) => {
  await orderModel.findByIdAndUpdate(req.body.orderId, {
    status: "rejected",
  });
  res.json({ success: true });
};

/* ================= KITCHEN ================= */
const kitchenOrders = async (req, res) => {
  const orders = await orderModel.find({ status: "preparing" });
  res.json({ success: true, orders });
};

/* ================= PREPARED ================= */
const markPrepared = async (req, res) => {
  await orderModel.findByIdAndUpdate(req.body.orderId, {
    status: "prepared",
  });
  res.json({ success: true });
};

/* ================= DELIVERED ================= */
const markDelivered = async (req, res) => {
  await orderModel.findByIdAndUpdate(req.body.orderId, {
    status: "delivered",
  });
  res.json({ success: true });
};

/* ================= VERIFY ================= */
const verifyOrder = async (req, res) => {
  if (req.body.success === "true") {
    await orderModel.findByIdAndUpdate(req.body.orderId, { payment: true });
    res.json({ success: true });
  } else {
    await orderModel.findByIdAndDelete(req.body.orderId);
    res.json({ success: false });
  }
};

/* ================= GET BILL ================= */
const getBillByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "delivered") {
      return res.json({
        success: false,
        message: "Bill available only for delivered orders",
      });
    }

    const bill = {
      orderId: order._id,
      customerName: order.address?.name || "Customer",
      items: order.items,
      amount: order.amount,
      deliveryFee: order.deliveryFee || 0,
      totalAmount: order.amount + (order.deliveryFee || 0),
      status: order.status,
      createdAt: order.createdAt,
    };

    res.json({
      success: true,
      bill,
    });
  } catch (error) {
    console.error("GET BILL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bill",
    });
  }
};

export {
  placeOrder,
  placeOrderCod,
  listOrders,
  userOrders,
  acceptOrder,
  rejectOrder,
  kitchenOrders,
  markPrepared,
  markDelivered,
  verifyOrder,
  getBillByOrderId
};
