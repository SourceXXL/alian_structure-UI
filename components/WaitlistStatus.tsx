'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Skeleton, 
  useTheme, 
  alpha 
} from '@mui/material';
import Link from 'next/link';
import { useStellarWallet } from './context/StellarWalletProvider';
import { RocketLaunch as RocketIcon, Star as StarIcon } from '@mui/icons-material';

export const WaitlistStatus: React.FC = () => {
  const { wallet } = useStellarWallet();
  const theme = useTheme();
  const [status, setStatus] = useState<{
    joined: boolean;
    position?: number;
    joinedAt?: string;
    count?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const url = wallet?.publicKey 
          ? `/api/waitlist?walletAddress=${wallet.publicKey}`
          : '/api/waitlist';
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (err) {
        console.error('Failed to fetch waitlist status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [wallet?.publicKey]);

  if (loading) {
    return (
      <Skeleton 
        variant="rectangular" 
        height={100} 
        sx={{ borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.05)' }} 
      />
    );
  }

  if (status?.joined) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '24px',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          backgroundImage: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'between',
          gap: 2
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <StarIcon sx={{ color: 'primary.light', fontSize: 18 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }} className="glow-text">
              Elite Waitlist Status
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#06b6d4', fontWeight: 600 }}>
            Mission joined on {new Date(status.joinedAt!).toLocaleDateString()}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.light', lineHeight: 1 }}>
            #{status.position}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: '0.65rem' }}>
            Position
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 3
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
          Join the Premium Waitlist
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: '400px' }}>
          Secure early clearance for exclusive features and rewards. {status?.count || 0} agents already in orbit.
        </Typography>
      </Box>
      <Link href="/waitlist" passHref style={{ width: '100%', maxWidth: '140px' }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<RocketIcon />}
          sx={{
            borderRadius: '14px',
            textTransform: 'none',
            fontWeight: 700,
            backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 8px 20px -6px ${theme.palette.primary.main}`,
            '&:hover': {
              boxShadow: `0 12px 28px -6px ${theme.palette.primary.main}`,
            }
          }}
        >
          Join Now
        </Button>
      </Link>
    </Paper>
  );
};
