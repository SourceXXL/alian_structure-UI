'use client';

import ReferralDashboard from '@/features/referral-sharing/page';
import { Box, Container, Typography } from '@mui/material';
import { useStellarWallet } from '@/components/context/StellarWalletProvider';

export default function ReferralsPage() {
  const { wallet } = useStellarWallet();
  
  // Use public key as userId if available, otherwise fallback to a mock for demo
  const userId = wallet?.publicKey || 'user-cosmic-explorer';

  return (
    <main className="pt-24 pb-20 px-4">
      <Container maxWidth="lg">
        {!wallet?.publicKey && (
          <Box 
            sx={{ 
              mb: 4, 
              p: 2, 
              borderRadius: '12px', 
              backgroundColor: 'rgba(245, 158, 11, 0.1)', 
              border: '1px solid rgba(245, 158, 11, 0.3)',
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" sx={{ color: '#F59E0B', fontWeight: 600 }}>
              Wallet not connected. Viewing in simulation mode. Connect your wallet to track actual rewards.
            </Typography>
          </Box>
        )}
        <ReferralDashboard userId={userId} />
      </Container>
    </main>
  );
}
