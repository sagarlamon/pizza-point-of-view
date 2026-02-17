import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import { MenuItem, Coupon, Category } from '../types';
import { 
  ChevronLeftIcon, 
  CloseIcon, 
  EditIcon, 
  TrashIcon,
  PlusIcon 
} from './Icons';

type AdminTab = 'orders' | 'menu' | 'coupons' | 'settings';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  
  const { 
    menuItems, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    orders,
    updateOrderStatus,
    storeConfig,
    updateStoreConfig 
  } = useData();
  
  const { showToast } = useNotifications();

  // Menu Item Modal State
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'veg' as Category,
    isAvailable: true,
  });

  // Coupon Modal State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage' as 'flat' | 'percentage',
    value: '',
    minOrder: '',
    maxDiscount: '',
    expiresAt: '',
    isActive: true,
  });

  // Delete Confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'menu' | 'coupon'; id: string } | null>(null);

  // Check for new orders
  useEffect(() => {
    if (orders.length > previousOrderCount && previousOrderCount > 0) {
      // New order received
      playNotificationSound();
      showToast('info', `New Order #${orders[0]?.id.slice(-6)} - ₹${orders[0]?.total}`);
    }
    setPreviousOrderCount(orders.length);
  }, [orders.length, previousOrderCount, showToast, orders]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.value = 1000;
        setTimeout(() => {
          oscillator.frequency.value = 1200;
          setTimeout(() => oscillator.stop(), 150);
        }, 150);
      }, 150);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  // Menu Item Functions
  const openAddMenuModal = () => {
    setEditingMenuItem(null);
    setMenuForm({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'veg',
      isAvailable: true,
    });
    setShowMenuModal(true);
  };

  const openEditMenuModal = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      isAvailable: item.isAvailable,
    });
    setShowMenuModal(true);
  };

  const handleSaveMenuItem = () => {
    if (!menuForm.name || !menuForm.price) {
      alert('Please fill in name and price');
      return;
    }

    const itemData: MenuItem = {
      id: editingMenuItem?.id || `item_${Date.now()}`,
      name: menuForm.name,
      description: menuForm.description,
      price: parseFloat(menuForm.price),
      image: menuForm.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
      category: menuForm.category,
      isAvailable: menuForm.isAvailable,
    };

    if (editingMenuItem) {
      updateMenuItem(editingMenuItem.id, itemData);
      showToast('success', `${itemData.name} has been updated`);
    } else {
      addMenuItem(itemData);
      showToast('success', `${itemData.name} has been added to the menu`);
    }

    setShowMenuModal(false);
  };

  const handleDeleteMenuItem = (id: string) => {
    const item = menuItems.find(i => i.id === id);
    deleteMenuItem(id);
    setDeleteConfirm(null);
    showToast('success', `${item?.name} has been removed from the menu`);
  };

  // Coupon Functions
  const openAddCouponModal = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      type: 'percentage',
      value: '',
      minOrder: '',
      maxDiscount: '',
      expiresAt: '',
      isActive: true,
    });
    setShowCouponModal(true);
  };

  const openEditCouponModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrder: coupon.minOrder.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || '',
      expiresAt: new Date(coupon.expiresAt).toISOString().split('T')[0],
      isActive: coupon.isActive,
    });
    setShowCouponModal(true);
  };

  const handleSaveCoupon = () => {
    if (!couponForm.code || !couponForm.value || !couponForm.minOrder) {
      alert('Please fill in all required fields');
      return;
    }

    const couponData: Coupon = {
      code: couponForm.code.toUpperCase(),
      type: couponForm.type,
      value: parseFloat(couponForm.value),
      minOrder: parseFloat(couponForm.minOrder),
      maxDiscount: couponForm.maxDiscount ? parseFloat(couponForm.maxDiscount) : undefined,
      expiresAt: new Date(couponForm.expiresAt || '2025-12-31'),
      isActive: couponForm.isActive,
    };

    if (editingCoupon) {
      updateCoupon(editingCoupon.code, couponData);
      showToast('success', `${couponData.code} has been updated`);
    } else {
      addCoupon(couponData);
      showToast('success', `${couponData.code} has been created`);
    }

    setShowCouponModal(false);
  };

  const handleDeleteCoupon = (code: string) => {
    deleteCoupon(code);
    setDeleteConfirm(null);
    showToast('success', `${code} has been removed`);
  };

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    name: storeConfig.name,
    phone: storeConfig.phone,
    upiId: storeConfig.upiId,
    maxDeliveryRadius: storeConfig.maxDeliveryRadius.toString(),
    freeDeliveryThreshold: storeConfig.freeDeliveryThreshold.toString(),
    deliveryCharge: storeConfig.deliveryCharge.toString(),
    offerText: storeConfig.offerText,
    isOpen: storeConfig.isOpen,
  });

  useEffect(() => {
    setSettingsForm({
      name: storeConfig.name,
      phone: storeConfig.phone,
      upiId: storeConfig.upiId,
      maxDeliveryRadius: storeConfig.maxDeliveryRadius.toString(),
      freeDeliveryThreshold: storeConfig.freeDeliveryThreshold.toString(),
      deliveryCharge: storeConfig.deliveryCharge.toString(),
      offerText: storeConfig.offerText,
      isOpen: storeConfig.isOpen,
    });
  }, [storeConfig]);

  const handleSaveSettings = () => {
    updateStoreConfig({
      name: settingsForm.name,
      phone: settingsForm.phone,
      upiId: settingsForm.upiId,
      maxDeliveryRadius: parseFloat(settingsForm.maxDeliveryRadius),
      freeDeliveryThreshold: parseFloat(settingsForm.freeDeliveryThreshold),
      deliveryCharge: parseFloat(settingsForm.deliveryCharge),
      offerText: settingsForm.offerText,
      isOpen: settingsForm.isOpen,
    });
    showToast('success', 'Store settings have been updated');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'preparing': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'out-for-delivery': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getNextStatus = (status: string) => {
    switch (status) {
      case 'new': return 'preparing';
      case 'preparing': return 'out-for-delivery';
      case 'out-for-delivery': return 'completed';
      default: return null;
    }
  };

  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'orders', label: 'Orders', count: orders.filter(o => o.status === 'new').length },
    { id: 'menu', label: 'Menu', count: menuItems.length },
    { id: 'coupons', label: 'Coupons', count: coupons.length },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${storeConfig.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {storeConfig.isOpen ? '🟢 Open' : '🔴 Closed'}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-100 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium relative ${
                activeTab === tab.id
                  ? 'text-orange-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="p-4 pb-20">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
              </div>
            ) : (
              orders.map(order => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">#{order.id}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('-', ' ')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mb-3">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-orange-500">₹{order.total}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {order.paymentMethod === 'upi' ? '💳 UPI Paid' : '💵 Cash on Delivery'}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-3">
                    <p className="font-medium text-gray-900 dark:text-white">{order.customer.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.phone}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.address}</p>
                    <p className="text-xs text-gray-400 mt-1">📍 {order.distance.toFixed(1)} km away</p>
                  </div>

                  <div className="flex gap-2">
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status) as typeof order.status)}
                        className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                      >
                        {order.status === 'new' && '👨‍🍳 Start Preparing'}
                        {order.status === 'preparing' && '🚴 Out for Delivery'}
                        {order.status === 'out-for-delivery' && '✅ Mark Completed'}
                      </button>
                    )}
                    {order.status === 'new' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="px-4 py-2.5 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={openAddMenuModal}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add New Item
            </button>

            {menuItems.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                        <p className="text-orange-500 font-bold mt-1">₹{item.price}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.category === 'veg' ? 'bg-green-100 text-green-700' :
                        item.category === 'non-veg' ? 'bg-red-100 text-red-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Available</span>
                    <button
                      onClick={() => updateMenuItem(item.id, { isAvailable: !item.isAvailable })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        item.isAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        item.isAvailable ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditMenuModal(item)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'menu', id: item.id })}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <button
              onClick={openAddCouponModal}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add New Coupon
            </button>

            {coupons.map(coupon => (
              <div
                key={coupon.code}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg font-mono font-bold">
                      {coupon.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                    <span className="ml-1 text-gray-900 dark:text-white font-medium">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Min Order:</span>
                    <span className="ml-1 text-gray-900 dark:text-white font-medium">₹{coupon.minOrder}</span>
                  </div>
                  {coupon.maxDiscount && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Max Discount:</span>
                      <span className="ml-1 text-gray-900 dark:text-white font-medium">₹{coupon.maxDiscount}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Expires:</span>
                    <span className="ml-1 text-gray-900 dark:text-white font-medium">
                      {new Date(coupon.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
                    <button
                      onClick={() => updateCoupon(coupon.code, { isActive: !coupon.isActive })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        coupon.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        coupon.isActive ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditCouponModal(coupon)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'coupon', id: coupon.code })}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Store Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={e => setSettingsForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={settingsForm.phone}
                    onChange={e => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={settingsForm.upiId}
                    onChange={e => setSettingsForm(prev => ({ ...prev, upiId: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Offer Banner Text</label>
                  <input
                    type="text"
                    value={settingsForm.offerText}
                    onChange={e => setSettingsForm(prev => ({ ...prev, offerText: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Delivery Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Delivery Radius (km)</label>
                  <input
                    type="number"
                    value={settingsForm.maxDeliveryRadius}
                    onChange={e => setSettingsForm(prev => ({ ...prev, maxDeliveryRadius: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Free Delivery Above (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.freeDeliveryThreshold}
                    onChange={e => setSettingsForm(prev => ({ ...prev, freeDeliveryThreshold: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Delivery Charge (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryCharge}
                    onChange={e => setSettingsForm(prev => ({ ...prev, deliveryCharge: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Store Status</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle to accept/reject new orders</p>
                </div>
                <button
                  onClick={() => setSettingsForm(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                  className={`w-14 h-7 rounded-full transition-colors relative ${
                    settingsForm.isOpen ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settingsForm.isOpen ? 'left-8' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              Save Settings
            </button>
          </div>
        )}
      </main>

      {/* Menu Item Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingMenuItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={() => setShowMenuModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <CloseIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={menuForm.name}
                  onChange={e => setMenuForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Margherita Pizza"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={menuForm.description}
                  onChange={e => setMenuForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the item..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  value={menuForm.price}
                  onChange={e => setMenuForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="199"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Image URL</label>
                <input
                  type="url"
                  value={menuForm.image}
                  onChange={e => setMenuForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                />
                {menuForm.image && (
                  <img src={menuForm.image} alt="Preview" className="mt-2 w-20 h-20 rounded-xl object-cover" />
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Category</label>
                <div className="flex gap-2">
                  {(['veg', 'non-veg', 'combos'] as Category[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setMenuForm(prev => ({ ...prev, category: cat }))}
                      className={`flex-1 py-2 rounded-xl font-medium text-sm transition-colors ${
                        menuForm.category === cat
                          ? cat === 'veg' ? 'bg-green-500 text-white' :
                            cat === 'non-veg' ? 'bg-red-500 text-white' :
                            'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Available for order</span>
                <button
                  onClick={() => setMenuForm(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    menuForm.isAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    menuForm.isAvailable ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>

              <button
                onClick={handleSaveMenuItem}
                className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                {editingMenuItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h2>
              <button
                onClick={() => setShowCouponModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <CloseIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={e => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. FLASH20"
                  disabled={!!editingCoupon}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500 font-mono uppercase disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Discount Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCouponForm(prev => ({ ...prev, type: 'percentage' }))}
                    className={`flex-1 py-2 rounded-xl font-medium text-sm transition-colors ${
                      couponForm.type === 'percentage'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Percentage %
                  </button>
                  <button
                    onClick={() => setCouponForm(prev => ({ ...prev, type: 'flat' }))}
                    className={`flex-1 py-2 rounded-xl font-medium text-sm transition-colors ${
                      couponForm.type === 'flat'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Flat ₹
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Discount Value {couponForm.type === 'percentage' ? '(%)' : '(₹)'} *
                </label>
                <input
                  type="number"
                  value={couponForm.value}
                  onChange={e => setCouponForm(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={couponForm.type === 'percentage' ? '20' : '50'}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Minimum Order (₹) *</label>
                <input
                  type="number"
                  value={couponForm.minOrder}
                  onChange={e => setCouponForm(prev => ({ ...prev, minOrder: e.target.value }))}
                  placeholder="300"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {couponForm.type === 'percentage' && (
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Maximum Discount (₹)</label>
                  <input
                    type="number"
                    value={couponForm.maxDiscount}
                    onChange={e => setCouponForm(prev => ({ ...prev, maxDiscount: e.target.value }))}
                    placeholder="150"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={couponForm.expiresAt}
                  onChange={e => setCouponForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Active</span>
                <button
                  onClick={() => setCouponForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    couponForm.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    couponForm.isActive ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>

              <button
                onClick={handleSaveCoupon}
                className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                {editingCoupon ? 'Update Coupon' : 'Add Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Delete</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this {deleteConfirm.type === 'menu' ? 'menu item' : 'coupon'}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'menu') {
                    handleDeleteMenuItem(deleteConfirm.id);
                  } else {
                    handleDeleteCoupon(deleteConfirm.id);
                  }
                }}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
