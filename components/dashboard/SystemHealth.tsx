'use client'

import { Bot, Database, Layers3, Radio } from 'lucide-react'
import Panel from './Panel'
import type { SystemHealthService } from '@/lib/types'

export interface SystemHealthMetrics {
  services?: SystemHealthService[]
  recordsReceived?: string
  processingLatency?: string
  uptime?: string
  throughput?: string
}

export default function SystemHealth({ metrics }: { metrics?: SystemHealthMetrics } = {}) {
  const m = metrics ?? {
    services: [
      { name: 'Data ingestion', status: '—' },
      { name: 'Kafka stream', status: '—' },
      { name: 'PostgreSQL', status: '—' },
      { name: 'AI processing', status: '—' },
    ],
    recordsReceived: '—',
    processingLatency: '—',
    uptime: '—',
    throughput: '—',
  }
  const services: SystemHealthService[] = m.services ?? []

  return (
    <Panel
      title="Data pipeline & system health"
      eyebrow="INFRASTRUCTURE MONITORING"
      className="health-panel"
    >
      <div className="health-grid">
        {services.map(({ name, status }, idx) => {
          const Icon = [Radio, Layers3, Database, Bot][idx]
          return (
            <div className="health-item" key={name}>
              <Icon size={16} />
              <span>
                {name}
                <b>
                  <i />
                </b>
              </span>
              <strong>{status}</strong>
            </div>
          )
        })}
        <div className="health-stat">
          <span>RECORDS RECEIVED</span>
          <b>{m.recordsReceived}</b>
          <small>in last 5 min</small>
        </div>
        <div className="health-stat">
          <span>PROCESSING LATENCY</span>
          <b>{m.processingLatency}</b>
          <small className="up">—</small>
        </div>
      </div>
      <div className="health-extra">
        <div className="health-extra-item">
          <span className="eyebrow">UPTIME</span>
          <b>{m.uptime} (illustrative)</b>
          <small>30-day rolling</small>
        </div>
        <div className="health-extra-item">
          <span className="eyebrow">THROUGHPUT</span>
          <b>{m.throughput} (illustrative)</b>
          <small>Peak: 3,200/s</small>
        </div>
      </div>
    </Panel>
  )
}
