import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import { calculateDistance } from '../data/mockData';
import {
  ArrowLeftIcon,
  LocationIcon,
  PhoneIcon,
  UserIcon,
  TagIcon,
  CashIcon,
  CreditCardIcon,
  CheckIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
} from './Icons';
import { LocationPicker } from './LocationPicker';
import UPIPayment from './UPIPayment';
import { cn } from '../utils/cn';

// Map pin icon
function MapPinIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

interface CheckoutProps {
  onBack: () => void;
  onOrderPlaced: (order: import('../types').Order) => void;
}

export function Checkout({ onBack, onOrderPlaced }: CheckoutProps) {
  const {
    state,
    subtotal,
    discount,
    deliveryCharge,
    total,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    setCustomer,
    setPaymentMethod,
    clearCart,
  } = useCart();

  const { setNotificationForOrder, showToast } = useNotifications();
  const { addOrder: addOrderToData, storeConfig } = useData();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showUPIPayment, setShowUPIPayment] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const { customer, paymentMethod, items } = state;

  // Validate distance when location changes
  useEffect(() => {
    if (customer.location) {
      const dist = calculateDistance(
        storeConfig.location.lat,
        storeConfig.location.lng,
        customer.location.lat,
        customer.location.lng
      );
      setDistance(dist);
      if (dist > storeConfig.maxDeliveryRadius) {
        setLocationError(`Sorry, we only deliver within ${storeConfig.maxDeliveryRadius} km. Your location is ${dist.toFixed(1)} km away.`);
      } else {
        setLocationError(null);
      }
    }
  }, [customer.location, storeConfig.location, storeConfig.maxDeliveryRadius]);

  const handleLocationSelect = (location: { lat: number; lng: number }, dist: number) => {
    setCustomer({
      ...customer,
      location,
    });
    setDistance(dist);
    setShowLocationPicker(false);
    
    // Clear location error if within range
    if (dist <= storeConfig.maxDeliveryRadius) {
      setLocationError(null);
      setFormErrors(prev => {
        const { location: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput);
    setCouponMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });
    if (result.success) {
      setCouponInput('');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponMessage(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customer.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!customer.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(customer.phone)) {
      errors.phone = 'Enter a valid 10-digit phone number';
    }

    if (!customer.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!customer.location) {
      errors.location = 'Please share your location for delivery';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if (locationError) return;

    // Generate order ID
    const orderId = `FP${Date.now().toString(36).toUpperCase()}`;

    // If UPI payment, show UPI payment screen first
    if (paymentMethod === 'upi') {
      setPendingOrderId(orderId);
      setShowUPIPayment(true);
      return;
    }

    // For COD, proceed directly
    await processOrder(orderId);
  };

  const processOrder = async (orderId: string) => {
    setIsPlacingOrder(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Create the full order object
    const newOrder: import('../types').Order = {
      id: orderId,
      items: items.map(item => ({ ...item })),
      subtotal,
      discount,
      deliveryCharge,
      total,
      status: 'new',
      paymentMethod,
      customer: { ...customer },
      createdAt: new Date(),
      distance: distance || 0,
      couponCode: state.couponCode || undefined,
    };

    // Save customer info for profile (using consistent key)
    try {
      const customerData = {
        name: customer.name,
        phone: customer.phone,
      };
      localStorage.setItem('flash-pizza-customer', JSON.stringify(customerData));
      localStorage.setItem('flashpizza_customer', JSON.stringify(customerData));
    } catch {
      // Ignore localStorage errors
    }
    
    // Add order to shared DataContext (this syncs with admin panel)
    addOrderToData(newOrder);

    // Show toast notification
    showToast('success', `Order #${orderId} placed successfully! 🍕`);

    // Add to notification center
    setNotificationForOrder(
      orderId,
      'Order Confirmed!',
      `Your order #${orderId} has been placed. Estimated delivery: 30-40 mins.`
    );

    // In production, this would send to backend
    console.log('Order placed:', newOrder);

    clearCart();
    setIsPlacingOrder(false);
    onOrderPlaced(newOrder);
  };

  const handleUPIPaymentComplete = async () => {
    if (pendingOrderId) {
      await processOrder(pendingOrderId);
      setShowUPIPayment(false);
      setPendingOrderId(null);
    }
  };

  const handleUPIPaymentCancel = () => {
    setShowUPIPayment(false);
    setPendingOrderId(null);
  };

  const canProceed = customer.location && !locationError && items.length > 0;

  // Calculate how much more is needed for free delivery
  const amountForFreeDelivery = storeConfig.freeDeliveryThreshold - (subtotal - discount);

  // Show UPI Payment screen
  if (showUPIPayment && pendingOrderId) {
    return (
      <UPIPayment
        amount={total}
        orderId={pendingOrderId}
        onPaymentComplete={handleUPIPaymentComplete}
        onCancel={handleUPIPaymentCancel}
      />
    );
  }

  // Show location picker
  if (showLocationPicker) {
    return (
      <LocationPicker
        onLocationSelect={handleLocationSelect}
        onClose={() => setShowLocationPicker(false)}
        initialLocation={customer.location}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon size={24} className="text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Checkout</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Cart Items */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Your Order</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <MinusIcon size={12} />
                  </button>
                  <span className="w-5 text-center font-medium text-gray-900 dark:text-white text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    <PlusIcon size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coupon Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TagIcon size={20} className="text-orange-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Apply Coupon</h2>
          </div>

          {state.couponCode ? (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckIcon size={18} className="text-green-600 flex-shrink-0" />
                <span className="font-medium text-green-700 dark:text-green-400 text-sm">
                  {state.couponCode} applied - ₹{discount} off
                </span>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="p-1.5 rounded-full hover:bg-green-100 dark:hover:bg-green-800 transition-colors flex-shrink-0"
              >
                <CloseIcon size={16} className="text-green-600" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className={cn(
                    'w-full px-4 py-3 pr-20 rounded-xl',
                    'bg-gray-50 dark:bg-gray-700',
                    'border border-gray-200 dark:border-gray-600',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
                    'transition-all text-sm'
                  )}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponInput.trim()}
                  className={cn(
                    'absolute right-1.5 top-1/2 -translate-y-1/2',
                    'px-4 py-2 rounded-lg',
                    'font-semibold text-sm transition-colors',
                    couponInput.trim()
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                  )}
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p
                  className={cn(
                    'text-sm',
                    couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'
                  )}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Customer Details */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Delivery Details</h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <UserIcon size={16} />
                Your Name
              </label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Enter your name"
                className={cn(
                  'w-full px-4 py-3 rounded-xl',
                  'bg-gray-50 dark:bg-gray-700',
                  'border',
                  formErrors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600',
                  'text-gray-900 dark:text-white',
                  'placeholder-gray-400 dark:placeholder-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
                  'transition-all text-sm'
                )}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <PhoneIcon size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="10-digit mobile number"
                className={cn(
                  'w-full px-4 py-3 rounded-xl',
                  'bg-gray-50 dark:bg-gray-700',
                  'border',
                  formErrors.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-600',
                  'text-gray-900 dark:text-white',
                  'placeholder-gray-400 dark:placeholder-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
                  'transition-all text-sm'
                )}
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <LocationIcon size={16} />
                Delivery Address
              </label>
              <textarea
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                placeholder="Full address with landmarks"
                rows={2}
                className={cn(
                  'w-full px-4 py-3 rounded-xl',
                  'bg-gray-50 dark:bg-gray-700',
                  'border',
                  formErrors.address ? 'border-red-500' : 'border-gray-200 dark:border-gray-600',
                  'text-gray-900 dark:text-white',
                  'placeholder-gray-400 dark:placeholder-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
                  'transition-all resize-none text-sm'
                )}
              />
              {formErrors.address && (
                <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
              )}
            </div>

            {/* Location with Map */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <MapPinIcon size={16} />
                Pin Your Location
              </label>
              <button
                onClick={() => setShowLocationPicker(true)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl',
                  'border-2',
                  customer.location
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : formErrors.location
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700',
                  'transition-all text-left'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    customer.location
                      ? 'bg-green-100 dark:bg-green-900/40'
                      : formErrors.location
                        ? 'bg-red-100 dark:bg-red-900/40'
                        : 'bg-white dark:bg-gray-600'
                  )}
                >
                  <MapPinIcon
                    size={24}
                    className={cn(
                      customer.location
                        ? 'text-green-600'
                        : formErrors.location
                          ? 'text-red-500'
                          : 'text-gray-400'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {customer.location ? (
                    <>
                      <p className="font-medium text-green-700 dark:text-green-400 text-sm">
                        Location Selected ✓
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        {distance?.toFixed(1)} km from store • Tap to change
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        className={cn(
                          'font-medium text-sm',
                          formErrors.location
                            ? 'text-red-600'
                            : 'text-gray-700 dark:text-gray-300'
                        )}
                      >
                        Tap to open map
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Select your exact delivery location
                      </p>
                    </>
                  )}
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {locationError && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                    <CloseIcon size={16} className="flex-shrink-0 mt-0.5" />
                    {locationError}
                  </p>
                </div>
              )}
              {formErrors.location && !locationError && (
                <p className="mt-1 text-sm text-red-500">{formErrors.location}</p>
              )}
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('upi')}
              className={cn(
                'flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
                paymentMethod === 'upi'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              )}
            >
              <CreditCardIcon
                size={20}
                className={cn(
                  paymentMethod === 'upi'
                    ? 'text-orange-600'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              />
              <span
                className={cn(
                  'font-medium text-sm',
                  paymentMethod === 'upi'
                    ? 'text-orange-700 dark:text-orange-400'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                UPI
              </span>
            </button>

            <button
              onClick={() => setPaymentMethod('cod')}
              className={cn(
                'flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
                paymentMethod === 'cod'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              )}
            >
              <CashIcon
                size={20}
                className={cn(
                  paymentMethod === 'cod'
                    ? 'text-orange-600'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              />
              <span
                className={cn(
                  'font-medium text-sm',
                  paymentMethod === 'cod'
                    ? 'text-orange-700 dark:text-orange-400'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                Cash
              </span>
            </button>
          </div>
        </section>

        {/* Bill Summary */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Bill Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Items Total</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <TruckIcon size={14} />
                Delivery
              </span>
              <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
            {deliveryCharge > 0 && amountForFreeDelivery > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add ₹{amountForFreeDelivery.toFixed(0)} more for free delivery
              </p>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
            <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white">
              <span>To Pay</span>
              <span>₹{total}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handlePlaceOrder}
            disabled={!canProceed || isPlacingOrder}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-lg',
              'transition-all duration-300',
              'flex items-center justify-center gap-2',
              canProceed && !isPlacingOrder
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.98]'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            )}
          >
            {isPlacingOrder ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Placing Order...
              </>
            ) : (
              <>{paymentMethod === 'cod' ? 'Place Order' : 'Pay ₹' + total}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
