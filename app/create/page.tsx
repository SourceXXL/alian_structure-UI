'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  TextField, 
  Button, 
  Grid, 
  Paper,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Check as CheckIcon,
  AutoAwesome as MagicIcon
} from '@mui/icons-material';

export default function CreateAgent() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    behavior: '',
    capabilities: [] as string[],
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleCapability = (cap: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap]
    }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log('Submitting agent:', formData);
  };

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 overflow-x-hidden">
      <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 800, mb: 1 }} className="glow-text">
            Forge AI Agent
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Step {step} of 4: Define your agent's cosmic essence
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 6 }}>
          <LinearProgress 
            variant="determinate" 
            value={(step / 4) * 100} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }
            }}
          />
        </Box>

        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, sm: 5 }, 
            borderRadius: '24px', 
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background decoration */}
          <Box sx={{ position: 'absolute', top: -50, right: -50, w: 100, h: 100, bg: alpha(theme.palette.primary.main, 0.1), blur: '40px', borderRadius: 'full' }} />

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <Box className="space-y-6">
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Agent Name</Typography>
                <TextField
                  fullWidth
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., DataAnalyzer Pro"
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Short Description</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What is the mission of this agent?"
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Box>
            </Box>
          )}

          {/* Step 2: Behavior */}
          {step === 2 && (
            <Box className="space-y-6">
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Behavior & Directives</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  name="behavior"
                  value={formData.behavior}
                  onChange={handleInputChange}
                  placeholder="Describe the protocols and personality of your agent..."
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Box>
            </Box>
          )}

          {/* Step 3: Capabilities */}
          {step === 3 && (
            <Box className="space-y-6">
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Select Cosmic Capabilities</Typography>
              <Grid container spacing={2}>
                {['Data Analysis', 'Content Generation', 'Code Generation', 'Automation', 'Translation', 'Summarization'].map((cap) => {
                  const isSelected = formData.capabilities.includes(cap);
                  return (
                    <Grid item xs={12} sm={6} key={cap}>
                      <Button
                        fullWidth
                        variant={isSelected ? "contained" : "outlined"}
                        onClick={() => toggleCapability(cap)}
                        sx={{ 
                          py: 2, 
                          borderRadius: '16px',
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                          backgroundColor: isSelected ? undefined : 'transparent',
                          '&:hover': {
                            backgroundColor: isSelected ? undefined : alpha(theme.palette.primary.main, 0.05)
                          }
                        }}
                        startIcon={isSelected ? <CheckIcon /> : <MagicIcon sx={{ opacity: 0.3 }} />}
                      >
                        {cap}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <Box className="space-y-6">
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }} className="glow-text">Final Observation</Typography>
              <Box sx={{ spaceY: 3, opacity: 0.9 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>Agent Identity</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{formData.name || 'Unnamed Agent'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>Mission Overview</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{formData.description || 'No description provided.'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>Capabilities</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {formData.capabilities.length > 0 ? formData.capabilities.map(cap => (
                      <Box key={cap} sx={{ px: 1.5, py: 0.5, bg: 'primary.main', borderRadius: 'full', fontSize: '10px', fontWeight: 800 }}>{cap}</Box>
                    )) : <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.5 }}>None selected</Typography>}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Navigation Buttons */}
        <Box className="flex justify-between gap-4 mt-8">
          <Button
            size="large"
            disabled={step === 1}
            onClick={handlePrev}
            startIcon={<BackIcon />}
            sx={{ 
              px: 4, 
              borderRadius: '14px', 
              color: 'white',
              '&.Mui-disabled': { opacity: 0.3, color: 'white' }
            }}
          >
            Back
          </Button>
          
          <Button
            size="large"
            variant="contained"
            onClick={step === 4 ? handleSubmit : handleNext}
            endIcon={step === 4 ? <CheckIcon /> : <NextIcon />}
            sx={{ 
              px: 6, 
              borderRadius: '14px',
              backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 8px 20px -6px ${theme.palette.primary.main}`,
              '&:hover': {
                boxShadow: `0 12px 28px -6px ${theme.palette.primary.main}`,
              }
            }}
          >
            {step === 4 ? 'Initiate Forge' : 'Next Protocol'}
          </Button>
        </Box>
      </Box>
    </main>
  );
}
