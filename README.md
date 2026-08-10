# Food Delivery System — Complete Project Requirements
### (MERN Stack: MongoDB, Express, React, Node.js + TailwindCSS)

This document is your single source of truth. Keep it open while you build, day by day. It covers **what** to build, not **how** to code it yet — we'll do that incrementally in future sessions.

---

## 1. Project Overview

A food delivery platform similar to Zomato/Swiggy where:
- Customers browse restaurants, order food, pay online, and track delivery live.
- Restaurant owners manage their menu, accept/reject orders, and mark order status.
- Delivery partners accept delivery requests, update their location, and mark deliveries complete.
- Admin oversees the whole platform — restaurants, users, delivery partners, disputes, analytics.

**Goal:** Build this incrementally so you actually understand every layer (auth, schema design, real-time updates, payments, state management) instead of copy-pasting a tutorial.

---

## 2. User Roles (Actors)

| Role | Description |
|---|---|
| **Customer** | Browses restaurants, orders food, pays, tracks order, rates/reviews |
| **Restaurant Owner (Vendor)** | Manages restaurant profile, menu, order acceptance, availability |
| **Delivery Partner (Rider)** | Accepts delivery jobs, updates live location, completes delivery |
| **Admin (Super Admin)** | Manages users, restaurants, riders, commissions, disputes, analytics |

All 4 roles will use the same backend but different frontend views/dashboards (or separate apps later — but for learning purposes, one React app with role-based routing is enough to start).

---

## 3. Feature List by Module

### 3.1 Authentication & Authorization
- Signup/Login via email+password (JWT-based)
- Role selection at signup (customer / vendor / rider) — admin created manually/seeded
- Password hashing (bcrypt)
- JWT access token + refresh token flow
- Protected routes (middleware-based role guards)
- Forgot/reset password (email link, later phase)
- (Optional later) Google OAuth login

