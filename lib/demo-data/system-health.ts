// Demo system health telemetry data for the "System Health" panel.
// These values are sample/demo data and must not be confused with live infrastructure metrics.
export interface DemoSystemHealthService {
  name: string
  status: string
}

export interface DemoSystemHealthMetrics {
  services: DemoSystemHealthService[]
  recordsReceived: string
  processingLatency: string
  uptime: string
  throughput: string
}

export const demoSystemHealthMetrics: DemoSystemHealthMetrics = {
  services: [
    { name: 'Data ingestion', status: '99.9%' },
    { name: 'Kafka stream', status: '99.5%' },
    { name: 'PostgreSQL', status: '99.9%' },
    { name: 'AI processing', status: '98.7%' },
  ],
  recordsReceived: '12,480',
  processingLatency: '240 ms',
  uptime: '99.97%',
  throughput: '2,486/s',
}