'use client';

import { NotificationSettings } from '@/components/NotificationSettings';
import { NotificationDemo } from '@/components/NotificationDemo';

export default function NotificationSettingsPage() {
  return (
    <main className="pt-20 pb-20 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Notification Settings</h1>
          <p className="text-gray-300 text-lg">
            Manage your notification preferences and stay updated with your trades and transactions.
          </p>
        </div>

        <NotificationSettings className="mb-8" />
        
        <div className="mb-8">
          <NotificationDemo />
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          <div className="p-6 rounded-lg border border-cosmic-purple/30 bg-cosmic-purple/10">
            <h2 className="text-xl font-semibold text-white mb-3">About Notifications</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong>Trade Notifications:</strong> Get real-time updates when your trades are executed or fail.
              </p>
              <p>
                <strong>Transaction Notifications:</strong> Receive alerts for general blockchain transactions.
              </p>
              <p>
                <strong>Push Notifications:</strong> Enable to receive notifications even when the app is closed.
              </p>
              <p>
                <strong>Quiet Hours:</strong> Set specific times when notifications should be silenced.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-lg border border-cosmic-blue/30 bg-cosmic-blue/10">
            <h2 className="text-xl font-semibold text-white mb-3">Privacy & Security</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                • All notifications are processed locally on your device
              </p>
              <p>
                • No personal data is shared with third-party services
              </p>
              <p>
                • You can disable notifications at any time
              </p>
              <p>
                • Push subscriptions can be revoked instantly
              </p>
            </div>
          </div>

          <div className="p-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
            <h2 className="text-xl font-semibold text-white mb-3">Troubleshooting</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong>Notifications not showing?</strong> Check your browser settings and ensure notifications are allowed for this site.
              </p>
              <p>
                <strong>Push not working?</strong> Make sure your browser supports push notifications and you're online.
              </p>
              <p>
                <strong>Still having issues?</strong> Try refreshing the page or restarting your browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
