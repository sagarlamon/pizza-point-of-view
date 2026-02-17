# 📘 Functions Reference - Flash Pizza

This document explains all major functions in the Flash Pizza codebase.

---

## Table of Contents

1. [Data Context Functions](#data-context-functions)
2. [Cart Context Functions](#cart-context-functions)
3. [Notification Context Functions](#notification-context-functions)
4. [Theme Context Functions](#theme-context-functions)
5. [Firebase Service Functions](#firebase-service-functions)
6. [Utility Functions](#utility-functions)
7. [Admin Panel Functions](#admin-panel-functions)
8. [Component Functions](#component-functions)

---

## Data Context Functions

**File:** `src/context/DataContext.tsx`

### `useData()`
```typescript
const { menuItems, orders, coupons, storeConfig, ... } = useData();
```
Hook to access all app data and CRUD operations.

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `menuItems` | `MenuItem[]` | All menu items |
| `orders` | `Order[]` | All orders |
| `coupons` | `Coupon[]` | All coupons |
| `storeConfig` | `StoreConfig` | Store settings |
| `newOrderIds` | `string[]` | IDs of unacknowledged new orders |
| `isFirebaseConnected` | `boolean` | Firebase connection status |

---

### `addMenuItem(item: MenuItem)`
```typescript
const { addMenuItem } = useData();
addMenuItem({
  id: 'item_123',
  name: 'Margherita Pizza',
  description: 'Classic cheese pizza',
  price: 199,
  image: 'https://...',
  category: 'veg',
  available: true,
  rating: 4.5
});
```
Adds a new menu item to the database.

**Parameters:**
- `item` - Complete MenuItem object

**Side Effects:**
- Saves to localStorage/Firebase
- Triggers re-render in all consuming components

---

### `updateMenuItem(id: string, updates: Partial<MenuItem>)`
```typescript
const { updateMenuItem } = useData();
updateMenuItem('item_123', { price: 249, available: false });
```
Updates specific fields of a menu item.

**Parameters:**
- `id` - Item ID to update
- `updates` - Partial object with fields to update

---

### `deleteMenuItem(id: string)`
```typescript
const { deleteMenuItem } = useData();
deleteMenuItem('item_123');
```
Removes a menu item from the database.

---

### `addCoupon(coupon: Coupon)`
```typescript
const { addCoupon } = useData();
addCoupon({
  code: 'WELCOME20',
  discountType: 'percentage',
  discountValue: 20,
  maxDiscount: 100,
  minOrderAmount: 200,
  expiresAt: new Date('2025-12-31'),
  active: true
});
```
Creates a new discount coupon.

---

### `updateCoupon(code: string, updates: Partial<Coupon>)`
```typescript
const { updateCoupon } = useData();
updateCoupon('WELCOME20', { active: false });
```
Updates coupon properties.

---

### `deleteCoupon(code: string)`
```typescript
const { deleteCoupon } = useData();
deleteCoupon('WELCOME20');
```
Removes a coupon.

---

### `validateCoupon(code: string, orderTotal: number)`
```typescript
const { validateCoupon } = useData();
const result = validateCoupon('WELCOME20', 500);
// Returns: { valid: true, discount: 100, message: '₹100 discount applied!' }
// Or: { valid: false, discount: 0, message: 'Minimum order ₹200 required' }
```
Validates a coupon and calculates discount.

**Parameters:**
- `code` - Coupon code to validate
- `orderTotal` - Current order total

**Returns:**
```typescript
{
  valid: boolean;
  discount: number;
  message: string;
}
```

**Validation Checks:**
1. Coupon exists
2. Coupon is active
3. Not expired
4. Minimum order amount met

---

### `addOrder(order: Order)`
```typescript
const { addOrder } = useData();
const newOrder: Order = {
  id: `order_${Date.now()}`,
  items: cartItems,
  subtotal: 500,
  discount: 50,
  deliveryCharge: 0,
  total: 450,
  status: 'new',
  customerName: 'John',
  customerPhone: '9876543210',
  customerAddress: '123 Main St',
  paymentMethod: 'upi',
  paymentStatus: 'paid',
  location: { lat: 12.97, lng: 77.59 },
  distance: 2.5,
  createdAt: new Date()
};
addOrder(newOrder);
```
Places a new order.

---

### `updateOrderStatus(id: string, status: OrderStatus)`
```typescript
const { updateOrderStatus } = useData();
updateOrderStatus('order_123', 'preparing');
// Status: 'new' → 'preparing' → 'out-for-delivery' → 'completed' | 'cancelled'
```
Updates order status.

---

### `acknowledgeOrder(id: string)`
```typescript
const { acknowledgeOrder } = useData();
acknowledgeOrder('order_123');
```
Removes order ID from `newOrderIds` array (stops alarm).

---

### `updateStoreConfig(updates: Partial<StoreConfig>)`
```typescript
const { updateStoreConfig } = useData();
updateStoreConfig({
  phone: '9876543210',
  upiId: 'newupi@bank',
  deliveryCharge: 40,
  minOrderForFreeDelivery: 400,
  isOpen: false
});
```
Updates store settings.

---

## Cart Context Functions

**File:** `src/components/CartContext.tsx`

### `useCart()`
```typescript
const { 
  items, 
  addItem, 
  removeItem, 
  updateQuantity,
  clearCart,
  subtotal,
  deliveryCharge,
  discount,
  total,
  applyCoupon,
  removeCoupon,
  appliedCoupon
} = useCart();
```

---

### `addItem(item: CartItem)`
```typescript
const { addItem } = useCart();
addItem({
  id: 'item_123',
  name: 'Margherita Pizza',
  price: 199,
  quantity: 1,
  image: 'https://...'
});
```
Adds item to cart. If item exists, increments quantity.

---

### `removeItem(id: string)`
```typescript
const { removeItem } = useCart();
removeItem('item_123');
```
Removes one quantity. If quantity becomes 0, removes item entirely.

---

### `updateQuantity(id: string, quantity: number)`
```typescript
const { updateQuantity } = useCart();
updateQuantity('item_123', 3);
```
Sets exact quantity for an item.

---

### `clearCart()`
```typescript
const { clearCart } = useCart();
clearCart();
```
Removes all items and applied coupon.

---

### `applyCoupon(code: string)`
```typescript
const { applyCoupon } = useCart();
const result = applyCoupon('WELCOME20');
// Returns: { success: true, message: '₹100 discount applied!' }
```
Applies a coupon to the cart.

**Returns:**
```typescript
{ success: boolean; message: string }
```

---

### `removeCoupon()`
```typescript
const { removeCoupon } = useCart();
removeCoupon();
```
Removes applied coupon.

---

### Computed Properties

| Property | Type | Description |
|----------|------|-------------|
| `items` | `CartItem[]` | Current cart items |
| `subtotal` | `number` | Sum of (price × quantity) |
| `deliveryCharge` | `number` | Based on subtotal & storeConfig |
| `discount` | `number` | Applied coupon discount |
| `total` | `number` | subtotal - discount + deliveryCharge |
| `appliedCoupon` | `string \| null` | Applied coupon code |

---

## Notification Context Functions

**File:** `src/context/NotificationContext.tsx`

### `useNotifications()`
```typescript
const { 
  notifications, 
  addNotification, 
  removeNotification,
  clearAllNotifications,
  unreadCount,
  showToast
} = useNotifications();
```

---

### `addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>)`
```typescript
const { addNotification } = useNotifications();
addNotification({
  type: 'order',
  title: 'Order Confirmed!',
  message: 'Your order #123 has been placed',
  orderId: 'order_123'
});
```
Adds a notification to the list.

**Notification Types:**
- `'order'` - Order-related notifications
- `'promo'` - Promotional notifications
- `'system'` - System notifications

---

### `showToast(type: 'success' | 'error' | 'info', message: string)`
```typescript
const { showToast } = useNotifications();
showToast('success', 'Item added to cart!');
showToast('error', 'Failed to place order');
showToast('info', 'Store will close at 10 PM');
```
Shows a temporary toast message.

---

### `setNotificationForOrder(orderId: string, title: string, message: string)`
```typescript
const { setNotificationForOrder } = useNotifications();
setNotificationForOrder('order_123', 'Preparing', 'Your order is being prepared');
```
Creates/replaces notification for a specific order.

---

### `removeNotificationForOrder(orderId: string)`
```typescript
const { removeNotificationForOrder } = useNotifications();
removeNotificationForOrder('order_123');
```
Removes all notifications for an order.

---

## Theme Context Functions

**File:** `src/context/ThemeContext.tsx`

### `useTheme()`
```typescript
const { theme, setTheme, toggleTheme } = useTheme();
```

---

### `setTheme(theme: 'light' | 'dark')`
```typescript
const { setTheme } = useTheme();
setTheme('dark');
```
Sets the theme explicitly.

---

### `toggleTheme()`
```typescript
const { toggleTheme } = useTheme();
toggleTheme();
```
Toggles between light and dark mode.

---

## Firebase Service Functions

**File:** `src/services/firebase.ts`

### `isFirebaseConfigured()`
```typescript
import { isFirebaseConfigured } from '../services/firebase';
if (isFirebaseConfigured()) {
  // Use Firebase
} else {
  // Use localStorage
}
```
Checks if Firebase environment variables are set.

---

### `subscribeToMenuItems(callback: (items: MenuItem[]) => void)`
```typescript
import { subscribeToMenuItems } from '../services/firebase';
const unsubscribe = subscribeToMenuItems((items) => {
  setMenuItems(items);
});
// Later: unsubscribe();
```
Real-time subscription to menu items.

---

### `subscribeToOrders(callback: (orders: Order[]) => void)`
```typescript
const unsubscribe = subscribeToOrders((orders) => {
  setOrders(orders);
});
```
Real-time subscription to orders.

---

### `subscribeToCoupons(callback: (coupons: Coupon[]) => void)`
```typescript
const unsubscribe = subscribeToCoupons((coupons) => {
  setCoupons(coupons);
});
```
Real-time subscription to coupons.

---

### `subscribeToStoreConfig(callback: (config: StoreConfig) => void)`
```typescript
const unsubscribe = subscribeToStoreConfig((config) => {
  setStoreConfig(config);
});
```
Real-time subscription to store configuration.

---

### Firebase Write Functions

```typescript
// Menu Items
saveMenuItem(item: MenuItem): Promise<void>
deleteMenuItemFromFirebase(id: string): Promise<void>

// Orders
saveOrder(order: Order): Promise<void>
updateOrderInFirebase(id: string, updates: Partial<Order>): Promise<void>

// Coupons
saveCoupon(coupon: Coupon): Promise<void>
deleteCouponFromFirebase(code: string): Promise<void>

// Store Config
saveStoreConfig(config: StoreConfig): Promise<void>
```

---

## Utility Functions

### Distance Calculation
**File:** `src/components/LocationPicker.tsx`

```typescript
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  // Haversine formula
  // Returns distance in kilometers
};
```
Calculates distance between two coordinates.

---

### UPI URL Generator
**File:** `src/components/UPIPayment.tsx`

```typescript
const generateUPIUrl = (
  upiId: string,
  amount: number,
  orderId: string,
  storeName: string
): string => {
  return `upi://pay?pa=${upiId}&pn=${storeName}&am=${amount}&tn=Order${orderId}&cu=INR`;
};
```
Generates UPI deep link URL.

---

### QR Code Generator
**File:** `src/components/UPIPayment.tsx`

```typescript
const generateQRCode = (data: string): string => {
  // Uses qr-code-generator library
  // Returns base64 SVG data URL
};
```
Generates QR code for UPI payment.

---

## Admin Panel Functions

**File:** `src/admin/AdminApp.tsx`

### Order Alarm System

```typescript
// OrderAlarm Class
class OrderAlarm {
  private audioContext: AudioContext | null = null;
  private intervalId: number | null = null;
  private isPlaying: boolean = false;

  start(): void;    // Start continuous alarm
  stop(): void;     // Stop alarm
  playOnce(): void; // Play single ring
}

// Usage
const alarm = new OrderAlarm();
alarm.start();  // Starts ringing every 3 seconds
alarm.stop();   // Stops when order is accepted
```

---

### Order Status Handlers

```typescript
const handleMarkPreparing = (order: Order) => {
  updateOrderStatus(order.id, 'preparing');
  acknowledgeOrder(order.id);
  showToast('success', 'Order marked as Preparing');
};

const handleMarkOutForDelivery = (order: Order) => {
  updateOrderStatus(order.id, 'out-for-delivery');
  showToast('success', 'Order marked as Out for Delivery');
};

const handleMarkCompleted = (order: Order) => {
  updateOrderStatus(order.id, 'completed');
  showToast('success', 'Order completed!');
};

const handleCancelOrder = (order: Order) => {
  updateOrderStatus(order.id, 'cancelled');
  showToast('info', 'Order cancelled');
};
```

---

### Menu Item Handlers

```typescript
const handleAddItem = (item: Omit<MenuItem, 'id'>) => {
  const newItem = { ...item, id: `item_${Date.now()}` };
  addMenuItem(newItem);
  showToast('success', 'Item added!');
};

const handleUpdateItem = (id: string, updates: Partial<MenuItem>) => {
  updateMenuItem(id, updates);
  showToast('success', 'Item updated!');
};

const handleDeleteItem = (id: string) => {
  deleteMenuItem(id);
  showToast('success', 'Item deleted!');
};

const handleToggleAvailability = (id: string, available: boolean) => {
  updateMenuItem(id, { available });
  showToast('info', available ? 'Item available' : 'Item unavailable');
};
```

---

### Coupon Handlers

```typescript
const handleAddCoupon = (coupon: Coupon) => {
  addCoupon(coupon);
  showToast('success', 'Coupon created!');
};

const handleUpdateCoupon = (code: string, updates: Partial<Coupon>) => {
  updateCoupon(code, updates);
  showToast('success', 'Coupon updated!');
};

const handleDeleteCoupon = (code: string) => {
  deleteCoupon(code);
  showToast('success', 'Coupon deleted!');
};

const handleToggleCouponActive = (code: string, active: boolean) => {
  updateCoupon(code, { active });
  showToast('info', active ? 'Coupon activated' : 'Coupon deactivated');
};
```

---

### Banner Handlers

```typescript
const handleAddBanner = (banner: Omit<Banner, 'id'>) => {
  const newBanner = { ...banner, id: `banner_${Date.now()}` };
  updateStoreConfig({
    banners: [...(storeConfig.banners || []), newBanner]
  });
  showToast('success', 'Banner added!');
};

const handleUpdateBanner = (id: string, updates: Partial<Banner>) => {
  const updatedBanners = storeConfig.banners?.map(b =>
    b.id === id ? { ...b, ...updates } : b
  );
  updateStoreConfig({ banners: updatedBanners });
  showToast('success', 'Banner updated!');
};

const handleDeleteBanner = (id: string) => {
  const filteredBanners = storeConfig.banners?.filter(b => b.id !== id);
  updateStoreConfig({ banners: filteredBanners });
  showToast('success', 'Banner deleted!');
};

const handleReorderBanners = (bannerId: string, direction: 'up' | 'down') => {
  // Swaps banner with adjacent banner
  const banners = [...(storeConfig.banners || [])];
  const index = banners.findIndex(b => b.id === bannerId);
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  [banners[index], banners[newIndex]] = [banners[newIndex], banners[index]];
  updateStoreConfig({ banners });
};
```

---

### Settings Handler

```typescript
const handleSaveSettings = (settings: Partial<StoreConfig>) => {
  updateStoreConfig(settings);
  showToast('success', 'Settings saved!');
  playSound(); // Confirmation sound
};
```

---

## Component Functions

### LocationPicker

```typescript
// Get user's current location
const handleGetCurrentLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
    },
    (error) => {
      showToast('error', 'Failed to get location');
    }
  );
};

// Check if location is within delivery radius
const isWithinDeliveryRadius = (
  userLat: number,
  userLng: number,
  storeLat: number,
  storeLng: number,
  radius: number
): boolean => {
  const distance = calculateDistance(userLat, userLng, storeLat, storeLng);
  return distance <= radius;
};
```

---

### Checkout

```typescript
const handlePlaceOrder = async () => {
  // 1. Validate location
  if (!location || !isWithinDeliveryRadius(...)) {
    showToast('error', 'Delivery not available at this location');
    return;
  }

  // 2. Create order object
  const order: Order = {
    id: `order_${Date.now()}`,
    items: cartItems,
    subtotal,
    discount,
    deliveryCharge,
    total,
    status: 'new',
    customerName,
    customerPhone,
    customerAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    location,
    distance,
    createdAt: new Date()
  };

  // 3. Save order
  addOrder(order);

  // 4. Clear cart
  clearCart();

  // 5. Navigate to tracking
  onOrderPlaced(order);
};
```

---

### OrderTracking

```typescript
// Get estimated delivery time based on status
const getEstimatedTime = (order: Order): string => {
  switch (order.status) {
    case 'new': return '30-40 mins';
    case 'preparing': return '20-30 mins';
    case 'out-for-delivery': return '10-15 mins';
    case 'completed': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return 'Unknown';
  }
};

// Get delivery rider position (simulated)
const getRiderPosition = (
  storeLocation: Location,
  customerLocation: Location,
  progress: number // 0-1
): Location => {
  return {
    lat: storeLocation.lat + (customerLocation.lat - storeLocation.lat) * progress,
    lng: storeLocation.lng + (customerLocation.lng - storeLocation.lng) * progress
  };
};
```

---

## Error Handling

All major functions include error handling:

```typescript
try {
  await saveOrder(order);
  showToast('success', 'Order placed!');
} catch (error) {
  console.error('Failed to save order:', error);
  showToast('error', 'Failed to place order. Please try again.');
}
```

---

## Type Definitions

All functions use TypeScript types defined in `src/types/index.ts`:

```typescript
type Category = 'veg' | 'non-veg' | 'combos' | 'beverages';
type OrderStatus = 'new' | 'preparing' | 'out-for-delivery' | 'completed' | 'cancelled';
type PaymentMethod = 'upi' | 'cod';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

interface MenuItem { ... }
interface CartItem { ... }
interface Order { ... }
interface Coupon { ... }
interface StoreConfig { ... }
interface Banner { ... }
interface Notification { ... }
```

See [types/index.ts](./src/types/index.ts) for complete type definitions.
