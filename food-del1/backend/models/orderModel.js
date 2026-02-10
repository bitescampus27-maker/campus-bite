import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    items: { type: Array, required: true },

    amount: { type: Number, required: true },

    address: { type: Object, required: true },

    // NEW: Use a clean universal status
    status: {
      type: String,
      default: "pending", // was "Food Processing"
    },

    payment: { type: Boolean, default: false }
  },

  // NEW: Automatic timestamps (createdAt, updatedAt)
  { timestamps: true }
);

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
