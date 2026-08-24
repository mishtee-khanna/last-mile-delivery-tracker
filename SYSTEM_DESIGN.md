# Last-Mile Delivery Tracker - System Design

## Architecture Overview
The platform uses a standard 3-tier architecture:
- **Presentation Layer**: A React-based SPA styled with modern Vanilla CSS, focusing on vibrant aesthetics, glassmorphism, and responsive micro-animations.
- **Application Layer**: A Node.js and Express.js REST API providing strict role-based access control using JWTs.
- **Data Layer**: A MySQL database interacted with via the Prisma ORM for type-safe query building and strict schema enforcement.

## 1. Rate Calculation Engine
The rate engine ensures dynamic and accurate pricing by avoiding hardcoded values. Instead, it relies on an admin-configurable `Config` table and a `RateCard` mapping table.
When a quote or order creation is requested, the system performs the following sequence:
1. **Volumetric Weight Calculation**: It multiplies package dimensions (L×B×H) and divides by the `VOLUMETRIC_DIVISOR` fetched dynamically from the `Config` table.
2. **Billable Weight Identification**: It compares the actual weight with the volumetric weight and selects the maximum of the two to prevent revenue loss on light but bulky packages.
3. **Rate Lookup**: It queries the `RateCard` table using the exact combination of the source zone, destination zone, and order type (B2B or B2C). Since inter-zone and intra-zone operations are inherently mapped in this combination, the rate per kg is reliably determined.
4. **COD Surcharge**: If the customer selects "Cash on Delivery", the engine looks up either `COD_SURCHARGE_B2B` or `COD_SURCHARGE_B2C` from the configuration and appends it to the base charge to yield the total amount.

## 2. Zone Detection Approach
Zones are abstracted as distinct regional identifiers (e.g., Zone 1, Zone 2) stored in a `Zone` table.
- **Mapping**: In a production environment, geocoding APIs (like Google Maps) would convert raw addresses into coordinates, and a geospatial query (using Polygon mapping) would identify the correct `zone_id`. 
- **Implementation**: For this MVP, zones are discrete selections made during order creation. Both Customers (pickup/drop) and Agents (current location) explicitly declare their zone ID. The system strictly ties Rate Cards and Auto-Assignment to these mapped zone IDs.

## 3. Auto-Assignment Logic
To minimize logistics overhead, assignment focuses on agent proximity and workload distribution.
When triggered (either automatically on order creation or manually by an admin):
1. **Filtering**: The system queries the `User` table for agents (`role = 'AGENT'`) who are currently available (`is_available = true`) and whose `current_zone_id` exactly matches the order's `pickup_zone_id`.
2. **Workload Balancing**: If multiple agents meet the criteria, the system calculates the number of active, incomplete orders assigned to each candidate. The agent with the fewest active orders is selected.
3. **Fallback**: If no agents are currently available in the pickup zone, the system aborts auto-assignment and leaves the order in the `PENDING` state, generating an alert for an Admin to manually override or assign it later.

## 4. Failed Delivery Handling
A resilient delivery process requires clean handling of delivery failures without losing track of the original transaction.
1. **Status Flagging**: If a delivery cannot be completed, the Agent marks the status as `FAILED`.
2. **Tracking Integrity**: The `FAILED` status, timestamp, and the acting Agent's ID are permanently appended to the `OrderTracking` table.
3. **Customer Resolution**: The customer is notified via email/SMS. Upon logging in, they see the failed status and are presented with an option to reschedule the delivery for a new date.
4. **Re-initialization**: Upon rescheduling, the system resets the order status back to `PENDING` and clears the previous `agent_id`. This places the order back into the primary queue to be picked up by the auto-assignment engine for the next day's route, ensuring the workload is cleanly redistributed rather than burdening the original agent.
