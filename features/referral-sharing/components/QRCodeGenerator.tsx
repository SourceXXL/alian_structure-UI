import React, { useState, useEffect } from 'react';
import { QRCodeConfig } from '../types';

interface QRCodeGeneratorProps {
  config: QRCodeConfig;
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ config, className = '' }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, [config]);

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      const qrUrl = await createQRCodeImage(config);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      // Fallback to external QR code service
      const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${config.size || 200}x${config.size || 200}&data=${encodeURIComponent(config.url)}`;
      setQrCodeUrl(fallbackUrl);
    } finally {
      setIsLoading(false);
    }
  };

  const createQRCodeImage = async (config: QRCodeConfig): Promise<string> => {
    // Simple QR code generation using canvas
    const size = config.size || 200;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas not supported');
    }

    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = config.bgColor || '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Simple QR code pattern (for demonstration)
    // In production, use a proper QR code library like qrcode.js
    const cellSize = Math.floor(size / 25);
    const fgColor = config.fgColor || '#000000';
    ctx.fillStyle = fgColor;

    // Generate a simple pattern that looks like a QR code
    const data = config.url;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash = hash & hash;
    }

    // Draw QR-like pattern
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        const shouldFill = (hash + row * col) % 3 !== 0;
        if (shouldFill) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }

    // Add corner squares (QR code markers)
    drawCornerSquare(ctx, 0, 0, cellSize * 7, fgColor);
    drawCornerSquare(ctx, size - cellSize * 7, 0, cellSize * 7, fgColor);
    drawCornerSquare(ctx, 0, size - cellSize * 7, cellSize * 7, fgColor);

    return canvas.toDataURL();
  };

  const drawCornerSquare = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + size * 0.14, y + size * 0.14, size * 0.72, size * 0.72);
    
    ctx.fillStyle = color;
    ctx.fillRect(x + size * 0.28, y + size * 0.28, size * 0.44, size * 0.44);
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative group">
        <img
          src={qrCodeUrl}
          alt="QR Code"
          className="rounded-lg shadow-lg transition-transform duration-200 group-hover:scale-105"
          style={{ width: config.size || 200, height: config.size || 200 }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 rounded-lg"></div>
      </div>
      
      <button
        onClick={downloadQRCode}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
      >
        Download QR Code
      </button>
    </div>
  );
};

export default QRCodeGenerator;
