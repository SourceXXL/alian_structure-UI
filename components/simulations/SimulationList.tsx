'use client'
import React from 'react'
import SimulationCard from './SimulationCard'
import useSimulationStore, { Simulation as StoreSimulation, SimulationStore } from '../../store/useSimulationStore'

const SimulationList: React.FC = React.memo(() => {
  const [sims, selectedSimulation] = useSimulationStore((state: SimulationStore) => [state.simulations, state.selectedSimulation])

  if (!sims || sims.length === 0) {
    return <div className="p-4 text-sm text-slate-500">No simulations available.</div>
  }

  return (
    <div className="space-y-3">
      {sims.map((sim: StoreSimulation) => (
        <SimulationCard key={sim.id} sim={sim} selected={selectedSimulation === sim.id} />
      ))}
    </div>
  )
});

SimulationList.displayName = 'SimulationList';

export default SimulationList
