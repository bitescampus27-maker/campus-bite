import mongoose from "mongoose";

const PosOrderSchema = new mongoose.Schema(
  {
    items: [
      {
        foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    orderType: {
      type: String,
      enum: ["dine-in", "takeaway"],
      default: "dine-in",
    },

    customerName: {
      type: String,
      default: "Walk-in",
    },

    customerPhone: {
      type: String,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      default: "cash",
    },

    // ⭐ NO delivered in ENUM because DB should NOT store delivered
    status: {
      type: String,
      enum: ["accepted", "preparing", "prepared"],
      default: "preparing",
    },

    isPaid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const PosOrder = mongoose.model("PosOrder", PosOrderSchema);

export default PosOrder;
