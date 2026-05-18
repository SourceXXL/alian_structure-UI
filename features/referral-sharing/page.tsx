'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { 
  fetchReferralData, 
  generateLink, 
  claimReferralReward 
} from '@/store/slices/referralSlice';
import ReferralShareModal from './components/ReferralShareModal';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Tabs, 
  Tab, 
  Chip, 
  IconButton, 
  Tooltip,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  TrendingUp as StatsIcon,
  AccountBalanceWallet as WalletIcon,
  Groups as PeopleIcon,
  RocketLaunch as RocketIcon,
  History as HistoryIcon,
  CheckCircle as SuccessIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { toast } from 'sonner';

interface ReferralDashboardProps {
  userId: string;
}

const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ userId }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { stats, links, rewards, loading, error } = useAppSelector((state) => state.referral);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (userId) {
      dispatch(fetchReferralData(userId));
    }
  }, [userId, dispatch]);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Referral link copied to clipboard!');
  };

  const handleClaim = (rewardId: string) => {
    dispatch(claimReferralReward(rewardId))
      .unwrap()
      .then(() => toast.success('Reward claimed successfully!'))
      .catch((err) => toast.error(err));
  };

  const handleGenerate = () => {
    dispatch(generateLink({ userId }))
      .unwrap()
      .then(() => {
        toast.success('New referral link generated!');
        setShowShareModal(false);
      })
      .catch((err) => toast.error(err));
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, md: 4 }, spaceY: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'start', sm: 'center' }, gap: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }} className="glow-text">
            Affiliate Center
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Expand the constellation and earn XLM rewards for every new explorer.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RocketIcon />}
          onClick={() => setShowShareModal(true)}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
            }
          }}
        >
          Create Referral
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          { label: 'Total Signal Hits', value: stats?.totalClicks || 0, icon: StatsIcon, color: '#3B82F6' },
          { label: 'Successful Boardings', value: stats?.totalSignups || 0, icon: PeopleIcon, color: '#10B981' },
          { label: 'Total Earnings', value: `${stats?.totalRewards || 0} XLM`, icon: WalletIcon, color: '#F59E0B' },
          { label: 'Conversion Orbit', value: `${((stats?.conversionRate || 0) * 100).toFixed(1)}%`, icon: RocketIcon, color: '#8B5CF6' }
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
                  {stat.value}
                </Typography>
              </Box>
              <stat.icon 
                sx={{ 
                  position: 'absolute', 
                  right: -10, 
                  bottom: -10, 
                  fontSize: 80, 
                  color: alpha(stat.color, 0.1),
                  transform: 'rotate(-15deg)'
                }} 
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tabs Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            px: 2,
            '& .MuiTab-root': { color: 'text.secondary', fontWeight: 700, py: 3 },
            '& .Mui-selected': { color: 'primary.main' }
          }}
        >
          <Tab label="Performance" />
          <Tab label={`Active Links (${links.length})`} />
          <Tab label={`Reward History (${rewards.length})`} />
        </Tabs>

        <Box sx={{ p: 4 }}>
          {activeTab === 0 && (
            <Box sx={{ maxWidth: '600px' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>Efficiency Metrics</Typography>
              <Box sx={{ spaceY: 3 }}>
                {[
                  { label: 'Active Transmission Links', value: stats?.activeLinks || 0 },
                  { label: 'Pending Credits', value: `${stats?.pendingRewards || 0} XLM` },
                  { label: 'Average Signal Strength', value: links.length > 0 ? (links.reduce((s, l) => s + l.uses, 0) / links.length).toFixed(1) : '0' }
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', mb: 2 }}>
                    <Typography sx={{ color: 'text.secondary' }}>{item.label}</Typography>
                    <Typography sx={{ fontWeight: 800 }}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              {links.length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography sx={{ color: 'text.secondary', mb: 3 }}>No transmission links found in this sector.</Typography>
                    <Button variant="outlined" onClick={() => setShowShareModal(true)}>Initiate Link</Button>
                  </Box>
                </Grid>
              ) : (
                links.map((link) => (
                  <Grid item xs={12} key={link.id}>
                    <Paper sx={{ p: 3, borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>{link.code}</Typography>
                            <Chip 
                              label={link.isActive ? 'Active' : 'Inactive'} 
                              size="small" 
                              color={link.isActive ? 'success' : 'default'}
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace', mb: 2 }}>{link.url}</Typography>
                          <Box sx={{ display: 'flex', gap: 3 }}>
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>{link.uses} Signals</Typography>
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>{link.reward} Bounty</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Copy Link">
                            <IconButton onClick={() => handleCopyLink(link.url)} sx={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Deactivate">
                            <IconButton sx={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {activeTab === 2 && (
            <Box sx={{ spaceY: 3 }}>
              {rewards.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography sx={{ color: 'text.secondary' }}>No bounties claimed in this timeframe.</Typography>
                </Box>
              ) : (
                rewards.map((reward) => (
                  <Paper key={reward.id} sx={{ p: 3, borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{reward.amount} {reward.asset}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          Signal Source: {reward.referralCode} • {new Date(reward.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                          label={reward.status} 
                          size="small" 
                          sx={{ 
                            backgroundColor: reward.status === 'claimed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: reward.status === 'claimed' ? '#10B981' : '#F59E0B',
                            fontWeight: 700
                          }} 
                        />
                        {reward.status === 'pending' && (
                          <Button variant="contained" size="small" onClick={() => handleClaim(reward.id)}>Claim</Button>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Share Modal */}
      <ReferralShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        userId={userId}
        onGenerate={handleGenerate}
      />
    </Box>
  );
};

export default ReferralDashboard;
