<div align="center">

# 🚚 Last-Mile Delivery Tracker

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=24&pause=1000&color=00BFFF&center=true&vCenter=true&width=800&lines=Smart+Delivery+Management+Platform;Real-Time+Order+Tracking+%7C+Dynamic+Pricing;Automated+Agent+Assignment+%7C+Role-Based+Access" alt="Typing SVG" />

<br>

![Status](https://img.shields.io/badge/Status-Active-2ea44f?style=for-the-badge&logo=github)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-REST%20API-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

</div>

---

## 📦 Overview

**Last-Mile Delivery Tracker** is a full-stack delivery management platform designed to simplify and automate the last-mile logistics workflow.

The system connects **Admins, Customers, and Delivery Agents** through a role-based platform that supports order creation, dynamic shipping quotes, delivery tracking, agent assignment, failed-delivery handling, and rescheduling.

> 🎯 **Goal:** Make last-mile delivery operations more efficient, transparent, and easier to manage.

---

## ✨ Key Features

### 👨‍💼 Admin Dashboard
- Manage delivery zones and rate cards
- Monitor all orders across the platform
- Configure pricing parameters
- Automatically assign agents
- Manually override agent assignments
- Track order and delivery status

### 👤 Customer Portal
- Register and log in securely
- Get dynamic shipping quotes
- Create delivery orders
- View order history
- Track delivery progress
- Reschedule failed deliveries

### 🛵 Delivery Agent Portal
- View assigned orders
- Update delivery status
- Mark orders as **Picked Up, In Transit, Delivered, or Failed**
- Update current delivery zone/location
- Manage delivery workload

### 💰 Dynamic Rate Engine
The pricing engine calculates shipping charges using:

```text
Package Dimensions
        ↓
Volumetric Weight
        ↓
Compare with Actual Weight
        ↓
Billable Weight
        ↓
Zone + Order Type Rate
        ↓
COD Surcharge (if applicable)
        ↓
Final Shipping Charge
```

### 🤖 Smart Auto-Assignment
Orders are automatically matched with suitable agents based on:

- Agent availability
- Current pickup zone
- Number of active orders
- Workload balancing

The system prioritizes an available agent in the pickup zone with the **least active workload**.

### 🔄 Failed Delivery & Rescheduling
Failed deliveries remain fully traceable through order tracking. Customers can reschedule failed orders, after which the order returns to the pending queue and can be reassigned to another available agent.

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      Customer       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   React Frontend    │
                    └──────────┬──────────┘
                               │ REST API
                    ┌──────────▼──────────┐
                    │ Node.js + Express   │
                    │   JWT + RBAC        │
                    └──────────┬──────────┘
                               │ Prisma ORM
                    ┌──────────▼──────────┐
                    │    MySQL Database   │
                    └─────────────────────┘
```

The application follows a **3-tier architecture**:

- 🎨 **Presentation Layer** — React SPA with responsive UI
- ⚙️ **Application Layer** — Node.js + Express REST API
- 🗄️ **Data Layer** — MySQL with Prisma ORM

More details are available in [`SYSTEM_DESIGN.md`](SYSTEM_DESIGN.md).

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| 🎨 Frontend | React, Vite, CSS |
| ⚙️ Backend | Node.js, Express.js |
| 🔐 Authentication | JWT, Role-Based Access Control |
| 🗄️ Database | MySQL |
| 🔗 ORM | Prisma |
| 🐳 Local Infrastructure | Docker Compose |
| 📡 Communication | REST APIs |

---

## 📁 Project Structure

```text
last-mile-delivery-tracker/
│
├── 📂 backend/
│   ├── server.js
│   ├── prisma/
│   ├── routes/
│   └── ...
│
├── 📂 frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── 📄 SYSTEM_DESIGN.md
├── 📄 docker-compose.yml
├── 📄 package.json
├── 📄 LastMile_Delivery_Tracker.pdf
└── 📄 README.md
```

---

## ⚡ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/mishtee-khanna/last-mile-delivery-tracker.git
cd last-mile-delivery-tracker
```

### 2️⃣ Start MySQL

Using Docker Compose:

```bash
docker-compose up -d
```

Or configure your own MySQL database in `backend/.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/lastmile"
```

### 3️⃣ Configure the Backend

```bash
cd backend
npm install
npx prisma db push
node seed.js
node server.js
```

The backend runs on **port 5000** by default.

### 4️⃣ Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

### 🚀 Run Both

From the project root, the included scripts can be used to start the frontend and backend:

```bash
npm install
npm run dev
```

---

## 🔑 Default Admin

The seed script creates an initial admin account for local development.

```text
Email:    admin@example.com
Password: admin123
```

⚠️ **For development/demo use only. Change credentials before deploying to production.**

---

## 🔌 API Overview

### 🔐 Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |

### 👤 Customer

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/customer/quote` | Generate shipping quote |
| POST | `/api/customer/orders` | Create order |
| GET | `/api/customer/orders` | View order history |
| POST | `/api/customer/orders/:id/reschedule` | Reschedule failed order |

### 🛵 Agent

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/agent/orders` | View assigned orders |
| PUT | `/api/agent/orders/:id/status` | Update delivery status |
| PUT | `/api/agent/location` | Update current zone |

### 👨‍💼 Admin

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/admin/rates` | Add rate card |
| POST | `/api/admin/zones` | Add delivery zone |
| GET | `/api/admin/orders` | View all orders |
| POST | `/api/admin/orders/:id/assign` | Assign agent |

---

## 🧮 Rate Calculation

The platform avoids hardcoded delivery pricing and uses configurable rate cards.

### Volumetric Weight

```text
Volumetric Weight = (Length × Width × Height) / Divisor
```

### Billable Weight

```text
Billable Weight = max(Actual Weight, Volumetric Weight)
```

### Final Charge

```text
Base Charge = Billable Weight × Rate Per KG

Final Charge = Base Charge + COD Surcharge
```

The rate is determined using the **pickup zone, drop zone, and order type (B2B/B2C)**.

---

## 🧠 Core System Logic

### Agent Assignment

```text
New Order
   ↓
Find Available Agents
   ↓
Match Pickup Zone
   ↓
Compare Active Orders
   ↓
Select Lowest Workload
   ↓
Assign Agent
```

If no suitable agent is available, the order remains **PENDING** for admin intervention.

### Failed Delivery

```text
Delivery Attempt
       ↓
     FAILED
       ↓
Tracking Record Saved
       ↓
Customer Notified
       ↓
Customer Reschedules
       ↓
Order → PENDING
       ↓
Agent Assignment Again
```

---

## 🔐 Security

- JWT-based authentication
- Role-based access control
- Protected API routes
- Server-side authorization
- Database-backed user and order management

---

## 📚 Documentation

- 📐 [System Design](SYSTEM_DESIGN.md)
- 📄 [Project Documentation](LastMile_Delivery_Tracker.pdf)

---

## 🌱 Future Improvements

- 📍 Real-time GPS tracking
- 🗺️ Google Maps/geocoding integration
- 🔔 Push notifications
- 📊 Advanced delivery analytics
- 🧭 Route optimization
- 📱 Mobile application for delivery agents
- ☁️ Cloud deployment and CI/CD
- 🧠 Predictive delivery-time estimation

---

## 📊 Project Status

🟢 **ACTIVE** — The platform is being developed and improved with additional logistics, tracking, and automation capabilities.

---

<div align="center">

### 🚚 Smarter Deliveries • Better Tracking • Efficient Logistics 🚚

<img src="https://capsule-render.vercel.app/api?type=waving&color=00BFFF&height=110&section=footer" width="100%" />

</div>
