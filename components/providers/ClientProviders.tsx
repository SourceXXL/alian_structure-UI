'use client';

import { useEffect } from 'react';
import { StellarWalletProvider } from '@/components/context/StellarWalletProvider';
import { ThemeModeProvider } from './ThemeModeProvider';
import QueryProvider from './QueryProvider';
import ReduxProvider from './ReduxProvider';
import '@/lib/i18n';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker only on the client
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then(function(registration) {
            console.log('SW registered: ', registration);
          })
          .catch(function(registrationError) {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <ThemeModeProvider>
      <ReduxProvider>
        <QueryProvider>
          <StellarWalletProvider>
            <div className="min-h-screen bg-gradient-to-br from-cosmic-dark via-cosmic-darker to-cosmic-dark">
              {/* Animated background stars */}
              <div className="fixed inset-0 pointer-events-none">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                    }}
                  />
                ))}
              </div>
              {children}
            </div>
          </StellarWalletProvider>
        </QueryProvider>
      </ReduxProvider>
    </ThemeModeProvider>
  );
}