'use client';

import React, { useEffect, useState, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage?: number;
}

interface PerformanceMonitorProps {
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
  targetFPS?: number;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = React.memo(({
  onPerformanceUpdate,
  targetFPS = 60
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const measurePerformance = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;
      
      frameCountRef.current++;
      
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
        const renderTime = deltaTime / frameCountRef.current;
        const memoryUsage = (performance as any).memory ? 
          Math.round((performance as any).memory.usedJSHeapSize / 1048576) : 0;
        
        const newMetrics = { fps, renderTime, memoryUsage };
        setMetrics(newMetrics);
        onPerformanceUpdate?.(newMetrics);
        
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      
      animationFrameRef.current = requestAnimationFrame(measurePerformance);
    };

    animationFrameRef.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onPerformanceUpdate]);

  const isPerformant = metrics.fps >= targetFPS;
  const performanceColor = isPerformant ? 'text-green-400' : 'text-red-400';

  return (
    <div className="fixed top-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs font-mono z-50">
      <h3 className="text-white font-semibold mb-2">Performance Monitor</h3>
      <div className={`space-y-1 ${performanceColor}`}>
        <div>FPS: {metrics.fps}</div>
        <div>Render Time: {metrics.renderTime.toFixed(2)}ms</div>
        {metrics.memoryUsage && (
          <div>Memory: {metrics.memoryUsage}MB</div>
        )}
        <div className={`font-semibold ${isPerformant ? 'text-green-500' : 'text-red-500'}`}>
          {isPerformant ? '✓ Target Met' : `✗ Below ${targetFPS} FPS`}
        </div>
      </div>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;
