'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography, 
  IconButton, 
  TextField, 
  Button, 
  Grid,
  alpha,
  CircularProgress
} from '@mui/material';
import { 
  Close as CloseIcon, 
  ContentCopy as CopyIcon, 
  QrCode as QrIcon,
  Share as ShareIcon,
  X as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { useAppDispatch } from '@/hooks/redux';
import { generateLink } from '@/store/slices/referralSlice';
import { ReferralLink } from '../types';
import { ReferralService } from '../services/referralService';
import { SocialShareService } from '../services/socialShareService';
import { toast } from 'sonner';

interface ReferralShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const ReferralShareModal: React.FC<ReferralShareModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [referralLink, setReferralLink] = useState<ReferralLink | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadReferralLink();
    }
  }, [isOpen, userId]);

  const loadReferralLink = async () => {
    setIsLoading(true);
    try {
      const existingLinks = await ReferralService.getUserReferralLinks(userId);
      const activeLink = existingLinks.find(link => link.isActive);
      if (activeLink) {
        setReferralLink(activeLink);
      } else {
        const newLink = await ReferralService.generateReferralLink(userId);
        setReferralLink(newLink);
      }
    } catch (error) {
      console.error('Failed to load referral link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink.url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    if (!referralLink) return;
    const text = `Join me on stellAIverse! Discover amazing AI agents and earn ${referralLink.reward} when you sign up!`;
    const url = encodeURIComponent(referralLink.url);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'whatsapp': shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + referralLink.url)}`; break;
    }
    
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: '24px',
          backgroundColor: 'rgba(15, 15, 35, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundImage: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), transparent 70%)',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>Propagate Invite</Typography>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : referralLink ? (
          <Box sx={{ spaceY: 4 }}>
            <Box sx={{ p: 3, borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', mb: 4 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1, textTransform: 'uppercase', fontWeight: 800 }}>
                Mission Reward
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.light' }}>
                {referralLink.reward}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Bounty for each successful boarding.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 600 }}>Transmission Link</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={referralLink.url}
                  InputProps={{
                    readOnly: true,
                    sx: { 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace'
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleCopy}
                  sx={{ borderRadius: '12px', minWidth: '80px', textTransform: 'none' }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontWeight: 600 }}>Broadcast on Networks</Typography>
              <Grid container spacing={2}>
                {[
                  { icon: TwitterIcon, platform: 'twitter', label: 'X (Twitter)', color: '#1DA1F2' },
                  { icon: FacebookIcon, platform: 'facebook', label: 'Facebook', color: '#1877F2' },
                  { icon: WhatsAppIcon, platform: 'whatsapp', label: 'WhatsApp', color: '#25D366' }
                ].map((s) => (
                  <Grid item xs={4} key={s.platform}>
                    <Box 
                      onClick={() => shareOnSocial(s.platform)}
                      sx={{ 
                        p: 2, 
                        borderRadius: '16px', 
                        backgroundColor: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: alpha(s.color, 0.1),
                          borderColor: s.color,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <s.icon sx={{ color: s.color, mb: 1 }} />
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>{s.label.split(' ')[0]}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error">Signal failed. Calibration required.</Typography>
            <Button onClick={loadReferralLink} sx={{ mt: 2 }}>Re-transmit</Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReferralShareModal;
