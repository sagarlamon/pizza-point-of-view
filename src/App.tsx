import { useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider, useCart } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { MenuItemCard } from './components/MenuItem';
import { FloatingCart } from './components/FloatingCart';
import { Checkout } from './components/Checkout';
import { OrderSuccess } from './components/OrderSuccess';
import { ProfilePage } from './components/ProfilePage';
import { OrderTracking } from './components/OrderTracking';
import NotificationCenter from './components/NotificationCenter';
import ToastContainer from './components/ToastContainer';
import AdminApp from './admin/AdminApp';
import { Category, CartItem, Order, SortOption } from './types';
import { cn } from './utils/cn';
import { FilterIcon, StarIcon } from './components/Icons';

// Check if admin mode is requested via URL
const isAdminMode = new URLSearchParams(window.location.search).has('admin');

type AppView = 'menu' | 'checkout' | 'success' | 'profile' | 'notifications' | 'tracking';

function MenuPage({ 
  onCheckout, 
  onProfile,
  onNotifications,
  activeOrder,
  onTrackActiveOrder
}: { 
  onCheckout: () => void; 
  onProfile: () => void;
  onNotifications: () => void;
  activeOrder: Order | null;
  onTrackActiveOrder: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [minRating, setMinRating] = useState<number>(0);
  const [vegOnly, setVegOnly] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const { menuItems, storeConfig } = useData();
  const { itemCount } = useCart();

  // Get active banners
  const activeBanners = useMemo(() => {
    const banners = storeConfig.banners?.filter(b => b.isActive).sort((a, b) => a.order - b.order) || [];
    // If no banners, use the legacy bannerImage
    if (banners.length === 0 && storeConfig.bannerImage) {
      return [{
        id: 'legacy',
        image: storeConfig.bannerImage,
        title: storeConfig.offerText,
        isActive: true,
        order: 0
      }];
    }
    return banners;
  }, [storeConfig.banners, storeConfig.bannerImage, storeConfig.offerText]);

  // Auto-rotate banners
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const filteredItems = useMemo(() => {
    let items = menuItems.filter(item => item.isAvailable);
    
    // Category filter
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    // Veg only filter
    if (vegOnly) {
      items = items.filter(item => item.category === 'veg' || item.category === 'beverages');
    }
    
    // Rating filter
    if (minRating > 0) {
      items = items.filter(item => (item.rating || 0) >= minRating);
    }
    
    // Sort
    switch (sortOption) {
      case 'price-low':
        items = [...items].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        items = [...items].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        items = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popularity':
        items = [...items].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      default:
        // When "All" is selected and default sort, show pizzas first, then beverages
        if (selectedCategory === 'all') {
          // Category priority: veg=1, non-veg=2, combos=3, beverages=4
          const categoryPriority: Record<string, number> = {
            'veg': 1,
            'non-veg': 2,
            'combos': 3,
            'beverages': 4
          };
          items = [...items].sort((a, b) => {
            const priorityA = categoryPriority[a.category] || 5;
            const priorityB = categoryPriority[b.category] || 5;
            return priorityA - priorityB;
          });
        }
        break;
    }
    
    return items;
  }, [selectedCategory, menuItems, sortOption, minRating, vegOnly]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (sortOption !== 'default') count++;
    if (minRating > 0) count++;
    if (vegOnly) count++;
    return count;
  }, [sortOption, minRating, vegOnly]);

  const clearFilters = () => {
    setSortOption('default');
    setMinRating(0);
    setVegOnly(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header onProfileClick={onProfile} onNotificationsClick={onNotifications} />

      {/* Active Order Banner */}
      {activeOrder && activeOrder.status !== 'completed' && (
        <button
          onClick={onTrackActiveOrder}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              {activeOrder.status === 'new' && <span>📋</span>}
              {activeOrder.status === 'preparing' && <span>👨‍🍳</span>}
              {activeOrder.status === 'out-for-delivery' && <span>🛵</span>}
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Order #{activeOrder.id.slice(-6)}</p>
              <p className="text-xs text-white/80">
                {activeOrder.status === 'new' && 'Order Received'}
                {activeOrder.status === 'preparing' && 'Being Prepared'}
                {activeOrder.status === 'out-for-delivery' && 'On the way!'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Track</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      )}

      {/* Store Closed Banner */}
      {!storeConfig.isOpen && (
        <div className="bg-red-500 text-white px-4 py-3 flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-semibold">Store is currently closed</span>
          <span className="text-white/80">• We'll be back soon!</span>
        </div>
      )}

      {/* Hero Banner Carousel */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {!bannerLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-900 dark:to-red-900 animate-pulse" />
        )}
        
        {/* Banner Images */}
        <div 
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
        >
          {activeBanners.map((banner, index) => (
            <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
              <img
                src={banner.image}
                alt={banner.title || `Banner ${index + 1}`}
                onLoad={() => setBannerLoaded(true)}
                className="w-full h-full object-cover"
              />
              {banner.title && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-flex flex-col gap-1 px-4 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-xl shadow-lg">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {banner.title}
                    </span>
                    {banner.subtitle && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {banner.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Banner Dots Indicator */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentBannerIndex
                    ? 'bg-white w-4'
                    : 'bg-white/50 hover:bg-white/75'
                )}
              />
            ))}
          </div>
        )}

        {/* Offer Badge - Only show if no banners have their own title */}
        {activeBanners.length === 1 && activeBanners[0].id === 'legacy' && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-full shadow-lg">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {storeConfig.offerText}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Category Filter + Filter Button */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 overflow-hidden">
            <CategoryFilter
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex-shrink-0 p-2.5 rounded-full transition-all',
              'border',
              showFilters || activeFiltersCount > 0
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            )}
          >
            <FilterIcon size={18} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort Options */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Sort by
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'default', label: 'Default' },
                  { id: 'price-low', label: 'Price: Low to High' },
                  { id: 'price-high', label: 'Price: High to Low' },
                  { id: 'rating', label: 'Top Rated' },
                  { id: 'popularity', label: 'Popular' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortOption(option.id as SortOption)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                      sortOption === option.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {[0, 3, 3.5, 4, 4.5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                      minRating === rating
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {rating === 0 ? 'All' : (
                      <>
                        <StarIcon size={12} className="text-yellow-400" />
                        {rating}+
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Veg Only Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Veg Only
              </label>
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors',
                  vegOnly ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                )}
              >
                <span
                  className={cn(
                    'block w-5 h-5 bg-white rounded-full shadow transform transition-transform',
                    vegOnly ? 'translate-x-6' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>
        )}

        {/* Results count */}
        {(activeFiltersCount > 0 || selectedCategory !== 'all') && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {filteredItems.length} items found
          </p>
        )}

        {/* Menu List */}
        <div className="flex flex-col gap-3 pb-28">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No items match your filters
            </p>
            <button
              onClick={clearFilters}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Cart - Disabled when store is closed */}
      {storeConfig.isOpen ? (
        <FloatingCart onCheckout={onCheckout} />
      ) : (
        itemCount > 0 && (
          <div className="fixed bottom-6 left-4 right-4 z-50">
            <div className="max-w-lg mx-auto bg-red-500 text-white rounded-2xl px-6 py-4 shadow-xl">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-semibold">Store is closed - Ordering disabled</span>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function AppContent() {
  const [view, setView] = useState<AppView>('menu');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const { addItem } = useCart();
  const { orders } = useData();

  // Find and update tracking order from DataContext
  useEffect(() => {
    // First, if we have a trackingOrder, check if its status has been updated
    if (trackingOrder) {
      const updatedOrder = orders.find((order: Order) => order.id === trackingOrder.id);
      if (updatedOrder) {
        // Always update to get the latest status
        const newOrder = {
          ...updatedOrder,
          createdAt: typeof updatedOrder.createdAt === 'string' 
            ? new Date(updatedOrder.createdAt) 
            : updatedOrder.createdAt
        };
        // Only set if actually different to prevent infinite loops
        if (trackingOrder.status !== updatedOrder.status) {
          setTrackingOrder(newOrder);
        }
        return;
      }
    }
    
    // If no tracking order, look for any active order
    const activeOrder = orders.find((order: Order) => 
      order.status !== 'completed' && order.status !== 'cancelled'
    );
    if (activeOrder && (!trackingOrder || trackingOrder.id !== activeOrder.id)) {
      setTrackingOrder({
        ...activeOrder,
        createdAt: typeof activeOrder.createdAt === 'string' 
          ? new Date(activeOrder.createdAt) 
          : activeOrder.createdAt
      });
    }
  }, [orders, trackingOrder]);

  const handleReorder = (items: CartItem[]) => {
    items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addItem(item);
      }
    });
    setView('menu');
  };

  const handleTrackOrder = (order: Order) => {
    setTrackingOrder(order);
    setView('tracking');
  };

  const handleCallSupport = () => {
    window.location.href = 'tel:+919876543210';
  };

  return (
    <div className="transition-all duration-300">
      {/* Toast Container - Always visible */}
      <ToastContainer />
      
      {view === 'menu' && (
        <MenuPage 
          onCheckout={() => setView('checkout')} 
          onProfile={() => setView('profile')}
          onNotifications={() => setView('notifications')}
          activeOrder={trackingOrder}
          onTrackActiveOrder={() => {
            if (trackingOrder) {
              setView('tracking');
            }
          }}
        />
      )}
      {view === 'checkout' && (
        <Checkout
          onBack={() => setView('menu')}
          onOrderPlaced={(order) => {
            setTrackingOrder(order);
            setView('tracking');
          }}
        />
      )}
      {view === 'success' && (
        <OrderSuccess onNewOrder={() => setView('menu')} />
      )}
      {view === 'profile' && (
        <ProfilePage 
          onBack={() => setView('menu')} 
          onReorder={handleReorder}
          onTrackOrder={handleTrackOrder}
        />
      )}
      {view === 'notifications' && (
        <NotificationCenter 
          onBack={() => setView('menu')}
        />
      )}
      {view === 'tracking' && trackingOrder && (
        <OrderTracking
          order={trackingOrder}
          onBack={() => setView('menu')}
          onCallSupport={handleCallSupport}
          onHome={() => setView('menu')}
        />
      )}
    </div>
  );
}

export function App() {
  // If URL has ?admin, show the separate admin panel
  if (isAdminMode) {
    return (
      <ThemeProvider>
        <DataProvider>
          <NotificationProvider>
            <AdminApp />
          </NotificationProvider>
        </DataProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <DataProvider>
        <CartProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </CartProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
