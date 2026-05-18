import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StellarWalletProvider } from '@/components/context/StellarWalletProvider';
import { ThemeModeProvider } from '@/components/providers/ThemeModeProvider';
import QueryProvider from '@/components/providers/QueryProvider';
import ReduxProvider from '@/components/providers/ReduxProvider';
import Navigation from '@/components/Navigation';
import PWAInstall from '@/components/PWAInstall';
import ReduxProvider from '@/components/providers/ReduxProvider';
import { Toaster } from 'sonner';
import '@/lib/i18n';

export const metadata: Metadata = {
  title: 'stellAIverse - AI Agent Marketplace',
  description: 'Create, discover, and interact with AI agents in a cosmic universe',
  keywords: ['AI agents', 'marketplace', 'automation', 'AI', 'Stellar'],
  openGraph: {
    title: 'stellAIverse',
    description: 'Beautiful AI agent marketplace with cosmic UI',
    type: 'website',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'stellAIverse',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'stellAIverse',
    startupImage: [
      {
        url: '/icons/icon-192x192.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
  other: {
    'msapplication-TileColor': '#1a1a2e',
    'msapplication-config': '/browserconfig.xml',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Critical resource hints for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
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
            `,
          }}
        />
        
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="stellAIverse" />
        
        {/* Critical CSS inline */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical CSS for above-the-fold content */
              body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
              .min-h-screen { min-height: 100vh; }
              .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
              .from-cosmic-dark { --tw-gradient-from: #1a1a2e; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(26 26 46 / 0)); }
              .via-cosmic-darker { --tw-gradient-stops: var(--tw-gradient-from), #0f0f23, var(--tw-gradient-to, rgb(15 15 35 / 0)); }
              .to-cosmic-dark { --tw-gradient-to: #1a1a2e; }
              .text-white { --tw-text-opacity: 1; color: rgb(255 255 255 / var(--tw-text-opacity)); }
              .overflow-x-hidden { overflow-x: hidden; }
              .fixed { position: fixed; }
              .inset-0 { inset: 0px; }
              .pointer-events-none { pointer-events: none; }
              .absolute { position: absolute; }
              .w-1 { width: 0.25rem; }
              .h-1 { height: 0.25rem; }
              .bg-white { --tw-bg-opacity: 1; background-color: rgb(255 255 255 / var(--tw-bg-opacity)); }
              .rounded-full { border-radius: 9999px; }
              .relative { position: relative; }
              .z-10 { z-index: 10; }
              @keyframes twinkle { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
              .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
            `,
          }}
        />
      </head>
      <body className="bg-cosmic-dark text-white overflow-x-hidden">
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

                  <div className="relative z-10">
                    <Navigation />
                    {children}
                  </div>

                  <Toaster richColors position="bottom-right" />

                </div>
              </StellarWalletProvider>
            </QueryProvider>
          </ReduxProvider>
        </ThemeModeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
