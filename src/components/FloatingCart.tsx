import { useCart } from '../context/CartContext';
import { CartIcon, ArrowLeftIcon } from './Icons';
import { cn } from '../utils/cn';

interface FloatingCartProps {
  onCheckout: () => void;
}

export function FloatingCart({ onCheckout }: FloatingCartProps) {
  const { itemCount, total, subtotal, discount, deliveryCharge } = useCart();

  if (itemCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'animate-in slide-in-from-bottom duration-300'
      )}
    >
      <div className="max-w-lg mx-auto p-4">
        <button
          onClick={onCheckout}
          className={cn(
            'w-full flex items-center justify-between',
            'bg-gradient-to-r from-orange-500 to-orange-600',
            'text-white rounded-2xl p-4',
            'shadow-2xl shadow-orange-500/40',
            'transition-all duration-300 ease-out',
            'hover:shadow-orange-500/50 hover:scale-[1.02]',
            'active:scale-[0.98]'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <CartIcon size={24} />
              <span
                className={cn(
                  'absolute -top-2 -right-2',
                  'bg-white text-orange-600',
                  'text-xs font-bold',
                  'w-5 h-5 rounded-full',
                  'flex items-center justify-center',
                  'shadow-md'
                )}
              >
                {itemCount}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm opacity-90">
                {itemCount} item{itemCount > 1 ? 's' : ''}
              </p>
              {discount > 0 && (
                <p className="text-xs opacity-75">
                  Save ₹{discount}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold">₹{total}</p>
              {deliveryCharge === 0 && subtotal >= 300 && (
                <p className="text-xs opacity-75">Free delivery</p>
              )}
            </div>
            <ArrowLeftIcon size={20} className="rotate-180" />
          </div>
        </button>
      </div>
    </div>
  );
}
