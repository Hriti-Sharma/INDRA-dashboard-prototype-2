/* ===== Analysis data-source boundary for INDRA =====

This module provides:
1. An asynchronous-capable data-source interface (AnalysisDataSource)
2. A static demo implementation that loads from lib/demo-data/

Existing dashboard types (Incident, Alert, Severity, LifecycleStage) are
NOT modified. This module is additive.

Demo data is clearly labelled synthetic. The implementation uses supplied
canonical values wherever available.
*/

import type {
  AnalysisData,
  AssessmentStatus,
  ConsensusAssessment,
  HistoricalTrends,
  SystemHealthTelemetry,
} from './types'
import {
  demoAIClassification,
  demoAIRiskRows,
  demoHistoricalTrends,
  demoIncidentConsensus,
  demoNationalConsensus,
  demoSourceDistribution,
  demoSystemHealthMetrics,
} from './demo-data'

/* ------------------------------------------------------------------ */
/*  Data-source interface                                             */
/* ------------------------------------------------------------------ */

export interface AnalysisDataSource {
  readonly schemaVersion: string
  readonly generatedAt: string
  /** Asynchronous analysis data load. Called once; results are cached. */
  loadAnalysisData(): Promise<AnalysisData>
  /** Convenience: analysis data from the last successful load. */
  getAnalysisData(): AnalysisData | null
  isLoading(): boolean
  getError(): Error | null
}

/* ------------------------------------------------------------------ */
/*  Static demo implementation                                        */
/* ------------------------------------------------------------------ */

export class DemoAnalysisDataSource implements AnalysisDataSource {
  private dataset: AnalysisData | null = null
  private loading = false
  private error: Error | null = null

  constructor() {}

  readonly schemaVersion = '1.0.0'
  readonly generatedAt = '2025-01-15T00:00:00Z'

  async loadAnalysisData(): Promise<AnalysisData> {
    this.loading = true
    this.error = null
    try {
      // Simulate async loading boundary
      const data: AnalysisData = await this.buildAnalysisData()
      this.dataset = data
      return data
    } catch (err) {
      this.error = err instanceof Error ? err : new Error(String(err))
      throw this.error
    } finally {
      this.loading = false
    }
  }

  getAnalysisData(): AnalysisData | null {
    return this.dataset
  }

  isLoading(): boolean {
    return this.loading
  }

  getError(): Error | null {
    return this.error
  }

  private async buildAnalysisData(): Promise<AnalysisData> {
    // Convert demo data into typed AnalysisData shape
    const sourceDistribution: AnalysisData['sourceDistribution'] = demoSourceDistribution.map(
      ({ source, count }) => ({ source, count })
    )

    const aiClassification: AnalysisData['aiClassification'] = demoAIClassification.map(
      ({ eventType, count }) => ({ eventType, count })
    )

    const aiRiskAssessments: AnalysisData['aiRiskAssessments'] = demoAIRiskRows.map(
      (row) => ({
        canonicalIncidentId: row.canonicalIncidentId,
        event: row.event,
        location: row.location,
        severity: row.severity,
        confidence: row.confidence,
        reports: row.reports,
        status: row.status,
        modelVersion: row.modelVersion,
        assessedAt: row.assessedAt,
      })
    )

    const consensus: AnalysisData['consensus'] = demoNationalConsensus

    // Incident-specific consensus keyed by canonical string incident ID.
    // Dashboard numeric IDs are derived and unstable; canonical IDs are the
    // stable reference for backend-assigned assessments.
    const incidentConsensusById: AnalysisData['incidentConsensusById'] = {
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

    const historicalTrends: AnalysisData['historicalTrends'] = {
      metrics: demoHistoricalTrends.metrics.map((m) => ({
        label: m.label,
        value: m.value,
        tone: m.tone,
      })),
      timeSeries: demoHistoricalTrends.timeSeries.map((p) => ({
        x: p.x,
        y: p.y,
      })),
      status: demoHistoricalTrends.status,
    }

    const systemHealth: AnalysisData['systemHealth'] = {
      services: demoSystemHealthMetrics.services.map((s) => ({
        name: s.name,
        status: s.status,
      })),
      recordsReceived: demoSystemHealthMetrics.recordsReceived,
      processingLatency: demoSystemHealthMetrics.processingLatency,
      uptime: demoSystemHealthMetrics.uptime,
      throughput: demoSystemHealthMetrics.throughput,
    }

    return {
      sourceDistribution,
      aiClassification,
      aiRiskAssessments,
      consensus,
      incidentConsensusById,
      historicalTrends,
      systemHealth,
      status: 'success' as AssessmentStatus,
    }
  }

  /** Resolve consensus assessment for a specific incident, falling back to national. */
  getConsensusForIncident(canonicalIncidentId: string): ConsensusAssessment {
    const incidentConsensus = demoIncidentConsensus[canonicalIncidentId]
    if (incidentConsensus) {
      return incidentConsensus
    }
    return demoNationalConsensus
  }
}