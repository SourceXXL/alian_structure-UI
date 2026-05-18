'use client'
import React, { useEffect, useRef } from 'react'

export const SimulationLogs: React.FC<{ logs: string[] }> = ({ logs }) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight
    }
  }, [logs.length])

  if (!logs || logs.length === 0) {
    return <div className="p-4 text-sm text-slate-500">No logs yet.</div>
  }

  return (
    <div ref={ref} className="bg-black text-green-200 font-mono text-xs p-3 rounded h-64 overflow-auto">
      {logs.map((l, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {l}
        </div>
      ))}
    </div>
  )
}

export default SimulationLogs
