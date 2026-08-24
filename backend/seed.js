const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  // Create admin
  const hashedAdmin = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedAdmin,
      role: "ADMIN"
    }
  });

  // Create configs
  await prisma.config.upsert({ where: { key: "VOLUMETRIC_DIVISOR" }, update: {}, create: { key: "VOLUMETRIC_DIVISOR", value: "5000" }});
  await prisma.config.upsert({ where: { key: "COD_SURCHARGE_B2B" }, update: {}, create: { key: "COD_SURCHARGE_B2B", value: "50" }});
  await prisma.config.upsert({ where: { key: "COD_SURCHARGE_B2C" }, update: {}, create: { key: "COD_SURCHARGE_B2C", value: "30" }});

  // Create Zones
  const zoneA = await prisma.zone.upsert({ where: { name: "North Zone" }, update: {}, create: { name: "North Zone" }});
  const zoneB = await prisma.zone.upsert({ where: { name: "South Zone" }, update: {}, create: { name: "South Zone" }});

  // Create Rate Cards
  // Check if exists, else create
  const existingRates = await prisma.rateCard.findMany();
  if (existingRates.length === 0) {
    await prisma.rateCard.createMany({
      data: [
        { source_zone_id: zoneA.id, dest_zone_id: zoneA.id, order_type: "B2C", rate_per_kg: 10 },
        { source_zone_id: zoneA.id, dest_zone_id: zoneB.id, order_type: "B2C", rate_per_kg: 20 },
        { source_zone_id: zoneA.id, dest_zone_id: zoneA.id, order_type: "B2B", rate_per_kg: 8 },
        { source_zone_id: zoneA.id, dest_zone_id: zoneB.id, order_type: "B2B", rate_per_kg: 15 },
        { source_zone_id: zoneB.id, dest_zone_id: zoneA.id, order_type: "B2C", rate_per_kg: 20 },
        { source_zone_id: zoneB.id, dest_zone_id: zoneB.id, order_type: "B2C", rate_per_kg: 10 },
        { source_zone_id: zoneB.id, dest_zone_id: zoneA.id, order_type: "B2B", rate_per_kg: 15 },
        { source_zone_id: zoneB.id, dest_zone_id: zoneB.id, order_type: "B2B", rate_per_kg: 8 },
      ]
    });
  }
  
  console.log("Database seeded successfully.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
