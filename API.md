# 🔌 API Reference - Flash Pizza

This document describes all Context APIs, types, and data structures used in Flash Pizza.

---

## Table of Contents

1. [Data Context API](#data-context-api)
2. [Cart Context API](#cart-context-api)
3. [Notification Context API](#notification-context-api)
4. [Theme Context API](#theme-context-api)
5. [Type Definitions](#type-definitions)
6. [Storage Keys](#storage-keys)
7. [Firebase Structure](#firebase-structure)

---

## Data Context API

**File:** `src/context/DataContext.tsx`

### Hook Usage

```typescript
import { useData } from '../context/DataContext';

function MyComponent() {
  const {
    // State
    menuItems,
    orders,
    coupons,
    storeConfig,
    newOrderIds,
    isFirebaseConnected,
    
    // Menu Item Functions
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    
    // Order Functions
    addOrder,
    updateOrderStatus,
    acknowledgeOrder,
    acknowledgeAllOrders,
    
    // Coupon Functions
    addCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    
    // Store Config Functions
    updateStoreConfig,
  } = useData();
}
```

### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `menuItems` | `MenuItem[]` | All menu items |
| `orders` | `Order[]` | All orders |
| `coupons` | `Coupon[]` | All coupons |
| `storeConfig` | `StoreConfig` | Store configuration |
| `newOrderIds` | `string[]` | IDs of unacknowledged new orders |
| `isFirebaseConnected` | `boolean` | Whether Firebase is connected |

### Functions

#### Menu Items

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `addMenuItem` | `item: MenuItem` | `void` | Add new menu item |
| `updateMenuItem` | `id: string, updates: Partial<MenuItem>` | `void` | Update menu item |
| `deleteMenuItem` | `id: string` | `void` | Delete menu item |

#### Orders

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `addOrder` | `order: Order` | `void` | Add new order |
| `updateOrderStatus` | `id: string, status: OrderStatus` | `void` | Update order status |
| `acknowledgeOrder` | `id: string` | `void` | Acknowledge single order |
| `acknowledgeAllOrders` | - | `void` | Acknowledge all orders |

#### Coupons

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `addCoupon` | `coupon: Coupon` | `void` | Add new coupon |
| `updateCoupon` | `code: string, updates: Partial<Coupon>` | `void` | Update coupon |
| `deleteCoupon` | `code: string` | `void` | Delete coupon |
| `validateCoupon` | `code: string, orderTotal: number` | `CouponValidation` | Validate coupon |

#### Store Config

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `updateStoreConfig` | `updates: Partial<StoreConfig>` | `void` | Update store settings |

---

## Cart Context API

**File:** `src/components/CartContext.tsx`

### Hook Usage

```typescript
import { useCart } from '../components/CartContext';

function MyComponent() {
  const {
    // State
    items,
    subtotal,
    deliveryCharge,
    discount,
    total,
    appliedCoupon,
    
    // Functions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    getItemQuantity,
  } = useCart();
}
```

### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `items` | `CartItem[]` | Cart items |
| `subtotal` | `number` | Sum of item prices |
| `deliveryCharge` | `number` | Calculated delivery charge |
| `discount` | `number` | Applied coupon discount |
| `total` | `number` | Final total |
| `appliedCoupon` | `string \| null` | Applied coupon code |

### Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `addItem` | `item: CartItem` | `void` | Add/increment item |
| `removeItem` | `id: string` | `void` | Remove/decrement item |
| `updateQuantity` | `id: string, quantity: number` | `void` | Set exact quantity |
| `clearCart` | - | `void` | Empty cart |
| `applyCoupon` | `code: string` | `{ success, message }` | Apply coupon |
| `removeCoupon` | - | `void` | Remove coupon |
| `getItemQuantity` | `id: string` | `number` | Get item quantity |

---

## Notification Context API

**File:** `src/context/NotificationContext.tsx`

### Hook Usage

```typescript
import { useNotifications } from '../context/NotificationContext';

function MyComponent() {
  const {
    // State
    notifications,
    toasts,
    unreadCount,
    
    // Functions
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    showToast,
    removeToast,
    setNotificationForOrder,
    removeNotificationForOrder,
  } = useNotifications();
}
```

### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `notifications` | `Notification[]` | All notifications |
| `toasts` | `Toast[]` | Active toast messages |
| `unreadCount` | `number` | Count of unread notifications |

### Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `addNotification` | `notification: NotificationInput` | `void` | Add notification |
| `removeNotification` | `id: string` | `void` | Remove notification |
| `markAsRead` | `id: string` | `void` | Mark as read |
| `markAllAsRead` | - | `void` | Mark all as read |
| `clearAllNotifications` | - | `void` | Clear all |
| `showToast` | `type, message, duration?` | `void` | Show toast |
| `removeToast` | `id: string` | `void` | Remove toast |
| `setNotificationForOrder` | `orderId, title, message` | `void` | Set order notification |
| `removeNotificationForOrder` | `orderId: string` | `void` | Remove order notification |

---

## Theme Context API

**File:** `src/context/ThemeContext.tsx`

### Hook Usage

```typescript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();
}
```

### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `'light' \| 'dark'` | Current theme |

### Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `setTheme` | `theme: 'light' \| 'dark'` | `void` | Set theme |
| `toggleTheme` | - | `void` | Toggle theme |

---

## Type Definitions

**File:** `src/types/index.ts`

### Category

```typescript
type Category = 'veg' | 'non-veg' | 'combos' | 'beverages';
```

### OrderStatus

```typescript
type OrderStatus = 'new' | 'preparing' | 'out-for-delivery' | 'completed' | 'cancelled';
```

### PaymentMethod

```typescript
type PaymentMethod = 'upi' | 'cod';
```

### PaymentStatus

```typescript
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
```

### Location

```typescript
interface Location {
  lat: number;
  lng: number;
}
```

### MenuItem

```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  available: boolean;
  rating?: number;
}
```

### CartItem

```typescript
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
```

### Order

```typescript
interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  location: Location;
  distance: number;
  createdAt: Date;
  couponCode?: string;
}
```

### Coupon

```typescript
interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount: number;
  expiresAt: Date;
  active: boolean;
}
```

### Banner

```typescript
interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  active: boolean;
  order: number;
}
```

### StoreConfig

```typescript
interface StoreConfig {
  name: string;
  phone: string;
  upiId: string;
  location: Location;
  deliveryRadius: number;
  deliveryCharge: number;
  minOrderForFreeDelivery: number;
  isOpen: boolean;
  offerText?: string;
  banners?: Banner[];
}
```

### Notification

```typescript
interface Notification {
  id: string;
  type: 'order' | 'promo' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  orderId?: string;
  orderStatus?: OrderStatus;
}
```

### Toast

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
}
```

---

## Storage Keys

**localStorage keys used by the app:**

| Key | Description | Type |
|-----|-------------|------|
| `flashpizza_menu_items` | Menu items | `MenuItem[]` |
| `flashpizza_orders` | Orders | `Order[]` |
| `flashpizza_coupons` | Coupons | `Coupon[]` |
| `flashpizza_store_config` | Store config | `StoreConfig` |
| `flashpizza_cart` | Cart items | `CartItem[]` |
| `flashpizza_applied_coupon` | Applied coupon | `string` |
| `flashpizza_customer` | Customer info | `{ name, phone }` |
| `flashpizza_theme` | Theme preference | `'light' \| 'dark'` |
| `flashpizza_notifications` | Notifications | `Notification[]` |
| `flashpizza_acknowledged_orders` | Acknowledged order IDs | `string[]` |
| `flashpizza_admin_processed_orders` | Processed order IDs (admin) | `string[]` |

---

## Firebase Structure

**Database path structure:**

```
flashpizza/
├── menuItems/
│   ├── item_1234567890/
│   │   ├── id: "item_1234567890"
│   │   ├── name: "Margherita Pizza"
│   │   ├── description: "Classic cheese pizza"
│   │   ├── price: 199
│   │   ├── image: "https://..."
│   │   ├── category: "veg"
│   │   ├── available: true
│   │   └── rating: 4.5
│   └── ...
│
├── orders/
│   ├── order_1234567890/
│   │   ├── id: "order_1234567890"
│   │   ├── items: [...]
│   │   ├── subtotal: 500
│   │   ├── discount: 50
│   │   ├── deliveryCharge: 0
│   │   ├── total: 450
│   │   ├── status: "preparing"
│   │   ├── customerName: "John"
│   │   ├── customerPhone: "9876543210"
│   │   ├── customerAddress: "123 Main St"
│   │   ├── paymentMethod: "upi"
│   │   ├── paymentStatus: "paid"
│   │   ├── location: { lat: 12.97, lng: 77.59 }
│   │   ├── distance: 2.5
│   │   └── createdAt: "2025-01-15T10:30:00Z"
│   └── ...
│
├── coupons/
│   ├── WELCOME20/
│   │   ├── code: "WELCOME20"
│   │   ├── discountType: "percentage"
│   │   ├── discountValue: 20
│   │   ├── maxDiscount: 100
│   │   ├── minOrderAmount: 200
│   │   ├── expiresAt: "2025-12-31T23:59:59Z"
│   │   └── active: true
│   └── ...
│
└── storeConfig/
    ├── name: "Flash Pizza"
    ├── phone: "9876543210"
    ├── upiId: "flashpizza@upi"
    ├── location: { lat: 12.9716, lng: 77.5946 }
    ├── deliveryRadius: 5
    ├── deliveryCharge: 35
    ├── minOrderForFreeDelivery: 300
    ├── isOpen: true
    ├── offerText: "🔥 50% OFF on first order!"
    └── banners: [...]
```

---

## API Response Types

### Coupon Validation Response

```typescript
interface CouponValidation {
  valid: boolean;
  discount: number;
  message: string;
}

// Examples:
// Success
{ valid: true, discount: 100, message: '₹100 discount applied!' }

// Errors
{ valid: false, discount: 0, message: 'Invalid coupon code' }
{ valid: false, discount: 0, message: 'Coupon expired' }
{ valid: false, discount: 0, message: 'Minimum order ₹200 required' }
{ valid: false, discount: 0, message: 'Coupon is not active' }
```

### Apply Coupon Response

```typescript
interface ApplyCouponResult {
  success: boolean;
  message: string;
}

// Examples:
{ success: true, message: '₹100 discount applied!' }
{ success: false, message: 'Invalid coupon code' }
```

---

## Event Handling

### Storage Event (Cross-Tab Sync)

The app uses the `storage` event to sync data across browser tabs:

```typescript
// DataContext.tsx
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.ORDERS) {
      const orders = JSON.parse(e.newValue || '[]');
      setOrders(orders);
    }
    // ... handle other keys
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

### Polling (Data Refresh)

Data is polled every 2 seconds for real-time updates:

```typescript
// DataContext.tsx
useEffect(() => {
  const interval = setInterval(() => {
    // Refresh orders from localStorage/Firebase
    // Check for new orders
    // Update state if changed
  }, 2000);
  
  return () => clearInterval(interval);
}, []);
```

---

## Error Handling

All API functions should handle errors gracefully:

```typescript
try {
  await saveOrder(order);
  showToast('success', 'Order placed!');
} catch (error) {
  console.error('Failed to save order:', error);
  showToast('error', 'Failed to place order');
}
```

### Firebase Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `PERMISSION_DENIED` | Auth/rules issue | Check Firebase rules |
| `DISCONNECTED` | Network issue | Fallback to localStorage |
| `UNAVAILABLE` | Firebase down | Fallback to localStorage |

---

## Best Practices

### 1. Always Use Hooks

```typescript
// ✅ Good
const { addMenuItem } = useData();

// ❌ Bad - importing directly
import { addMenuItem } from './DataContext';
```

### 2. Handle Loading States

```typescript
const { menuItems } = useData();

if (menuItems.length === 0) {
  return <LoadingSpinner />;
}
```

### 3. Optimistic Updates

```typescript
// Update UI immediately, then persist
const handleToggle = (id: string, available: boolean) => {
  updateMenuItem(id, { available }); // Immediate state update
  // Firebase/localStorage save happens in context
};
```

### 4. Error Boundaries

```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <DataProvider>
    <App />
  </DataProvider>
</ErrorBoundary>
```
