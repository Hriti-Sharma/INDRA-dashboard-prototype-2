// Demo AI risk assessment rows for the "AI Risk Intelligence" panel.
// These values are sample/demo data and must not be confused with live backend ML predictions.
// Assessments are linked to incidents using stable canonical string IDs.
import type { AssessmentStatus } from '../types'

export interface DemoAIRiskRow {
  canonicalIncidentId: string
  event: string
  location: string
  severity: 'critical' | 'high' | 'moderate' | 'low'
  confidence: string
  reports: number
  status: AssessmentStatus
  modelVersion: string
  assessedAt: string
}

export const demoAIRiskRows: DemoAIRiskRow[] = [
  {
    canonicalIncidentId: 'IND-2025-DEL-001',
    event: 'Heatwave',
    location: 'Delhi NCR',
    severity: 'critical',
    confidence: '96%',
    reports: 231,
    status: 'success',
    modelVersion: 'indra-ai-v2.1',
    assessedAt: '2025-01-15T10:30:00Z',
  },
  {
    canonicalIncidentId: 'IND-2025-BEN-002',
    event: 'Heavy Rainfall',
    location: 'Bengaluru Urban',
    severity: 'high',
    confidence: '92%',
    reports: 148,
    status: 'success',
    modelVersion: 'indra-ai-v2.1',
    assessedAt: '2025-01-15T10:25:00Z',
  },
  {
    canonicalIncidentId: 'IND-2025-ODI-003',
    event: 'Cyclone',
    location: 'Odisha Coast',
    severity: 'critical',
    confidence: '97%',
    reports: 392,
    status: 'processing',
    modelVersion: 'indra-ai-v2.1',
    assessedAt: '2025-01-15T10:45:00Z',
  },
]