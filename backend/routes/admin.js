const express = require("express");
const prisma = require("../prisma/db");
const authMiddleware = require("../middleware/auth");
const { assignAgentToOrder } = require("../services/assignmentEngine");

const router = express.Router();
router.use(authMiddleware(["ADMIN"]));

// Add Zone
router.post("/zones", async (req, res) => {
  try {
    const { name } = req.body;
    const zone = await prisma.zone.create({ data: { name } });
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/zones", async (req, res) => {
  const zones = await prisma.zone.findMany();
  res.json(zones);
});

// Add Rate Card
router.post("/rates", async (req, res) => {
  try {
    const { source_zone_id, dest_zone_id, order_type, rate_per_kg } = req.body;
    const rate = await prisma.rateCard.create({
      data: { source_zone_id, dest_zone_id, order_type, rate_per_kg }
    });
    res.json(rate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update config
router.post("/config", async (req, res) => {
  try {
    const { key, value } = req.body;
    const config = await prisma.config.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View all orders
router.get("/orders", async (req, res) => {
  try {
    const { status, zone_id, agent_id } = req.query;
    
    let filters = {};
    if (status) filters.status = status;
    if (agent_id) filters.agent_id = parseInt(agent_id);
    if (zone_id) {
      filters.OR = [
        { pickup_zone_id: parseInt(zone_id) },
        { drop_zone_id: parseInt(zone_id) }
      ];
    }

    const orders = await prisma.order.findMany({
      where: filters,
      include: { customer: true, agent: true, pickupZone: true, dropZone: true }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual override status
router.put("/orders/:id/status", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    await prisma.orderTracking.create({
      data: { order_id: orderId, status, actor_id: req.user.userId }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual Agent assignment or Trigger Auto
router.post("/orders/:id/assign", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { agent_id } = req.body; // if null, trigger auto

    if (agent_id) {
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { agent_id: parseInt(agent_id), status: "ASSIGNED" }
      });
      await prisma.orderTracking.create({
        data: { order_id: orderId, status: "ASSIGNED", actor_id: req.user.userId }
      });
      return res.json(updated);
    } else {
      const result = await assignAgentToOrder(orderId, req.user.userId);
      return res.json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
