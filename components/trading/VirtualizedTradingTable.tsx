'use client';

import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useDebounce } from 'use-debounce';
import { TradingDataPoint } from './OptimizedTradingChart';

interface VirtualizedTradingTableProps {
  data: TradingDataPoint[];
  height?: number;
  rowHeight?: number;
  debounceMs?: number;
  maxVisibleRows?: number;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: TradingDataPoint[];
}

// Memoized cell formatters
const formatCell = {
  timestamp: React.memo((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }),
  
  price: React.memo((price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  }),
  
  volume: React.memo((volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return volume.toFixed(0);
  }),
  
  change: React.memo((open: number, close: number) => {
    const change = close - open;
    const changePercent = (change / open) * 100;
    const isPositive = change >= 0;
    
    return (
      <span style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>
        {isPositive ? '+' : ''}{change.toFixed(4)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
      </span>
    );
  }),
};

// Memoized row component
const TableRow = React.memo<RowProps>(({ index, style, data }) => {
  const item = data[index];
  
  return (
    <div 
      style={{
        ...style,
        display: 'flex',
        borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
        alignItems: 'center',
        padding: '0 12px',
        fontSize: '12px',
        backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(139, 92, 246, 0.05)',
      }}
    >
      <div style={{ flex: '0 0 140px', color: '#cbd5e1' }}>
        {formatCell.timestamp(item.timestamp)}
      </div>
      <div style={{ flex: '0 0 100px', textAlign: 'right', color: '#8b5cf6' }}>
        {formatCell.price(item.price)}
      </div>
      <div style={{ flex: '0 0 80px', textAlign: 'right', color: '#06b6d4' }}>
        {formatCell.volume(item.volume)}
      </div>
      <div style={{ flex: '0 0 80px', textAlign: 'right', color: '#22c55e' }}>
        {formatCell.price(item.high)}
      </div>
      <div style={{ flex: '0 0 80px', textAlign: 'right', color: '#ef4444' }}>
        {formatCell.price(item.low)}
      </div>
      <div style={{ flex: '0 0 80px', textAlign: 'right', color: '#cbd5e1' }}>
        {formatCell.price(item.open)}
      </div>
      <div style={{ flex: '0 0 80px', textAlign: 'right', color: '#cbd5e1' }}>
        {formatCell.price(item.close)}
      </div>
      <div style={{ flex: '1', textAlign: 'right' }}>
        {formatCell.change(item.open, item.close)}
      </div>
    </div>
  );
});

TableRow.displayName = 'TableRow';

// Memoized header component
const TableHeader = React.memo(() => (
  <div 
    style={{
      display: 'flex',
      borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
      backgroundColor: 'rgba(2, 6, 23, 0.9)',
      padding: '8px 12px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#cbd5e1',
      position: 'sticky',
      top: 0,
      zIndex: 1,
    }}
  >
    <div style={{ flex: '0 0 140px' }}>Time</div>
    <div style={{ flex: '0 0 100px', textAlign: 'right' }}>Price</div>
    <div style={{ flex: '0 0 80px', textAlign: 'right' }}>Volume</div>
    <div style={{ flex: '0 0 80px', textAlign: 'right' }}>High</div>
    <div style={{ flex: '0 0 80px', textAlign: 'right' }}>Low</div>
    <div style={{ flex: '0 0 80px', textAlign: 'right' }}>Open</div>
    <div style={{ flex: '0 0 80px', textAlign: 'right' }}>Close</div>
    <div style={{ flex: '1', textAlign: 'right' }}>Change</div>
  </div>
));

TableHeader.displayName = 'TableHeader';

const VirtualizedTradingTable: React.FC<VirtualizedTradingTableProps> = React.memo(({
  data,
  height = 400,
  rowHeight = 32,
  debounceMs = 300,
  maxVisibleRows = 1000,
}) => {
  const [debouncedData] = useDebounce(data, debounceMs);

  // Memoize processed data with downsampling if needed
  const processedData = useMemo(() => {
    if (!debouncedData || debouncedData.length === 0) return [];
    
    // Downsample data if too many rows
    if (debouncedData.length > maxVisibleRows) {
      const step = Math.ceil(debouncedData.length / maxVisibleRows);
      return debouncedData.filter((_, index) => index % step === 0);
    }
    
    return debouncedData;
  }, [debouncedData, maxVisibleRows]);

  // Early return for empty data
  if (!processedData || processedData.length === 0) {
    return (
      <div 
        style={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#cbd5e1',
          fontSize: '14px',
          backgroundColor: 'rgba(2, 6, 23, 0.5)',
          borderRadius: '8px',
        }}
      >
        No trading data available
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px' }}>
      <TableHeader />
      <List
        height={height - 40} // Account for header height
        itemCount={processedData.length}
        itemSize={rowHeight}
        itemData={processedData}
        className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
        overscanCount={5} // Render 5 extra rows above/below viewport for smoother scrolling
      >
        {TableRow}
      </List>
    </div>
  );
});

VirtualizedTradingTable.displayName = 'VirtualizedTradingTable';

export default VirtualizedTradingTable;
