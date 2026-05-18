/* Service for social media sharing functionality */

import { SocialShareConfig } from '../types';

export class SocialShareService {
  // Generate share URL for different platforms
  static generateShareUrl(config: SocialShareConfig): string {
    const { platform, url, title, description, hashtags } = config;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const encodedHashtags = hashtags ? hashtags.join(',') : '';

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`;

      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;

      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;

      case 'whatsapp':
        return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;

      case 'telegram':
        return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;

      default:
        return url;
    }
  }

  // Share on social media
  static async share(config: SocialShareConfig): Promise<void> {
    const shareUrl = this.generateShareUrl(config);
    
    if (typeof window !== 'undefined') {
      // Open in new window/tab
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
  }

  // Native Web Share API (if supported)
  static async nativeShare(config: SocialShareConfig): Promise<boolean> {
    if (typeof window !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: config.title,
          text: config.description,
          url: config.url,
        });
        return true;
      } catch (error) {
        console.warn('Native share failed:', error);
        return false;
      }
    }
    return false;
  }

  // Check if native sharing is supported
  static isNativeShareSupported(): boolean {
    return typeof window !== 'undefined' && 'share' in navigator;
  }

  // Copy to clipboard
  static async copyToClipboard(text: string): Promise<boolean> {
    if (typeof window !== 'undefined' && 'clipboard' in navigator) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.warn('Clipboard API failed:', error);
        return this.fallbackCopyToClipboard(text);
      }
    }
    return false;
  }

  // Fallback copy method for older browsers
  private static fallbackCopyToClipboard(text: string): boolean {
    try {
      if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      }
    } catch (error) {
      console.warn('Fallback copy failed:', error);
    }
    return false;
  }

  // Generate email share link
  static generateEmailShare(config: SocialShareConfig): string {
    const { url, title, description } = config;
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description}\n\n${url}`);
    
    return `mailto:?subject=${subject}&body=${body}`;
  }

  // Generate SMS share link
  static generateSmsShare(config: SocialShareConfig): string {
    const { url, title } = config;
    const message = encodeURIComponent(`${title} ${url}`);
    
    return `sms:?body=${message}`;
  }
}
