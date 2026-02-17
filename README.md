# 🍕 Flash Pizza - Food Ordering PWA

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4.0-blue?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Vite-7.0-purple?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Firebase-Ready-orange?logo=firebase" alt="Firebase">
  <img src="https://img.shields.io/badge/PWA-Ready-green" alt="PWA">
</p>

<p align="center">
  <b>A production-ready, real-time food ordering system built for small restaurants and pizza shops.</b>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## 📸 Screenshots

### Customer App
| Home | Menu | Cart | Checkout |
|------|------|------|----------|
| Banner carousel, categories | List view with filters | Floating cart summary | Location, payment |

### Admin Panel
| Orders | Menu | Coupons | Banners |
|--------|------|---------|---------|
| Real-time orders | CRUD operations | Discount codes | Promotional banners |

---

## ✨ Features

### Customer Panel
- 🍕 **Browse Menu** - Filter by category, rating, price, veg/non-veg
- 🛒 **Quick Cart** - Add items with one tap, floating cart summary
- 📍 **Location Picker** - Interactive map with 5km delivery radius validation
- 💳 **UPI Payment** - QR code + deep link to UPI apps
- 📦 **Order Tracking** - Real-time status updates with progress bar
- 🌙 **Dark Mode** - System preference + manual toggle
- 🔔 **Notifications** - Order status updates

### Admin Panel
- 📋 **Live Orders** - Real-time with alarm sound for new orders
- 🍕 **Menu Management** - Add, edit, delete items with images
- 🎟️ **Coupon System** - Percentage/flat discounts with expiry
- 🖼️ **Banner Manager** - Multiple promotional banners
- ⚙️ **Settings** - Store info, UPI ID, delivery charges
- 🔔 **Sound Alerts** - Continuous alarm until order is accepted

### Technical
- ⚡ **Fast** - Vite build, optimized for low-end devices
- 📱 **PWA Ready** - Install on home screen
- 🔥 **Firebase Ready** - Real-time database (optional)
- 💾 **Offline Support** - localStorage fallback
- 🎨 **Responsive** - Mobile-first design

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/flash-pizza.git
cd flash-pizza

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables (Optional - for Firebase)

Create a `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DOCUMENTATION.md](./DOCUMENTATION.md) | Complete user & developer guide |
| [FUNCTIONS.md](./FUNCTIONS.md) | All functions explained |
| [COMPONENTS.md](./COMPONENTS.md) | All components documented |
| [API.md](./API.md) | Context API reference |
| [FILE_STRUCTURE.txt](./FILE_STRUCTURE.txt) | Project structure |
| [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) | Firebase configuration |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |

---

## 🏗️ Project Structure

```
flash-pizza/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Customer app (900+ lines)
│   ├── index.css             # Tailwind + custom styles
│   │
│   ├── admin/
│   │   └── AdminApp.tsx      # Admin panel (1200+ lines)
│   │
│   ├── components/           # UI Components
│   │   ├── CartContext.tsx   # Cart state management
│   │   ├── Checkout.tsx      # Checkout flow
│   │   ├── LocationPicker.tsx# Map integration
│   │   ├── MenuItem.tsx      # Food item card
│   │   ├── OrderProgress.tsx # Status timeline
│   │   ├── OrderTracking.tsx # Full tracking page
│   │   ├── ProfilePage.tsx   # User profile
│   │   ├── UPIPayment.tsx    # UPI QR & deep links
│   │   └── ...
│   │
│   ├── context/              # React Context
│   │   ├── DataContext.tsx   # Central data store
│   │   ├── NotificationContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── data/
│   │   └── mockData.ts       # Initial/sample data
│   │
│   ├── services/
│   │   └── firebase.ts       # Firebase integration
│   │
│   └── types/
│       └── index.ts          # TypeScript types
│
├── DOCUMENTATION.md
├── FUNCTIONS.md
├── COMPONENTS.md
├── API.md
└── ...
```

---

## 🔧 Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, TypeScript 5.7 |
| Styling | Tailwind CSS 4.0 |
| Build | Vite 7.0 |
| Maps | Leaflet (OpenStreetMap) |
| Database | Firebase Realtime DB / localStorage |
| Icons | Custom SVG components |

---

## 🚀 Deployment

### Option 1: Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Option 2: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option 3: Netlify

```bash
npm run build
# Drag & drop dist/ folder to Netlify
```

---

## 📱 Mobile App

The PWA can be wrapped for app stores:

### Android
```bash
# Using Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap open android
```

### iOS
```bash
npx cap add ios
npx cap open ios
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Firebase](https://firebase.google.com/)
- [Leaflet](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)

---

<p align="center">
  Made by SAGAR with ❤️ for small restaurants and pizza shops
</p>
