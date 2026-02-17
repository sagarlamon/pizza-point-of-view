import React from 'react';
import { Category } from '../types';
import { VegIcon, NonVegIcon, ComboIcon, BeverageIcon } from './Icons';
import { cn } from '../utils/cn';

interface CategoryFilterProps {
  selected: Category | 'all';
  onSelect: (category: Category | 'all') => void;
}

const categories: { id: Category | 'all'; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'all', label: 'All', icon: null, color: 'text-orange-500' },
  { id: 'veg', label: 'Veg', icon: <VegIcon size={18} />, color: 'text-green-600' },
  { id: 'non-veg', label: 'Non-Veg', icon: <NonVegIcon size={18} />, color: 'text-red-600' },
  { id: 'combos', label: 'Combos', icon: <ComboIcon size={18} />, color: 'text-purple-600' },
  { id: 'beverages', label: 'Drinks', icon: <BeverageIcon size={18} />, color: 'text-blue-600' },
];

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => {
        const isSelected = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-full font-medium text-sm whitespace-nowrap',
              'transition-all duration-300 ease-out transform',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
              isSelected
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105 focus:ring-orange-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 focus:ring-gray-300'
            )}
          >
            {cat.icon && (
              <span
                className={cn(
                  'transition-colors duration-300',
                  isSelected ? 'text-white' : cat.color
                )}
              >
                {cat.icon}
              </span>
            )}
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
