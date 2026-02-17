import { CheckIcon, TruckIcon } from './Icons';
import { OrderProgress } from './OrderProgress';
import { cn } from '../utils/cn';

interface OrderSuccessProps {
  onNewOrder: () => void;
}

export function OrderSuccess({ onNewOrder }: OrderSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-6 pb-24">
      <div className="max-w-md mx-auto pt-8">
        {/* Success Header */}
        <div className="text-center mb-8 animate-in zoom-in duration-500">
          {/* Success Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30">
              <CheckIcon size={40} className="text-white" />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-green-500 rounded-full animate-ping opacity-20" />
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Order Placed! 🎉
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your delicious pizza is being prepared
          </p>
        </div>

        {/* Order Progress */}
        <div className="mb-6">
          <OrderProgress 
            status="new"
            estimatedTime="30-40 mins"
          />
        </div>

        {/* Delivery Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-6 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <TruckIcon size={24} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">30-40 mins</p>
            </div>
          </div>
        </div>

        {/* What's Next Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-6 transition-colors duration-300">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-orange-500">1</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our chef will start preparing your order
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-orange-500">2</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You'll receive a notification when it's out for delivery
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-orange-500">3</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your order in real-time from Order History
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onNewOrder}
          className={cn(
            'w-full py-4 rounded-2xl font-bold text-lg',
            'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
            'shadow-lg shadow-orange-500/30',
            'transition-all duration-300',
            'hover:shadow-orange-500/50 active:scale-[0.98]'
          )}
        >
          Continue Shopping
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          You can track your order from Profile → Order History
        </p>
      </div>
    </div>
  );
}
