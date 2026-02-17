import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { CartItem, MenuItem, CustomerInfo, PaymentMethod } from '../types';
import { useData } from './DataContext';

interface CartState {
  items: CartItem[];
  couponCode: string;
  discount: number;
  customer: CustomerInfo;
  paymentMethod: PaymentMethod;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: MenuItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'APPLY_COUPON'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'SET_CUSTOMER'; payload: CustomerInfo }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  couponCode: '',
  discount: 0,
  customer: {
    name: '',
    phone: '',
    address: '',
    location: null,
  },
  paymentMethod: 'cod',
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1,
        };
        return { ...state, items: newItems };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
    case 'REMOVE_ITEM': {
      const existingIndex = state.items.findIndex(item => item.id === action.payload);
      if (existingIndex >= 0) {
        const item = state.items[existingIndex];
        if (item.quantity > 1) {
          const newItems = [...state.items];
          newItems[existingIndex] = { ...item, quantity: item.quantity - 1 };
          return { ...state, items: newItems };
        }
        return {
          ...state,
          items: state.items.filter(i => i.id !== action.payload),
        };
      }
      return state;
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(i => i.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'APPLY_COUPON':
      return {
        ...state,
        couponCode: action.payload.code,
        discount: action.payload.discount,
      };
    case 'REMOVE_COUPON':
      return { ...state, couponCode: '', discount: 0 };
    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  setCustomer: (customer: CustomerInfo) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  itemCount: number;
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { validateCoupon, storeConfig } = useData();

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate delivery charge using storeConfig from DataContext
  const calculateDeliveryCharge = (orderSubtotal: number, orderDiscount: number): number => {
    const finalAmount = orderSubtotal - orderDiscount;
    return finalAmount >= storeConfig.freeDeliveryThreshold ? 0 : storeConfig.deliveryCharge;
  };
  
  const deliveryCharge = calculateDeliveryCharge(subtotal, state.discount);
  const total = subtotal - state.discount + deliveryCharge;
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = useCallback((item: MenuItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const applyCoupon = useCallback((code: string) => {
    // Use validateCoupon from DataContext
    const result = validateCoupon(code, subtotal);
    if (result.valid) {
      dispatch({ type: 'APPLY_COUPON', payload: { code, discount: result.discount } });
    }
    return { success: result.valid, message: result.message };
  }, [subtotal, validateCoupon]);

  const removeCoupon = useCallback(() => {
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);

  const setCustomer = useCallback((customer: CustomerInfo) => {
    dispatch({ type: 'SET_CUSTOMER', payload: customer });
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const getItemQuantity = useCallback((id: string) => {
    const item = state.items.find(i => i.id === id);
    return item?.quantity ?? 0;
  }, [state.items]);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        setCustomer,
        setPaymentMethod,
        clearCart,
        subtotal,
        discount: state.discount,
        deliveryCharge,
        total,
        itemCount,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
