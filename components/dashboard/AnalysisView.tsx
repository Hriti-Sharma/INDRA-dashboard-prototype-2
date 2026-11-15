'use client'

import { useState, useMemo } from 'react'
import Panel from './Panel'
import { Bars, Donut } from './Charts'
import SystemHealth from './SystemHealth'
import type { PublicReport } from '@/lib/types'
import { useSharedFilters } from './FilterContext'

export default function AnalysisView({ selectedIncidentId }: { selectedIncidentId?: string | null } = {}) {
  const {
    filteredReports,
    filteredIncidents,
    filteredCanonicalIncidentIds,
    analysisData,
    analysisLoading,
    analysisError,
  } = useSharedFilters()
  const [range, setRange] = useState<'1H' | '6H' | '24H' | '7D'>('24H')

  const IST = 'Asia/Kolkata'
  const now = new Date()

  const windowStart = useMemo(() => {
    const d = new Date(now)
    switch (range) {
      case '1H': d.setHours(d.getHours() - 1); return d
      case '6H': d.setHours(d.getHours() - 6); return d
      case '24H': d.setDate(d.getDate() - 1); return d
      case '7D': d.setDate(d.getDate() - 7); return d
    }
  }, [range])

  const bucketConfig = useMemo(() => {
    switch (range) {
      case '1H': return { count: 6, interval: 10 * 60 * 1000, fmt: { hour: 'numeric', minute: '2-digit', hour12: false } as Intl.DateTimeFormatOptions }
      case '6H': return { count: 6, interval: 60 * 60 * 1000, fmt: { hour: 'numeric', hour12: false } as Intl.DateTimeFormatOptions }
      case '24H': return { count: 12, interval: 2 * 60 * 60 * 1000, fmt: { hour: 'numeric', hour12: false } as Intl.DateTimeFormatOptions }
      case '7D': return { count: 7, interval: 24 * 60 * 60 * 1000, fmt: { weekday: 'short', day: '2-digit' } as Intl.DateTimeFormatOptions }
    }
  }, [range])

  const timeSeriesData = useMemo(() => {
    const { count: bucketCount, interval } = bucketConfig
    const data = Array.from({ length: bucketCount }, () => ({ count: 0 }))
    for (const report of filteredReports) {
      if (typeof report.postedAt !== 'string') continue
      const posted = new Date(report.postedAt)
      if (isNaN(posted.getTime())) continue
      if (posted < windowStart || posted > now) continue
      const idx = Math.floor((posted.getTime() - windowStart.getTime()) / interval)
      if (idx >= 0 && idx < bucketCount) {
        data[idx].count++
      }
    }
    return data
  }, [filteredReports, windowStart, now, bucketConfig])

  const incidentTypeDistribution = useMemo(() => {
    const counts = new Map<string, number>()
    for (const inc of filteredIncidents) {
      const event = inc.event.trim()
      if (!event) continue
      counts.set(event, (counts.get(event) || 0) + 1)
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [filteredIncidents])

  const stateDistribution = useMemo(() => {
    const counts = new Map<string, number>()
    for (const inc of filteredIncidents) {
      const state = inc.state.trim()
      if (!state) continue
      counts.set(state, (counts.get(state) || 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
  }, [filteredIncidents])

  const sourceDistribution = useMemo(() => {
    const counts = new Map<string, number>()
    for (const report of filteredReports) {
      const source = report.source.trim()
      if (!source) continue
      counts.set(source, (counts.get(source) || 0) + 1)
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [filteredReports])

  const filteredAIRiskAssessments = useMemo(() => {
    if (!analysisData?.aiRiskAssessments) return []
    return analysisData.aiRiskAssessments.filter(a =>
      filteredCanonicalIncidentIds.includes(a.canonicalIncidentId)
    )
  }, [analysisData?.aiRiskAssessments, filteredCanonicalIncidentIds])

  const filteredAIClassification = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of filteredAIRiskAssessments) {
      counts.set(a.event, (counts.get(a.event) || 0) + 1)
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [filteredAIRiskAssessments])

  const xLabels = useMemo(() => {
    const { count: bucketCount, interval } = bucketConfig
    return Array.from({ length: bucketCount }, (_, i) => {
      const t = new Date(windowStart.getTime() + i * interval)
      return range === '7D'
        ? t.toLocaleDateString('en-IN', { timeZone: IST, ...bucketConfig.fmt })
        : t.toLocaleTimeString('en-IN', { timeZone: IST, ...bucketConfig.fmt })
    })
  }, [windowStart, bucketConfig])

  const maxCount = Math.max(1, ...timeSeriesData.map(d => d.count))
  const totalReports = timeSeriesData.reduce((s, d) => s + d.count, 0)

  const selectedIncident = selectedIncidentId != null
    ? filteredIncidents.find(() => filteredCanonicalIncidentIds.includes(selectedIncidentId))
    : null
  const filterMismatch = selectedIncidentId != null && !selectedIncident

  return (
    <main className="dashboard">
      <div className="section-head">
        <div>
          <span className="eyebrow">ANALYTICS LAYER</span>
          <h2>Incident activity &amp; distribution</h2>
        </div>
<span className="demo-tag">Sample data</span>
      </div>

      <div className="analytics-grid">
        {totalReports > 0 ? (
          <Panel title="Reports over time" className="trend-panel" action={
            <div className="range-tabs">
              {(['1H', '6H', '24H', '7D'] as const).map((x) => (
                <button
                  className={range === x ? 'active' : ''}
                  key={x}
                  onClick={() => setRange(x)}
                >
                  {x}
                </button>
              ))}
            </div>
          }>
            <p className="caption">District filtering for public reports uses reported locality and may not exactly match official district boundaries.</p>
            <div className="chart-legend">
              <span className="cyan">▲ Rainfall</span>
              <span className="blue">▲ Flood</span>
              <span className="orange">▲ Heatwave</span>
              <span className="red">▲ Cyclone</span>
            </div>
            <div className="line-chart">
              <div className="y-axis">
                <span>{maxCount}</span>
                <span>{Math.ceil(maxCount / 2)}</span>
                <span>{Math.ceil(maxCount / 4)}</span>
                <span>0</span>
              </div>
              <svg viewBox={`0 0 ${60 + xLabels.length * 48} 210`} preserveAspectRatio="none" role="img" aria-label="Incident reports trend chart">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  className="area"
                  d={[
                    `M60 210`,
                    ...timeSeriesData.map((d, i) => {
                      const x = 60 + i * 48;
                      const y = 210 - (d.count / maxCount) * 160;
                      return `L${x} ${y}`;
                    }),
                    `L${60 + (timeSeriesData.length - 1) * 48} 210`,
                    `L60 210Z`,
                  ].join(' ')}
                />
                <path
                  className="line"
                  d={[
                    `M60 ${210 - (timeSeriesData[0].count / maxCount) * 160}`,
                    ...timeSeriesData.map((d, i) => {
                      const x = 60 + i * 48;
                      const y = 210 - (d.count / maxCount) * 160;
                      return `L${x} ${y}`;
                    }),
                  ].join(' ')}
                  fill="none"
                  stroke="var(--cyan)"
                  strokeWidth="2"
                />
              </svg>
              <div className="x-axis" style={{ gap: '6px' }}>
                {xLabels.map((label, i) => (
                  <span key={i} style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="Reports over time" className="trend-panel" action={
            <div className="range-tabs">
              {(['1H', '6H', '24H', '7D'] as const).map((x) => (
                <button
                  className={range === x ? 'active' : ''}
                  key={x}
                  onClick={() => setRange(x)}
                >
                  {x}
                </button>
              ))}
            </div>
          }>
            <div className="chart-legend">
              <span className="cyan">▲ Rainfall</span>
              <span className="blue">▲ Flood</span>
              <span className="orange">▲ Heatwave</span>
              <span className="red">▲ Cyclone</span>
            </div>
            <div className="line-chart">
              <div className="y-axis">
                <span>0</span>
                <span>0</span>
                <span>0</span>
                <span>0</span>
              </div>
              <svg viewBox="0 0 700 210" preserveAspectRatio="none" role="img" aria-label="Incident reports trend chart">
                <path className="area" d="M0 210 L700 210 L700 210 L0 210Z" fill="var(--cyan)" opacity="0.15" />
                <path className="line" d="M0 210 L700 210" fill="none" stroke="var(--cyan)" strokeWidth="2" />
              </svg>
              <div className="x-axis" style={{ gap: '6px' }}>
                {xLabels.map((label, i) => (
                  <span key={i} style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <p className="caption">No reports in this period.</p>
          </Panel>
        )}

<Panel title="Incidents by type" eyebrow="BAR CHART">
          {incidentTypeDistribution.length > 0 ? (
            <Bars data={incidentTypeDistribution} color="cyan" />
          ) : (
            <p className="caption">No incidents match the selected filters.</p>
          )}
        </Panel>

        <Panel title="Reports by source" eyebrow="INGESTION MIX">
  {sourceDistribution.length > 0 ? (
    <Donut data={sourceDistribution.map((d) => [d[0], d[1]])} />
  ) : (
    <p className="caption">No source distribution data available.</p>
  )}
</Panel>
<Panel title="Incidents by state" eyebrow="TOP 5 · ACTIVE INCIDENTS">

          {stateDistribution.length > 0 ? (
            <Bars data={stateDistribution} color="blue" />
          ) : (
            <p className="caption">No incidents match the selected filters.</p>
          )}
        </Panel>
<Panel title="AI risk intelligence" eyebrow="MODEL STATUS · EVENT CLASSIFICATION">
  {filteredAIRiskAssessments.length > 0 ? (
    <div className="ai-list">
      {filteredAIRiskAssessments.map((row) => (
        <div className="ai-row" key={row.canonicalIncidentId}>
          <div className="ai-icon">
            <span className="demo-tag">AI</span>
          </div>
          <div className="ai-info">
            <div className="ai-event">{row.event}</div>
            <div className="ai-location">{row.location}</div>
          </div>
          <div className="ai-severity">{row.severity}</div>
          <div className="ai-reports">{row.reports} reports</div>
          <div className="ai-confidence">{row.confidence}</div>
          <div className="ai-status">{row.status}</div>
        </div>
      ))}
    </div>
  ) : (
    <p className="caption">No AI risk assessments available.</p>
  )}
</Panel>

<Panel title="Incident event distribution" eyebrow="EVENT TYPES">
  {filteredAIClassification.length > 0 ? (
    <div className="classification-bars">
      <Bars data={filteredAIClassification.map((d) => [d[0], d[1]])} color="blue" />
    </div>
  ) : (
    <p className="caption">No AI classification data available.</p>
  )}
</Panel>

<Panel title="Data reliability & source consensus" eyebrow="EVIDENCE LAYER">
  <div className="consensus-detail">
    {analysisData?.consensus ? (
      <>
        <div className="consensus-row">
          <span className="eyebrow">SOURCE AGREEMENT</span>
          <b>{analysisData.consensus.sourceAgreement}%</b>
        </div>
        <div className="consensus-row">
          <span className="eyebrow">INDEPENDENT SOURCES</span>
          <b>{analysisData.consensus.independentSources}</b>
        </div>
        <div className="consensus-row">
          <span className="eyebrow">CONSENSUS LEVEL</span>
          <b className="green">{analysisData.consensus.consensusLevel}</b>
        </div>
        <div className="consensus-row">
          <span className="eyebrow">RELIABILITY INDEX</span>
          <b>{analysisData.consensus.reliabilityIndex} / 100</b>
        </div>
        {selectedIncidentId && analysisData.incidentConsensusById?.[selectedIncidentId] ? (
          <div className="consensus-row">
            <span className="eyebrow">INCIDENT ASSESSMENT</span>
            <p>Incident-specific consensus available for selected incident.</p>
          </div>
        ) : null}
        {filterMismatch && (
          <div className="consensus-row">
            <span className="eyebrow">SELECTED INCIDENT</span>
            <p>The selected incident is not visible under the current filters.</p>
          </div>
        )}
        <div className="consensus-note">
          <p>
            Source consensus measures agreement across independent data providers. AI confidence
            measures model certainty in classification. These are distinct metrics and should not
            be conflated.
          </p>
        </div>
      </>
    ) : (
      <>
        <div className="consensus-row">
          <span className="eyebrow">SOURCE AGREEMENT</span>
          <b>—</b>
        </div>
        <div className="consensus-row">
          <span className="eyebrow">INDEPENDENT SOURCES</span>
          <b>—</b>
        </div>
        <div className="consensus-row">
          <span className="eyebrow">CONSENSUS LEVEL</span>
          <b className="green">—</b>
        </div>
        <div className="consensus-row">
          <span className="eyebrow">RELIABILITY INDEX</span>
          <b>—</b>
        </div>
        {filterMismatch && (
          <div className="consensus-row">
            <span className="eyebrow">SELECTED INCIDENT</span>
            <p>The selected incident is not visible under the current filters.</p>
          </div>
        )}
        <div className="consensus-note">
          <p>
            Source consensus measures agreement across independent data providers. AI confidence
            measures model certainty in classification. These are distinct metrics and should not
            be conflated.
          </p>
        </div>
      </>
    )}
  </div>
</Panel>

        <Panel title="Historical trend analysis" eyebrow="7-DAY COMPARISON · ALL INDIA">
  {analysisData?.historicalTrends ? (
    <>
      <div className="trend-comparison">
        <div className="trend-stat">
          <b className="cyan">{analysisData.historicalTrends.metrics[0]?.value ?? '—'}</b>
          <small>{analysisData.historicalTrends.metrics[0]?.label ?? 'WEEK-OVER-WEEK'}</small>
        </div>
        <div className="trend-stat">
          <b>{analysisData.historicalTrends.metrics[1]?.value ?? '—'}</b>
          <small>{analysisData.historicalTrends.metrics[1]?.label ?? 'TOTAL REPORTS (7D)'}</small>
        </div>
        <div className="trend-stat">
          <b className="red">{analysisData.historicalTrends.metrics[2]?.value ?? '—'}</b>
          <small>{analysisData.historicalTrends.metrics[2]?.label ?? 'CRITICAL EVENTS'}</small>
        </div>
        <div className="trend-stat">
          <b className="green">{analysisData.historicalTrends.metrics[3]?.value ?? '—'}</b>
          <small>{analysisData.historicalTrends.metrics[3]?.label ?? 'RESPONSE TIME'}</small>
        </div>
      </div>
      <div className="line-chart small">
        <Bars data={analysisData.historicalTrends.timeSeries.map((p) => [p.x, p.y])} color="cyan" />
      </div>
    </>
  ) : (
    <>
      <div className="trend-comparison">
        <div className="trend-stat">
          <b className="cyan">—</b>
          <small>WEEK-OVER-WEEK</small>
        </div>
        <div className="trend-stat">
          <b>—</b>
          <small>TOTAL REPORTS (7D)</small>
        </div>
        <div className="trend-stat">
          <b className="red">—</b>
          <small>CRITICAL EVENTS</small>
        </div>
        <div className="trend-stat">
          <b className="green">—</b>
          <small>RESPONSE TIME</small>
        </div>
      </div>
      <div className="line-chart small">
        <p className="caption">No trend data available.</p>
      </div>
    </>
  )}
</Panel>
      </div>

      <SystemHealth metrics={analysisData?.systemHealth ?? undefined} />

      <footer>
        <span>INDRA · v3.0.0</span>
        <span>
          India&apos;s National Disaster &amp; Risk Analytics <b>▲</b>
        </span>
      </footer>
    </main>
  )
}

