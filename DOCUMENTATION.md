# 🍕 Flash Pizza - Complete Documentation

## Production-Ready Food Ordering PWA

A real-world, production-ready food ordering system built with React, TypeScript, and Tailwind CSS. Designed to be wrapped into Android & iOS apps via WebView.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [File Structure](#file-structure)
4. [Tech Stack](#tech-stack)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [User Guide - Customer](#user-guide---customer)
8. [User Guide - Admin](#user-guide---admin)
9. [API Reference](#api-reference)
10. [Database Schema](#database-schema)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Flash Pizza is a complete food ordering solution with:
- **Customer Panel**: Browse menu, add to cart, checkout, track orders
- **Admin Panel**: Manage orders, menu, coupons, banners, settings

### Access URLs
- **Customer Panel**: `https://your-domain.com/`
- **Admin Panel**: `https://your-domain.com/?admin`

### Default Admin Password
```
admin123
```

---

## ✨ Features

### Customer Features
| Feature | Description |
|---------|-------------|
| 🍕 Menu Browsing | Filter by category (Veg, Non-Veg, Combos, Drinks) |
| 🔍 Search & Filter | Sort by price, rating, name; filter by diet |
| 🛒 Smart Cart | Add/remove items, quantity control |
| 🎟️ Coupons | Apply discount codes at checkout |
| 📍 Location | Pin location on map for delivery |
| 💳 UPI Payment | QR code + UPI deep link |
| 💵 COD | Cash on delivery option |
| 📦 Order Tracking | Real-time order status updates |
| 📱 PWA Ready | Install on home screen |
| 🌙 Dark Mode | Light/dark theme toggle |
| 📞 Help & Support | Call/WhatsApp support |

### Admin Features
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Real-time order management |
| 🍕 Menu Management | Add, edit, delete, toggle items |
| 🎟️ Coupon Management | Create discount codes |
| 🖼️ Banner Management | Multiple promotional banners |
| ⚙️ Store Settings | Phone, UPI, delivery charges |
| 🔔 Order Alerts | Continuous alarm for new orders |
| 📱 Real-time Sync | Firebase integration |
| 🔒 Secure Access | Password protected |

---

## 📁 File Structure

```
flash-pizza/
├── index.html                    # Main HTML entry point
├── package.json                  # Dependencies & scripts
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── .env.example                 # Environment variables template
├── DOCUMENTATION.md             # This file
├── FIREBASE_SETUP_GUIDE.md      # Firebase setup instructions
├── FILE_STRUCTURE.txt           # Detailed file structure
│
├── public/                      # Static assets
│   └── favicon.ico
│
└── src/
    ├── main.tsx                 # React entry point
    ├── App.tsx                  # Main app component (Customer)
    ├── index.css                # Global styles + Tailwind
    │
    ├── admin/
    │   └── AdminApp.tsx         # Admin panel (Orders, Menu, Coupons, Banners, Settings)
    │
    ├── components/
    │   ├── CartContext.tsx      # Shopping cart state & logic
    │   ├── CategoryFilter.tsx   # Category tabs (All, Veg, Non-Veg, Combos, Drinks)
    │   ├── Checkout.tsx         # Checkout flow (customer info, payment, location)
    │   ├── FloatingCart.tsx     # Floating cart summary button
    │   ├── Header.tsx           # App header with profile/notifications
    │   ├── Icons.tsx            # All SVG icons (50+ icons)
    │   ├── LocationPicker.tsx   # Map for selecting delivery location
    │   ├── MenuItem.tsx         # Individual menu item card
    │   ├── NotificationCenter.tsx # Notification list view
    │   ├── OrderProgress.tsx    # Order status progress bar
    │   ├── OrderTracking.tsx    # Full order tracking page with map
    │   ├── ProfilePage.tsx      # Customer profile, orders, settings, help
    │   └── UPIPayment.tsx       # UPI payment with QR code
    │
    ├── context/
    │   ├── DataContext.tsx      # Global data state (Firebase/localStorage)
    │   ├── NotificationContext.tsx # Toast & notification management
    │   └── ThemeContext.tsx     # Light/dark theme management
    │
    ├── data/
    │   └── mockData.ts          # Initial data (menu items, store config)
    │
    ├── services/
    │   └── firebase.ts          # Firebase Realtime Database integration
    │
    └── types/
        └── index.ts             # TypeScript type definitions
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Styling |
| **Firebase** | Realtime database (optional) |
| **Leaflet** | Interactive maps |
| **Web Audio API** | Notification sounds |
| **localStorage** | Offline data storage |

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Steps

```bash
# 1. Clone/download the project
cd flash-pizza

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Customer: http://localhost:5173
# Admin: http://localhost:5173/?admin

# 5. Build for production
npm run build
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Firebase Configuration (Optional - for real-time sync)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

### Store Configuration (via Admin Panel)

| Setting | Description | Default |
|---------|-------------|---------|
| Store Name | Business name | Flash Pizza |
| Phone | Contact number | +91 98765 43210 |
| UPI ID | Payment UPI | princesagar7155@ptaxis |
| Delivery Radius | Max delivery distance | 5 km |
| Delivery Charge | Fee for orders < minimum | ₹35 |
| Min for Free Delivery | Order amount for free delivery | ₹300 |
| Store Open | Enable/disable ordering | true |

---

## 👤 User Guide - Customer

### 1. Browsing Menu
- Open the app
- Use category tabs: **All | Veg | Non-Veg | Combos | Drinks**
- Use filters: Sort by price/rating, filter by diet
- Tap item to add to cart

### 2. Managing Cart
- Tap floating cart button to view items
- Use +/- buttons to adjust quantity
- Tap "Checkout" to proceed

### 3. Checkout Process
1. Enter name & phone number
2. Apply coupon code (optional)
3. Pin delivery location on map
4. Select payment method (UPI/COD)
5. Confirm order

### 4. UPI Payment
- Scan QR code with any UPI app
- OR tap "Pay via UPI App" button
- Complete payment in UPI app
- Tap "I've Completed Payment"

### 5. Order Tracking
- After ordering, see real-time status
- View on map: Store → Your location
- Statuses: New → Preparing → Out for Delivery → Completed

### 6. Profile & History
- Tap profile icon (top right)
- View past orders
- Reorder previous orders
- Access settings & help

---

## 👨‍💼 User Guide - Admin

### Accessing Admin Panel
1. Go to `your-site.com/?admin`
2. Enter password: `admin123`

### Orders Tab
| Action | Description |
|--------|-------------|
| View New Orders | Orange badge shows count |
| Start Preparing | Move order to "Preparing" |
| Out for Delivery | Assign to delivery |
| Mark Completed | Finish order |
| Cancel Order | Cancel with refund |

**New Order Alarm**: Continuous ring until you accept/cancel

### Menu Tab
| Action | Description |
|--------|-------------|
| Add Item | + button, fill form |
| Edit Item | ✏️ pencil icon |
| Delete Item | 🗑️ trash icon |
| Toggle Availability | Switch on/off |

**Item Fields**:
- Name, Description, Price
- Image URL
- Category (Veg/Non-Veg/Combos/Beverages)
- Rating (1-5)
- Available toggle

### Coupons Tab
| Action | Description |
|--------|-------------|
| Add Coupon | + button, fill form |
| Edit Coupon | ✏️ pencil icon |
| Delete Coupon | 🗑️ trash icon |
| Toggle Active | Switch on/off |

**Coupon Fields**:
- Code (auto-uppercase)
- Discount Type (% or flat ₹)
- Discount Value
- Max Discount (for %)
- Min Order Amount
- Expiry Date

### Banners Tab
| Action | Description |
|--------|-------------|
| Add Banner | + button, fill form |
| Edit Banner | ✏️ pencil icon |
| Delete Banner | 🗑️ trash icon |
| Reorder | ↑↓ arrows |
| Toggle Active | Switch on/off |

**Banner Fields**:
- Image URL
- Title (offer text)
- Subtitle (optional)
- Order (display position)

### Settings Tab
| Setting | Description |
|---------|-------------|
| Store Name | Business name |
| Phone Number | For customer support |
| UPI ID | For payments |
| Store Location | Lat/Long for delivery radius |
| Delivery Radius | Max km for delivery |
| Min for Free Delivery | ₹ threshold |
| Delivery Charge | ₹ fee below threshold |
| Store Open | Enable/disable ordering |

---

## 📊 Database Schema

### MenuItem
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'veg' | 'non-veg' | 'combos' | 'beverages';
  available: boolean;
  rating?: number;
}
```

### Order
```typescript
{
  id: string;
  items: CartItem[];
  total: number;
  status: 'new' | 'preparing' | 'out-for-delivery' | 'completed' | 'cancelled';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLocation?: { lat: number; lng: number };
  paymentMethod: 'upi' | 'cod';
  paymentStatus: 'pending' | 'completed';
  couponCode?: string;
  discount: number;
  deliveryCharge: number;
  distance?: number;
  createdAt: Date;
}
```

### Coupon
```typescript
{
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount: number;
  expiresAt: Date;
  isActive: boolean;
}
```

### Banner
```typescript
{
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  isActive: boolean;
  order: number;
}
```

### StoreConfig
```typescript
{
  name: string;
  phone: string;
  upiId: string;
  location: { lat: number; lng: number };
  deliveryRadius: number;
  deliveryCharge: number;
  minOrderForFreeDelivery: number;
  isOpen: boolean;
  banners: Banner[];
  offerText?: string;
}
```

---

## 🚀 Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Option 2: Netlify
```bash
# Build
npm run build

# Drag & drop 'dist' folder to Netlify
# OR connect GitHub repo
```

### Option 3: Firebase Hosting
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Initialize
firebase init hosting

# Deploy
firebase deploy
```

### Option 4: Self-Hosted
```bash
# Build
npm run build

# Upload 'dist' folder to your server
# Configure nginx/apache to serve index.html
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Orders not syncing between devices**
- Solution: Set up Firebase (see FIREBASE_SETUP_GUIDE.md)
- Without Firebase, data is stored locally only

**2. UPI payment not working**
- Check UPI ID format in Admin Settings
- Format: `username@bankname`

**3. Location not working**
- Browser must allow location access
- Use HTTPS in production

**4. Dark mode not working**
- Clear localStorage: `localStorage.clear()`
- Refresh page

**5. Admin panel not loading**
- Use correct URL: `?admin` at the end
- Clear cache and refresh

**6. New order alarm not playing**
- Browser may block audio
- Interact with page first (click anywhere)

### Reset All Data
```javascript
// In browser console
localStorage.clear();
location.reload();
```

---

## 📱 Mobile App Deployment

### Android (WebView)
1. Create Android Studio project
2. Add WebView component
3. Load your deployed URL
4. Build APK/AAB
5. Publish to Play Store

### iOS (WebView)
1. Create Xcode project
2. Add WKWebView
3. Load your deployed URL
4. Build IPA
5. Publish to App Store

### PWA Installation
- Open site in Chrome/Safari
- Tap "Add to Home Screen"
- App icon appears on device

---

## 📞 Support

For issues or feature requests:
- Email: your-email@example.com
- WhatsApp: +91 98765 43210

---

## 📄 License

MIT License - Free for personal and commercial use.

---

**Built with ❤️ for small food businesses**
