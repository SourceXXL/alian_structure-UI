'use client';

import { useEffect, useState } from 'react';
import { usePWA } from '@/hooks/usePWA';

interface PWAInstallProps {
  className?: string;
}

export default function PWAInstall({ className = '' }: PWAInstallProps) {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    promptInstall,
    skipWaiting,
  } = usePWA();

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if (isInstallable && !isInstalled) {
      // Show install prompt after a delay
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  useEffect(() => {
    if (updateAvailable) {
      setShowUpdatePrompt(true);
    }
  }, [updateAvailable]);

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (success) {
      setShowInstallPrompt(false);
    }
  };

  const handleUpdateClick = async () => {
    await skipWaiting();
    setShowUpdatePrompt(false);
    // Reload to get the new version
    window.location.reload();
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const dismissUpdatePrompt = () => {
    setShowUpdatePrompt(false);
  };

  // Check if user recently dismissed the install prompt
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
      if (Date.now() - dismissedTime < oneWeek) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (!isOnline) {
    return (
      <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
        <div className="bg-yellow-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">You're offline</p>
              <p className="text-xs opacity-90">Some features may not be available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg shadow-xl max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">Install stellAIverse</h3>
                <p className="text-xs opacity-90 mb-3">
                  Get the full experience with offline access and faster performance
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleInstallClick}
                    className="bg-white text-purple-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
                  >
                    Install
                  </button>
                  <button
                    onClick={dismissInstallPrompt}
                    className="bg-white/20 text-white px-3 py-1 rounded text-xs font-medium hover:bg-white/30 transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
              <button
                onClick={dismissInstallPrompt}
                className="flex-shrink-0 text-white/70 hover:text-white"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Prompt */}
      {showUpdatePrompt && (
        <div className={`fixed top-4 left-4 right-4 z-50 ${className}`}>
          <div className="bg-green-500 text-white p-4 rounded-lg shadow-xl max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">Update Available</h3>
                <p className="text-xs opacity-90 mb-3">
                  A new version of stellAIverse is ready to install
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateClick}
                    className="bg-white text-green-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
                  >
                    Update Now
                  </button>
                  <button
                    onClick={dismissUpdatePrompt}
                    className="bg-white/20 text-white px-3 py-1 rounded text-xs font-medium hover:bg-white/30 transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={dismissUpdatePrompt}
                className="flex-shrink-0 text-white/70 hover:text-white"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
