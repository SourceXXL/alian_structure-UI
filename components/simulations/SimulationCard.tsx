'use client'
import React from 'react'
import { StatusBadge } from './StatusBadge'
import useSimulationStore, { Simulation as StoreSimulation, SimulationStore } from '../../store/useSimulationStore'

type Props = {
  sim: StoreSimulation
  selected?: boolean
}

export const SimulationCard: React.FC<Props> = React.memo(({ sim, selected }) => {
  const [startRun, reloadSimulation, setSelectedSimulation] = useSimulationStore((state: SimulationStore) => [state.startRun, state.reloadSimulation, state.setSelectedSimulation])
  const disabled = sim.status === 'running'
  const highlight = Boolean(useSimulationStore.getState().versionHighlights[sim.id])

  return (
    <div
      onClick={() => setSelectedSimulation(sim.id)}
      className={`p-4 border rounded-md cursor-pointer flex justify-between items-center gap-4 ${
        selected ? 'bg-slate-50 border-slate-300' : 'bg-white border-gray-200'
      }`}
    >
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium">{sim.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full text-slate-700 ${highlight ? 'bg-amber-100 animate-pulse' : 'bg-slate-100'}`}>{sim.version}</span>
        </div>
        <div className="mt-2 text-xs text-slate-600">
          <StatusBadge status={sim.status} />
          {sim.lastRun ? <div className="text-xs text-slate-500 mt-1">Last run: {new Date(sim.lastRun).toLocaleString()}</div> : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={e => {
            e.stopPropagation()
            reloadSimulation(sim.id)
          }}
          className="text-xs px-3 py-1 border rounded text-slate-700 hover:bg-slate-50"
        >
          Reload
        </button>
        <button
          onClick={e => {
            e.stopPropagation()
            startRun(sim.id)
          }}
          disabled={disabled}
          className={`text-xs px-3 py-1 rounded text-white ${disabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {disabled ? 'Running…' : 'Run'}
        </button>
      </div>
    </div>
  )
});

SimulationCard.displayName = 'SimulationCard';

export default SimulationCard
