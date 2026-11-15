// Demo historical trend data for the "Historical Trend Analysis" panel.
// These values are sample/demo data and must not be confused with live backend intelligence.
import type { AssessmentStatus } from '../types'

export interface DemoTrendMetric {
  label: string
  value: string
  tone: 'cyan' | 'red' | 'green' | 'default'
}

export interface DemoTimeSeriesPoint {
  x: string
  y: number
}

export interface DemoHistoricalTrends {
  metrics: DemoTrendMetric[]
  timeSeries: DemoTimeSeriesPoint[]
  status: AssessmentStatus
}

export const demoHistoricalTrends: DemoHistoricalTrends = {
  metrics: [
    { label: 'WEEK-OVER-WEEK', value: '+8.3%', tone: 'cyan' },
    { label: 'TOTAL REPORTS (7D)', value: '4,218', tone: 'default' },
    { label: 'CRITICAL EVENTS', value: '12', tone: 'red' },
    { label: 'RESPONSE TIME', value: '−22%', tone: 'green' },
  ],
  timeSeries: [
    { x: 'Mon', y: 450 },
    { x: 'Tue', y: 520 },
    { x: 'Wed', y: 380 },
    { x: 'Thu', y: 610 },
    { x: 'Fri', y: 490 },
    { x: 'Sat', y: 430 },
    { x: 'Sun', y: 560 },
  ],
  status: 'success',
}