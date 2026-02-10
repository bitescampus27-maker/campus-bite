import express from "express";
import PosOrder from "../models/posOrderModel.js";
import Food from "../models/foodModel.js";

const router = express.Router();

/* -----------------------------------------------------
   UPDATE POS ORDER STATUS (preparing → prepared)
------------------------------------------------------ */
router.post("/update-status", async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.json({ success: false, message: "orderId and status required" });
    }

    const updatedOrder = await PosOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.json({ success: false, message: "Order not found" });
    }

    return res.json({ success: true, order: updatedOrder });

  } catch (error) {
    console.error("POS status update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


/* -----------------------------------------------------
   CREATE POS ORDER → auto to kitchen (status = preparing)
------------------------------------------------------ */
router.post("/order", async (req, res) => {
  try {
    const { items, orderType, customerName, customerPhone, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    let orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const food = await Food.findById(item.foodId);

      if (!food) {
        return res.status(404).json({
          success: false,
          message: `Food item not found: ${item.foodId}`,
        });
      }

      const quantity = item.quantity || 1;

      orderItems.push({
        foodId: food._id,
        name: food.name,
        price: food.price,
        quantity,
      });

      totalAmount += food.price * quantity;
    }

    const newOrder = await PosOrder.create({
      items: orderItems,
      totalAmount,
      orderType: orderType || "dine-in",
      customerName,
      customerPhone,
      paymentMethod: paymentMethod || "cash",
      isPaid: true,
      status: "preparing", // ⭐ Direct to kitchen
    });

    return res.status(201).json({
      success: true,
      message: "POS order created",
      order: newOrder,
    });

  } catch (error) {
    console.error("POS order error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


/* -----------------------------------------------------
   GET ALL POS ORDERS (Admin)
------------------------------------------------------ */
router.get("/orders", async (req, res) => {
  try {
    const orders = await PosOrder.find().sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    console.error("Fetch POS orders error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
