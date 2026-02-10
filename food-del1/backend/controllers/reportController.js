import orderModel from "../models/orderModel.js";

/* ================= MONTHLY REPORT ================= */
const monthlyReport = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const orders = await orderModel.find({
      createdAt: { $gte: start, $lt: end },
    });

    const delivered = orders.filter(o => o.status === "delivered");
    const rejected = orders.filter(o => o.status === "rejected");

    const totalRevenue = delivered.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    const itemMap = {};
    orders.forEach(order => {
      order.items.forEach(i => {
        itemMap[i.name] = (itemMap[i.name] || 0) + i.quantity;
      });
    });

    const topItems = Object.entries(itemMap).map(([name, count]) => ({
      name,
      count,
    }));

    res.json({
      totalOrders: orders.length,
      delivered: delivered.length,
      rejected: rejected.length,
      totalRevenue,
      orders,
      topItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load monthly report" });
  }
};

/* ================= DAILY REPORT ================= */
const dailyReport = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const start = new Date(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const orders = await orderModel.find({
      createdAt: { $gte: start, $lt: end },
    });

    const delivered = orders.filter(o => o.status === "delivered");
    const rejected = orders.filter(o => o.status === "rejected");

    const totalRevenue = delivered.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    res.json({
      totalOrders: orders.length,
      delivered: delivered.length,
      rejected: rejected.length,
      totalRevenue,
      orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load daily report" });
  }
};

export { monthlyReport, dailyReport };
