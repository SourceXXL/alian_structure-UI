'use client';

import { QuotaVisualization } from '@/features/agent-telemetry/components/QuotaVisualization';
import { BonusDashboard } from '@/features/trading-bonuses/components/BonusDashboard';
import { WaitlistStatus } from '@/components/WaitlistStatus';
import { 
  Box, 
  Typography, 
  Grid, 
  Chip, 
  Button, 
  useTheme, 
  useMediaQuery,
  alpha 
} from '@mui/material';
import {
  TrendingUp as PerformanceIcon,
  Forum as InteractionIcon,
  Settings as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

export default function Portfolio() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const agents = [
    {
      id: 1,
      name: 'MyDataBot',
      status: 'Active',
      performance: 94,
      interactions: 1250,
      createdAt: '2024-12-15',
    },
    {
      id: 2,
      name: 'ContentHelper',
      status: 'Active',
      performance: 87,
      interactions: 856,
      createdAt: '2024-11-20',
    },
  ];

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 overflow-x-hidden">
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 800, mb: 1 }} className="glow-text">
            Agent Portfolio
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Coordinate and supervise your constellation of AI agents.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, mb: 12 }}>
          {/* Waitlist Status Section */}
          <WaitlistStatus />
          
          {/* Real-time Quota and Rate Limit Visualization */}
          <QuotaVisualization userId="user-123" />

          {/* Trading Bonuses Feature */}
          <BonusDashboard />
        </div>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            Deployed Units
            <Chip label={agents.length} size="small" sx={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: 'primary.light', fontWeight: 700 }} />
          </Typography>
          
          <Box className="space-y-6">
            {agents.map((agent) => (
              <Box
                key={agent.id}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: '24px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: `0 8px 30px -10px ${alpha(theme.palette.primary.main, 0.2)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }} className="glow-text">
                      {agent.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                      Commissioned: <span style={{ color: alpha(theme.palette.text.primary, 0.7) }}>{agent.createdAt}</span>
                    </Typography>
                  </Box>
                  <Chip 
                    label={agent.status} 
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(52, 211, 153, 0.1)', 
                      color: '#34d399', 
                      fontWeight: 700,
                      borderRadius: '8px'
                    }} 
                  />
                </Box>

                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1, borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                        <PerformanceIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>Efficiency</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{agent.performance}%</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1, borderRadius: '12px', backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                        <InteractionIcon sx={{ color: '#06b6d4', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>Signal Hits</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#06b6d4' }}>{agent.interactions}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box className="flex gap-3">
                      <Button 
                        fullWidth 
                        variant="contained" 
                        startIcon={<ViewIcon />}
                        sx={{ 
                          py: 1.5, 
                          borderRadius: '14px', 
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          color: 'white',
                          boxShadow: 'none',
                          '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.2)' }
                        }}
                      >
                        Monitor
                      </Button>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        startIcon={<EditIcon />}
                        sx={{ 
                          py: 1.5, 
                          borderRadius: '14px', 
                          borderColor: 'rgba(255,255,255,0.1)',
                          color: 'text.secondary',
                          '&:hover': { borderColor: 'primary.main', color: 'primary.main' }
                        }}
                      >
                        Modify
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </main>
  );
}
