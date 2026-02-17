import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../types';
import { OrderProgress } from './OrderProgress';
import { useData } from '../context/DataContext';
import L from 'leaflet';

interface OrderTrackingProps {
  order: Order;
  onBack: () => void;
  onCallSupport: () => void;
  onHome?: () => void;
}

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-IN', { 
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getEstimatedDeliveryTime = (createdAt: Date | string, status: string): string => {
  const orderTime = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  let addMinutes = 30;
  
  switch (status) {
    case 'new':
      addMinutes = 35;
      break;
    case 'preparing':
      addMinutes = 25;
      break;
    case 'out-for-delivery':
      addMinutes = 10;
      break;
    default:
      return 'Delivered';
  }
  
  const estimated = new Date(orderTime.getTime() + addMinutes * 60000);
  return formatTime(estimated);
};

export const OrderTracking: React.FC<OrderTrackingProps> = ({ order, onBack, onCallSupport, onHome }) => {
  const [estimatedTime, setEstimatedTime] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { storeConfig } = useData();
  
  useEffect(() => {
    if (order.status !== 'completed') {
      setEstimatedTime(getEstimatedDeliveryTime(order.createdAt, order.status));
    }
  }, [order.createdAt, order.status]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const storeLocation = storeConfig.location;
    const customerLocation = order.customer.location || { lat: storeLocation.lat + 0.01, lng: storeLocation.lng + 0.01 };

    // Calculate center between store and customer
    const centerLat = (storeLocation.lat + customerLocation.lat) / 2;
    const centerLng = (storeLocation.lng + customerLocation.lng) / 2;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    }).setView([centerLat, centerLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Store marker (orange)
    const storeIcon = L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <span style="transform: rotate(45deg); font-size: 16px;">🍕</span>
          </div>
        </div>
      `,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    // Customer marker (blue)
    const customerIcon = L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <span style="transform: rotate(45deg); font-size: 16px;">🏠</span>
          </div>
        </div>
      `,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    // Delivery rider marker (green) - only show if out for delivery
    const riderIcon = L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); animation: pulse 2s infinite;">
            <span style="font-size: 20px;">🛵</span>
          </div>
        </div>
      `,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker([storeLocation.lat, storeLocation.lng], { icon: storeIcon }).addTo(map);
    L.marker([customerLocation.lat, customerLocation.lng], { icon: customerIcon }).addTo(map);

    // Show rider between store and customer if out for delivery
    if (order.status === 'out-for-delivery') {
      const riderLat = (storeLocation.lat * 0.3 + customerLocation.lat * 0.7);
      const riderLng = (storeLocation.lng * 0.3 + customerLocation.lng * 0.7);
      L.marker([riderLat, riderLng], { icon: riderIcon }).addTo(map);
    }

    // Draw route line
    L.polyline(
      [
        [storeLocation.lat, storeLocation.lng],
        [customerLocation.lat, customerLocation.lng]
      ],
      { 
        color: '#f97316', 
        weight: 4, 
        opacity: 0.8,
        dashArray: '10, 10'
      }
    ).addTo(map);

    // Fit bounds to show both markers
    const bounds = L.latLngBounds(
      [storeLocation.lat, storeLocation.lng],
      [customerLocation.lat, customerLocation.lng]
    );
    map.fitBounds(bounds, { padding: [40, 40] });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [order.customer.location, order.status]);

  const isCompleted = order.status === 'completed';
  const isCancelled = order.status === 'cancelled';

  // Show cancelled order view
  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon />
              </button>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order #{order.id.slice(-6)}
                </h1>
                <p className="text-xs text-red-500">
                  Cancelled
                </p>
              </div>
            </div>
            {onHome && (
              <button
                onClick={onHome}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium transition-colors"
              >
                <HomeIcon />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Cancelled Banner */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-4xl">
              ❌
            </div>
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
              Order Cancelled
            </h2>
            <p className="text-sm text-red-600 dark:text-red-500 mt-2 max-w-md mx-auto">
              We're sorry, but your order has been cancelled. If you paid online, your refund will be processed within 3-5 business days.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm transition-colors duration-300">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="text-gray-900 dark:text-white font-medium">#{order.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order Date</span>
                <span className="text-gray-900 dark:text-white">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Amount</span>
                <span className="text-gray-900 dark:text-white line-through">₹{order.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method</span>
                <span className="text-gray-900 dark:text-white">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm transition-colors duration-300">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 opacity-60">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm line-through">{item.name}</p>
                    <p className="text-xs text-gray-500">₹{item.price} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">Need Help?</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                  If you have any questions about your cancelled order or refund, please contact us.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={onCallSupport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-medium transition-colors"
              >
                <PhoneIcon />
                Call Support
              </button>
            </div>
          </div>

          {/* Order Again */}
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Want to order again?
            </p>
            {onHome && (
              <button
                onClick={onHome}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium transition-colors"
              >
                🍕 Order Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon />
            </button>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order #{order.id.slice(-6)}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onHome && (
              <button
                onClick={onHome}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium transition-colors"
              >
                <HomeIcon />
              </button>
            )}
            <button
              onClick={onCallSupport}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-medium transition-colors"
            >
              <PhoneIcon />
              <span className="hidden sm:inline">Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Preview */}
      <div className="relative h-48 sm:h-56 bg-gray-200 dark:bg-gray-700">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full text-xs">
            <span>🍕</span>
            <span className="text-gray-700 dark:text-gray-300">Store</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full text-xs">
            <span>🏠</span>
            <span className="text-gray-700 dark:text-gray-300">You</span>
          </div>
          {order.status === 'out-for-delivery' && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full text-xs animate-pulse">
              <span>🛵</span>
              <span className="text-green-600 dark:text-green-400 font-medium">On the way!</span>
            </div>
          )}
        </div>

        {/* ETA Badge */}
        {!isCompleted && (
          <div className="absolute top-3 right-3 px-3 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-xl shadow-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Arriving by</p>
            <p className="text-lg font-bold text-orange-500">{estimatedTime}</p>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Order Progress */}
        <OrderProgress 
          status={order.status}
          orderId={order.id}
          estimatedTime={estimatedTime}
        />

        {/* Delivery Address */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm transition-colors duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">
              🏠
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivering to</p>
              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                {order.customer.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {order.customer.address}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                📞 {order.customer.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice / Bill Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
          {/* Invoice Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧾</span>
              <h3 className="font-semibold text-gray-900 dark:text-white">Invoice</h3>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors">
              <DownloadIcon />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>

          {/* Order Items */}
          <div className="p-4">
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">₹{item.price} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            {/* Bill Breakdown */}
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Item Total</span>
                <span className="text-gray-900 dark:text-white">₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span>🏷️</span> Discount
                  </span>
                  <span className="text-green-600 dark:text-green-400">-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span>🚚</span> Delivery
                </span>
                <span className={order.deliveryCharge === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}>
                  {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-xl font-bold text-orange-500">₹{order.total}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {order.paymentMethod === 'cod' ? '💵' : '📱'}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}
                </span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                order.paymentMethod === 'cod' 
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {order.paymentMethod === 'cod' ? 'Pay ₹' + order.total : 'Paid ✓'}
              </div>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm transition-colors duration-300">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span>🕐</span> Order Timeline
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Order Placed</span>
              <span className="text-gray-900 dark:text-white font-medium">{formatTime(order.createdAt)}</span>
            </div>
            {order.status !== 'new' && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Confirmed</span>
                <span className="text-gray-900 dark:text-white font-medium">{formatTime(new Date(new Date(order.createdAt).getTime() + 2 * 60000))}</span>
              </div>
            )}
            {(order.status === 'out-for-delivery' || order.status === 'completed') && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Out for Delivery</span>
                <span className="text-gray-900 dark:text-white font-medium">{formatTime(new Date(new Date(order.createdAt).getTime() + 20 * 60000))}</span>
              </div>
            )}
            {order.status === 'completed' && (
              <div className="flex items-center justify-between">
                <span className="text-green-600 dark:text-green-400 font-medium">Delivered</span>
                <span className="text-green-600 dark:text-green-400 font-medium">{formatTime(new Date(new Date(order.createdAt).getTime() + 35 * 60000))}</span>
              </div>
            )}
            {!isCompleted && (
              <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                <span className="text-orange-500 font-medium">Est. Delivery</span>
                <span className="text-orange-500 font-bold">{estimatedTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Need help with your order?
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onCallSupport}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-medium transition-colors"
            >
              <PhoneIcon />
              Call Support
            </button>
            <a
              href={`https://wa.me/919876543210?text=Hi, I need help with order ${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full text-sm font-medium transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
