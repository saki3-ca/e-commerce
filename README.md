# 🌸 Masfeeh - Accessorize Your World
### Premium E-Commerce Platform

A boutique e-commerce platform built specifically for **Masfeeh** based on their Facebook brand identity (`@Masfeeh`), featuring real product collections, automated email notifications to the store owner and customers, real-time order tracking, and an intuitive owner admin dashboard for adding new items.

---

## ✨ Key Features Implemented

### 1. 🛍️ Customer Storefront & Luxury Brand Aesthetic
- **Brand Identity**: Matches Masfeeh's soft champagne, rose gold, and royal charcoal color palette with typography, crown logo, and Facebook cover artwork.
- **Product Catalog**:
  - **Bags**: Signature FIOM monogram and floral clover cross body bags with **dual belts** (long shoulder strap + chic short hand belt).
  - **Hair Accessories**: Handcrafted crystal and pearl hair clips.
  - **Fake Nails**: Salon-grade french ombre and gel press-on nails.
  - **Jewelry & Rings**: 18K gold-plated dainty stacking rings.
  - **Bangles & More**: Royal velvet bangles and bridal sets.
- **Interactive Shopping Bag**:
  - Quantity controls, instant subtotal calculation, coupon discounts (`WELCOME10` or `MASFEEH10` for 10% off), and a dynamic Free Shipping progress tracker (orders over ৳2,500).
- **Checkout Flow**:
  - Customer contact details, delivery address, and delivery area selection (Inside Dhaka ৳70, Outside Dhaka ৳130).
  - Payment options: **Cash on Delivery (COD)**, **bKash / Nagad Mobile Banking** (with instructions & TrxID verification), and **Card Payment**.

---

### 2. 📧 Automated Email Notifications
- **Every Order Alerts the Owner**:
  - As soon as a customer places an order, an HTML email is dispatched to the store owner (`maishamonsura@gmail.com`).
  - Includes complete customer details (phone, address, delivery notes), itemized product table, pricing breakdown, and a link to review the order.
- **Every Accepted Order Notifies the Customer**:
  - When the owner reviews and accepts an order in the dashboard, the system immediately generates and sends an **Order Accepted Notification** to the customer's email.
  - Provides estimated delivery timeline (24-48 hours inside Dhaka), courier tracking reference, and direct customer care contacts.
- **In-App Email Activity & HTML Preview**:
  - An outbox and audit log in the Admin dashboard lets the owner inspect the rendered HTML layout of every sent email.
  - Supports live SMTP configuration (e.g. Gmail App Passwords) and gracefully falls back to simulated email delivery out-of-the-box.

---

### 3. 🚚 Customer Order Tracking
- Dedicated **Track Order** interface accessible from anywhere on the site.
- Searchable by **Order ID** (e.g. `MSF-10021`) or **Customer Phone Number** (e.g. `01712-345678`).
- Interactive 5-stage visual progress timeline:
  1. *Order Placed*
  2. *Order Accepted by Masfeeh*
  3. *Packaging & Quality Inspection*
  4. *Out for Delivery (Courier Assigned)*
  5. *Delivered to Doorstep*

---

### 4. 👑 Owner Admin Dashboard ("Owner can add new item easily")
- Accessible via the **"Owner Admin"** button in the header.
- **Add New Item Easily**:
  - Upload image files directly from computer (drag-and-drop / file browser) or specify an image URL.
  - Set product name, category, price, discount/original price, stock quantity, badge tag, and bullet features.
  - Live preview before publishing to the shop catalog.
- **Order Management**:
  - Filter orders by status (*Pending, Accepted, Packaging, Out for Delivery, Delivered*).
  - Single-click **"Accept Order"** action that updates order state and sends the customer notification email.
  - Customer quick-contact links (Phone call and direct WhatsApp link).
- **Inventory Management**:
  - View, update stock, edit pricing, or delete items.
- **Shop & SMTP Settings**:
  - Configure Owner Email, WhatsApp hotline, address, and live SMTP mail credentials with a built-in "Send Test Email" tool.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Run the Full-Stack Application
To start the production server serving both the backend API and the frontend application:
```bash
npm start
```
The application will be live at:
👉 **http://localhost:5000**

### 2. Development Mode (with Vite Hot-Reload)
To run backend and frontend concurrently in development mode:
```bash
# Terminal 1: Start Backend Server
node server/index.js

# Terminal 2: Start Vite Client
npm run dev --prefix client
```
Frontend development server:
👉 **http://localhost:5173**

---

## ⚙️ SMTP Setup for Live Emails (Optional)
By default, all emails are safely generated, formatted in luxury HTML, and logged in the **Admin > Email Activity** tab without requiring any email service credentials.

To send real live emails to your inbox:
1. Open the **Owner Admin** portal.
2. Navigate to the **Shop & SMTP Settings** tab.
3. Enter your SMTP details (for Gmail: Host `smtp.gmail.com`, Port `587`, User `yourname@gmail.com`, and a 16-character [Google App Password](https://myaccount.google.com/apppasswords)).
4. Click **"Send Test"** to verify connection.
