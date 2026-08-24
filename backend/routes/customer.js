const express = require("express");
const prisma = require("../prisma/db");
const authMiddleware = require("../middleware/auth");
const { calculateRate } = require("../services/rateEngine");
const { sendNotification } = require("../services/notification");
const { assignAgentToOrder } = require("../services/assignmentEngine");

const router = express.Router();
router.use(authMiddleware(["CUSTOMER", "ADMIN"]));

// Get my orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customer_id: req.user.userId },
      include: { trackingHistory: true, agent: true }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate quote
router.post("/quote", async (req, res) => {
  try {
    const { pickup_zone_id, drop_zone_id, length, width, height, weight, order_type, payment_type } = req.body;
    const rate = await calculateRate(pickup_zone_id, drop_zone_id, length, width, height, weight, order_type, payment_type);
    res.json(rate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create Order
router.post("/orders", async (req, res) => {
  try {
    const { pickup_address, pickup_zone_id, drop_address, drop_zone_id, length, width, height, weight, order_type, payment_type } = req.body;
    
    // Calculate final rate
    const rateInfo = await calculateRate(pickup_zone_id, drop_zone_id, length, width, height, weight, order_type, payment_type);

    const order = await prisma.order.create({
      data: {
        customer_id: req.user.userId,
        pickup_address,
        pickup_zone_id,
        drop_address,
        drop_zone_id,
        package_length: length,
        package_width: width,
        package_height: height,
        actual_weight: weight,
        order_type,
        payment_type,
        calculated_weight: rateInfo.calculated_weight,
        charge: rateInfo.charge,
        cod_surcharge_applied: rateInfo.cod_surcharge_applied,
        status: "PENDING"
      }
    });

    await prisma.orderTracking.create({
      data: { order_id: order.id, status: "PENDING", actor_id: req.user.userId }
    });

    // Attempt auto-assign
    try {
      await assignAgentToOrder(order.id, req.user.userId);
    } catch (e) {
      console.log("Auto-assignment skipped: ", e.message);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reschedule failed order
router.post("/orders/:id/reschedule", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { scheduled_date } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order.customer_id !== req.user.userId) return res.status(403).json({ error: "Forbidden" });
    if (order.status !== "FAILED") return res.status(400).json({ error: "Only failed orders can be rescheduled" });

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PENDING",
        agent_id: null,
        scheduled_date: new Date(scheduled_date)
      }
    });

    await prisma.orderTracking.create({
      data: { order_id: orderId, status: "PENDING", actor_id: req.user.userId }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
