# INDRA — Backend-to-UI Data Mapping

This document explains how INDRA's frontend receives and displays backend data. It describes the current
frontend data architecture, the mapping from backend-provided information to each UI component, and the
integration flow for connecting a real backend.

## 1. Purpose and Architecture

INDRA is a national disaster-intelligence dashboard. The backend/ML layer owns all intelligence calculations
and assessments — source consensus, reliability calculations, AI classifications and risk assessments,
historical trend calculations, incident lifecycle and assessment provenance, and infrastructure telemetry.
The frontend presents backend-provided information and handles user interaction, filtering, sorting,
and presentation formatting. The frontend must not independently calculate or reinterpret intelligence.

### Data Flow

```
Backend API → API-backed data source → Data validation/mapping → Frontend context/state → Presentation components
```

The existing architecture already defines this boundary. Today, demo data sources stand in for the backend.
When the backend is connected, the demo data source implementations can be replaced without rewriting UI
components, because all UI components consume data through typed props or shared React context.

### Separation of Concerns

| Layer | Responsibility | Example |
|---|---|---|
| Backend API | Authoritative intelligence, ML assessments, source reliability, consensus, historical records, lifecycle, telemetry | Incident records, severity, confidence, consensus %, trend stats |
| Data Source | Load, validate, adapt backend responses to frontend types | `IncidentDataSource`, `AnalysisDataSource` |
| Shared Types | Canonical contracts used by both frontend and backend adapters | `CanonicalIncident`, `PublicReport`, `AnalysisData` |
| Filter Context | Shared filter state, filtered datasets, loading/error states | `FilterProvider`, `useSharedFilters()` |
| Presentation Components | Render data, handle user interaction | `Topbar`, `FilterToolbar`, `AnalysisView`, `Panel`, `Charts` |

## 2. Home Dashboard — Backend-to-UI Mapping

### Topbar

| Aspect | Detail |
|---|---|
| **Data received** | Current time (IST), last sync timestamp, freshness state (fresh/stale/updating), syncing flag |
| **Backend-provided** | Sync timestamp and service status |
| **Frontend responsibility** | Display time, display last updated timestamp, display freshness badge, handle manual refresh |
| **Backend contract needed** | Timestamp and service health endpoint |

### FilterToolbar

| Aspect | Detail |
|---|---|
| **Data received** | Current filter values (state, district, eventType, severity), available filter options |
| **Backend-provided** | Available state/district options, event types, severity levels |
| **Frontend responsibility** | Render dropdowns, manage filter selection, apply filters to incident data |
| **Backend contract needed** | Filter option lists (states, districts, event types) |

### Live Intelligence / Map

| Aspect | Detail |
|---|---|
| **Data received** | Incident records with coordinates, severity, status, event type, value, source |
| **Backend-provided** | Incident records with canonical IDs, geolocation, severity |
| **Frontend responsibility** | Render SVG map, plot markers, handle marker selection, handle state selection from map |
| **Backend contract needed** | Incident records with lat/lng, severity, canonical IDs |
| **Keyboard limitation** | Map markers are SVG `<g>` elements with `onClick` handlers — they are NOT keyboard-focusable. Incident selection via map requires a mouse. Users can access incident details via the alert stream or Analysis page instead. |

### Selected Incident Report

| Aspect | Detail |
|---|---|
| **Data received** | Selected incident details (event, place, state, district, severity, value, reports, confidence, consensus, evidence, area affected) |
| **Backend-provided** | Full incident record with evidence sources, area-affected breakdown, AI metrics |
| **Frontend responsibility** | Display incident report, handle drill-down from state to district to incident, handle selection |
| **Backend contract needed** | Full incident record including evidence, area-affected, AI metrics |
| **Filter interaction** | Respects active state/district filters; resets selection when filters exclude the selected incident |

### KPI Section

| Aspect | Detail |
|---|---|
| **Data received** | Incident records (for computing counts) |
| **Backend-provided** | Incident records with severity, status, confidence fields |
| **Frontend responsibility** | Display four stat cards: total reports, active incidents, critical alerts, AI-detected incidents |
| **Display deltas** | Hardcoded demo deltas (`+12.8%`, `+4.2%`, `+2`, `+23.1%`) — backend should provide real deltas |
| **Backend contract needed** | Incident records; backend should also provide comparison/delta values |

### Alert System

| Aspect | Detail |
|---|---|
| **Data received** | Alert records (severity, event, place, time, text, confidence, source), incident records (for linking) |
| **Backend-provided** | Alert records with severity, linked incident IDs |
| **Frontend responsibility** | Group alerts by severity tabs (Critical/High/Moderate), display alert cards, handle alert click to select incident |
| **Backend contract needed** | Alert records with severity, incident linkage |

