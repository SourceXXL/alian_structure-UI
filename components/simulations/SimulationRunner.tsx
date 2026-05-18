"use client"
import React from "react"
import SimulationLogs from "./SimulationLogs"
import useSimulationStore, { SimulationStore, SimulationRun } from "../../store/useSimulationStore"

export const SimulationRunner: React.FC<{ simulationId: string | null }> = ({ simulationId }) => {
  const [startRun, fetchLogsForRun, runs] = useSimulationStore((state: SimulationStore) => [state.startRun, state.fetchLogsForRun, state.runs])

  const runList: SimulationRun[] = Object.values(runs).filter((r: SimulationRun) => r.simulationId === simulationId).sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => simulationId && startRun(simulationId)}
          disabled={!simulationId}
          className={`px-3 py-1 rounded text-white ${simulationId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
        >
          Run Selected
        </button>
      </div>

      <div>
        <h4 className="text-sm font-medium">Run History</h4>
        <div className="space-y-3 mt-2">
          {runList.length === 0 && <div className="text-sm text-slate-500">No runs yet.</div>}
          {runList.map((r: SimulationRun) => (
            <div key={r.runId} className="p-3 border rounded">
              <div className="flex justify-between items-center">
                <div className="text-sm">Run {r.runId}</div>
                <div className="text-xs text-slate-600">{r.status}</div>
              </div>
              <div className="mt-2">
                <SimulationLogs logs={r.logs} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SimulationRunner
