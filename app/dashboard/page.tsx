'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '@/components/Button';
import MetricLineChart from '@/components/metrics/MetricLineChart';
import MetricSeriesTable from '@/components/metrics/MetricSeriesTable';
import type { MetricsPanelResponse, MetricsPanelsResponse, MetricsRange } from '@/lib/metrics/types';
import { panelToCsv } from '@/lib/metrics/csv';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TextField, 
  Grid,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';

const RANGES: MetricsRange[] = ['15m', '1h', '6h', '24h', '7d'];

function downloadText(filename: string, text: string, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MetricsDashboardPage() {
  const [group, setGroup] = useState<'system' | 'business'>('system');
  const [range, setRange] = useState<MetricsRange>('1h');
  const [step, setStep] = useState(30);
  const [seriesFilter, setSeriesFilter] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const panelsQuery = useQuery<MetricsPanelsResponse>({
    queryKey: ['metrics-panels'],
    queryFn: async () => {
      const res = await fetch('/api/metrics/panels');
      if (!res.ok) throw new Error('Failed to load panels');
      return res.json();
    },
    staleTime: 60_000,
  });

  const panels = panelsQuery.data?.panels || [];
  const filteredPanels = useMemo(
    () => panels.filter((p) => p.group === group),
    [panels, group]
  );

  const [panelId, setPanelId] = useState<string>('');
  const effectivePanelId = panelId || filteredPanels[0]?.id || '';

  const panelQuery = useQuery<MetricsPanelResponse>({
    queryKey: ['metrics-panel', effectivePanelId, range, step],
    enabled: Boolean(effectivePanelId),
    queryFn: async () => {
      const u = new URL('/api/metrics/panel', window.location.origin);
      u.searchParams.set('panelId', effectivePanelId);
      u.searchParams.set('range', range);
      u.searchParams.set('step', String(step));
      const res = await fetch(u.pathname + u.search);
      if (!res.ok) throw new Error('Failed to load panel');
      return res.json();
    },
    staleTime: 15_000,
  });

  const series = useMemo(() => {
    const s = panelQuery.data?.series || [];
    const f = seriesFilter.trim().toLowerCase();
    if (!f) return s;
    return s.filter((x) => x.seriesName.toLowerCase().includes(f));
  }, [panelQuery.data, seriesFilter]);

  const source = panelsQuery.data?.source || 'mock';
  const selectedPanel = panels.find((p) => p.id === effectivePanelId) || null;

  const handleExport = () => {
    if (!panelQuery.data) return;
    const csv = panelToCsv({ ...panelQuery.data, series });
    downloadText(`metrics-${effectivePanelId}-${range}.csv`, csv, 'text/csv');
  };

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6">
      <Box sx={{ maxWidth: '1200px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box>
          <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 800, mb: 1 }} className="glow-text">
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1, maxWidth: '800px' }}>
            Real-time insights from the stellAIverse engine. Monitor performance and business metrics with cosmic precision.
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
            Source: <span style={{ color: alpha(theme.palette.text.primary, 0.7), fontWeight: 600 }}>{source}</span>
          </Typography>
        </Box>

        <Box className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
          <Box className="flex gap-2 w-full md:w-auto">
            <Button 
              className="flex-1 md:flex-none"
              variant={group === 'system' ? 'primary' : 'outline'} 
              onClick={() => setGroup('system')}
            >
              System
            </Button>
            <Button 
              className="flex-1 md:flex-none"
              variant={group === 'business' ? 'primary' : 'outline'} 
              onClick={() => setGroup('business')}
            >
              Business
            </Button>
          </Box>

          <Box className="hidden md:block h-8 w-px bg-white/10" />

          <Grid container spacing={2} sx={{ flex: 1 }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'gray' }}>Panel</InputLabel>
                <Select
                  value={effectivePanelId}
                  label="Panel"
                  onChange={(e) => setPanelId(e.target.value)}
                  sx={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  {filteredPanels.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'gray' }}>Range</InputLabel>
                <Select
                  value={range}
                  label="Range"
                  onChange={(e) => setRange(e.target.value as MetricsRange)}
                  sx={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  {RANGES.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Step (s)"
                type="number"
                value={step}
                onChange={(e) => setStep(Number(e.target.value || 30))}
                InputProps={{ inputProps: { min: 5, max: 300 } }}
                sx={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              />
            </Grid>
          </Grid>

          <Button 
            className="w-full md:w-auto"
            variant="secondary" 
            onClick={handleExport} 
            disabled={!panelQuery.data || series.length === 0}
          >
            Export CSV
          </Button>
        </Box>

        {selectedPanel ? (
          <Box className="p-4 md:p-8 rounded-3xl border border-cosmic-purple/20 nebula-bg shadow-2xl relative overflow-hidden">
            <Box className="absolute top-0 right-0 w-64 h-64 bg-cosmic-purple/5 blur-[80px] rounded-full -z-10" />
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }} className="glow-text">
                {selectedPanel.title}
              </Typography>
              {selectedPanel.description && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {selectedPanel.description}
                </Typography>
              )}
            </Box>

            <Box className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
              <TextField
                fullWidth
                size="small"
                placeholder="Filter series (e.g. job=api)"
                value={seriesFilter}
                onChange={(e) => setSeriesFilter(e.target.value)}
                sx={{ 
                  maxWidth: '400px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                Showing <span style={{ color: 'white', fontWeight: 600 }}>{series.length}</span> series
              </Typography>
            </Box>

            {panelQuery.isLoading && <Typography sx={{ color: 'text.secondary', py: 8, textAlign: 'center' }}>Syncing with cosmos...</Typography>}
            {panelQuery.isError && <Typography sx={{ color: 'error.main', py: 8, textAlign: 'center' }}>Navigation failure. Cosmos unreachable.</Typography>}

            {panelQuery.data && (
              <Box className="space-y-8">
                <Box sx={{ minHeight: '300px', width: '100%' }}>
                  <MetricLineChart series={series} />
                </Box>
                <Box sx={{ overflowX: 'auto' }}>
                  <MetricSeriesTable series={series} />
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box className="py-20 text-center text-gray-500">
            <Typography>Select a constellation panel to begin observation.</Typography>
          </Box>
        )}
      </Box>
    </main>
  );
}