## 3. Analysis Dashboard — Backend-to-UI Mapping

All nine Analysis panels receive data through `useSharedFilters()` → `analysisData` from `FilterContext`. The
`AnalysisData` type is defined in `lib/types.ts`.

### Reports Over Time

| Aspect | Detail |
|---|---|
| **Current data source** | `filteredReports` from FilterContext (public source records matching filters) |
| **Backend-provided** | Public report records with `postedAt` timestamps |
| **Frontend calculation** | Time-bucketing (1H/6H/24H/7D ranges) — frontend presentation logic |
| **Filter-responsive** | Yes — respects state/district filters |
| **Empty state** | "No reports in this period." |
| **Demo-data limitation** | Uses static prototype fixture; backend should provide public report records |

### Incidents by Type

| Aspect | Detail |
|---|---|
| **Current data source** | `filteredIncidents` grouped by `event` field |
| **Backend-provided** | Incident records with event type |
| **Frontend calculation** | Presentation-level grouping and counting — acceptable |
| **Filter-responsive** | Yes — respects all active filters |
| **Empty state** | "No incidents match the selected filters." |

### Reports by Source

| Aspect | Detail |
|---|---|
| **Current data source** | `filteredReports` grouped by `source` field (computed in AnalysisView) |
| **Backend-provided** | Public source records with source attribution |
| **Frontend calculation** | Presentation-level grouping and counting — acceptable |
| **Filter-responsive** | Yes — respects state/district filters |
| **Empty state** | "No source distribution data available." |
| **Demo-data limitation** | Previously used static `sourcesData`; now computed from filtered reports |

### Incidents by State

| Aspect | Detail |
|---|---|
| **Current data source** | `filteredIncidents` grouped by `state` field |
| **Backend-provided** | Incident records with state/district |
| **Frontend calculation** | Presentation-level grouping, counting, top-5 limit — acceptable |
| **Filter-responsive** | Yes — respects all active filters |
| **Empty state** | "No incidents match the selected filters." |
| **Demo-data limitation** | Previously capped at top 5 states; cap removed — all matching states now display |

### AI Risk Intelligence

| Aspect | Detail |
|---|---|
| **Current data source** | `analysisData.aiRiskAssessments` from DemoAnalysisDataSource |
| **Backend-provided** | AI risk assessments per incident with canonical incident ID |
| **Backend contract needed** | AI risk assessment records linked to canonical incident IDs |
| **Filter-responsive** | Yes — only assessments for filtered incidents are displayed |
| **Empty state** | "No AI risk assessments available." |
| **Backend-owned** | Risk scores, confidence, model version, assessment status |

### Incident Event Distribution

| Aspect | Detail |
|---|---|
| **Current data source** | `filteredAIRiskAssessments` grouped by `event` field |
| **Backend-provided** | AI risk assessments with event type |
| **Frontend calculation** | Presentation-level grouping and counting — acceptable |
| **Filter-responsive** | Yes — respects filters via `filteredAIRiskAssessments` |
| **Empty state** | "No AI classification data available." |
| **Note** | Panel renamed from "AI Classification Distribution" to "Incident Event Distribution" because it groups by incident event type, not AI classification. The `AIClassificationEntry` type exists in `lib/types.ts` but is not populated by current demo data. |

### Data Reliability & Source Consensus

| Aspect | Detail |
|---|---|
| **Current data source** | `analysisData.consensus` (national) + `incidentConsensusById` (incident-specific) |
| **Backend-provided** | Consensus percentage, source count, consensus level, reliability index per incident or national |
| **Backend contract needed** | Consensus/reliability assessments keyed by canonical incident ID |
| **Filter-responsive** | National overview is default; incident-specific when an incident is selected |
| **Empty state** | Displays `—` for all four metrics when no assessment data |
| **Backend-owned** | Consensus calculations, reliability index, source verification |

### Historical Trend Analysis

| Aspect | Detail |
|---|---|
| **Current data source** | `analysisData.historicalTrends` from DemoAnalysisDataSource |
| **Backend-provided** | Trend metrics (week-over-week %, totals, critical events, response time), time-series data points |
| **Backend contract needed** | Historical trend calculations and time-series aggregates |
| **Filter-responsive** | No — national overview only, independent of state/district filters |
| **Empty state** | "No trend data available." |
| **Backend-owned** | Historical aggregations, trend calculations |
| **Geographic scope** | Explicitly labelled "ALL INDIA" in panel eyebrow |

