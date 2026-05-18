import { create } from 'zustand'

export interface Simulation {
  id: string
  name: string
  version: string
  status: 'idle' | 'running' | 'success' | 'error'
  lastRun?: string
}

export interface SimulationRun {
  runId: string
  simulationId: string
  status: 'running' | 'success' | 'error'
  logs: string[]
  startedAt: string
}

export interface SimulationStore {
  simulations: Simulation[]
  runs: Record<string, SimulationRun>
  selectedSimulation: string | null
  errors: string | null
  lastFetched: string | null
  versionHighlights: Record<string, number>
  pollHandle: number | null

  loadSimulations: () => Promise<void>
  setSelectedSimulation: (id: string | null) => void
  startRun: (id: string) => Promise<void>
  reloadSimulation: (id: string) => Promise<void>
  fetchLogsForRun: (runId: string) => Promise<void>
  startAutoRefresh: () => void
  stopAutoRefresh: () => void
}

export const useSimulationStore = create<SimulationStore>(
  (set: (partial: Partial<SimulationStore> | ((state: SimulationStore) => Partial<SimulationStore>)) => void, get: () => SimulationStore) => ({
    simulations: [],
    runs: {},
    selectedSimulation: null,
    errors: null,
    lastFetched: null,
    versionHighlights: {},
    pollHandle: null,

    loadSimulations: async () => {
      try {
        const res = await fetch('/api/simulations')
        if (!res.ok) throw new Error('Failed to load simulations')
        const data: Simulation[] = await res.json()
        set((state: SimulationStore) => {
          const highlights: Record<string, number> = { ...state.versionHighlights }
          for (const s of data) {
            const prev = state.simulations.find(x => x.id === s.id)
            if (prev && prev.version !== s.version) {
              highlights[s.id] = Date.now()
            }
          }
          return { simulations: data, lastFetched: new Date().toISOString(), versionHighlights: highlights, errors: null }
        })
      } catch (err: any) {
        set({ errors: String(err.message || err) })
      }
    },

    setSelectedSimulation: (id: string | null) => set({ selectedSimulation: id }),

    startRun: async (id: string) => {
      try {
        const startedAt = new Date().toISOString()
        set((state: SimulationStore) => ({
          simulations: state.simulations.map(s => (s.id === id ? { ...s, status: 'running', lastRun: startedAt } : s)),
          errors: null,
        }))

        const res = await fetch(`/api/simulations/run/${id}`, { method: 'POST' })
        if (!res.ok) throw new Error('Failed to start run')
        const run: SimulationRun = await res.json()

        set((state: SimulationStore) => ({ runs: { ...state.runs, [run.runId]: run } }))

        const poll = window.setInterval(async () => {
          await get().fetchLogsForRun(run.runId)
          const r = get().runs[run.runId]
          if (r && (r.status === 'success' || r.status === 'error')) {
            window.clearInterval(poll)
          }
        }, 1000)
      } catch (err: any) {
        set({ errors: String(err.message || err) })
      }
    },

    reloadSimulation: async (id: string) => {
      try {
        const res = await fetch(`/api/simulations/reload/${id}`, { method: 'POST' })
        if (!res.ok) throw new Error('Failed to reload')
        await get().loadSimulations()
      } catch (err: any) {
        set({ errors: String(err.message || err) })
      }
    },

    fetchLogsForRun: async (runId: string) => {
      try {
        const res = await fetch(`/api/simulations/logs/${runId}`)
        if (!res.ok) throw new Error('Failed to fetch logs')
        const data = await res.json()
        set((state: SimulationStore) => {
          const run = state.runs[runId]
          if (!run) return {}
          const updated: SimulationRun = { ...run, logs: data.logs }
          const sim = state.simulations.find((s: Simulation) => s.id === run.simulationId)
          if (sim && (sim.status === 'success' || sim.status === 'error')) {
            updated.status = sim.status
          }
          return { runs: { ...state.runs, [runId]: updated } }
        })
      } catch (err: any) {
        set({ errors: String(err.message || err) })
      }
    },

    startAutoRefresh: () => {
      const current = get().pollHandle
      if (current) return
      const handle = window.setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
        get().loadSimulations()
      }, 5000)
      set({ pollHandle: handle })
    },

    stopAutoRefresh: () => {
      const h = get().pollHandle
      if (h) {
        window.clearInterval(h)
        set({ pollHandle: null })
      }
    },
  }),
)

export default useSimulationStore
