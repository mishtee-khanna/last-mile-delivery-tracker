const prisma = require("../prisma/db");

const calculateRate = async (
  pickup_zone_id,
  drop_zone_id,
  package_length,
  package_width,
  package_height,
  actual_weight,
  order_type,
  payment_type
) => {
  // 1. Get configs
  const configs = await prisma.config.findMany();
  const configMap = {};
  configs.forEach((c) => (configMap[c.key] = c.value));

  const volumetricDivisor = parseFloat(configMap["VOLUMETRIC_DIVISOR"] || "5000");
  const codSurchargeB2B = parseFloat(configMap["COD_SURCHARGE_B2B"] || "50");
  const codSurchargeB2C = parseFloat(configMap["COD_SURCHARGE_B2C"] || "30");

  // 2. Calculate volumetric weight
  const volumetricWeight = (package_length * package_width * package_height) / volumetricDivisor;
  
  // 3. Bill on higher weight
  const billableWeight = Math.max(actual_weight, volumetricWeight);

  // 4. Find Rate card
  const rateCard = await prisma.rateCard.findFirst({
    where: {
      source_zone_id: pickup_zone_id,
      dest_zone_id: drop_zone_id,
      order_type: order_type
    }
  });

  if (!rateCard) {
    throw new Error(`No rate card found for zones ${pickup_zone_id} to ${drop_zone_id} (${order_type})`);
  }

  // 5. Base charge
  let charge = billableWeight * rateCard.rate_per_kg;

  // 6. COD Surcharge
  let cod_surcharge_applied = 0;
  if (payment_type === "COD") {
    cod_surcharge_applied = order_type === "B2B" ? codSurchargeB2B : codSurchargeB2C;
    charge += cod_surcharge_applied;
  }

  return { charge, calculated_weight: billableWeight, cod_surcharge_applied };
};

module.exports = { calculateRate };
