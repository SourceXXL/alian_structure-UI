'use client'
import React from 'react'
import type { SimulationStatus } from '../../lib/simulations'

const STATUS_MAP: Record<SimulationStatus, { color: string; label: string }> = {
  idle: { color: 'bg-gray-400', label: 'Idle' },
  running: { color: 'bg-yellow-400', label: 'Running' },
  success: { color: 'bg-green-500', label: 'Success' },
  error: { color: 'bg-red-500', label: 'Error' },
}

export const StatusBadge: React.FC<{ status: SimulationStatus }> = ({ status }) => {
  const meta = STATUS_MAP[status]
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${meta.color}`} />
      <span className="text-sm text-gray-700">{meta.label}</span>
    </div>
  )
}

export default StatusBadge
