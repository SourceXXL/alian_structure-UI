/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  productionBrowserSourceMaps: true,
  // Enhanced PWA Configuration with aggressive caching
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    scope: '/',
    sw: 'sw.js',
    
    // Enhanced runtime caching with better strategies
    runtimeCaching: [
      {
        urlPattern: /^https?.*\/api\/.*$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'stellaiverse-api',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200]
          },
          networkTimeoutSeconds: 10,
          cacheKeyWillBeUsed: async ({ request }) => {
            // Add build version to cache key for better cache busting
            const buildId = process.env.BUILD_ID || Date.now().toString();
            return `${request.url}?v=${buildId}`;
          },
        },
      },
      {
        urlPattern: /\.(?:js|css|html|json)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'stellaiverse-static',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          },
          cacheKeyWillBeUsed: async ({ request }) => {
            const buildId = process.env.BUILD_ID || Date.now().toString();
            return `${request.url}?v=${buildId}`;
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|avif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'stellaiverse-images',
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          },
          cacheKeyWillBeUsed: async ({ request }) => {
            const buildId = process.env.BUILD_ID || Date.now().toString();
            return `${request.url}?v=${buildId}`;
          },
        },
      },
      {
        urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'stellaiverse-fonts',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200]
          },
          cacheKeyWillBeUsed: async ({ request }) => {
            const buildId = process.env.BUILD_ID || Date.now().toString();
            return `${request.url}?v=${buildId}`;
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'stellaiverse-google-fonts-stylesheets',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200]
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'stellaiverse-google-fonts-webfonts',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200]
          },
        },
      },
    ],
  },
  // Asset versioning for cache busting with build hash
  generateBuildId: async () => {
    // Create a more stable build ID based on content hash
    const crypto = await import('crypto');
    const fs = await import('fs');
    const path = await import('path');
    
    try {
      // Get package.json content for base hash
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Create hash from package version and timestamp
      const hashInput = `${packageJson.version}-${Date.now()}`;
      const hash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 8);
      
      return `build-${hash}`;
    } catch (error) {
      console.warn('Failed to generate build hash, using timestamp fallback');
      return `build-${Date.now()}`;
    }
  },
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@stellar/stellar-sdk', '@tanstack/react-query', '@mui/material', '@mui/icons-material', 'recharts', 'nft.storage', 'ipfs-http-client'],
  },
};

export default nextConfig;
