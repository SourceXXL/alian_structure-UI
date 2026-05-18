'use client'
import React from 'react'
import SimulationCard from './SimulationCard'
import useSimulationStore, { Simulation as StoreSimulation, SimulationStore } from '../../store/useSimulationStore'
import { useDebounce } from 'use-debounce';

interface OptimizedSimulationListProps {
  height?: number;
  itemHeight?: number;
  debounceMs?: number;
}

const OptimizedSimulationList: React.FC<OptimizedSimulationListProps> = React.memo(({ 
  height = 600,
  itemHeight = 120,
  debounceMs = 300
}) => {
  const [sims, selectedSimulation] = useSimulationStore((state: SimulationStore) => [state.simulations, state.selectedSimulation]);
  const [debouncedSims] = useDebounce(sims || [], debounceMs);

  const renderSimulationItem = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const sim = debouncedSims[index];
    if (!sim) return null;
    
    return (
      <div style={style}>
        <SimulationCard 
          key={sim.id} 
          sim={sim} 
          selected={selectedSimulation === sim.id} 
        />
      </div>
    );
  });

  renderSimulationItem.displayName = 'RenderSimulationItem';

  if (!debouncedSims || debouncedSims.length === 0) {
    return <div className="p-4 text-sm text-slate-500">No simulations available.</div>;
  }

  return (
    <div className="space-y-3" style={{ height, overflow: 'auto' }}>
      {debouncedSims.map((sim: StoreSimulation, index: number) => (
        <SimulationCard 
          key={sim.id} 
          sim={sim} 
          selected={selectedSimulation === sim.id} 
        />
      ))}
    </div>
  );
});

OptimizedSimulationList.displayName = 'OptimizedSimulationList';

export default OptimizedSimulationList;
