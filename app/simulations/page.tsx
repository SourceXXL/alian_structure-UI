"use client"
import React, { useEffect } from "react"
import SimulationList from "../../components/simulations/SimulationList"
import SimulationRunner from "../../components/simulations/SimulationRunner"
import useSimulationStore, { SimulationStore } from "../../store/useSimulationStore"

export default function SimulationsPage() {
  const [loadSimulations, startAutoRefresh, stopAutoRefresh, selectedSimulation, errors] = useSimulationStore((state: SimulationStore) => [state.loadSimulations, state.startAutoRefresh, state.stopAutoRefresh, state.selectedSimulation, state.errors])

  useEffect(() => {
    loadSimulations()
    startAutoRefresh()
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stopAutoRefresh()
      else startAutoRefresh()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stopAutoRefresh()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [loadSimulations, startAutoRefresh, stopAutoRefresh])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Simulation Environment Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside className="md:col-span-1">
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Environments</h3>
            </div>
            <SimulationList />
          </div>
        </aside>

        <main className="md:col-span-2">
          <div className="bg-white p-4 rounded shadow-sm">
            {selectedSimulation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Details</h2>
                </div>
                <SimulationRunner simulationId={selectedSimulation} />
              </div>
            ) : (
              <div className="text-sm text-slate-500">Select a simulation to view details.</div>
            )}
            {errors ? <div className="mt-3 text-sm text-red-600">{errors}</div> : null}
          </div>
        </main>
      </div>
    </div>
  )
}
