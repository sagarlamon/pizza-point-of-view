import React from 'react';
import { OrderStatus } from '../types';

interface OrderProgressProps {
  status: OrderStatus;
  compact?: boolean;
  estimatedTime?: string;
  orderId?: string;
}

// Step icons
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const ChefHatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/>
    <line x1="6" y1="17" x2="18" y2="17"/>
  </svg>
);

const BikeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5"/>
    <circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const CancelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const steps = [
  { id: 'new', label: 'Order Placed', icon: ClipboardIcon, description: 'We received your order' },
  { id: 'preparing', label: 'Preparing', icon: ChefHatIcon, description: 'Chef is cooking your food' },
  { id: 'out-for-delivery', label: 'On the Way', icon: BikeIcon, description: 'Rider is heading to you' },
  { id: 'completed', label: 'Delivered', icon: HomeIcon, description: 'Enjoy your meal!' },
];

const getStepIndex = (status: OrderStatus): number => {
  const index = steps.findIndex(s => s.id === status);
  return index >= 0 ? index : 0;
};

export const OrderProgress: React.FC<OrderProgressProps> = ({ 
  status, 
  compact = false,
  estimatedTime,
  orderId 
}) => {
  const currentStepIndex = getStepIndex(status);
  const isCancelled = status === 'cancelled';

  // Show cancelled state
  if (isCancelled) {
    if (compact) {
      return (
        <div className="flex items-center gap-1.5 text-red-500">
          <CancelIcon />
          <span className="text-xs font-medium">Cancelled</span>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm transition-colors duration-300">
        {/* Header */}
        {orderId && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
              <p className="font-semibold text-gray-900 dark:text-white">#{orderId.slice(-8).toUpperCase()}</p>
            </div>
          </div>
        )}

        {/* Cancelled Banner */}
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500 text-white flex items-center justify-center">
            <CancelIcon />
          </div>
          <p className="text-red-700 dark:text-red-400 font-semibold text-lg">
            Order Cancelled
          </p>
          <p className="text-sm text-red-600 dark:text-red-500 mt-2">
            Your order has been cancelled. If you paid online, your refund will be processed within 3-5 business days.
          </p>
        </div>

        {/* Help Section */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Need help? Contact us for support
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <React.Fragment key={step.id}>
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isCompleted || isCurrent
                    ? 'bg-orange-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${isCurrent ? 'scale-125' : ''}`}
              />
              {index < steps.length - 1 && (
                <div 
                  className={`w-4 h-0.5 transition-colors duration-300 ${
                    isCompleted ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm transition-colors duration-300">
      {/* Header */}
      {orderId && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
            <p className="font-semibold text-gray-900 dark:text-white">#{orderId.slice(-8).toUpperCase()}</p>
          </div>
          {estimatedTime && status !== 'completed' && (
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Time</p>
              <p className="font-semibold text-orange-500">{estimatedTime}</p>
            </div>
          )}
        </div>
      )}

      {/* Current Status Banner */}
      <div className={`mb-6 p-4 rounded-xl ${
        status === 'completed' 
          ? 'bg-green-50 dark:bg-green-900/20' 
          : 'bg-orange-50 dark:bg-orange-900/20'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            status === 'completed'
              ? 'bg-green-500 text-white'
              : 'bg-orange-500 text-white animate-pulse'
          }`}>
            {React.createElement(steps[currentStepIndex].icon)}
          </div>
          <div>
            <p className={`font-semibold text-lg ${
              status === 'completed' 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-orange-700 dark:text-orange-400'
            }`}>
              {steps[currentStepIndex].label}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {steps[currentStepIndex].description}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex items-start">
              {/* Vertical Line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-5 top-10 w-0.5 h-12 transition-colors duration-500 ${
                    isCompleted ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
              
              {/* Step Circle */}
              <div 
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-orange-500 text-white' 
                    : isCurrent 
                      ? 'bg-orange-500 text-white ring-4 ring-orange-100 dark:ring-orange-900/50' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
              >
                {isCompleted ? <CheckIcon /> : <Icon />}
              </div>

              {/* Step Content */}
              <div className="ml-4 pb-10">
                <p className={`font-medium transition-colors duration-300 ${
                  isCompleted || isCurrent 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.label}
                </p>
                <p className={`text-sm transition-colors duration-300 ${
                  isPending 
                    ? 'text-gray-300 dark:text-gray-600' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed Message */}
      {status === 'completed' && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
          <p className="text-green-700 dark:text-green-400 font-medium">
            🎉 Order delivered successfully!
          </p>
          <p className="text-sm text-green-600 dark:text-green-500 mt-1">
            Thank you for ordering with Flash Pizza
          </p>
        </div>
      )}
    </div>
  );
};
