# 🧩 Components Reference - Flash Pizza

This document explains all React components in the Flash Pizza codebase.

---

## Table of Contents

1. [Core App Components](#core-app-components)
2. [Customer Components](#customer-components)
3. [Admin Components](#admin-components)
4. [Context Providers](#context-providers)
5. [Shared Components](#shared-components)

---

## Core App Components

### `App.tsx` - Customer Application

**Location:** `src/App.tsx`

The main customer-facing application component.

**Responsibilities:**
- Route management (menu, checkout, tracking, profile)
- Category filtering
- Search and sort functionality
- Banner carousel
- Store closed status display

**Props:** None (root component)

**State:**
```typescript
const [view, setView] = useState<AppView>('menu');
const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
const [searchQuery, setSearchQuery] = useState('');
const [sortBy, setSortBy] = useState<SortOption>('default');
const [ratingFilter, setRatingFilter] = useState<number>(0);
const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
```

**Key Features:**
- Banner auto-rotation (4 seconds)
- Filter bar (sort, rating, diet)
- Active order tracking banner
- Store closed overlay

**Child Components:**
- `Header`
- `CategoryFilter`
- `MenuItem` (multiple)
- `FloatingCart`
- `Checkout`
- `OrderTracking`
- `ProfilePage`
- `NotificationCenter`

---

### `AdminApp.tsx` - Admin Panel

**Location:** `src/admin/AdminApp.tsx`

The admin dashboard for managing the store.

**Responsibilities:**
- Order management with real-time updates
- Menu CRUD operations
- Coupon management
- Banner management
- Store settings
- Authentication

**State:**
```typescript
const [activeTab, setActiveTab] = useState<AdminTab>('orders');
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [password, setPassword] = useState('');
```

**Sub-Components (Internal):**
- `LoginScreen` - Password authentication
- `OrdersTab` - Live order management
- `MenuTab` - Menu item CRUD
- `CouponsTab` - Coupon management
- `BannersTab` - Banner management
- `SettingsTab` - Store configuration

**Features:**
- Continuous alarm for new orders
- Real-time order updates
- Modal forms for add/edit
- Delete confirmations

---

## Customer Components

### `Header.tsx`

**Location:** `src/components/Header.tsx`

Top navigation bar with logo and actions.

**Props:**
```typescript
interface HeaderProps {
  onProfileClick: () => void;
  onNotificationsClick: () => void;
  unreadCount: number;
}
```

**Features:**
- Flash Pizza logo
- Notification bell with badge
- Profile icon

---

### `CategoryFilter.tsx`

**Location:** `src/components/CategoryFilter.tsx`

Horizontal scrollable category tabs.

**Props:**
```typescript
interface CategoryFilterProps {
  selected: Category | 'all';
  onSelect: (category: Category | 'all') => void;
}
```

**Categories:**
1. All (default)
2. Veg (green icon)
3. Non-Veg (red icon)
4. Combos (purple icon)
5. Drinks (blue icon)

**Features:**
- Horizontal scroll on mobile
- Active state highlighting
- Smooth transitions

---

### `MenuItem.tsx`

**Location:** `src/components/MenuItem.tsx`

Individual food item card in list view.

**Props:**
```typescript
interface MenuItemProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}
```

**Features:**
- Item image (112×112px)
- Name, description, price
- Veg/Non-veg badge
- Star rating
- Add/Remove buttons
- Quantity display

**Layout:**
```
┌─────────────────────────────────────┐
│ ┌──────┐  Name                      │
│ │      │  Description               │
│ │ IMG  │  ★ Rating                  │
│ │      │  ₹Price          [- N +]   │
│ └──────┘                            │
└─────────────────────────────────────┘
```

---

### `FloatingCart.tsx`

**Location:** `src/components/FloatingCart.tsx`

Bottom floating cart summary bar.

**Props:**
```typescript
interface FloatingCartProps {
  itemCount: number;
  total: number;
  onCheckout: () => void;
}
```

**Features:**
- Item count badge
- Total amount display
- Checkout button
- Slide-up animation

**Visibility:** Only shown when `itemCount > 0`

---

### `Checkout.tsx`

**Location:** `src/components/Checkout.tsx`

Full checkout flow component.

**Props:**
```typescript
interface CheckoutProps {
  onBack: () => void;
  onOrderPlaced: (order: Order) => void;
}
```

**Sections:**
1. **Cart Items** - Edit quantities
2. **Coupon Input** - Apply discount code
3. **Customer Info** - Name, phone, address
4. **Location Picker** - Map integration
5. **Payment Method** - UPI or COD
6. **Bill Summary** - Itemized breakdown
7. **Place Order Button**

**State:**
```typescript
const [customerName, setCustomerName] = useState('');
const [customerPhone, setCustomerPhone] = useState('');
const [customerAddress, setCustomerAddress] = useState('');
const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('cod');
const [location, setLocation] = useState<Location | null>(null);
const [showLocationPicker, setShowLocationPicker] = useState(false);
const [showUPIPayment, setShowUPIPayment] = useState(false);
const [couponCode, setCouponCode] = useState('');
```

---

### `LocationPicker.tsx`

**Location:** `src/components/LocationPicker.tsx`

Interactive map for selecting delivery location.

**Props:**
```typescript
interface LocationPickerProps {
  onLocationSelect: (location: Location, distance: number) => void;
  onClose: () => void;
  storeLocation: Location;
  deliveryRadius: number;
}
```

**Features:**
- Leaflet/OpenStreetMap integration
- Store marker (orange)
- User marker (blue, draggable)
- Delivery radius circle
- Distance calculation
- "Use My Location" button
- Deliverability check

**Map Elements:**
```
┌──────────────────────────────────────┐
│  [Use My Location]                   │
│                                      │
│       🔴 Delivery Radius Circle      │
│                                      │
│          🍕 Store                    │
│                                      │
│              📍 User                 │
│                                      │
│  Distance: 2.5 km ✓ Deliverable      │
│                                      │
│        [Confirm Location]            │
└──────────────────────────────────────┘
```

---

### `UPIPayment.tsx`

**Location:** `src/components/UPIPayment.tsx`

UPI payment screen with QR code.

**Props:**
```typescript
interface UPIPaymentProps {
  amount: number;
  orderId: string;
  onPaymentComplete: () => void;
  onBack: () => void;
}
```

**Features:**
- QR code generation
- "Pay via UPI App" deep link button
- Manual UPI ID copy
- Payment verification options
- Amount display

**Layout:**
```
┌──────────────────────────────────────┐
│         Scan QR to Pay               │
│                                      │
│         ┌──────────────┐             │
│         │              │             │
│         │   QR CODE    │             │
│         │              │             │
│         └──────────────┘             │
│                                      │
│           ₹450.00                    │
│                                      │
│     [Open UPI App to Pay]            │
│                                      │
│     ── Or pay manually ──            │
│                                      │
│     UPI ID: shop@upi [Copy]          │
│                                      │
│     [✓ I've Completed Payment]       │
└──────────────────────────────────────┘
```

---

### `OrderProgress.tsx`

**Location:** `src/components/OrderProgress.tsx`

Order status timeline/progress bar.

**Props:**
```typescript
interface OrderProgressProps {
  status: OrderStatus;
  orderId?: string;
  estimatedTime?: string;
  compact?: boolean;
}
```

**Modes:**
1. **Compact** - Horizontal dots (for lists)
2. **Full** - Vertical timeline (for tracking page)

**Statuses:**
```
📋 New → 👨‍🍳 Preparing → 🚴 Out for Delivery → ✅ Completed
                                              ↓
                                         ❌ Cancelled
```

**Visual States:**
- Completed: Green checkmark
- Active: Pulsing orange ring
- Pending: Gray dot
- Cancelled: Red X

---

### `OrderTracking.tsx`

**Location:** `src/components/OrderTracking.tsx`

Full order tracking page.

**Props:**
```typescript
interface OrderTrackingProps {
  order: Order;
  onHome: () => void;
}
```

**Sections:**
1. **Map Preview** - Store, customer, rider positions
2. **Order Progress** - Status timeline
3. **ETA Card** - Estimated delivery time
4. **Order Details** - ID, date, items
5. **Invoice Preview** - Bill breakdown
6. **Support Buttons** - Call, WhatsApp

**Map Elements:**
- 🍕 Store marker
- 🏠 Customer marker
- 🛵 Rider marker (when out-for-delivery)
- Dashed route line

**Cancelled Order View:**
- Cancellation message
- Refund information
- Support contact
- "Order Again" button

---

### `ProfilePage.tsx`

**Location:** `src/components/ProfilePage.tsx`

User profile and settings page.

**Props:**
```typescript
interface ProfilePageProps {
  onBack: () => void;
  onTrackOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
}
```

**Sections:**
1. **Main** - Profile card, navigation
2. **Orders** - Order history with reorder
3. **Settings** - Theme toggle
4. **Help** - Call/WhatsApp support

**Features:**
- Customer name/phone display
- Order history with status
- Active order highlight
- Track order button
- Reorder functionality
- Light/Dark mode toggle

---

### `NotificationCenter.tsx`

**Location:** `src/components/NotificationCenter.tsx`

Notification list page.

**Props:**
```typescript
interface NotificationCenterProps {
  onBack: () => void;
}
```

**Features:**
- Notification list
- Unread badge
- Clear all button
- Empty state

---

## Admin Components

### Internal Admin Components

These are defined within `AdminApp.tsx`:

#### `LoginScreen`
- Password input
- Login button
- Error messages

#### `OrdersTab`
- New orders (alarm)
- Preparing orders
- Out for delivery orders
- Completed orders
- Cancelled orders
- Status update buttons

#### `MenuTab`
- Menu item list
- Add item button
- Edit/Delete buttons
- Availability toggle
- Add/Edit modal form

#### `CouponsTab`
- Coupon list
- Add coupon button
- Edit/Delete buttons
- Active toggle
- Add/Edit modal form

#### `BannersTab`
- Banner list with preview
- Add banner button
- Edit/Delete buttons
- Active toggle
- Reorder buttons (up/down)
- Add/Edit modal form

#### `SettingsTab`
- Store name input
- Phone number input
- UPI ID input
- Location inputs (lat/lng)
- Delivery radius input
- Delivery charge input
- Min order for free delivery
- Open/Close store toggle
- Save button

---

## Context Providers

### `DataProvider`

**Location:** `src/context/DataContext.tsx`

Central data store provider.

**Wraps:** Entire application

**Provides:**
- Menu items state
- Orders state
- Coupons state
- Store config state
- CRUD functions
- Polling/sync logic

---

### `CartProvider`

**Location:** `src/components/CartContext.tsx`

Shopping cart state provider.

**Wraps:** Customer application

**Provides:**
- Cart items
- Add/remove functions
- Coupon application
- Totals calculation

---

### `NotificationProvider`

**Location:** `src/context/NotificationContext.tsx`

Notification state provider.

**Wraps:** Entire application

**Provides:**
- Notifications list
- Add/remove functions
- Toast functions
- Unread count

---

### `ThemeProvider`

**Location:** `src/context/ThemeContext.tsx`

Theme state provider.

**Wraps:** Entire application

**Provides:**
- Current theme
- Toggle function
- Set theme function

---

## Shared Components

### `Icons.tsx`

**Location:** `src/components/Icons.tsx`

SVG icon components.

**Available Icons:**
```typescript
// Navigation
HomeIcon, BackIcon, CloseIcon, MenuIcon

// Categories
VegIcon, NonVegIcon, ComboIcon, BeverageIcon

// Actions
PlusIcon, MinusIcon, CartIcon, SearchIcon
EditIcon, DeleteIcon, CheckIcon

// Status
StarIcon, ClockIcon, LocationIcon
PhoneIcon, WhatsAppIcon

// UI
ChevronRightIcon, ChevronDownIcon
SunIcon, MoonIcon, BellIcon, UserIcon
SettingsIcon, HelpIcon, HistoryIcon
```

**Usage:**
```tsx
import { CartIcon, StarIcon } from './Icons';

<CartIcon className="w-6 h-6 text-orange-500" />
<StarIcon className="w-4 h-4 fill-yellow-400" />
```

---

## Component Hierarchy

```
App.tsx
├── ThemeProvider
│   └── DataProvider
│       └── NotificationProvider
│           └── CartProvider
│               ├── Header
│               │   ├── Logo
│               │   ├── BellIcon (notifications)
│               │   └── UserIcon (profile)
│               │
│               ├── [view === 'menu']
│               │   ├── StoreClosed Banner
│               │   ├── Banner Carousel
│               │   ├── FilterBar
│               │   ├── CategoryFilter
│               │   ├── MenuItem[] (list)
│               │   └── FloatingCart
│               │
│               ├── [view === 'checkout']
│               │   ├── Checkout
│               │   │   ├── CartItems
│               │   │   ├── CouponInput
│               │   │   ├── CustomerForm
│               │   │   ├── LocationPicker
│               │   │   ├── PaymentMethod
│               │   │   ├── BillSummary
│               │   │   └── PlaceOrderButton
│               │   └── UPIPayment (modal)
│               │
│               ├── [view === 'tracking']
│               │   └── OrderTracking
│               │       ├── MapPreview
│               │       ├── OrderProgress
│               │       ├── ETACard
│               │       ├── OrderDetails
│               │       └── Invoice
│               │
│               ├── [view === 'profile']
│               │   └── ProfilePage
│               │       ├── ProfileCard
│               │       ├── OrderHistory
│               │       ├── Settings
│               │       └── HelpSupport
│               │
│               └── [view === 'notifications']
│                   └── NotificationCenter
│                       └── NotificationList

AdminApp.tsx
├── ThemeProvider
│   └── DataProvider
│       └── NotificationProvider
│           ├── [!authenticated]
│           │   └── LoginScreen
│           │
│           └── [authenticated]
│               ├── Sidebar
│               │   └── TabButtons[]
│               │
│               ├── [tab === 'orders']
│               │   └── OrdersTab
│               │       ├── NewOrders (with alarm)
│               │       ├── PreparingOrders
│               │       ├── OutForDeliveryOrders
│               │       ├── CompletedOrders
│               │       └── CancelledOrders
│               │
│               ├── [tab === 'menu']
│               │   └── MenuTab
│               │       ├── MenuItemList
│               │       └── AddEditModal
│               │
│               ├── [tab === 'coupons']
│               │   └── CouponsTab
│               │       ├── CouponList
│               │       └── AddEditModal
│               │
│               ├── [tab === 'banners']
│               │   └── BannersTab
│               │       ├── BannerList
│               │       └── AddEditModal
│               │
│               └── [tab === 'settings']
│                   └── SettingsTab
│                       └── SettingsForm
```

---

## Styling Conventions

All components use Tailwind CSS with these conventions:

```tsx
// Consistent patterns
className="flex items-center justify-between"
className="p-4 rounded-xl bg-white dark:bg-gray-800"
className="text-gray-900 dark:text-white"
className="border border-gray-200 dark:border-gray-700"
className="hover:bg-gray-100 dark:hover:bg-gray-700"
className="transition-all duration-200"

// Responsive
className="w-full sm:w-auto"
className="grid grid-cols-1 md:grid-cols-2"
className="text-sm md:text-base"
```

---

## Animation Classes

Defined in `src/index.css`:

```css
/* Toast slide down */
@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Pulse for active status */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Spin for loading */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

Usage:
```tsx
className="animate-pulse"
className="animate-spin"
className="animate-slideDown"
```
