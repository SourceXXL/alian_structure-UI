'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className = '' }: NotificationSettingsProps) {
  const {
    permission,
    isSupported,
    preferences,
    requestPermission,
    updatePreferences,
    subscribeToPush,
    unsubscribeFromPush,
    isSubscribed
  } = useNotifications();

  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      await requestPermission();
    } catch (error) {
      console.error('Failed to request permission:', error);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleSubscribeToPush = async () => {
    setIsSubscribing(true);
    try {
      await subscribeToPush();
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribeFromPush = async () => {
    setIsSubscribing(true);
    try {
      await unsubscribeFromPush();
    } catch (error) {
      console.error('Failed to unsubscribe from push:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!isSupported) {
    return (
      <div className={`p-4 rounded-lg border border-red-500/30 bg-red-500/10 ${className}`}>
        <p className="text-red-400 text-sm">
          Notifications are not supported in your browser. Please use a modern browser like Chrome, Firefox, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Permission Status */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Notification Permission</h3>
        
        <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
          <div>
            <p className="text-white font-medium">Browser Permission</p>
            <p className="text-gray-400 text-sm">
              Status: <span className={`font-medium ${
                permission === 'granted' ? 'text-green-400' : 
                permission === 'denied' ? 'text-red-400' : 
                'text-yellow-400'
              }`}>
                {permission === 'granted' ? 'Granted' : 
                 permission === 'denied' ? 'Blocked' : 
                 'Not Requested'}
              </span>
            </p>
          </div>
          
          {permission === 'default' && (
            <button
              onClick={handleRequestPermission}
              disabled={isRequestingPermission}
              className="px-4 py-2 bg-cosmic-purple hover:bg-cosmic-purple/80 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequestingPermission ? 'Requesting...' : 'Enable Notifications'}
            </button>
          )}
          
          {permission === 'denied' && (
            <div className="text-right">
              <p className="text-red-400 text-sm">Blocked in browser settings</p>
              <p className="text-gray-400 text-xs mt-1">Enable in your browser settings</p>
            </div>
          )}
        </div>
      </div>

      {/* Push Subscription */}
      {permission === 'granted' && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Push Notifications</h3>
          
          <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
            <div>
              <p className="text-white font-medium">Push Subscription</p>
              <p className="text-gray-400 text-sm">
                Receive notifications even when the app is closed
              </p>
            </div>
            
            {!isSubscribed ? (
              <button
                onClick={handleSubscribeToPush}
                disabled={isSubscribing}
                className="px-4 py-2 bg-cosmic-purple hover:bg-cosmic-purple/80 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            ) : (
              <button
                onClick={handleUnsubscribeFromPush}
                disabled={isSubscribing}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg font-medium text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Unsubscribing...' : 'Unsubscribe'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      {permission === 'granted' && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
          
          <div className="space-y-4">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
              <div>
                <p className="text-white font-medium">Enable Notifications</p>
                <p className="text-gray-400 text-sm">Master toggle for all notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.enabled}
                  onChange={(e) => updatePreferences({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cosmic-purple"></div>
              </label>
            </div>

            {preferences.enabled && (
              <>
                {/* Trade Notifications */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <p className="text-white font-medium">Trade Notifications</p>
                    <p className="text-gray-400 text-sm">Get notified about successful and failed trades</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.tradeNotifications}
                      onChange={(e) => updatePreferences({ tradeNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cosmic-purple"></div>
                  </label>
                </div>

                {/* Transaction Notifications */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <p className="text-white font-medium">Transaction Notifications</p>
                    <p className="text-gray-400 text-sm">Get notified about general transactions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.transactionNotifications}
                      onChange={(e) => updatePreferences({ transactionNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cosmic-purple"></div>
                  </label>
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <p className="text-white font-medium">Sound</p>
                    <p className="text-gray-400 text-sm">Play sound with notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.soundEnabled}
                      onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cosmic-purple"></div>
                  </label>
                </div>

                {/* Vibration */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <p className="text-white font-medium">Vibration</p>
                    <p className="text-gray-400 text-sm">Vibrate on notifications (mobile devices)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.vibrationEnabled}
                      onChange={(e) => updatePreferences({ vibrationEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cosmic-purple"></div>
                  </label>
                </div>

                {/* Quiet Hours */}
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">Quiet Hours</p>
                      <p className="text-gray-400 text-sm">Disable notifications during specific hours</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.quietHours.enabled}
                        onChange={(e) => updatePreferences({ 
                          quietHours: { ...preferences.quietHours, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cosmic-purple"></div>
                    </label>
                  </div>
                  
                  {preferences.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={preferences.quietHours.start}
                          onChange={(e) => updatePreferences({ 
                            quietHours: { ...preferences.quietHours, start: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cosmic-purple"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                        <input
                          type="time"
                          value={preferences.quietHours.end}
                          onChange={(e) => updatePreferences({ 
                            quietHours: { ...preferences.quietHours, end: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cosmic-purple"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
