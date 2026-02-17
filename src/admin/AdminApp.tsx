import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import { Order, MenuItem, Coupon, Banner } from '../types';

// ============== ALARM SOUND SYSTEM ==============
// Continuous alarm that plays until admin takes action
class OrderAlarm {
  private audioContext: AudioContext | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isPlaying = false;

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    // Play immediately
    this.playRing();
    
    // Then repeat every 3 seconds until stopped
    this.intervalId = setInterval(() => {
      this.playRing();
    }, 3000);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private playRing() {
    try {
      this.audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Play a series of beeps like a phone ring
      const playBeep = (startTime: number, frequency: number) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.4, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.15);
      };

      const now = this.audioContext.currentTime;
      
      // Ring pattern: high-low-high (like a phone)
      playBeep(now, 800);
      playBeep(now + 0.2, 600);
      playBeep(now + 0.4, 800);
      playBeep(now + 0.6, 600);
      playBeep(now + 0.8, 800);
      
    } catch (e) {
      console.log('Sound not supported');
    }
  }
}

// Single global alarm instance
const orderAlarm = new OrderAlarm();

// Database Status Component
const DatabaseStatus: React.FC = () => {
  const { isUsingFirebase } = useData();
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <>
      <button 
        onClick={() => !isUsingFirebase && setShowHelp(true)}
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      >
        <span className={`w-2 h-2 rounded-full animate-pulse ${isUsingFirebase ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <span className={`text-xs ${isUsingFirebase ? 'text-green-600' : 'text-yellow-600'}`}>
          {isUsingFirebase ? '🔥 Firebase Connected' : '💾 Local Mode (tap for help)'}
        </span>
      </button>
      
      {/* Help Modal for Firebase Setup */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">🔥 Setup Firebase (Free)</h3>
              <button onClick={() => setShowHelp(false)} className="text-gray-500 text-xl">✕</button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800">
                  <strong>Currently using Local Storage</strong><br />
                  Data is saved only on this device. To sync across all devices, setup Firebase.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Quick Setup (15 min):</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Firebase Console</a></li>
                  <li>Create a new project</li>
                  <li>Enable Realtime Database</li>
                  <li>Copy your credentials</li>
                  <li>Create <code className="bg-gray-100 px-1 rounded">.env</code> file with credentials</li>
                  <li>Rebuild and deploy!</li>
                </ol>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-xs">
                  <strong>✅ Firebase Free Tier Includes:</strong><br />
                  • 1GB storage (you'll use ~5MB)<br />
                  • 10GB/month downloads<br />
                  • 100 simultaneous connections<br />
                  • Unlimited reads/writes
                </p>
              </div>
              
              <p className="text-gray-500 text-xs">
                See <code className="bg-gray-100 px-1 rounded">FIREBASE_SETUP_GUIDE.md</code> for detailed instructions.
              </p>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AdminApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'coupons' | 'banners' | 'settings'>('orders');

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('flashpizza_admin_auth', 'true');
    } else {
      alert('Invalid password');
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('flashpizza_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🍕</div>
            <h1 className="text-2xl font-bold text-gray-800">Flash Pizza Admin</h1>
            <p className="text-gray-500 mt-2">Enter password to continue</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍕</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Flash Pizza Admin</h1>
              <DatabaseStatus />
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('flashpizza_admin_auth');
              setIsAuthenticated(false);
            }}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {(['orders', 'menu', 'coupons', 'banners', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors relative ${
                  activeTab === tab
                    ? 'text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'menu' && <MenuTab />}
        {activeTab === 'coupons' && <CouponsTab />}
        {activeTab === 'banners' && <BannersTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

// ============== ORDERS TAB ==============
const OrdersTab: React.FC = () => {
  const { orders, updateOrderStatus } = useData();
  const { showToast } = useNotifications();
  const alarmActiveRef = useRef(false);
  
  // Check for new orders and manage alarm
  useEffect(() => {
    const newOrders = orders.filter(o => o.status === 'new');
    
    if (newOrders.length > 0 && !alarmActiveRef.current) {
      // Start alarm for new orders
      alarmActiveRef.current = true;
      orderAlarm.start();
    } else if (newOrders.length === 0 && alarmActiveRef.current) {
      // Stop alarm when no new orders
      alarmActiveRef.current = false;
      orderAlarm.stop();
    }
    
    // Cleanup on unmount
    return () => {
      orderAlarm.stop();
    };
  }, [orders]);

  // ============ ADMIN ACTION HANDLERS ============
  // Notifications are ONLY created here via explicit admin actions
  // NO notifications from polling or effects

  const handleMarkPreparing = (order: Order) => {
    updateOrderStatus(order.id, 'preparing');
    showToast('success', `Order #${order.id.slice(-6)} marked as Preparing`);
    // Stop alarm since we took action on this order
    // Alarm will restart if there are other new orders (handled by useEffect)
  };

  const handleMarkOutForDelivery = (order: Order) => {
    updateOrderStatus(order.id, 'out-for-delivery');
    showToast('success', `Order #${order.id.slice(-6)} is Out for Delivery`);
  };

  const handleMarkCompleted = (order: Order) => {
    updateOrderStatus(order.id, 'completed');
    showToast('success', `Order #${order.id.slice(-6)} completed`);
  };

  const handleCancelOrder = (order: Order) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      updateOrderStatus(order.id, 'cancelled');
      showToast('info', `Order #${order.id.slice(-6)} has been cancelled`);
      // Stop alarm since we took action
      orderAlarm.stop();
      alarmActiveRef.current = false;
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-yellow-100 text-yellow-700';
      case 'out-for-delivery': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'new': return 'New';
      case 'preparing': return 'Preparing';
      case 'out-for-delivery': return 'Out for Delivery';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Orders */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Active Orders ({activeOrders.length})
        </h2>
        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            No active orders
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.paymentMethod === 'upi' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {order.paymentMethod === 'upi' ? '💳 UPI' : '💵 COD'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">₹{order.total}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 bg-gray-50">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="flex-1 text-sm text-gray-700">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 border-t">
                  <p className="text-sm text-gray-800 font-medium">{order.customer.name}</p>
                  <p className="text-sm text-gray-500">{order.customer.phone}</p>
                  <p className="text-sm text-gray-500">{order.customer.address}</p>
                </div>

                {/* Actions */}
                <div className="p-4 border-t bg-gray-50 flex gap-3">
                  {order.status === 'new' && (
                    <>
                      <button
                        onClick={() => handleMarkPreparing(order)}
                        className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                      >
                        Start Preparing
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleMarkOutForDelivery(order)}
                      className="flex-1 bg-purple-500 text-white py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
                    >
                      Out for Delivery
                    </button>
                  )}
                  {order.status === 'out-for-delivery' && (
                    <button
                      onClick={() => handleMarkCompleted(order)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Completed Orders ({completedOrders.length})
          </h2>
          <div className="space-y-3">
            {completedOrders.slice(0, 10).map(order => (
              <div key={order.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{order.customer.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">₹{order.total}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Orders */}
      {cancelledOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Cancelled Orders ({cancelledOrders.length})
          </h2>
          <div className="space-y-3">
            {cancelledOrders.slice(0, 10).map(order => (
              <div key={order.id} className="bg-white rounded-xl p-4 flex items-center justify-between border-l-4 border-red-400">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Cancelled
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{order.customer.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 line-through">₹{order.total}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============== MENU TAB ==============
const MenuTab: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useData();
  const { showToast } = useNotifications();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'veg' as MenuItem['category'],
    isAvailable: true,
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'veg',
      isAvailable: true,
    });
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      isAvailable: item.isAvailable,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      showToast('error', 'Name and price are required');
      return;
    }

    const itemData: Omit<MenuItem, 'id'> = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',
      category: formData.category,
      isAvailable: formData.isAvailable,
    };

    if (editingItem) {
      updateMenuItem(editingItem.id, itemData);
      showToast('success', 'Item updated');
    } else {
      addMenuItem({ ...itemData, id: `item_${Date.now()}` });
      showToast('success', 'Item added');
    }

    setShowModal(false);
  };

  const handleDelete = (item: MenuItem) => {
    if (confirm(`Delete "${item.name}"?`)) {
      deleteMenuItem(item.id);
      showToast('success', 'Item deleted');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Menu Items ({menuItems.length})</h2>
        <button
          onClick={openAddModal}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          + Add Item
        </button>
      </div>

      <div className="space-y-3">
        {menuItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl p-4 flex items-center gap-4">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.category === 'veg' ? 'bg-green-100 text-green-700' :
                  item.category === 'non-veg' ? 'bg-red-100 text-red-700' :
                  item.category === 'beverages' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {item.category}
                </span>
                {!item.isAvailable && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    Unavailable
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{item.description}</p>
              <p className="font-bold text-orange-600 mt-1">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(item)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(item)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {editingItem ? 'Edit Item' : 'Add Item'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuItem['category'] })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="beverages">Beverages</option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                  <option value="combos">Combos</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isAvailable" className="text-sm text-gray-700">Available</label>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                {editingItem ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============== COUPONS TAB ==============
const CouponsTab: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useData();
  const { showToast } = useNotifications();
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as Coupon['type'],
    value: '',
    minOrder: '',
    maxDiscount: '',
    expiresAt: '',
    isActive: true,
  });

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minOrder: '',
      maxDiscount: '',
      expiresAt: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrder: coupon.minOrder.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.value) {
      showToast('error', 'Code and discount are required');
      return;
    }

    const couponData: Coupon = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: parseFloat(formData.value),
      minOrder: parseFloat(formData.minOrder) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: formData.isActive,
    };

    if (editingCoupon) {
      updateCoupon(editingCoupon.code, couponData);
      showToast('success', 'Coupon updated');
    } else {
      addCoupon(couponData);
      showToast('success', 'Coupon added');
    }

    setShowModal(false);
  };

  const handleDelete = (coupon: Coupon) => {
    if (confirm(`Delete coupon "${coupon.code}"?`)) {
      deleteCoupon(coupon.code);
      showToast('success', 'Coupon deleted');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Coupons ({coupons.length})</h2>
        <button
          onClick={openAddModal}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          + Add Coupon
        </button>
      </div>

      <div className="space-y-3">
        {coupons.map(coupon => (
          <div key={coupon.code} className="bg-white rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">{coupon.code}</span>
                {!coupon.isActive && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {coupon.type === 'percentage' 
                  ? `${coupon.value}% off` 
                  : `₹${coupon.value} off`}
                {coupon.minOrder > 0 && ` (Min: ₹${coupon.minOrder})`}
                {coupon.maxDiscount && ` (Max: ₹${coupon.maxDiscount})`}
              </p>
              {coupon.expiresAt && (
                <p className="text-xs text-gray-400">
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(coupon)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(coupon)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            No coupons yet
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  disabled={!!editingCoupon}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Coupon['type'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value * ({formData.type === 'percentage' ? '%' : '₹'})
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
                <input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              {formData.type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires On</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                {editingCoupon ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============== BANNERS TAB ==============
const BannersTab: React.FC = () => {
  const { storeConfig, updateStoreConfig } = useData();
  const { showToast } = useNotifications();
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    subtitle: '',
    isActive: true,
  });

  const banners = storeConfig.banners || [];

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      image: '',
      title: '',
      subtitle: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      image: banner.image,
      title: banner.title,
      subtitle: banner.subtitle || '',
      isActive: banner.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.image) {
      showToast('error', 'Banner image URL is required');
      return;
    }

    const newBanner: Banner = {
      id: editingBanner?.id || `banner_${Date.now()}`,
      image: formData.image,
      title: formData.title,
      subtitle: formData.subtitle || undefined,
      isActive: formData.isActive,
      order: editingBanner?.order || banners.length,
    };

    let updatedBanners: Banner[];
    if (editingBanner) {
      updatedBanners = banners.map(b => b.id === editingBanner.id ? newBanner : b);
      showToast('success', '✅ Banner updated');
    } else {
      updatedBanners = [...banners, newBanner];
      showToast('success', '✅ Banner added');
    }

    updateStoreConfig({ banners: updatedBanners });
    setShowModal(false);
  };

  const handleDelete = (banner: Banner) => {
    if (confirm(`Delete this banner?`)) {
      const updatedBanners = banners.filter(b => b.id !== banner.id);
      updateStoreConfig({ banners: updatedBanners });
      showToast('success', 'Banner deleted');
    }
  };

  const handleToggleActive = (banner: Banner) => {
    const updatedBanners = banners.map(b => 
      b.id === banner.id ? { ...b, isActive: !b.isActive } : b
    );
    updateStoreConfig({ banners: updatedBanners });
    showToast('success', banner.isActive ? 'Banner disabled' : 'Banner enabled');
  };

  const handleReorder = (bannerId: string, direction: 'up' | 'down') => {
    const index = banners.findIndex(b => b.id === bannerId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;
    
    const updatedBanners = [...banners];
    [updatedBanners[index], updatedBanners[newIndex]] = [updatedBanners[newIndex], updatedBanners[index]];
    
    // Update order property
    const reorderedBanners = updatedBanners.map((b, i) => ({ ...b, order: i }));
    updateStoreConfig({ banners: reorderedBanners });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Promotional Banners</h2>
          <p className="text-sm text-gray-500">Add and manage banners that appear on the customer home page</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          + Add Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-gray-500 mb-4">No banners yet. Add your first promotional banner!</p>
          <button
            onClick={openAddModal}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium"
          >
            Add Banner
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.sort((a, b) => a.order - b.order).map((banner, index) => (
            <div key={banner.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="flex">
                {/* Banner Image Preview */}
                <div className="w-40 h-24 flex-shrink-0 relative">
                  <img
                    src={banner.image}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                  />
                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Disabled</span>
                    </div>
                  )}
                </div>
                
                {/* Banner Info */}
                <div className="flex-1 p-3 flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <h3 className="font-medium text-gray-800">
                        {banner.title || 'Untitled Banner'}
                      </h3>
                      {banner.isActive && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    {banner.subtitle && (
                      <p className="text-sm text-gray-500 mt-1">{banner.subtitle}</p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Reorder buttons */}
                    <button
                      onClick={() => handleReorder(banner.id, 'up')}
                      disabled={index === 0}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ⬆️
                    </button>
                    <button
                      onClick={() => handleReorder(banner.id, 'down')}
                      disabled={index === banners.length - 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ⬇️
                    </button>
                    
                    {/* Toggle Active */}
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`p-2 rounded-lg ${banner.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      {banner.isActive ? '👁️' : '👁️‍🗨️'}
                    </button>
                    
                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(banner)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      ✏️
                    </button>
                    
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(banner)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-800 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Recommended image size: 1200 x 400 pixels</li>
          <li>• Use high-quality images for better appearance</li>
          <li>• Banners rotate automatically every 4 seconds</li>
          <li>• Drag to reorder banners using the ⬆️⬇️ buttons</li>
        </ul>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {editingBanner ? 'Edit Banner' : 'Add Banner'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                {formData.image && (
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Offer Text)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., 🔥 20% OFF on all pizzas!"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Optional)</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g., Use code FLASH20 at checkout"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bannerActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="bannerActive" className="text-sm text-gray-700">Active (show on customer page)</label>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                {editingBanner ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============== SETTINGS TAB ==============
const SettingsTab: React.FC = () => {
  const { storeConfig, updateStoreConfig } = useData();
  const { showToast } = useNotifications();
  const [formData, setFormData] = useState({
    name: storeConfig.name,
    phone: storeConfig.phone,
    upiId: storeConfig.upiId,
    offerText: storeConfig.offerText,
    bannerImage: storeConfig.bannerImage,
    maxDeliveryRadius: storeConfig.maxDeliveryRadius.toString(),
    freeDeliveryThreshold: storeConfig.freeDeliveryThreshold.toString(),
    deliveryCharge: storeConfig.deliveryCharge.toString(),
    isOpen: storeConfig.isOpen,
  });

  // Update form when storeConfig changes
  useEffect(() => {
    setFormData({
      name: storeConfig.name,
      phone: storeConfig.phone,
      upiId: storeConfig.upiId,
      offerText: storeConfig.offerText,
      bannerImage: storeConfig.bannerImage,
      maxDeliveryRadius: storeConfig.maxDeliveryRadius.toString(),
      freeDeliveryThreshold: storeConfig.freeDeliveryThreshold.toString(),
      deliveryCharge: storeConfig.deliveryCharge.toString(),
      isOpen: storeConfig.isOpen,
    });
  }, [storeConfig]);

  const handleSave = () => {
    updateStoreConfig({
      name: formData.name,
      phone: formData.phone,
      upiId: formData.upiId,
      offerText: formData.offerText,
      bannerImage: formData.bannerImage,
      maxDeliveryRadius: parseFloat(formData.maxDeliveryRadius),
      freeDeliveryThreshold: parseFloat(formData.freeDeliveryThreshold),
      deliveryCharge: parseFloat(formData.deliveryCharge),
      isOpen: formData.isOpen,
    });
    showToast('success', '✅ Settings saved successfully!');
    
    // Play a success sound
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log('Sound not supported');
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Store Settings</h2>

      <div className="bg-white rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
          <input
            type="text"
            value={formData.upiId}
            onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Offer Text</label>
          <input
            type="text"
            value={formData.offerText}
            onChange={(e) => setFormData({ ...formData, offerText: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
          <input
            type="text"
            value={formData.bannerImage}
            onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 border rounded-lg"
          />
          {formData.bannerImage && (
            <img 
              src={formData.bannerImage} 
              alt="Banner preview" 
              className="mt-2 w-full h-24 object-cover rounded-lg"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (km)</label>
            <input
              type="number"
              value={formData.maxDeliveryRadius}
              onChange={(e) => setFormData({ ...formData, maxDeliveryRadius: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (₹)</label>
            <input
              type="number"
              value={formData.deliveryCharge}
              onChange={(e) => setFormData({ ...formData, deliveryCharge: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Order for Free Delivery (₹)</label>
          <input
            type="number"
            value={formData.freeDeliveryThreshold}
            onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">Store Status</p>
            <p className="text-sm text-gray-500">
              {formData.isOpen ? 'Store is accepting orders' : 'Store is closed'}
            </p>
          </div>
          <button
            onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              formData.isOpen ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                formData.isOpen ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AdminApp;
