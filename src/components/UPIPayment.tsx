import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useData } from '../context/DataContext';

interface UPIPaymentProps {
  amount: number;
  orderId: string;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

const UPIPayment: React.FC<UPIPaymentProps> = ({
  amount,
  orderId,
  onPaymentComplete,
  onCancel,
}) => {
  const { storeConfig } = useData();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verifying' | 'success' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [copied, setCopied] = useState(false);

  // Generate UPI payment URL
  const transactionNote = `${storeConfig.name} Order ${orderId}`;
  const upiUrl = `upi://pay?pa=${storeConfig.upiId}&pn=${encodeURIComponent(storeConfig.name)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${orderId}`;

  // Countdown timer
  useEffect(() => {
    if (paymentStatus !== 'pending') return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenUPIApp = () => {
    // Try to open UPI app
    window.location.href = upiUrl;
  };

  const handleCopyUPIId = () => {
    navigator.clipboard.writeText(storeConfig.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentDone = () => {
    setPaymentStatus('verifying');
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        onPaymentComplete();
      }, 1500);
    }, 1500);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
        <p className="text-gray-600 dark:text-gray-400">Your order is being prepared</p>
      </div>
    );
  }

  if (paymentStatus === 'verifying') {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verifying Payment...</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center">Please wait while we confirm your payment</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between z-10">
        <button
          onClick={onCancel}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Pay with UPI</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 p-4 pb-32">
        {/* Amount Card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <p className="text-orange-100 text-sm mb-1">Amount to Pay</p>
          <p className="text-4xl font-bold">₹{amount.toFixed(2)}</p>
          <p className="text-orange-100 text-sm mt-2">Order #{orderId}</p>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">
            Complete payment in <span className="font-bold text-gray-900 dark:text-white">{formatTime(countdown)}</span>
          </span>
        </div>

        {/* QR Code Section */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="text-center text-gray-700 dark:text-gray-300 font-medium mb-4">
            Scan QR Code to Pay
          </h3>
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-xl shadow-inner">
              <QRCodeSVG
                value={upiUrl}
                size={200}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f97316'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='white' font-size='10' font-weight='bold'%3E🍕%3C/text%3E%3C/svg%3E",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
          </div>
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Open any UPI app and scan this code
          </p>
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Pay via UPI App Button */}
        <button
          onClick={handleOpenUPIApp}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-bold flex items-center justify-center gap-3 mb-4 active:scale-[0.98] transition-transform"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.5 13.5L7.5 21l-3-4.5L0 15l7.5-1.5L10.5 6l3 7.5L21 15l-4.5 1.5-3 4.5-3-7.5z"/>
          </svg>
          Pay ₹{amount.toFixed(2)} via UPI App
        </button>

        {/* UPI ID Copy Section */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Or pay manually to UPI ID:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg px-4 py-3 font-mono text-gray-900 dark:text-white">
              {storeConfig.upiId}
            </div>
            <button
              onClick={handleCopyUPIId}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 text-white active:bg-orange-600'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Payment Apps */}
        <div className="mb-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 text-center">Supported UPI Apps</p>
          <div className="flex justify-center gap-4">
            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
              <div
                key={app}
                className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"
              >
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{app}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-900 dark:text-blue-100 font-medium text-sm">How to pay?</p>
              <ol className="text-blue-700 dark:text-blue-300 text-sm mt-1 space-y-1">
                <li>1. Scan QR code or tap "Pay via UPI App"</li>
                <li>2. Complete payment in your UPI app</li>
                <li>3. Come back and tap "I've Paid"</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 safe-area-bottom">
        <button
          onClick={handlePaymentDone}
          className="w-full bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          I've Completed the Payment
        </button>
        <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-2">
          Payment will be verified by the store owner
        </p>
      </div>
    </div>
  );
};

export default UPIPayment;
