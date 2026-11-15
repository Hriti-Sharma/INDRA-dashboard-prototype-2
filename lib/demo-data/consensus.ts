// Demo consensus and reliability assessment data for the "Data Reliability & Source Consensus" panel.
// These values are sample/demo data and must not be confused with live backend intelligence.
// canonicalIncidentId is undefined for national overview assessments.
import type { AssessmentStatus } from '../types'

export interface DemoConsensusAssessment {
  canonicalIncidentId?: string
  sourceAgreement: number
  independentSources: number
  consensusLevel: 'High' | 'Medium' | 'Low'
  reliabilityIndex: number
  status: AssessmentStatus
  modelVersion: string
  assessedAt: string
}

export const demoNationalConsensus: DemoConsensusAssessment = {
  sourceAgreement: 76,
  independentSources: 3,
  consensusLevel: 'High',
  reliabilityIndex: 88,
  status: 'success',
  modelVersion: 'indra-consensus-v1.0',
  assessedAt: '2025-01-15T09:00:00Z',
}

export const demoIncidentConsensus: Record<string, DemoConsensusAssessment> = {
  'IND-2025-DEL-001': {
    canonicalIncidentId: 'IND-2025-DEL-001',
    sourceAgreement: 82,
    independentSources: 4,
    consensusLevel: 'High',
    reliabilityIndex: 91,
    status: 'success',
    modelVersion: 'indra-consensus-v1.0',
    assessedAt: '2025-01-15T10:30:00Z',
  },
  'IND-2025-BEN-002': {
    canonicalIncidentId: 'IND-2025-BEN-002',
    sourceAgreement: 68,
    independentSources: 2,
    consensusLevel: 'Medium',
    reliabilityIndex: 74,
    status: 'success',
    modelVersion: 'indra-consensus-v1.0',
    assessedAt: '2025-01-15T10:25:00Z',
  },
}