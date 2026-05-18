import { SocialShareService } from '../services/socialShareService';
import { SocialShareConfig } from '../types';

// Mock window and navigator
Object.defineProperty(window, 'open', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(navigator, 'share', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
  },
  writable: true,
});

describe('SocialShareService', () => {
  const mockConfig: SocialShareConfig = {
    platform: 'twitter',
    url: 'https://stellaiverse.com/ref/ABC12345',
    title: 'Join me on stellAIverse!',
    description: 'Discover amazing AI agents',
    hashtags: ['stellAIverse', 'AI'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateShareUrl', () => {
    it('should generate Twitter share URL', () => {
      const url = SocialShareService.generateShareUrl(mockConfig);
      
      expect(url).toContain('twitter.com/intent/tweet');
      expect(url).toContain(encodeURIComponent(mockConfig.url));
      expect(url).toContain(encodeURIComponent(mockConfig.title));
      expect(url).toContain('stellAIverse,AI');
    });

    it('should generate Facebook share URL', () => {
      const config = { ...mockConfig, platform: 'facebook' as const };
      const url = SocialShareService.generateShareUrl(config);
      
      expect(url).toContain('facebook.com/sharer/sharer.php');
      expect(url).toContain(encodeURIComponent(mockConfig.url));
    });

    it('should generate LinkedIn share URL', () => {
      const config = { ...mockConfig, platform: 'linkedin' as const };
      const url = SocialShareService.generateShareUrl(config);
      
      expect(url).toContain('linkedin.com/sharing/share-offsite');
      expect(url).toContain(encodeURIComponent(mockConfig.url));
    });

    it('should generate WhatsApp share URL', () => {
      const config = { ...mockConfig, platform: 'whatsapp' as const };
      const url = SocialShareService.generateShareUrl(config);
      
      expect(url).toContain('wa.me/');
      expect(url).toContain(encodeURIComponent(mockConfig.title + ' ' + mockConfig.url));
    });

    it('should generate Telegram share URL', () => {
      const config = { ...mockConfig, platform: 'telegram' as const };
      const url = SocialShareService.generateShareUrl(config);
      
      expect(url).toContain('t.me/share/url');
      expect(url).toContain(encodeURIComponent(mockConfig.url));
    });
  });

  describe('share', () => {
    it('should open share URL in new window', async () => {
      await SocialShareService.share(mockConfig);
      
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com'),
        '_blank',
        'width=600,height=400,scrollbars=yes,resizable=yes'
      );
    });
  });

  describe('nativeShare', () => {
    it('should use native share if available', async () => {
      (navigator.share as jest.Mock).mockResolvedValue(undefined);

      const result = await SocialShareService.nativeShare(mockConfig);

      expect(navigator.share).toHaveBeenCalledWith({
        title: mockConfig.title,
        text: mockConfig.description,
        url: mockConfig.url,
      });
      expect(result).toBe(true);
    });

    it('should return false if native share fails', async () => {
      (navigator.share as jest.Mock).mockRejectedValue(new Error('Share failed'));

      const result = await SocialShareService.nativeShare(mockConfig);

      expect(result).toBe(false);
    });

    it('should return false if native share is not supported', async () => {
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
      });

      const result = await SocialShareService.nativeShare(mockConfig);

      expect(result).toBe(false);
    });
  });

  describe('isNativeShareSupported', () => {
    it('should return true if native share is supported', () => {
      Object.defineProperty(navigator, 'share', {
        value: jest.fn(),
        writable: true,
      });

      expect(SocialShareService.isNativeShareSupported()).toBe(true);
    });

    it('should return false if native share is not supported', () => {
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
      });

      expect(SocialShareService.isNativeShareSupported()).toBe(false);
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard using Clipboard API', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);

      const result = await SocialShareService.copyToClipboard('test text');

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
    });

    it('should return false if Clipboard API fails', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Clipboard failed'));

      const result = await SocialShareService.copyToClipboard('test text');

      expect(result).toBe(false);
    });
  });

  describe('generateEmailShare', () => {
    it('should generate email share link', () => {
      const url = SocialShareService.generateEmailShare(mockConfig);

      expect(url).toContain('mailto:');
      expect(url).toContain('subject=' + encodeURIComponent(mockConfig.title));
      expect(url).toContain('body=' + encodeURIComponent(mockConfig.description + '\n\n' + mockConfig.url));
    });
  });

  describe('generateSmsShare', () => {
    it('should generate SMS share link', () => {
      const url = SocialShareService.generateSmsShare(mockConfig);

      expect(url).toContain('sms:?body=');
      expect(url).toContain(encodeURIComponent(mockConfig.title + ' ' + mockConfig.url));
    });
  });
});
