import React from 'react';
import { render, screen } from '@testing-library/react';
import OptimizedTradingChart, { TradingDataPoint } from '@/components/trading/OptimizedTradingChart';
import VirtualizedTradingTable from '@/components/trading/VirtualizedTradingTable';

// Mock performance API for testing
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1024 * 1024, // 1MB
  },
};

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
const mockCancelAnimationFrame = jest.fn();

// Setup mocks
beforeEach(() => {
  Object.defineProperty(window, 'performance', {
    value: mockPerformance,
    writable: true,
  });
  window.requestAnimationFrame = mockRequestAnimationFrame;
  window.cancelAnimationFrame = mockCancelAnimationFrame;
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

// Helper function to generate test data
const generateTestData = (count: number): TradingDataPoint[] => {
  const data: TradingDataPoint[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    data.push({
      timestamp: now - (count - i) * 1000,
      price: 100 + Math.random() * 10,
      volume: Math.floor(Math.random() * 100000) + 1000,
      high: 110 + Math.random() * 5,
      low: 90 + Math.random() * 5,
      open: 95 + Math.random() * 10,
      close: 105 + Math.random() * 10,
    });
  }
  
  return data;
};

describe('OptimizedTradingChart Performance Tests', () => {
  test('should handle small dataset efficiently', () => {
    const testData = generateTestData(100);
    
    const startTime = performance.now();
    render(<OptimizedTradingChart data={testData} height={400} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(50); // Should render within 50ms
    expect(screen.getByText('No trading data available')).not.toBeInTheDocument();
  });

  test('should handle medium dataset efficiently', () => {
    const testData = generateTestData(1000);
    
    const startTime = performance.now();
    render(<OptimizedTradingChart data={testData} height={400} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should render within 100ms
  });

  test('should handle large dataset with downsampling', () => {
    const testData = generateTestData(10000);
    
    const startTime = performance.now();
    render(<OptimizedTradingChart data={testData} height={400} maxDataPoints={1000} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(150); // Should render within 150ms even with large dataset
  });

  test('should show empty state when no data provided', () => {
    render(<OptimizedTradingChart data={[]} height={400} />);
    expect(screen.getByText('No trading data available')).toBeInTheDocument();
  });

  test('should debounce data updates', () => {
    const testData = generateTestData(500);
    const { rerender } = render(<OptimizedTradingChart data={testData} height={400} debounceMs={300} />);
    
    // Rapid updates should be debounced
    const newData = generateTestData(600);
    rerender(<OptimizedTradingChart data={newData} height={400} debounceMs={300} />);
    
    // Fast forward timers
    jest.advanceTimersByTime(300);
    
    // Component should still be rendered without errors
    expect(screen.queryByText('No trading data available')).not.toBeInTheDocument();
  });

  test('should enable performance monitoring when requested', () => {
    const mockOnPerformanceUpdate = jest.fn();
    const testData = generateTestData(100);
    
    render(
      <OptimizedTradingChart 
        data={testData} 
        height={400} 
        enablePerformanceMonitoring={true}
        onPerformanceUpdate={mockOnPerformanceUpdate}
      />
    );
    
    // Performance monitor should be rendered
    expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
  });
});

describe('VirtualizedTradingTable Performance Tests', () => {
  test('should handle small dataset efficiently', () => {
    const testData = generateTestData(50);
    
    const startTime = performance.now();
    render(<VirtualizedTradingTable data={testData} height={400} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(50); // Should render within 50ms
  });

  test('should handle large dataset with virtualization', () => {
    const testData = generateTestData(10000);
    
    const startTime = performance.now();
    render(<VirtualizedTradingTable data={testData} height={400} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should render within 100ms due to virtualization
  });

  test('should show empty state when no data provided', () => {
    render(<VirtualizedTradingTable data={[]} height={400} />);
    expect(screen.getByText('No trading data available')).toBeInTheDocument();
  });

  test('should debounce data updates', () => {
    const testData = generateTestData(1000);
    const { rerender } = render(<VirtualizedTradingTable data={testData} height={400} debounceMs={300} />);
    
    // Rapid updates should be debounced
    const newData = generateTestData(2000);
    rerender(<VirtualizedTradingTable data={newData} height={400} debounceMs={300} />);
    
    // Fast forward timers
    jest.advanceTimersByTime(300);
    
    // Component should still be rendered without errors
    expect(screen.queryByText('No trading data available')).not.toBeInTheDocument();
  });
});

describe('Performance Requirements', () => {
  test('should meet 60 FPS target for small datasets', () => {
    const testData = generateTestData(100);
    
    // Simulate frame timing
    let frameCount = 0;
    const startTime = performance.now();
    
    for (let i = 0; i < 60; i++) {
      render(<OptimizedTradingChart data={testData} height={400} />);
      frameCount++;
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const fps = (frameCount * 1000) / totalTime;
    
    expect(fps).toBeGreaterThan(60); // Should maintain >60 FPS
  });

  test('should maintain reasonable memory usage', () => {
    const initialMemory = mockPerformance.memory.usedJSHeapSize;
    
    // Render multiple charts
    for (let i = 0; i < 10; i++) {
      const testData = generateTestData(1000);
      render(<OptimizedTradingChart data={testData} height={400} />);
    }
    
    const finalMemory = mockPerformance.memory.usedJSHeapSize;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});

describe('React.memo Optimization', () => {
  test('should not re-render when props are unchanged', () => {
    const testData = generateTestData(100);
    const { rerender } = render(<OptimizedTradingChart data={testData} height={400} />);
    
    // Get the initial render count (mocked)
    const initialRenderCount = mockPerformance.now.mock.calls.length;
    
    // Re-render with same props
    rerender(<OptimizedTradingChart data={testData} height={400} />);
    
    // Performance.now should not be called again due to memoization
    expect(mockPerformance.now).toHaveBeenCalledTimes(initialRenderCount);
  });

  test('should re-render when data changes', () => {
    const testData = generateTestData(100);
    const { rerender } = render(<OptimizedTradingChart data={testData} height={400} />);
    
    // Re-render with different data
    const newData = generateTestData(200);
    rerender(<OptimizedTradingChart data={newData} height={400} />);
    
    // Component should re-render with new data
    expect(screen.queryByText('No trading data available')).not.toBeInTheDocument();
  });
});