### 3.2 Customer Features
- Browse restaurants (list + search + filters: cuisine, rating, price, veg/non-veg, delivery time)
- Restaurant detail page with full menu (categorized: starters, main course, desserts, etc.)
- Add to cart, update quantity, remove item
- Cart persists per restaurant (can't mix items from 2 restaurants — real Zomato/Swiggy rule)
- Apply coupon/promo code
- Address management (multiple saved addresses, select delivery address)
- Checkout → Order summary → Payment
- Order tracking page (status stepper: Placed → Accepted → Preparing → Out for delivery → Delivered)
- Live delivery tracking on map (rider location updates)
- Order history
- Cancel order (only allowed before "Preparing" stage, with reason)
- Rate & review restaurant + delivery experience after order
- Favorite/wishlist restaurants
- Notifications (order status changes)
- Profile management

### 3.3 Restaurant/Vendor Features
- Vendor registration (with approval flow — admin must approve new restaurants)
- Restaurant profile setup (name, address, cuisine type, opening hours, images)
- Menu management (CRUD: add/edit/delete dish, categories, price, image, veg/non-veg tag, availability toggle)
- Incoming order dashboard (real-time new order alert)
- Accept/Reject order (with reason if rejected)
- Update order status (Preparing → Ready for pickup)
- View order history & earnings
- Toggle restaurant "open/closed" status
- View ratings & reviews received
- Basic analytics (orders today, revenue, top-selling items)

### 3.4 Delivery Partner Features
- Rider registration (with document/vehicle info — approval flow by admin)
- Toggle online/offline availability
- Receive delivery request (accept/reject within timer, like real apps)
- View pickup restaurant location + drop customer location
- Update live location (sent to backend periodically via socket)
- Mark "Picked up" → "Delivered"
- View earnings/history
- Rating from customers

### 3.5 Admin Features
- Dashboard with platform-wide stats (total orders, revenue, active users, active restaurants)
- Approve/reject new restaurant/rider applications
- Manage (block/unblock) users, restaurants, riders
- View all orders, filter by status/date/restaurant
- Manage commission % per restaurant
- Manage coupons/promo codes (create, expire, usage limits)
- Handle disputes/refund requests
- View reviews (moderate/remove abusive ones)

### 3.6 Cross-Cutting Features (all roles)
- Real-time updates via **Socket.IO** (order status, rider location, new order alerts)
- Notifications (in-app; email optional later; push notifications = advanced/optional)
- Payment integration (Razorpay/Stripe test mode — COD also supported)
- Search with debouncing
- Pagination / infinite scroll for restaurant & order lists
- Image upload (Cloudinary or local/multer, for restaurant/menu/profile images)
- Input validation (frontend + backend)
- Error handling & logging
- Responsive design (mobile-first, since real food delivery usage is mostly mobile)

---

## 4. Core System Flows

### 4.1 Order Lifecycle (the heart of the system)
```
Customer places order
   → Order status: "Placed"
   → Payment confirmed (or COD selected)
   → Restaurant receives real-time notification
   → Restaurant Accepts → status: "Accepted"
        (or Rejects → status: "Rejected", refund triggered if paid online)
   → Restaurant marks "Preparing"
   → Restaurant marks "Ready for Pickup"
   → System assigns/notifies nearby available riders
   → Rider Accepts delivery → status: "Out for Delivery"
   → Rider updates live location (socket)
   → Rider marks "Delivered"
   → Customer can rate restaurant + rider
```

### 4.2 Payment Flow
```
Checkout → choose payment method (Online / COD)
   → If Online: create payment order (Razorpay/Stripe) → verify payment signature on backend
   → On success: create Order in DB with paymentStatus = "paid"
   → On failure: show retry, don't create order (or mark "payment_failed")
   → If COD: create Order directly with paymentStatus = "pending"
```

### 4.3 Rider Assignment Flow (simplified for learning — no complex geo-algorithm needed initially)
```
Order marked "Ready for Pickup"
   → Backend queries riders where isOnline = true and isAvailable = true
   → (Phase 1: simplest — notify all nearby riders, first to accept gets it)
   → (Phase 2, advanced: assign nearest rider using geo queries)
```

### 4.4 Restaurant Approval Flow
```
Vendor signs up → submits restaurant details → status = "pending"
   → Admin reviews → Approves (status="approved", visible to customers)
                   → or Rejects (status="rejected", vendor notified with reason)
```

---

## 5. Database Schema (MongoDB Collections)

### User
```
{
  name, email, password (hashed), phone,
  role: "customer" | "vendor" | "rider" | "admin",
  addresses: [ { label, street, city, pincode, lat, lng, isDefault } ],
  isBlocked: Boolean,
  createdAt
}
```

### Restaurant
```
{
  owner: ObjectId (ref User),
  name, description, cuisineType: [String],
  address: { street, city, pincode, lat, lng },
  images: [String],
  openingHours: { open, close },
  isOpen: Boolean,
  status: "pending" | "approved" | "rejected" | "blocked",
  rating: { avg: Number, count: Number },
  commissionPercent: Number,
  createdAt
}
```

### MenuItem
```
{
  restaurant: ObjectId (ref Restaurant),
  name, description, price,
  category: String,  // e.g. "Starters", "Main Course"
  isVeg: Boolean,
  image: String,
  isAvailable: Boolean
}
```

### Cart (or handle client-side + sync on checkout — your design choice, discuss trade-offs when we build it)
```
{
  user: ObjectId,
  restaurant: ObjectId,
  items: [ { menuItem: ObjectId, quantity, priceAtAdd } ]
}
```

### Order
```
{
  customer: ObjectId,
  restaurant: ObjectId,
  rider: ObjectId (nullable until assigned),
  items: [ { menuItem, name, price, quantity } ],
  deliveryAddress: { street, city, pincode, lat, lng },
  itemsTotal, deliveryFee, discount, taxes, grandTotal,
  couponApplied: String,
  paymentMethod: "online" | "cod",
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
  orderStatus: "placed" | "accepted" | "rejected" | "preparing" |
               "ready" | "out_for_delivery" | "delivered" | "cancelled",
  statusHistory: [ { status, timestamp } ],
  rejectionReason: String,
  createdAt
}
```

### Rider
```
{
  user: ObjectId (ref User),
  vehicleType, vehicleNumber,
  documents: [String], // license, etc.
  isOnline: Boolean,
  isAvailable: Boolean,
  currentLocation: { lat, lng },
  status: "pending" | "approved" | "rejected" | "blocked",
  rating: { avg, count }
}
```

### Review
```
{
  order: ObjectId,
  customer: ObjectId,
  restaurant: ObjectId,
  rider: ObjectId,
  restaurantRating: Number, restaurantComment: String,
  riderRating: Number, riderComment: String,
  createdAt
}
```

### Coupon
```
{
  code, discountType: "flat" | "percent", discountValue,
  minOrderValue, maxDiscount, expiryDate,
  usageLimit, usedCount, isActive
}
```

---

## 6. API Endpoints (High-Level — grouped by resource)

```
/api/auth
  POST /signup
  POST /login
  POST /refresh-token
  POST /logout

/api/users
  GET  /me
  PUT  /me
  POST /me/addresses
  PUT  /me/addresses/:id
  DELETE /me/addresses/:id

/api/restaurants
  GET    /            (list + filters + search + pagination)
  GET    /:id
  POST   /            (vendor creates - status:pending)
  PUT    /:id
  PATCH  /:id/toggle-open
  GET    /:id/menu

/api/menu-items
  POST   /            (vendor)
  PUT    /:id
  DELETE /:id
  PATCH  /:id/toggle-availability

/api/cart
  GET    /
  POST   /add
  PUT    /update
  DELETE /remove/:itemId
  DELETE /clear

/api/orders
  POST   /                      (checkout/place order)
  GET    /my-orders             (customer)
  GET    /restaurant/:id        (vendor)
  GET    /:id
  PATCH  /:id/status            (vendor/rider updates status)
  PATCH  /:id/cancel            (customer)

/api/payments
  POST   /create-order          (Razorpay/Stripe order creation)
  POST   /verify                (verify signature, confirm payment)

/api/riders
  PATCH  /availability
  PATCH  /location
  GET    /available-orders
  PATCH  /:orderId/accept

/api/reviews
  POST   /
  GET    /restaurant/:id

/api/coupons
  GET    /validate/:code
  POST   / (admin)
  PATCH  /:id (admin)

/api/admin
  GET    /dashboard-stats
  GET    /restaurants/pending
  PATCH  /restaurants/:id/approve
  PATCH  /restaurants/:id/reject
  GET    /riders/pending
  PATCH  /riders/:id/approve
  PATCH  /users/:id/block
```

---

## 7. Tech Stack & Architecture

**Frontend:** React (Vite), TailwindCSS, React Router, Axios, React Query or Redux Toolkit (state mgmt — we'll decide when we get there), Socket.IO client, React Hook Form + Zod/Yup (validation)

**Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT, bcrypt, Socket.IO server, Multer/Cloudinary (image upload), express-validator (validation), Razorpay/Stripe SDK

**Architecture:**
```
Client (React)  <---REST API--->  Server (Express)  <--->  MongoDB
       ^                                 ^
       |________ Socket.IO (real-time) __|
```

Backend follows MVC-ish structure:
```
/models
/controllers
/routes
/middlewares   (auth, role-check, error handler)
/utils
/config
server.js
```

---

## 8. Non-Functional Requirements

- **Security:** JWT expiry + refresh tokens, password hashing, input sanitization, rate limiting on auth routes, role-based access control on every protected endpoint
- **Validation:** Both client-side (instant feedback) and server-side (never trust client)
- **Error Handling:** Centralized Express error-handling middleware, consistent API response shape (`{ success, message, data }`)
- **Scalability considerations (learning-level, not production-scale):** pagination everywhere, indexes on frequently-queried fields (restaurant location, order status)
- **Real-time:** Socket.IO rooms per restaurant/order/rider for targeted event emission
- **Responsiveness:** Mobile-first Tailwind layouts
- **Environment config:** `.env` for secrets, never hardcoded keys

---

## 9. Suggested Build Roadmap (Phase-by-Phase, so you can go day by day)

This is the order I'd recommend building in — each phase is independently testable, so you actually see progress and understand each piece before moving on.

**Phase 1 — Foundation**
- Project setup (backend + frontend scaffolding, folder structure, DB connection)
- User model + Auth (signup/login/JWT) + protected route middleware

**Phase 2 — Restaurant & Menu (Vendor side)**
- Restaurant CRUD (vendor creates, admin approves)
- MenuItem CRUD
- Public restaurant listing + detail page (customer side, read-only for now)

**Phase 3 — Cart & Checkout (Customer side)**
- Cart logic (add/update/remove)
- Address management
- Order creation (COD only first — skip payment gateway initially to reduce complexity)

**Phase 4 — Order Lifecycle**
- Order status flow (vendor accept/reject/prepare)
- Order history for customer & vendor
- Basic notifications (poll-based first, before we add sockets)

**Phase 5 — Real-Time Layer**
- Integrate Socket.IO: live order status push, new-order alert to vendor

**Phase 6 — Delivery Partner Module**
- Rider registration/approval
- Rider accepts delivery, updates status
- Live location updates via socket

**Phase 7 — Payments**
- Integrate Razorpay/Stripe test mode
- Payment verification, order creation tied to payment success

**Phase 8 — Admin Panel**
- Approvals (restaurant/rider), user management, dashboard stats

**Phase 9 — Polish & Extras**
- Coupons, reviews/ratings, search & filters, favorites, map-based live tracking UI

We do NOT need to build in this exact order if you want to prioritize differently — but this order minimizes rework because later phases depend on earlier ones being stable.

---

## 10. What We'll Decide Together As We Go (open design questions)
- State management choice: Context API vs Redux Toolkit vs React Query (or a mix)
- Cart storage: DB-backed cart vs local-only cart synced at checkout
- Rider assignment: broadcast-to-all-nearby vs nearest-rider-first (geo query)
- Image storage: local/multer (simpler, good for learning) vs Cloudinary (more realistic)
- Notification delivery: in-app only vs also email vs push (web push is a rabbit hole — decide later)

---

**Next step:** tell me which Phase 1 piece you want to start with — usually that's project setup + the User model + auth — and we'll build just that, properly, with explanations of every decision.