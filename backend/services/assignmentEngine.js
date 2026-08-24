const prisma = require("../prisma/db");
const { sendNotification } = require("./notification");

const assignAgentToOrder = async (orderId, actorId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) throw new Error("Order not found");
  if (order.status !== "PENDING") throw new Error("Order is not in PENDING state");

  // Find nearest available agent: based on current_zone_id == pickup_zone_id
  const agents = await prisma.user.findMany({
    where: {
      role: "AGENT",
      is_available: true,
      current_zone_id: order.pickup_zone_id
    },
    include: {
      _count: {
        select: { ordersAsAgent: { where: { status: { in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"] } } } }
      }
    }
  });

  if (agents.length === 0) {
    return { success: false, message: "No available agents in the pickup zone." };
  }

  // Sort by fewest active orders
  agents.sort((a, b) => a._count.ordersAsAgent - b._count.ordersAsAgent);
  const selectedAgent = agents[0];

  // Assign agent
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      agent_id: selectedAgent.id,
      status: "ASSIGNED"
    }
  });

  // Log tracking
  await prisma.orderTracking.create({
    data: {
      order_id: orderId,
      status: "ASSIGNED",
      actor_id: actorId
    }
  });

  // Notify Customer
  await sendNotification(order.customer_id, "EMAIL", `Your order #${orderId} has been assigned to agent ${selectedAgent.name}.`);
  // Notify Agent
  await sendNotification(selectedAgent.id, "EMAIL", `You have been assigned order #${orderId}.`);

  return { success: true, agent: selectedAgent, order: updatedOrder };
};

module.exports = { assignAgentToOrder };
