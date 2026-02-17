import { useState } from 'react';
import { MenuItem as MenuItemType } from '../types';
import { useCart } from '../context/CartContext';
import { PlusIcon, MinusIcon, VegIcon, NonVegIcon, StarIcon, BeverageIcon } from './Icons';
import { cn } from '../utils/cn';

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItemCard({ item }: MenuItemProps) {
  const { addItem, removeItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAdd = () => {
    setIsAnimating(true);
    addItem(item);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  const isVeg = item.category === 'veg' || item.category === 'beverages';
  const isBeverage = item.category === 'beverages';

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden',
        'shadow-sm hover:shadow-lg dark:shadow-gray-900/30',
        'transition-all duration-300 ease-out',
        'border border-gray-100 dark:border-gray-700',
        'flex gap-4 p-3',
        isAnimating && 'scale-[1.01]'
      )}
    >
      {/* Image Container - Square on left */}
      <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
        )}
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            'group-hover:scale-110',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
        {/* Veg/Non-Veg/Beverage Badge */}
        <div
          className={cn(
            'absolute top-2 left-2 p-1 rounded-md backdrop-blur-md',
            isBeverage
              ? 'bg-blue-100/90 dark:bg-blue-900/90'
              : isVeg
                ? 'bg-green-100/90 dark:bg-green-900/90'
                : 'bg-red-100/90 dark:bg-red-900/90'
          )}
        >
          {isBeverage ? (
            <BeverageIcon size={12} className="text-blue-600 dark:text-blue-400" />
          ) : isVeg ? (
            <VegIcon size={12} className="text-green-600 dark:text-green-400" />
          ) : (
            <NonVegIcon size={12} className="text-red-600 dark:text-red-400" />
          )}
        </div>
      </div>

      {/* Content - Right side */}
      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight line-clamp-1">
              {item.name}
            </h3>
            {/* Rating Badge */}
            {item.rating && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-600 rounded text-white text-xs font-medium flex-shrink-0">
                <span>{item.rating}</span>
                <StarIcon size={10} className="text-white" />
              </div>
            )}
          </div>
          {item.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-snug">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ₹{item.price}
          </span>

          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full',
                'bg-orange-500 hover:bg-orange-600 text-white',
                'font-semibold text-sm',
                'transition-all duration-200 ease-out',
                'transform active:scale-95',
                'shadow-md shadow-orange-500/30'
              )}
            >
              <PlusIcon size={16} />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 rounded-full p-1">
              <button
                onClick={handleRemove}
                className={cn(
                  'p-2 rounded-full',
                  'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600',
                  'text-orange-600 dark:text-orange-400',
                  'transition-all duration-200',
                  'transform active:scale-90',
                  'shadow-sm'
                )}
              >
                <MinusIcon size={14} />
              </button>
              <span className="w-8 text-center font-bold text-orange-600 dark:text-orange-400">
                {quantity}
              </span>
              <button
                onClick={handleAdd}
                className={cn(
                  'p-2 rounded-full',
                  'bg-orange-500 hover:bg-orange-600 text-white',
                  'transition-all duration-200',
                  'transform active:scale-90',
                  'shadow-md shadow-orange-500/30'
                )}
              >
                <PlusIcon size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