### System Health

| Aspect | Detail |
|---|---|
| **Current data source** | `analysisData.systemHealth` from DemoAnalysisDataSource |
| **Backend-provided** | Service statuses, records received, processing latency, uptime, throughput |
| **Backend contract needed** | Infrastructure telemetry |
| **Filter-responsive** | No — global infrastructure metrics, independent of incident filters |
| **Empty state** | Displays `—` for all metrics when no telemetry data |
| **Backend-owned** | Infrastructure telemetry |
| **Filter interaction** | Alerts are filtered to match active incident filters (alert shown only if its linked incident matches filters) |

## 4. Existing Frontend Data Architecture

### IncidentDataSource (`lib/data-source.ts`)

| Aspect | Detail |
|---|---|
| **Interface** | `loadDataset()`, `getIncidents()`, `getAlerts()`, `getSourceRecords()`, `isLoading()`, `getError()` |
| **Current implementation** | `StaticPrototypeDataSource` loads `test-data/indra-prototype.json` |
| **Adapter** | `adaptIncidentToDashboard()` maps `CanonicalIncident` → dashboard `Incident`; `adaptAlertToDashboard()` maps `CanonicalAlert` → dashboard `Alert` |
| **Canonical ID mapping** | `buildIdMap()` sorts canonical incidents alphabetically and assigns sequential numeric IDs; reverse mapping available for dashboard→canonical lookup |
| **Prototype fallbacks** | Documented as prototype-only: `consensus ?? 'Medium'`, `independentSources: '0/0'`, `confidence ?? 0`, `evidence: []` |
| **Replacement** | A backend-backed `IncidentDataSource` can replace `StaticPrototypeDataSource` without changing consumers |

### AnalysisDataSource (`lib/analysis-data-source.ts`)

| Aspect | Detail |
|---|---|
| **Interface** | `loadAnalysisData()`, `getAnalysisData()`, `isLoading()`, `getError()` |
| **Current implementation** | `DemoAnalysisDataSource` loads from `lib/demo-data/` |

### FilterContext (`components/dashboard/FilterContext.tsx`)

| Aspect | Detail |
|---|---|
| **Responsibilities** | Filter state management, data loading, filtered dataset computation, analysis data provision |
| **Provides** | `filters`, `setFilter`, `reset`, `filteredIncidents`, `filteredAlerts`, `filteredReports`, `filteredCanonicalIncidentIds`, `analysisData`, `loading`, `error`, `analysisLoading`, `analysisError` |
| **Loading isolation** | Incident data and analysis data load independently; failure of one does not block the other |
| **Filter matching** | Case-insensitive state/district matching; exact eventType/severity matching |

### Shared TypeScript Contracts (`lib/types.ts`)

| Type | Purpose | Backend-provided? |
|---|---|---|
| `CanonicalIncident` | Stable canonical incident record | Yes |
| `CanonicalAlert` | Stable canonical alert record | Yes |
| `PublicReport` | Public source report record | Yes |
| `Incident` | Dashboard incident (adapted from canonical) | Yes (via adapter) |
| `Alert` | Dashboard alert (adapted from canonical) | Yes (via adapter) |
| `AnalysisData` | Complete analysis dataset | Yes |
| `ConsensusAssessment` | Consensus/reliability per incident or national | Yes |
| `AIRiskAssessment` | AI risk assessment per incident | Yes |
| `HistoricalTrends` | Trend metrics and time series | Yes |
| `SystemHealthTelemetry` | Infrastructure telemetry | Yes |
| `AssessmentStatus` | `'pending' \| 'processing' \| 'success' \| 'failed' \| 'unavailable'` | Yes |

### Canonical Incident ID Mapping

Canonical incidents use stable string IDs (e.g., `IND-2025-DEL-001`). The dashboard assigns derived numeric IDs for internal use. The `buildIdMap()` function creates the canonical→numeric mapping, and `FilterContext` maintains a reverse numeric→canonical mapping for filter-matching. Backend queries should use canonical string IDs, not derived numeric IDs.

### Loading, Error, Empty, Unavailable States

| State | Handling |
|---|---|
| Loading | `loading` / `analysisLoading` booleans; loading message displayed |
| Error | `error` / `analysisError` objects; error message displayed |
| Empty | Empty arrays in data fields; "No X data available" captions |
| Unavailable | `—` placeholder values for missing metrics |
| Filtered empty | "No incidents match the selected filters." |

### Demo-Data Organisation

