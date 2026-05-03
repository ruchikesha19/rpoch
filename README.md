# 🚀 FeedNet – Real-Time Food Redistribution Platform

> Reducing food waste by connecting restaurants and volunteers instantly.

---

## 🌟 Overview

FeedNet is a **real-time food redistribution system** that enables restaurants to share surplus food with nearby volunteers instantly.

Unlike traditional systems, FeedNet uses **live synchronization (Socket.IO)** to ensure food is claimed and delivered quickly — minimizing waste and maximizing impact.

---

## ⚡ Key Features

### 🔐 Authentication

* Role-based login (Volunteer / Restaurant)
* Protected routes
* Persistent sessions using localStorage

### 🍽️ Restaurant Dashboard

* Add surplus food listings
* Manage listings (view, complete, delete)
* Live statistics (meals donated, active listings)
* Impact tracking (CO₂ savings)

### 🚚 Volunteer Dashboard

* View available food pickups
* Accept deliveries in real-time
* Track deliveries
* Earn reward points based on distance

### 🔄 Pickup Lifecycle

```
Create → Broadcast → Accept → Complete → Delete
```

### ⚡ Real-Time System

* Instant updates via Socket.IO
* No page refresh required
* Global synchronization across users

### 💬 Community Chat

* Real-time communication between volunteers & restaurants

### 🎯 Reward System

* Points based on delivery distance
* Dynamic contribution tracking

---

## 🏗️ System Architecture

```
Frontend (React + Tailwind)
        ↓
Backend (Node.js + Express)
        ↓
Database (MongoDB)
        ↓
Real-Time Layer (Socket.IO)
```

---

## 🔁 Working Flow

1. Restaurant adds food listing
2. Listing is broadcast instantly
3. Volunteers receive it live
4. Volunteer accepts pickup
5. Listing updates globally
6. Restaurant marks completion
7. Stats & rewards updated

---

## ⚙️ Tech Stack

| Layer     | Technology                 |
| --------- | -------------------------- |
| Frontend  | React.js, Tailwind CSS     |
| Backend   | Node.js, Express.js        |
| Database  | MongoDB, Mongoose          |
| Real-Time | Socket.IO                  |
| State     | Context API                |
| Auth      | LocalStorage (JWT planned) |

---

## 📡 Socket Events

| Event              | Description           |
| ------------------ | --------------------- |
| `new_pickup`       | Broadcast new listing |
| `pickup_accepted`  | Sync acceptance       |
| `pickup_completed` | Update completion     |
| `pickup_deleted`   | Remove listing        |

---

## 📂 Project Structure

```
react/
├── src/
│   ├── pages/
│   │   ├── Volunteers.js
│   │   ├── Restaurants.js
│   │   ├── Community.js
│   │   ├── Login.js
│   │   └── Register.js
│   ├── components/
│   ├── contexts/
│   ├── services/
│   │   └── api.js
│   └── App.js
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Pickup.js
│   ├── server.js
│   └── .env
```

---

## ▶️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/feednet.git
cd feednet
```

### 2. Install dependencies

#### Frontend

```bash
cd react
npm install
npm start
```

#### Backend

```bash
cd backend
npm install
npm run dev
```

---

### 3. Environment Variables

Create `.env` in backend:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

---

## 🧪 Demo Flow

1. Login as **Restaurant**
2. Add a food listing
3. Open another tab as **Volunteer**
4. See listing instantly
5. Accept pickup
6. Watch real-time updates across dashboards

---

## 🚧 Challenges Solved

* Real-time synchronization across users
* Preventing duplicate pickup acceptance
* Fixing dropdown UI glitches (z-index, overflow)
* Eliminating stale data using socket listeners
* Memory leak prevention (socket cleanup)

---

## 🚀 Future Improvements

* JWT Authentication
* Password hashing (bcrypt)
* Mobile app version
* AI-based food matching
* Push notifications

---

## 📊 Project Status

```
✔ Full-stack system complete
✔ Real-time engine working
✔ Stable and demo-ready
```

---

## 👨‍💻 Contributors

**Ruchikesha S**

**M Sakthi Rishikesh**

**Mannaswini**

**Tara**


Computer Science Engineering
Reva University

---

## 🏁 Final Note

FeedNet is built to demonstrate how **real-time technology can solve real-world problems like food waste efficiently and effectively.**

---

