import { MenuItem, Coupon, StoreConfig, Order } from '../types';

export const STORE_CONFIG: StoreConfig = {
  name: 'Flash Pizza',
  phone: '+919876543210',
  upiId: 'princesagar7155@ptaxis',
  location: {
    lat: 12.9716,
    lng: 77.5946,
  },
  maxDeliveryRadius: 5,
  freeDeliveryThreshold: 300,
  deliveryCharge: 35,
  bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80',
  offerText: '🔥 Flat 20% OFF on orders above ₹500!',
  isOpen: true,
};

export const MENU_ITEMS: MenuItem[] = [
  // Beverages
  {
    id: 'b1',
    name: 'Coca-Cola',
    price: 60,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80',
    category: 'beverages',
    description: 'Chilled 500ml bottle',
    isAvailable: true,
    rating: 4.5,
    popularity: 90,
  },
  {
    id: 'b2',
    name: 'Fresh Lime Soda',
    price: 49,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
    category: 'beverages',
    description: 'Refreshing lime soda with mint',
    isAvailable: true,
    rating: 4.3,
    popularity: 85,
  },
  {
    id: 'b3',
    name: 'Mango Shake',
    price: 89,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80',
    category: 'beverages',
    description: 'Thick and creamy mango shake',
    isAvailable: true,
    rating: 4.7,
    popularity: 95,
  },
  // Veg Items
  {
    id: 'v1',
    name: 'Margherita Pizza',
    price: 199,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
    category: 'veg',
    description: 'Classic tomato sauce with mozzarella cheese',
    isAvailable: true,
    rating: 4.5,
    popularity: 95,
  },
  {
    id: 'v2',
    name: 'Paneer Tikka Pizza',
    price: 279,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    category: 'veg',
    description: 'Spicy paneer with bell peppers and onions',
    isAvailable: true,
    rating: 4.6,
    popularity: 88,
  },
  {
    id: 'v3',
    name: 'Veggie Supreme',
    price: 299,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&q=80',
    category: 'veg',
    description: 'Loaded with fresh vegetables and herbs',
    isAvailable: true,
    rating: 4.4,
    popularity: 82,
  },
  {
    id: 'v4',
    name: 'Cheese Burst',
    price: 329,
    image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400&q=80',
    category: 'veg',
    description: 'Extra cheese stuffed crust',
    isAvailable: true,
    rating: 4.8,
    popularity: 98,
  },
  // Non-Veg Items
  {
    id: 'nv1',
    name: 'Chicken Tikka Pizza',
    price: 329,
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80',
    category: 'non-veg',
    description: 'Tandoori chicken with special spices',
    isAvailable: true,
    rating: 4.7,
    popularity: 92,
  },
  {
    id: 'nv2',
    name: 'Pepperoni Classic',
    price: 349,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80',
    category: 'non-veg',
    description: 'Classic pepperoni with mozzarella',
    isAvailable: true,
    rating: 4.5,
    popularity: 90,
  },
  {
    id: 'nv3',
    name: 'BBQ Chicken',
    price: 379,
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=400&q=80',
    category: 'non-veg',
    description: 'Smoky BBQ chicken with caramelized onions',
    isAvailable: true,
    rating: 4.6,
    popularity: 87,
  },
  {
    id: 'nv4',
    name: 'Meat Feast',
    price: 429,
    image: 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?w=400&q=80',
    category: 'non-veg',
    description: 'Loaded with chicken, pepperoni & sausage',
    isAvailable: true,
    rating: 4.8,
    popularity: 94,
  },
  // Combos
  {
    id: 'c1',
    name: 'Party Pack (2 Medium)',
    price: 499,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&q=80',
    category: 'combos',
    description: '2 medium pizzas of your choice',
    isAvailable: true,
    rating: 4.6,
    popularity: 85,
  },
  {
    id: 'c2',
    name: 'Family Feast',
    price: 799,
    image: 'https://images.unsplash.com/photo-1606502281004-f86cf1282e29?w=400&q=80',
    category: 'combos',
    description: '2 large pizzas + garlic bread + coke',
    isAvailable: true,
    rating: 4.7,
    popularity: 91,
  },
  {
    id: 'c3',
    name: 'Date Night Combo',
    price: 599,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
    category: 'combos',
    description: '1 large pizza + pasta + 2 drinks',
    isAvailable: true,
    rating: 4.5,
    popularity: 88,
  },
];

export const COUPONS: Coupon[] = [
  {
    code: 'FLASH20',
    type: 'percentage',
    value: 20,
    minOrder: 500,
    maxDiscount: 150,
    isActive: true,
    expiresAt: new Date('2025-12-31'),
  },
  {
    code: 'FLAT50',
    type: 'flat',
    value: 50,
    minOrder: 300,
    isActive: true,
    expiresAt: new Date('2025-12-31'),
  },
  {
    code: 'WELCOME',
    type: 'percentage',
    value: 15,
    minOrder: 200,
    maxDiscount: 100,
    isActive: true,
    expiresAt: new Date('2025-12-31'),
  },
];

// Mock orders for admin panel
export const MOCK_ORDERS: Order[] = [];

// Utility to calculate distance using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