Demo data is centralised in `lib/demo-data/` with separate modules:
- `source-distribution.ts` — source → count data
- `ai-classification.ts` — AI classification buckets
- `ai-risk.ts` — AI risk assessment rows linked to canonical incident IDs
- `consensus.ts` — national and incident-specific consensus assessments
- `historical-trends.ts` — trend metrics and time series
- `system-health.ts` — infrastructure telemetry


## 5. Expected Backend Integration Flow

1. **Backend API** serves incident records, alert records, public source records, consensus assessments, AI risk assessments, trend data, and system health telemetry.
2. **API-backed data source** implements `IncidentDataSource` (replacing `StaticPrototypeDataSource`) and/or `AnalysisDataSource` (replacing `DemoAnalysisDataSource`).
3. **Validation/mapping** adapts backend responses to `CanonicalIncident`, `CanonicalAlert`, `PublicReport`, and `AnalysisData` types.
4. **Frontend context/state** (`FilterContext`) receives adapted data and provides it to presentation components via `useSharedFilters()`.
5. **Presentation components** render backend-provided data without modification.

### Replacing Demo Data Sources

Demo data sources can be replaced incrementally:

| Current | Backend Replacement |
|---|---|
| `StaticPrototypeDataSource` | API-backed `IncidentDataSource` implementation |
| `DemoAnalysisDataSource` | API-backed `AnalysisDataSource` implementation |
| `lib/demo-data/*` static arrays | API responses mapped to `AnalysisData` type |

UI components consume data through `useSharedFilters()` and props — no component changes are required when the data source changes.

### What NOT to Invent

Do not invent:
- Endpoint names or URLs
- API request/response schemas
- Backend status enums beyond `AssessmentStatus`
- Model versions
- Assessment history structures
- Reliability or consensus formulas

## 6. Data Ownership

### Backend-Owned

The backend must provide all intelligence calculations and assessments:

- Incident records and lifecycle
- Source provenance and reliability
- Consensus calculations
- AI classification and risk assessments
- Historical intelligence calculations
- KPI aggregates and comparison values
- System telemetry

### Frontend-Owned

The frontend is responsible for presentation only:

- Rendering and presentation
- User interactions (clicks, filter selection, navigation)
- Filter selection and presentation-level filtering (grouping/counting already-loaded records)
- Map visualisation
- Chart rendering (Bars, Donut, line charts)
- Navigation and theme switching
- Loading and empty-state presentation

### Exceptions

- `KPISection` uses hardcoded demo deltas (`+12.8%`, `+4.2%`, `+2`, `+23.1%`) — backend should provide real comparison values
- `IncidentDataSource` adapter has documented prototype fallbacks for `consensus`, `independentSources`, `confidence`, `evidence` — these are NOT derived from data and should not be treated as verified findings

## 7. Integration Checklist

- [ ] API contracts agreed (incident records, alert records, public reports, consensus, AI risk, trends, system health)
- [ ] API-backed incident data source implemented (`IncidentDataSource`)
- [ ] API-backed analysis data source implemented (`AnalysisDataSource`)
- [ ] Response types validated against `CanonicalIncident`, `CanonicalAlert`, `PublicReport`, `AnalysisData`
- [ ] Loading/error states connected to UI
- [ ] Demo data replaced safely without component changes
- [ ] Filters verified against real data
- [ ] Home and Analysis data consistency verified
- [ ] Backend integration regression tests passed

## 8. Current Readiness and Limitations

### Already Implemented

- Complete data architecture with typed contracts
- Replaceable data source abstractions
- Centralised demo data clearly labelled as synthetic
- Independent loading/error states
- Canonical incident ID mapping
- Filter-context sharing across Home and Analysis pages
- All nine Analysis panels with demo data
- Empty/loading/error states for all panels

### Prepared but Not Connected

- `AnalysisDataSource` interface ready for backend implementation
- `IncidentDataSource` interface ready for backend implementation
- `AnalysisView` accepts `selectedIncidentId` prop (not yet wired by `app/analysis/page.tsx`)
- `SystemHealth` accepts `metrics` prop (not yet wired by backend data)

### Backend-Dependent

- All intelligence values (consensus, reliability, trends, AI risk, source distribution, system health)
- Real incident, alert, and public report records
- Assessment status lifecycle
- Model version and timestamp provenance

### Still Requiring Frontend Verification

- Browser-based keyboard navigation testing (map markers are not keyboard accessible)
- Filter combination edge cases
- Large dataset rendering performance
- Light/dark theme visual consistency with backend data

Demo data must not be described as live data.
Each file explicitly labels its values as sample/demo data.
| **Backend replacement** | A backend-backed `AnalysisDataSource` can replace `DemoAnalysisDataSource` without changing consumers |