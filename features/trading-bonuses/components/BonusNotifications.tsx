import * as React from 'react';
import { useEffect } from 'react';
import { useBonusStore } from '@/store/useBonusStore';

export const BonusNotifications: React.FC = () => {
  const { notifications, removeNotification } = useBonusStore();

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[notifications.length - 1].id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, removeNotification]);

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 max-w-sm w-full">
      {notifications.map((notif: any) => (
        <div
          key={notif.id}
          className="p-4 rounded-lg bg-cosmic-darker border border-cosmic-purple/50 shadow-2xl shadow-cosmic-purple/20 animate-float-in flex items-start gap-4 backdrop-blur-xl"
        >
          <div className="w-10 h-10 rounded-full bg-cosmic-purple/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">✨</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white leading-tight">{notif.message}</h4>
            <p className="text-sm text-gray-400 mt-1">
              You just earned <span className="text-cosmic-cyan font-bold">{notif.amount} XLM</span>
            </p>
          </div>
          <button
            onClick={() => removeNotification(notif.id)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
