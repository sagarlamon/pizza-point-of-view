import { PizzaIcon } from './Icons';
import { useNotifications } from '../context/NotificationContext';

interface HeaderProps {
  onProfileClick: () => void;
  onNotificationsClick: () => void;
}

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export function Header({ onProfileClick, onNotificationsClick }: HeaderProps) {
  const { unreadCount } = useNotifications();
  
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <PizzaIcon size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Flash Pizza
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Hot & Fresh
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notification Bell Button */}
          <button
            onClick={onNotificationsClick}
            className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="View notifications"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Profile Icon Button */}
          <button
            onClick={onProfileClick}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open profile"
          >
            <UserIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
