export type SimulationStatus = 'idle' | 'running' | 'success' | 'error'

export type Simulation = {
  id: string
  name: string
  version: string
  status: SimulationStatus
  lastRun?: string
}

export type SimulationRun = {
  runId: string
  simulationId: string
  status: 'running' | 'success' | 'error'
  logs: string[]
  startedAt: string
}

const simulations: Simulation[] = [
  { id: 'sim-a', name: 'Agent Behavior Test', version: 'v1.0.0', status: 'idle' },
  { id: 'sim-b', name: 'Network Stress', version: 'v1.2.3', status: 'idle' },
  { id: 'sim-c', name: 'Storage Fuzz', version: 'v0.9.1', status: 'idle' },
]

const runs = new Map<string, SimulationRun>()

export async function getSimulations(): Promise<Simulation[]> {
  // return a deep copy to avoid accidental mutation
  return simulations.map(s => ({ ...s }))
}

export async function runSimulation(simulationId: string): Promise<SimulationRun> {
  const sim = simulations.find(s => s.id === simulationId)
  if (!sim) throw new Error('Simulation not found')

  const runId = `${simulationId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const startedAt = new Date().toISOString()
  const run: SimulationRun = {
    runId,
    simulationId,
    status: 'running',
    logs: [],
    startedAt,
  }

  runs.set(runId, run)

  // optimistic update on simulation
  sim.status = 'running'
  sim.lastRun = startedAt

  // simulate log streaming and eventual completion
  const steps = [
    `Starting simulation ${sim.name}`,
    'Initializing modules...',
    'Connecting to mock network...',
    'Running checks...',
  ]

  steps.forEach((msg, idx) => {
    setTimeout(() => {
      const r = runs.get(runId)
      if (r) {
        r.logs.push(`[${new Date().toISOString()}] ${msg}`)
      }
    }, 400 * (idx + 1))
  })

  // finish after a short delay with random success/failure
  setTimeout(() => {
    const success = Math.random() > 0.15
    const r = runs.get(runId)
    if (!r) return
    r.logs.push(`[${new Date().toISOString()}] ${success ? 'Simulation completed successfully' : 'Simulation failed with error code 42'}`)
    r.status = success ? 'success' : 'error'

    // update simulation status
    const s = simulations.find(x => x.id === simulationId)
    if (s) s.status = r.status === 'success' ? 'success' : 'error'
  }, 400 * (steps.length + 4))

  return { ...run }
}

export async function getLogs(runId: string): Promise<string[]> {
  const r = runs.get(runId)
  return r ? [...r.logs] : []
}

export async function reloadSimulation(simulationId: string): Promise<Simulation> {
  const s = simulations.find(x => x.id === simulationId)
  if (!s) throw new Error('Simulation not found')

  // bump patch version
  const m = s.version.match(/v?(\d+)\.(\d+)\.(\d+)/)
  if (m) {
    const major = Number(m[1])
    const minor = Number(m[2])
    const patch = Number(m[3]) + 1
    s.version = `v${major}.${minor}.${patch}`
  } else {
    s.version = s.version + '.1'
  }
  // hint status change
  s.status = 'idle'
  return { ...s }
}

export async function getRun(runId: string): Promise<SimulationRun | null> {
  const r = runs.get(runId)
  return r ? { ...r } : null
}
