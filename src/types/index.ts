// Core Types for Flash Pizza

export type Category = 'veg' | 'non-veg' | 'combos' | 'beverages';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  description?: string;
  isAvailable: boolean;
  rating?: number;
  popularity?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Coupon {
  code: string;
  type: 'flat' | 'percentage';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  isActive: boolean;
  expiresAt: Date;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  } | null;
}

export type PaymentMethod = 'upi' | 'cod';

export type OrderStatus = 'new' | 'preparing' | 'out-for-delivery' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  items: CartItem[];
  customer: CustomerInfo;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: Date;
  distance: number;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  isActive: boolean;
  order: number;
}

export interface StoreConfig {
  name: string;
  phone: string;
  upiId: string;
  location: {
    lat: number;
    lng: number;
  };
  maxDeliveryRadius: number; // in km
  freeDeliveryThreshold: number;
  deliveryCharge: number;
  bannerImage: string; // Legacy - still used as fallback
  offerText: string;
  isOpen: boolean;
  banners?: Banner[]; // Multiple banners support
}

export type Theme = 'light' | 'dark' | 'system';

export type SortOption = 'default' | 'price-low' | 'price-high' | 'rating' | 'popularity';
