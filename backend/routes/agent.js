const express = require("express");
const prisma = require("../prisma/db");
const authMiddleware = require("../middleware/auth");
const { sendNotification } = require("../services/notification");

const router = express.Router();
router.use(authMiddleware(["AGENT"]));

// Get assigned orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { agent_id: req.user.userId }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.put("/orders/:id/status", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order.agent_id !== req.user.userId) return res.status(403).json({ error: "Not assigned to this order" });

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    await prisma.orderTracking.create({
      data: { order_id: orderId, status, actor_id: req.user.userId }
    });

    await sendNotification(order.customer_id, "EMAIL/SMS", `Your order #${orderId} status changed to ${status}`);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update agent location (zone)
router.put("/location", async (req, res) => {
  try {
    const { current_zone_id } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { current_zone_id: parseInt(current_zone_id) }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
