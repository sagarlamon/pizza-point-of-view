import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MenuItem, Coupon, Order, StoreConfig } from '../types';
import { MENU_ITEMS, COUPONS, STORE_CONFIG } from '../data/mockData';
import {
  isFirebaseConfigured,
  subscribeToMenuItems,
  subscribeToOrders,
  subscribeToCoupons,
  subscribeToStoreConfig,
  addMenuItem as fbAddMenuItem,
  updateMenuItem as fbUpdateMenuItem,
  deleteMenuItem as fbDeleteMenuItem,
  addCoupon as fbAddCoupon,
  updateCoupon as fbUpdateCoupon,
  deleteCoupon as fbDeleteCoupon,
  addOrder as fbAddOrder,
  updateOrderStatus as fbUpdateOrderStatus,
  updateStoreConfig as fbUpdateStoreConfig,
  initializeFirebaseData,
} from '../services/firebase';

interface DataContextType {
  // Menu Items
  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  
  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (code: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (code: string) => void;
  validateCoupon: (code: string, orderTotal: number) => { valid: boolean; discount: number; message: string };
  
  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  // New order notifications (for admin)
  newOrderIds: string[];
  acknowledgeOrder: (orderId: string) => void;
  acknowledgeAllOrders: () => void;
  
  // Store Config
  storeConfig: StoreConfig;
  updateStoreConfig: (config: Partial<StoreConfig>) => void;
  
  // Data source info
  isUsingFirebase: boolean;
  
  // Refresh data
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MENU_ITEMS: 'flashpizza_menu_items',
  COUPONS: 'flashpizza_coupons',
  ORDERS: 'flashpizza_orders',
  STORE_CONFIG: 'flashpizza_store_config',
  ACKNOWLEDGED_ORDERS: 'flashpizza_acknowledged_orders',
};

// Helper to get acknowledged order IDs
const getAcknowledgedOrderIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACKNOWLEDGED_ORDERS);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
};

