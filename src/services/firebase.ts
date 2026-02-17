import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  push, 
  update, 
  remove,
  Database,
  get
} from 'firebase/database';
import type { MenuItem, Coupon, Order, StoreConfig } from '../types';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId
  );
};

// Initialize Firebase only if configured
let app: FirebaseApp | null = null;
let database: Database | null = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log('🔥 Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Database references
const getRef = (path: string) => {
  if (!database) throw new Error('Firebase not initialized');
  return ref(database, path);
};

// ============ MENU ITEMS ============

export const subscribeToMenuItems = (
  callback: (items: MenuItem[]) => void
): (() => void) => {
  if (!database) {
    console.log('Firebase not configured, using localStorage');
    return () => {};
  }

  const menuRef = getRef('menuItems');
  const unsubscribe = onValue(menuRef, (snapshot) => {
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

  return unsubscribe;
};

export const addMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<string> => {
  if (!database) throw new Error('Firebase not configured');
  
  const menuRef = getRef('menuItems');
  const newRef = push(menuRef);
  await set(newRef, item);
  return newRef.key || '';
};

export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<void> => {
  if (!database) throw new Error('Firebase not configured');
  
  const itemRef = getRef(`menuItems/${id}`);
  await update(itemRef, updates);
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  if (!database) throw new Error('Firebase not configured');
  
  const itemRef = getRef(`menuItems/${id}`);
  await remove(itemRef);
};

// ============ COUPONS ============

export const subscribeToCoupons = (
  callback: (coupons: Coupon[]) => void
): (() => void) => {
  if (!database) {
    return () => {};
  }

  const couponsRef = getRef('coupons');
  const unsubscribe = onValue(couponsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const coupons: Coupon[] = Object.entries(data).map(([id, coupon]) => ({
        ...(coupon as Coupon),
        id,
        expiresAt: new Date((coupon as Coupon).expiresAt),
      }));
      callback(coupons);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};

export const addCoupon = async (coupon: Coupon): Promise<void> => {
  if (!database) throw new Error('Firebase not configured');
  
  const couponRef = getRef(`coupons/${coupon.code}`);
  await set(couponRef, {
    ...coupon,
    expiresAt: coupon.expiresAt.toISOString(),
  });
};

export const updateCoupon = async (code: string, updates: Partial<Coupon>): Promise<void> => {
  if (!database) throw new Error('Firebase not configured');
  
  const couponRef = getRef(`coupons/${code}`);
  const updateData = { ...updates };
  if (updates.expiresAt) {
    (updateData as Record<string, unknown>).expiresAt = updates.expiresAt.toISOString();
  }
  await update(couponRef, updateData);
};

export const deleteCoupon = async (code: string): Promise<void> => {
  if (!database) throw new Error('Firebase not configured');
  
  const couponRef = getRef(`coupons/${code}`);
  await remove(couponRef);
};

// ============ ORDERS ============

export const subscribeToOrders = (
  callback: (orders: Order[]) => void
): (() => void) => {
  if (!database) {
    return () => {};
  }

  const ordersRef = getRef('orders');
  const unsubscribe = onValue(ordersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const orders: Order[] = Object.entries(data).map(([id, order]) => ({
        ...(order as Order),
        id,
        createdAt: new Date((order as Order).createdAt),
      }));
      // Sort by date, newest first
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      callback(orders);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};

export const addOrder = async (order: Order): Promise<void> => {
  if (!database) throw new Error('Firebase not configured');
  
  const orderRef = getRef(`orders/${order.id}`);
  await set(orderRef, {
    ...order,
    createdAt: order.createdAt.toISOString(),
  });
};

export const updateOrderStatus = async (
  orderId: string, 
  status: Order['status']
): Promise<void> => {
  if (!database) throw new Error('Firebase not configured');
  
  const orderRef = getRef(`orders/${orderId}`);
  await update(orderRef, { status });
};

// ============ STORE CONFIG ============

export const subscribeToStoreConfig = (
  callback: (config: StoreConfig) => void
): (() => void) => {
  if (!database) {
    return () => {};
  }

  const configRef = getRef('storeConfig');
  const unsubscribe = onValue(configRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data as StoreConfig);
    }
  });

  return unsubscribe;
};

export const updateStoreConfig = async (config: Partial<StoreConfig>): Promise<void> => {
  if (!database) throw new Error('Firebase not configured');
  
  const configRef = getRef('storeConfig');
  await update(configRef, config);
};

export const initializeStoreConfig = async (config: StoreConfig): Promise<void> => {
  if (!database) throw new Error('Firebase not configured');
  
  const configRef = getRef('storeConfig');
  const snapshot = await get(configRef);
  if (!snapshot.exists()) {
    await set(configRef, config);
  }
};

// ============ INITIAL DATA SETUP ============

export const initializeFirebaseData = async (
  menuItems: MenuItem[],
  coupons: Coupon[],
  storeConfig: StoreConfig
): Promise<void> => {
  if (!database) return;

  try {
    // Check if data already exists
    const menuRef = getRef('menuItems');
    const menuSnapshot = await get(menuRef);
    
    if (!menuSnapshot.exists()) {
      console.log('Initializing Firebase with default data...');
      
      // Add menu items
      for (const item of menuItems) {
        const newRef = push(menuRef);
        await set(newRef, { ...item, id: undefined });
      }
      
      // Add coupons
      for (const coupon of coupons) {
        const couponRef = getRef(`coupons/${coupon.code}`);
        await set(couponRef, {
          ...coupon,
          expiresAt: coupon.expiresAt.toISOString(),
        });
      }
      
      // Set store config
      const configRef = getRef('storeConfig');
      await set(configRef, storeConfig);
      
      console.log('Firebase initialized with default data');
    }
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
  }
};

export { database };
