#!/bin/bash

# PWA Setup Script for stellAIverse
# This script helps set up the PWA features

echo "🚀 Setting up PWA features for stellAIverse..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install PWA dependencies
echo "📦 Installing PWA dependencies..."
npm install next-pwa workbox-webpack-plugin

if [ $? -eq 0 ]; then
    echo "✅ PWA dependencies installed successfully"
else
    echo "❌ Failed to install PWA dependencies"
    exit 1
fi

# Generate icons
echo "🎨 Generating app icons..."
node scripts/generate-icons.js

if [ $? -eq 0 ]; then
    echo "✅ Icons generated successfully"
else
    echo "⚠️  Icon generation failed (this is expected without proper image tools)"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Project built successfully"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 PWA setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm start' to start the production server"
echo "2. Open your browser and navigate to http://localhost:3000"
echo "3. Open DevTools → Application to verify PWA features"
echo "4. Test offline functionality by toggling offline mode"
echo ""
echo "📚 For more information, see docs/PWA_IMPLEMENTATION.md"
