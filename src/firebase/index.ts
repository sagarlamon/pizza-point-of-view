import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  update,
  remove,
  onValue,
  Database,
  DataSnapshot,
  Unsubscribe
} from 'firebase/database';
import firebaseConfig from './config';
import { MenuItem, Coupon, Order, StoreConfig } from '../types';

// Initialize Firebase
let app: FirebaseApp | null = null;
let database: Database | null = null;
let isFirebaseEnabled = false;

export const initializeFirebase = (): boolean => {
  try {
    // Check if we have valid config
    if (
      firebaseConfig.apiKey === "YOUR_API_KEY" ||
      !firebaseConfig.apiKey ||
      firebaseConfig.projectId === "YOUR_PROJECT_ID"
    ) {
      console.log('Firebase not configured. Using localStorage fallback.');
      return false;
    }

    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    isFirebaseEnabled = true;
    console.log('Firebase initialized successfully!');
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return false;
  }
};

export const isFirebaseActive = () => isFirebaseEnabled;

// ==================== MENU ITEMS ====================

export const subscribeToMenuItems = (
  callback: (items: MenuItem[]) => void
): Unsubscribe | null => {
  if (!database) return null;
  
  const menuRef = ref(database, 'menuItems');
  return onValue(menuRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val();
    if (data) {
      const items: MenuItem[] = Object.entries(data).map(([id, item]) => ({
        ...(item as MenuItem),
        id,
      }));
      callback(items);
    } else {
      callback([]);
    }
  });
};

export const addMenuItemToFirebase = async (item: Omit<MenuItem, 'id'>): Promise<string | null> => {
  if (!database) return null;
  
  const menuRef = ref(database, 'menuItems');
  const newItemRef = push(menuRef);
  await set(newItemRef, item);
  return newItemRef.key;
};

export const updateMenuItemInFirebase = async (id: string, item: Partial<MenuItem>): Promise<void> => {
  if (!database) return;
  
  const itemRef = ref(database, `menuItems/${id}`);
  await update(itemRef, item);
};

export const deleteMenuItemFromFirebase = async (id: string): Promise<void> => {
  if (!database) return;
  
  const itemRef = ref(database, `menuItems/${id}`);
  await remove(itemRef);
};

// ==================== COUPONS ====================

export const subscribeToCoupons = (
  callback: (coupons: Coupon[]) => void
): Unsubscribe | null => {
  if (!database) return null;
  
  const couponsRef = ref(database, 'coupons');
  return onValue(couponsRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val();
    if (data) {
      const coupons: Coupon[] = Object.entries(data).map(([id, coupon]) => {
        const c = coupon as Record<string, unknown>;
        return {
          code: c.code as string,
          type: c.type as 'flat' | 'percentage',
          value: c.value as number,
          minOrder: c.minOrder as number,
          maxDiscount: c.maxDiscount as number | undefined,
          isActive: c.isActive as boolean,
          expiresAt: new Date(c.expiresAt as string),
          id,
        } as Coupon & { id: string };
      });
      callback(coupons);
    } else {
      callback([]);
    }
  });
};

export const addCouponToFirebase = async (coupon: Coupon): Promise<string | null> => {
  if (!database) return null;
  
  const couponsRef = ref(database, 'coupons');
  const newCouponRef = push(couponsRef);
  await set(newCouponRef, {
    ...coupon,
    expiresAt: coupon.expiresAt.toISOString(),
  });
  return newCouponRef.key;
};

export const updateCouponInFirebase = async (code: string, coupon: Partial<Coupon>): Promise<void> => {
  if (!database) return;
  
  // Find coupon by code
  const couponsRef = ref(database, 'coupons');
  const snapshot = await get(couponsRef);
  const data = snapshot.val();
  
  if (data) {
    const entry = Object.entries(data).find(([, c]) => (c as Coupon).code === code);
    if (entry) {
      const [id] = entry;
      const couponRef = ref(database, `coupons/${id}`);
      const updateData: Record<string, unknown> = { ...coupon };
      if (coupon.expiresAt) {
        updateData.expiresAt = coupon.expiresAt.toISOString();
      }
      await update(couponRef, updateData);
    }
  }
};

export const deleteCouponFromFirebase = async (code: string): Promise<void> => {
  if (!database) return;
  
  const couponsRef = ref(database, 'coupons');
  const snapshot = await get(couponsRef);
  const data = snapshot.val();
  
  if (data) {
    const entry = Object.entries(data).find(([, c]) => (c as Coupon).code === code);
    if (entry) {
      const [id] = entry;
      const couponRef = ref(database, `coupons/${id}`);
      await remove(couponRef);
    }
  }
};

// ==================== ORDERS ====================

export const subscribeToOrders = (
  callback: (orders: Order[]) => void
): Unsubscribe | null => {
  if (!database) return null;
  
  const ordersRef = ref(database, 'orders');
  return onValue(ordersRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val();
    if (data) {
      const orders: Order[] = Object.entries(data).map(([id, order]) => ({
        ...(order as Order),
        id,
        createdAt: new Date((order as Order).createdAt),
      }));
      // Sort by date descending
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      callback(orders);
    } else {
      callback([]);
    }
  });
};

export const addOrderToFirebase = async (order: Omit<Order, 'id'>): Promise<string | null> => {
  if (!database) return null;
  
  const ordersRef = ref(database, 'orders');
  const newOrderRef = push(ordersRef);
  await set(newOrderRef, {
    ...order,
    createdAt: order.createdAt.toISOString(),
  });
  return newOrderRef.key;
};

export const updateOrderStatusInFirebase = async (
  orderId: string,
  status: Order['status']
): Promise<void> => {
  if (!database) return;
  
  const orderRef = ref(database, `orders/${orderId}`);
  await update(orderRef, { status });
};

// ==================== STORE CONFIG ====================

export const subscribeToStoreConfig = (
  callback: (config: StoreConfig) => void
): Unsubscribe | null => {
  if (!database) return null;
  
  const configRef = ref(database, 'storeConfig');
  return onValue(configRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data as StoreConfig);
    }
  });
};

export const updateStoreConfigInFirebase = async (config: Partial<StoreConfig>): Promise<void> => {
  if (!database) return;
  
  const configRef = ref(database, 'storeConfig');
  await update(configRef, config);
};

// ==================== INITIAL DATA SETUP ====================

export const setupInitialData = async (
  menuItems: MenuItem[],
  coupons: Coupon[],
  storeConfig: StoreConfig
): Promise<void> => {
  if (!database) return;
  
  // Check if data already exists
  const menuRef = ref(database, 'menuItems');
  const menuSnapshot = await get(menuRef);
  
  if (!menuSnapshot.exists()) {
    // Setup initial menu items
    for (const item of menuItems) {
      await addMenuItemToFirebase(item);
    }
    console.log('Initial menu items added to Firebase');
  }
  
  const couponsRef = ref(database, 'coupons');
  const couponsSnapshot = await get(couponsRef);
  
  if (!couponsSnapshot.exists()) {
    // Setup initial coupons
    for (const coupon of coupons) {
      await addCouponToFirebase(coupon);
    }
    console.log('Initial coupons added to Firebase');
  }
  
  const configRef = ref(database, 'storeConfig');
  const configSnapshot = await get(configRef);
  
  if (!configSnapshot.exists()) {
    // Setup initial store config
    await set(configRef, storeConfig);
    console.log('Initial store config added to Firebase');
  }
};