// Helper to save acknowledged order IDs
const saveAcknowledgedOrderIds = (ids: Set<string>) => {
  localStorage.setItem(STORAGE_KEYS.ACKNOWLEDGED_ORDERS, JSON.stringify([...ids]));
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(STORE_CONFIG);
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  const [isUsingFirebase, setIsUsingFirebase] = useState(false);
  const previousOrderIds = useRef<Set<string>>(new Set());
  const isInitialized = useRef(false);

  // ==================== LOCALSTORAGE FUNCTIONS ====================
  
  const loadDataFromLocalStorage = useCallback(() => {
    try {
      // Load menu items
      const savedMenu = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
      if (savedMenu) {
        setMenuItems(JSON.parse(savedMenu));
      } else {
        setMenuItems(MENU_ITEMS);
        localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(MENU_ITEMS));
      }

      // Load coupons
      const savedCoupons = localStorage.getItem(STORAGE_KEYS.COUPONS);
      if (savedCoupons) {
        const parsedCoupons = JSON.parse(savedCoupons).map((coupon: Coupon) => ({
          ...coupon,
          expiresAt: new Date(coupon.expiresAt),
        }));
        setCoupons(parsedCoupons);
      } else {
        setCoupons(COUPONS);
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(COUPONS));
      }

      // Load orders
      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders).map((order: Order) => ({
          ...order,
          createdAt: new Date(order.createdAt),
        }));
        setOrders(parsedOrders);
        // Initialize previous order IDs
        previousOrderIds.current = new Set(parsedOrders.map((o: Order) => o.id));
      }

      // Load store config
      const savedConfig = localStorage.getItem(STORAGE_KEYS.STORE_CONFIG);
      if (savedConfig) {
        setStoreConfig(JSON.parse(savedConfig));
      } else {
        setStoreConfig(STORE_CONFIG);
        localStorage.setItem(STORAGE_KEYS.STORE_CONFIG, JSON.stringify(STORE_CONFIG));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    // Check if Firebase is configured
    const firebaseEnabled = isFirebaseConfigured();
    setIsUsingFirebase(firebaseEnabled);
    
    if (firebaseEnabled) {
      console.log('🔥 Using Firebase Realtime Database');
      
      // Setup initial data if database is empty
      initializeFirebaseData(MENU_ITEMS, COUPONS, STORE_CONFIG);
      
      // Subscribe to realtime updates
      const unsubMenu = subscribeToMenuItems((items) => {
        setMenuItems(items);
      });
      
      const unsubCoupons = subscribeToCoupons((items) => {
        setCoupons(items);
      });
      
      const unsubOrders = subscribeToOrders((items) => {
        // Track new orders
        const acknowledgedIds = getAcknowledgedOrderIds();
        const newOrders = items.filter(o => 
          !previousOrderIds.current.has(o.id) && 
          !acknowledgedIds.has(o.id) &&
          o.status === 'new'
        );
        
        if (newOrders.length > 0) {
          setNewOrderIds(prev => {
            const existing = new Set(prev);
            const toAdd = newOrders.map(o => o.id).filter(id => !existing.has(id));
            return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
          });
        }
        
        // Update previous order IDs
        items.forEach(o => previousOrderIds.current.add(o.id));
        setOrders(items);
      });
      
      const unsubConfig = subscribeToStoreConfig((config) => {
        setStoreConfig(config);
      });
      
      return () => {
        unsubMenu?.();
        unsubCoupons?.();
        unsubOrders?.();
        unsubConfig?.();
      };
    } else {
      console.log('💾 Using localStorage (Firebase not configured)');
      loadDataFromLocalStorage();
      
      // Listen for storage changes from other tabs
      const handleStorageChange = (e: StorageEvent) => {
        if (Object.values(STORAGE_KEYS).includes(e.key || '')) {
          loadDataFromLocalStorage();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [loadDataFromLocalStorage]);

  // LocalStorage polling (only when not using Firebase)
  useEffect(() => {
    if (isUsingFirebase) return;
    
    const interval = setInterval(() => {
      // Poll orders
      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) {
        const parsedOrders: Order[] = JSON.parse(savedOrders).map((order: Order) => ({
          ...order,
          createdAt: new Date(order.createdAt),
        }));
        
        setOrders(currentOrders => {
          const savedOrdersStr = JSON.stringify(parsedOrders.map(o => ({ ...o, createdAt: o.createdAt.toISOString() })));
          const currentOrdersStr = JSON.stringify(currentOrders.map(o => ({ ...o, createdAt: o.createdAt.toISOString() })));
          
          if (savedOrdersStr === currentOrdersStr) {
            return currentOrders;
          }
          
          // Check for new orders
          const acknowledgedIds = getAcknowledgedOrderIds();
          const newOrders = parsedOrders.filter(o => 
            !previousOrderIds.current.has(o.id) && 
            !acknowledgedIds.has(o.id) && 
            o.status === 'new'
          );
          
          if (newOrders.length > 0) {
            setNewOrderIds(prev => {
              const existing = new Set(prev);
              const toAdd = newOrders.map(o => o.id).filter(id => !existing.has(id));
              return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
            });
          }
          
          // Update tracking
          parsedOrders.forEach(o => previousOrderIds.current.add(o.id));
          return parsedOrders;
        });
      }
      
      // Poll store config (for real-time settings updates)
      const savedConfig = localStorage.getItem(STORAGE_KEYS.STORE_CONFIG);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setStoreConfig(currentConfig => {
          // Only update if changed
          if (JSON.stringify(parsedConfig) !== JSON.stringify(currentConfig)) {
            return parsedConfig;
          }
          return currentConfig;
        });
      }
      
      // Poll coupons (for real-time coupon updates)
      const savedCoupons = localStorage.getItem(STORAGE_KEYS.COUPONS);
      if (savedCoupons) {
        const parsedCoupons = JSON.parse(savedCoupons).map((coupon: Coupon) => ({
          ...coupon,
          expiresAt: new Date(coupon.expiresAt),
        }));
        setCoupons(currentCoupons => {
          if (JSON.stringify(parsedCoupons) !== JSON.stringify(currentCoupons)) {
            return parsedCoupons;
          }
          return currentCoupons;
        });
      }
      
      // Poll menu items (for real-time menu updates)
      const savedMenu = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
      if (savedMenu) {
        const parsedMenu = JSON.parse(savedMenu);
        setMenuItems(currentMenu => {
          if (JSON.stringify(parsedMenu) !== JSON.stringify(currentMenu)) {
            return parsedMenu;
          }
          return currentMenu;
        });
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isUsingFirebase]);

  // ==================== MENU ITEMS ====================

  const addMenuItem = useCallback((item: MenuItem) => {
    if (isUsingFirebase) {
      fbAddMenuItem(item).catch(console.error);
    } else {
      setMenuItems(prev => {
        const newItems = [...prev, item];
        localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(newItems));
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.MENU_ITEMS }));
        return newItems;
      });
    }
  }, [isUsingFirebase]);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    if (isUsingFirebase) {
      fbUpdateMenuItem(id, updates).catch(console.error);
    } else {
      setMenuItems(prev => {
        const newItems = prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
        localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(newItems));
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.MENU_ITEMS }));
        return newItems;
      });
    }
  }, [isUsingFirebase]);

  const deleteMenuItem = useCallback((id: string) => {
    if (isUsingFirebase) {
      fbDeleteMenuItem(id).catch(console.error);
    } else {
      setMenuItems(prev => {
        const newItems = prev.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(newItems));
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.MENU_ITEMS }));
        return newItems;
      });
    }
  }, [isUsingFirebase]);

  // ==================== COUPONS ====================

  const addCoupon = useCallback((coupon: Coupon) => {
    if (isUsingFirebase) {
      fbAddCoupon(coupon).catch(console.error);
    } else {
      setCoupons(prev => {
        const newCoupons = [...prev, coupon];
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(newCoupons));
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.COUPONS }));
        return newCoupons;
      });
    }
  }, [isUsingFirebase]);

  const updateCoupon = useCallback((code: string, updates: Partial<Coupon>) => {
    if (isUsingFirebase) {
      fbUpdateCoupon(code, updates).catch(console.error);
    } else {
      setCoupons(prev => {
        const newCoupons = prev.map(coupon => 
          coupon.code === code ? { ...coupon, ...updates } : coupon
        );
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(newCoupons));
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.COUPONS }));
        return newCoupons;
      });
    }
  }, [isUsingFirebase]);

  const deleteCoupon = useCallback((code: string) => {
    if (isUsingFirebase) {
      fbDeleteCoupon(code).catch(console.error);
    } else {
      setCoupons(prev => {
        const newCoupons = prev.filter(coupon => coupon.code !== code);
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(newCoupons));
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.COUPONS }));
        return newCoupons;
      });
    }
  }, [isUsingFirebase]);

  const validateCoupon = useCallback((code: string, orderTotal: number): { valid: boolean; discount: number; message: string } => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid coupon code' };
    }
    
    if (!coupon.isActive) {
      return { valid: false, discount: 0, message: 'This coupon is no longer active' };
    }
    
    if (new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, discount: 0, message: 'This coupon has expired' };
    }
    
    if (orderTotal < coupon.minOrder) {
      return { valid: false, discount: 0, message: `Minimum order amount is ₹${coupon.minOrder}` };
    }
    
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (orderTotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }
    
    return { valid: true, discount, message: `₹${discount} discount applied!` };
  }, [coupons]);

  // ==================== ORDERS ====================

  const addOrder = useCallback((order: Order) => {
    if (isUsingFirebase) {
      fbAddOrder(order).catch(console.error);
    } else {
      setOrders(prev => {
        const newOrders = [order, ...prev];
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.ORDERS }));
        return newOrders;
      });
    }
  }, [isUsingFirebase]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    if (isUsingFirebase) {
      fbUpdateOrderStatus(orderId, status).catch(console.error);
    } else {
      setOrders(prev => {
        const newOrders = prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        );
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.ORDERS }));
        return newOrders;
      });
    }
  }, [isUsingFirebase]);

  // ==================== STORE CONFIG ====================

  const updateStoreConfig = useCallback((updates: Partial<StoreConfig>) => {
    if (isUsingFirebase) {
      fbUpdateStoreConfig(updates).catch(console.error);
    } else {
      setStoreConfig(prev => {
        const newConfig = { ...prev, ...updates };
        localStorage.setItem(STORAGE_KEYS.STORE_CONFIG, JSON.stringify(newConfig));
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.STORE_CONFIG }));
        return newConfig;
      });
    }
  }, [isUsingFirebase]);

  // ==================== ORDER ACKNOWLEDGMENT ====================

  const acknowledgeOrder = useCallback((orderId: string) => {
    const acknowledgedIds = getAcknowledgedOrderIds();
    acknowledgedIds.add(orderId);
    saveAcknowledgedOrderIds(acknowledgedIds);
    setNewOrderIds(prev => prev.filter(id => id !== orderId));
  }, []);

  const acknowledgeAllOrders = useCallback(() => {
    const acknowledgedIds = getAcknowledgedOrderIds();
    newOrderIds.forEach(id => acknowledgedIds.add(id));
    saveAcknowledgedOrderIds(acknowledgedIds);
    setNewOrderIds([]);
  }, [newOrderIds]);

  const refreshData = useCallback(() => {
    if (!isUsingFirebase) {
      loadDataFromLocalStorage();
    }
    // Firebase automatically syncs via subscriptions
  }, [isUsingFirebase, loadDataFromLocalStorage]);

  return (
    <DataContext.Provider value={{
      menuItems,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      coupons,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      validateCoupon,
      orders,
      addOrder,
      updateOrderStatus,
      newOrderIds,
      acknowledgeOrder,
      acknowledgeAllOrders,
      storeConfig,
      updateStoreConfig,
      isUsingFirebase,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
