import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Order } from '../types';
import { OrderProgress } from './OrderProgress';

interface ProfilePageProps {
  onBack: () => void;
  onReorder: (items: Order['items']) => void;
  onTrackOrder?: (order: Order) => void;
}

// Icons as components
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

type ProfileSection = 'main' | 'settings' | 'help' | 'orders';

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onReorder, onTrackOrder }) => {
  const { theme, setTheme } = useTheme();
  const { orders: dataOrders } = useData();
  const [currentSection, setCurrentSection] = useState<ProfileSection>('main');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });

  // Get orders from DataContext and sort them
  const orders = React.useMemo(() => {
    return [...dataOrders].sort((a, b) => {
      const aIsActive = a.status !== 'completed' && a.status !== 'cancelled';
      const bIsActive = b.status !== 'completed' && b.status !== 'cancelled';
      
      if (aIsActive && !bIsActive) return -1;
      if (!aIsActive && bIsActive) return 1;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [dataOrders]);

  useEffect(() => {
    // Try both localStorage keys for customer info (for backwards compatibility)
    const savedInfo = localStorage.getItem('flash-pizza-customer') || localStorage.getItem('flashpizza_customer');
    if (savedInfo) {
      setCustomerInfo(JSON.parse(savedInfo));
    }
  }, []);

  const handleCall = () => {
    window.location.href = 'tel:+919876543210';
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/919876543210?text=Hi, I need help with my order', '_blank');
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'preparing': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'out-for-delivery': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleBack = () => {
    if (currentSection === 'main') {
      onBack();
    } else {
      setCurrentSection('main');
    }
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'settings': return 'Settings';
      case 'help': return 'Help & Support';
      case 'orders': return 'Order History';
      default: return 'Profile';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
            {getSectionTitle()}
          </h1>
        </div>
      </div>

      {/* Main Section */}
      {currentSection === 'main' && (
        <div className="p-4 space-y-4">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <UserIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {customerInfo.name || 'Guest User'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 truncate">
                  {customerInfo.phone || 'No phone number'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
            {/* Order History */}
            <button
              onClick={() => setCurrentSection('orders')}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <HistoryIcon />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">Order History</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">View your past orders</p>
              </div>
              <ChevronRightIcon />
            </button>

            <div className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />

            {/* Settings */}
            <button
              onClick={() => setCurrentSection('settings')}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
                <SettingsIcon />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">Settings</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Theme & preferences</p>
              </div>
              <ChevronRightIcon />
            </button>

            <div className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />

            {/* Help & Support */}
            <button
              onClick={() => setCurrentSection('help')}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                <PhoneIcon />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">Help & Support</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Call or WhatsApp us</p>
              </div>
              <ChevronRightIcon />
            </button>
          </div>

          {/* App Info */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-400 dark:text-gray-500">Flash Pizza v1.0.0</p>
          </div>
        </div>
      )}

      {/* Settings Section */}
      {currentSection === 'settings' && (
        <div className="p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
            <div className="p-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Appearance</p>
              
              {/* Light Mode */}
              <button
                onClick={() => setTheme('light')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl mb-2 transition-colors ${
                  theme === 'light' 
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500' 
                    : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent'
                }`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  theme === 'light' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  <SunIcon />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Light Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Classic bright theme</p>
                </div>
                {theme === 'light' && (
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => setTheme('dark')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  theme === 'dark' 
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500' 
                    : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent'
                }`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  <MoonIcon />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Easy on the eyes</p>
                </div>
                {theme === 'dark' && (
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      {currentSection === 'help' && (
        <div className="p-4 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm transition-colors duration-300">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                <span className="text-4xl">🍕</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Need Help?</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">We're here to assist you</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCall}
                className="w-full flex items-center justify-center gap-3 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
              >
                <PhoneIcon />
                <span>Call Us</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-3 p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
              >
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Available 10:00 AM - 10:00 PM
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Section */}
      {currentSection === 'orders' && (
        <div className="p-4">
          {orders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center transition-colors duration-300">
              <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <PackageIcon />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Your order history will appear here</p>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isActive = order.status !== 'completed';
                
                return (
                  <div
                    key={order.id}
                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm transition-colors duration-300 overflow-hidden ${
                      isActive ? 'ring-2 ring-orange-500' : ''
                    }`}
                  >
                    {/* Active Order Banner */}
                    {isActive && (
                      <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-between">
                        <span className="text-sm font-medium">🔥 Active Order</span>
                        <span className="text-xs opacity-90">Tap to track</span>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">#{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                          {order.status.replace('-', ' ')}
                        </span>
                      </div>

                      {/* Order Progress Bar */}
                      <div className="mb-4">
                        <OrderProgress status={order.status} compact />
                      </div>

                      {/* Order Items */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className="w-10 h-10 rounded-lg border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-700"
                            >
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 rounded-lg border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">+{order.items.length - 3}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex-1 truncate">
                          {order.items.map(i => i.name).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white">₹{order.total}</p>
                        <div className="flex gap-2">
                          {isActive && onTrackOrder && (
                            <button
                              onClick={() => onTrackOrder(order)}
                              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Track Order
                            </button>
                          )}
                          <button
                            onClick={() => onReorder(order.items)}
                            className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                          >
                            Reorder
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
