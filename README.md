# Last-Mile Delivery Tracker

A comprehensive delivery management platform built with React, Node.js, Express, and MySQL.

## Features
- **Admin**: Manage zones, rate cards, and monitor all orders. Auto-assign agents or override status.
- **Customer**: Get live quotes, place orders, view order history, and reschedule failed deliveries.
- **Agent**: Update delivery status (Picked up, In Transit, Delivered, Failed) and current location.
- **Rate Engine**: Dynamically calculates shipping charge using volumetric vs actual weight, zone-to-zone rates (B2B/B2C), and COD surcharges.
- **Auto-Assignment**: Matches unassigned orders to the nearest available agent with the least active orders.

## Setup Guide

### 1. Database Setup
We use MySQL. You can use the provided `docker-compose.yml` to spin up a local instance:
```bash
docker-compose up -d
```
Alternatively, configure the `backend/.env` file with your own MySQL connection string:
```
DATABASE_URL="mysql://root:password@localhost:3306/lastmile"
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
node seed.js  # Seeds admin user, zones, and rate cards
npm start     # Runs on port 5000 (add start script or use node server.js)
```
*(Default Admin Login: admin@example.com / admin123)*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Docs
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
- **Customer**: 
  - `POST /api/customer/quote` (Get price quote)
  - `POST /api/customer/orders` (Create order)
  - `GET /api/customer/orders` (View history)
  - `POST /api/customer/orders/:id/reschedule`
- **Agent**:
  - `GET /api/agent/orders` (Assigned orders)
  - `PUT /api/agent/orders/:id/status` (Update status)
  - `PUT /api/agent/location` (Update current zone)
- **Admin**:
  - `POST /api/admin/rates` (Add rate card)
  - `POST /api/admin/zones` (Add zone)
  - `GET /api/admin/orders` (All orders)
  - `POST /api/admin/orders/:id/assign` (Auto-assign or manual assign)

## Rate Calculation Logic
1. System determines `volumetric_weight` = (L * B * H) / 5000 (divisor is configurable).
2. `billable_weight` is the maximum of `actual_weight` and `volumetric_weight`.
3. Looks up `RateCard` for Pickup Zone -> Drop Zone matching the order type (B2B/B2C).
4. `Base Charge = billable_weight * rate_per_kg`.
5. If payment is COD, adds `COD_SURCHARGE` depending on B2B or B2C configuration.
