'use client'

import { useEffect, useRef, useState } from 'react'
import Topbar from '@/components/dashboard/Topbar'
import Link from 'next/link'

const sections = [
  { id: 'welcome', title: 'Welcome to INDRA' },
  { id: 'dashboard', title: 'Understanding Your Dashboard' },
  { id: 'map', title: 'Reading the Intelligence Map' },
  { id: 'report', title: 'Incident Report' },
  { id: 'severity', title: 'Severity' },
  { id: 'refresh', title: 'Time, Refresh & Data Reliability' },
  { id: 'data', title: 'Understanding Incident Data' },
  { id: 'analysis', title: 'Analysis Page' },
  { id: 'system-health', title: 'System Health' },
  { id: 'sources', title: 'Sources' },
  { id: 'faq', title: 'Troubleshooting & FAQs' },
  { id: 'privacy', title: 'Privacy Policy' },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('welcome')
  const [visibleSectionIds, setVisibleSectionIds] = useState<string[]>(sections.map(s => s.id))
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null)
  const scrollTargetRef = useRef<string | null>(null)

  useEffect(() => {
    if (!searchQuery) {
      setVisibleSectionIds(sections.map(s => s.id))
      return
    }
    const query = searchQuery.toLowerCase()
    const visible = sections.filter(s => {
      const titleMatch = s.title.toLowerCase().includes(query)
      const el = document.getElementById(s.id)
      const contentMatch = el ? (el.textContent || '').toLowerCase().includes(query) : false
      return titleMatch || contentMatch
    })
    setVisibleSectionIds(visible.map(s => s.id))
  }, [searchQuery])

  useEffect(() => {
    if (pendingScrollId) {
      const el = document.getElementById(pendingScrollId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
      setPendingScrollId(null)
    }
  }, [pendingScrollId, visibleSectionIds])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (scrollTargetRef.current !== null) {
          for (const entry of entries) {
            if (entry.isIntersecting && entry.target.id === scrollTargetRef.current) {
              scrollTargetRef.current = null
              setActiveSection(entry.target.id)
            }
          }
          return
        }
        const visible = entries
          .filter(e => e.isIntersecting && e.target.id)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id)
        }
      },
      { threshold: 0.5, rootMargin: '-140px 0% -30% 0%' }
    )
    const elements = document.querySelectorAll('.help-section')
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [visibleSectionIds])

  return (
    <main className="dashboard help-page" id="main-content">
      <Topbar />

      <div className="help-search">
        <input
          className="help-search-input"
          type="search"
          placeholder="Search help topics…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search help sections"
        />
        <button
          className="help-search-reset"
          onClick={() => setSearchQuery('')}
          disabled={!searchQuery}
          aria-label="Clear search"
        >
          ✕
        </button>
      </div>

      <div className="help-content">
        <div className="help-sticky-nav">
          <Link href="/" className="help-back-link">&larr; Back to Dashboard</Link>
          <nav className="help-nav help-sticky-list" aria-label="Help sections">
            {sections.map(section => (
              <Link
                key={section.id}
                href={`#${section.id}`}
                className={`help-nav-item ${activeSection === section.id ? 'help-nav-item--active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollTargetRef.current = section.id
                  setActiveSection(section.id)
                  if (!visibleSectionIds.includes(section.id)) {
                    setSearchQuery('')
                    setPendingScrollId(section.id)
                  } else {
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                {section.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="help-body">

          {visibleSectionIds.length === 0 && (
            <div className="help-empty">
              No results found for &ldquo;<span>{searchQuery}</span>&rdquo;. Try different keywords.
            </div>
          )}

        <section id="welcome" className="help-section" style={{ display: visibleSectionIds.includes('welcome') ? undefined : 'none' }}>
          <h2>Welcome to INDRA</h2>
          <p>
            <strong>INDRA</strong> is India&apos;s National Disaster &amp; Risk Analytics, a dashboard for incident intelligence across India.
          </p>
          <p>
            This dashboard may be useful to anyone who needs a consolidated view of incident information across India, including members of the public, researchers, and emergency-planning stakeholders. It presents a single unified view; role-based interfaces are not part of the current implementation.
          </p>
        </section>

        <section id="dashboard" className="help-section" style={{ display: visibleSectionIds.includes('dashboard') ? undefined : 'none' }}>
          <h2>Understanding Your Dashboard</h2>
          <p>
            The Home dashboard brings together four key metric cards, four filter controls, an intelligence map, an alert stream, and detailed incident reports. Use the filters to focus on the states, districts, event types, and severities that matter to you.
          </p>
          <div className="help-grid">
            <div className="help-card">
              <h3>KPI Section</h3>
              <p>Four stat cards show aggregate counts computed from the incident data:</p>
              <ul>
                <li><strong>Total incident reports</strong> — number of incident reports shown on the dashboard.</li>
                <li><strong>Active incidents</strong> — count of incidents whose status is not Resolved.</li>
                <li><strong>Critical alerts</strong> — number of Critical-severity alerts.</li>
                <li><strong>AI-detected incidents</strong> — count of incidents with confidence above 90%.</li>
              </ul>
            </div>
            <div className="help-card">
              <h3>Filter Toolbar</h3>
              <p>Four filters control which incidents appear on the map and in the alert stream:</p>
              <ul>
                <li><strong>State</strong> — searchable dropdown. Choose All India or a specific state.</li>
                <li><strong>District</strong> — searchable dropdown. Options depend on the state you select.</li>
                <li><strong>Event Type</strong> — dropdown (e.g. Heatwave, Heavy Rainfall, Cyclone, Flood).</li>
                <li><strong>Severity</strong> — dropdown (Critical, High, Moderate, or Low).</li>
              </ul>
            </div>
            <div className="help-example">
              <h3>How the dashboard fits together</h3>
              <ul>
                <li><strong>Filter first:</strong> Use State and District to narrow the view to a region.</li>
                <li><strong>Scan the map:</strong> Colored markers show incident locations. Click a marker to open its detailed report.</li>
                <li><strong>Read the alerts:</strong> The alert stream lists active incidents with severity badges and timestamps.</li>
                <li><strong>Open a report:</strong> Select any incident to see its full lifecycle stage, AI metrics, evidence sources, and affected-area breakdown.</li>
              </ul>
            </div>
            <div className="help-card">
              <h3>Navigation</h3>
              <ul>
                <li><strong>Home</strong> — the main dashboard with map, KPIs, filters and alerts.</li>
                <li><strong>Analysis</strong> — trend charts and system health summary.</li>
                <li><strong>Help</strong> — documentation and guidance for using INDRA.</li>
                <li><strong>Privacy Policy</strong> — information about privacy, data handling and user information.</li>
              </ul>
            </div>
            <div className="help-card">
              <h3>Interactive Intelligence Map</h3>
              <p>An SVG map of India shows incident markers positioned by latitude/longitude. Click any marker to view the Selected Incident Report.</p>
            </div>
            <div className="help-card">
              <h3>Alert System</h3>
              <p>The alert stream is organized into three severity tabs — Red (Critical), Orange (High), and Yellow (Moderate). Each tab displays a count calculated from the current alert data and retains its bright severity colour regardless of which tab is selected. Selecting a tab filters the displayed alerts to that severity only.</p>
              <ul>
                <li>Severity badge (Critical / High / Moderate / Low)</li>
                <li>Timestamp and location</li>
                <li>Alert text</li>
                <li>AI confidence percentage</li>
                <li>Source: data provider</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="map" className="help-section" style={{ display: visibleSectionIds.includes('map') ? undefined : 'none' }}>
          <h2>Reading the Intelligence Map</h2>
          <p>
            The map is an SVG outline of India with incident markers plotted at each incident's latitude and longitude. Markers are colored by severity — critical,
            high, moderate, or low — using the same color scheme as alerts and KPI cards.
          </p>
          <p>
            Clicking a marker opens that incident's detailed report panel. The report shows the incident's lifecycle
            stage, current reading, AI confidence, reports analyzed, consensus, independent sources, evidence list, and
            area-affected breakdown.
          </p>
          <div className="help-grid">
            <div className="help-card">
              <h3>Map Controls</h3>
              <ul>
                <li><strong>Zoom in (+) / Zoom out (−):</strong> Adjust the map scale up to 5×.</li>
                <li><strong>Reset view:</strong> Return to the default zoom and position.</li>
                <li><strong>Clear selection:</strong> Deselects the selected incident and resets all filters to All States / All Districts / All Event Types / All Severities.</li>
                <li><strong>Drag to pan:</strong> Move the map view in any direction.</li>
                <li><strong>Select a state on the map:</strong> Click inside any state boundary to apply that state as the active filter and view only its incidents.</li>
              </ul>
            </div>
            <div className="help-example">
              <h3>Map severity legend</h3>
              <div className="help-example-legend">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: "var(--critical)" }} />
                    <strong>Critical</strong> — highest severity
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: "var(--high)" }} />
                    <strong>High</strong> — elevated severity
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: "var(--moderate)" }} />
                    <strong>Moderate</strong> — moderate severity
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: "var(--low)" }} />
                    <strong>Low</strong> — lowest severity
                  </div>
                </div>
              </div>
            </div>
            <div className="help-card">
              <h3>Boundary data attribution</h3>
              <p>
                State boundary geometry comes from geoBoundaries gbOpen IND ADM1 (DataMeet / Election Commission of
                India), licensed CC BY 2.5 IN. This is <strong>not</strong> official Survey of India data. Boundary data
                and incident coordinates are separate datasets: markers are plotted at each incident's recorded lat/lng,
                independent of state outline precision. Do not infer exact geographic accuracy from boundary geometry alone.
              </p>
            </div>
          </div>
        </section>

        <section id="report" className="help-section" style={{ display: visibleSectionIds.includes('report') ? undefined : 'none' }}>
          <h2>Incident Report</h2>
          <p>
            The Incident Report lets you drill down from All India to individual incidents. Selecting an incident displays its full detailed report panel.
          </p>
          <div className="help-card">
            <h3>All India View</h3>
            <ul>
              <li>Displays all available states represented in the currently filtered incident data.</li>
              <li>States are ordered by highest severity first, then by incident count, and finally alphabetically.</li>
              <li>Selecting a state opens its district/area list for further drilling down.</li>
              <li>The report reflects active dashboard filters applied to the current view.</li>
            </ul>
          </div>

          <div className="help-card">
            <h3>State View</h3>
            <ul>
              <li>Shows districts or areas belonging to the selected state.</li>
              <li>Districts are ordered by severity (Critical → High → Moderate → Low), then by incident count, and finally alphabetically.</li>
              <li>Selecting a district/area displays its incident report cards below.</li>
              <li>Clicking an incident opens its full detailed report panel.</li>
            </ul>
          </div>

          <div className="help-card">
            <h3>Navigation Flow</h3>
            <ul>
              <li>Start from All India → select a State → select a District/Area → open the specific incident report.</li>
              <li>Each selection narrows the context: States → Districts → Individual incidents.</li>
              <li>Opening an incident report highlights its marker on the map.</li>
            </ul>
          </div>
        </section>

        <section id="severity" className="help-section" style={{ display: visibleSectionIds.includes('severity') ? undefined : 'none' }}>
          <h2>Severity</h2>
          <p>
            Severity classifies each incident into one of four levels. Colors are applied consistently across map
            markers, alert tags, and stat-card accents:
          </p>
          <div className="severity-grid">
            <div className="severity-item critical">
              <div className="severity-badge" style={{ background: 'var(--alert-critical)' }}>CRITICAL</div>
              <h3>Critical</h3>
            </div>
            <div className="severity-item high">
              <div className="severity-badge" style={{ background: 'var(--alert-high)' }}>HIGH</div>
              <h3>High</h3>
            </div>
            <div className="severity-item moderate">
              <div className="severity-badge" style={{ background: 'var(--alert-moderate)' }}>MODERATE</div>
              <h3>Moderate</h3>
            </div>
            <div className="severity-item low">
              <div className="severity-badge" style={{ background: 'var(--alert-low)' }}>LOW</div>
              <h3>Low</h3>
            </div>
          </div>
          <p>
            Every incident also carries AI-assessed trust metrics:
          </p>
          <ul>
            <li><strong>Confidence</strong> — AI model certainty (0–100%).</li>
            <li><strong>Reports analyzed:</strong> number of source reports reviewed.</li>
            <li><strong>Consensus:</strong> agreement level across sources (High / Medium / Low).</li>
            <li><strong>Independent sources:</strong> count of independent providers confirming the incident.</li>
          </ul>
        </section>

        <section id="refresh" className="help-section" style={{ display: visibleSectionIds.includes('refresh') ? undefined : 'none' }}>
          <h2>Time, Refresh & Data Reliability</h2>
          <p>
            Current Time (IST) is displayed in the top bar and updates once per second using the Asia/Kolkata timezone.
            Last Updated shows the timestamp of the last successful synchronization.
          </p>
          <div className="help-grid">
            <div className="help-card">
              <h3>Current Time (IST)</h3>
              <p>Displays the current time in Indian Standard Time (Asia/Kolkata), updated every second.</p>
            </div>
            <div className="help-card">
              <h3>Last Updated</h3>
              <p>Shows the timestamp of the last successful dashboard synchronization.</p>
            </div>
            <div className="help-card">
              <h3>Refresh Indicator</h3>
              <p>The FRESH / UPDATING / STALE badge indicates the synchronization state:</p>
              <ul>
                <li><strong>FRESH</strong> — last sync within the last 60 seconds</li>
                <li><strong>UPDATING</strong> — a synchronization cycle is in progress</li>
                <li><strong>STALE</strong> — no successful sync in over 60 seconds</li>
              </ul>
            </div>
            <div className="help-card">
              <h3>Manual Refresh</h3>
              <p>Clicking the Refresh button triggers an immediate synchronization cycle and updates the timestamp.</p>
            </div>
          </div>
          <div className="help-example">
            <h3>Freshness status guide</h3>
            <div className="help-example-legend">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: "var(--low)" }} />
                  <strong>FRESH</strong> — synced within 60 seconds
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: "var(--amber)" }} />
                  <strong>UPDATING</strong> — sync cycle in progress
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: "var(--red)" }} />
                  <strong>STALE</strong> — no successful sync in over 60 seconds
                </div>
              </div>
            </div>
            </div>
        </section>

        <section id="data" className="help-section" style={{ display: visibleSectionIds.includes('data') ? undefined : 'none' }}>
          <h2>Understanding Incident Data</h2>
          <p>
            Each incident in the dashboard carries structured information organized into groups. The fields below describe what the interface displays — they are interface labels, not independently verified facts.
          </p>
          <div className="help-grid">
            <div className="help-card">
              <h3>Core Information</h3>
              <ul>
                <li><strong>Event:</strong> type of incident (e.g. Heatwave, Heavy Rainfall)</li>
                <li><strong>Place:</strong> location name (e.g. "Delhi NCR")</li>
                <li><strong>State / District:</strong> administrative location</li>
              </ul>
            </div>
            <div className="help-card">
              <h3>Measurement</h3>
              <ul>
                <li><strong>Severity:</strong> critical, high, moderate, or low</li>
                <li><strong>Value:</strong> measured reading with unit (e.g. "45.2°C", "142 mm")</li>
                <li><strong>Alert text:</strong> short description of the incident</li>
              </ul>
            </div>
            <div className="help-card">
              <h3>AI Trust Metrics</h3>
              <ul>
                <li><strong>Confidence:</strong> AI model certainty (0–100%)</li>
                <li><strong>Reports analyzed:</strong> number of source reports reviewed.</li>
                <li><strong>Consensus:</strong> agreement across sources (High / Medium / Low).</li>
              </ul>
            </div>
            <div className="help-card">
              <h3>Source & Location</h3>
              <ul>
                <li><strong>Source:</strong> data provider that reported the incident</li>
                <li><strong>Lat / Lng:</strong> coordinates for map positioning</li>
                <li><strong>Time:</strong> display-relative timestamp (e.g. "41 min ago")</li>
              </ul>
            </div>
            
          </div>
          <div className="help-example">
            <h3>Example incident report structure</h3>
            <div className="help-example-legend">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
                  <strong>Event:</strong> Heatwave
                </div>
                <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
                  <strong>Severity:</strong> Critical
                </div>
                <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
                  <strong>Value:</strong> 45.2°C
                </div>
                <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
                  <strong>Confidence:</strong> 96%
                </div>
                <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
                  <strong>Evidence:</strong> IMD API (verified), Satellite / sensor (verified), Citizen reports (verified), Public posts (pending)
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="sources" className="help-section" style={{ display: visibleSectionIds.includes('sources') ? undefined : 'none' }}>
          <h2>Sources</h2>
        </section>

        <section id="analysis" className="help-section" style={{ display: visibleSectionIds.includes('analysis') ? undefined : 'none' }}>
          <h2>Analysis Page</h2>
          <p>
            The Analysis page (reachable from the top navigation) provides trend charts, distribution views, and data reliability indicators for filtered incident data.
          </p>
          <div className="help-grid">
            <div className="help-card">
              <h3>Reports over time</h3>
              <p>Time-series line chart showing incident counts across a selectable range (1H, 6H, 24H, or 7D).</p>
            </div>
            <div className="help-card">
              <h3>Event distribution</h3>
              <p>Breakdown of incidents by event type (e.g. Heatwave, Heavy Rainfall, Cyclone), ordered by count.</p>
            </div>
            <div className="help-card">
              <h3>State distribution</h3>
              <p>Top five states by incident count, ordered by severity then count.</p>
            </div>
            <div className="help-card">
              <h3>AI classification distribution</h3>
              <p>Bar chart of detected events classified by the AI model.</p>
            </div>
            <div className="help-card">
              <h3>Source consensus</h3>
              <p>Source agreement level, independent source count, consensus level, and reliability index for the primary incident.</p>
            </div>
            <div className="help-card">
              <h3>Trend comparison</h3>
              <p>Week-over-week comparison showing total reports, critical events, and response time change.</p>
            </div>
          </div>
          </section>

        <section id="system-health" className="help-section" style={{ display: visibleSectionIds.includes('system-health') ? undefined : 'none' }}>
          <h2>System Health</h2>
          <p>
            The System Health panel (shown on the Analysis page) displays data pipeline and infrastructure metrics.
          </p>
          <div className="help-grid">
            <div className="help-card">
              <h3>Service indicators</h3>
              <ul>
                <li>Data ingestion</li>
                <li>Kafka stream</li>
                <li>PostgreSQL</li>
                <li>AI processing</li>
              </ul>
              <p>Each service shows its current status percentage.</p>
            </div>
            <div className="help-card">
              <h3>Metrics</h3>
              <ul>
                <li>Records received — count received in the last 5 minutes</li>
                <li>Processing latency — current latency with change vs average</li>
                <li>Uptime — 30-day rolling uptime</li>
                <li>Throughput — current events per second</li>
              </ul>
            </div>
          </div>
        </section>
        <section id="faq" className="help-section" style={{ display: visibleSectionIds.includes('faq') ? undefined : 'none' }}>
          <h2>Troubleshooting & FAQs</h2>
          <dl>
            <dt>How do I find incidents in a particular state or district?</dt>
            <dd>Use the filter toolbar: select a state from the State dropdown, then choose a district from the District dropdown. The map and alert stream will update to show only incidents matching your selection.</dd>
            <dt>How are incident severity levels determined?</dt>
            <dd>Incidents are classified as Critical, High, Moderate, or Low based on their impact and urgency. Severity is assigned by the data source and shown as a badge on each alert card.</dd>
            <dt>Where does incident information come from?</dt>
            <dd>Incident information is drawn from the data sources configured for your INDRA deployment. Each alert card displays its source so you can see which provider contributed the information.</dd>
            <dt>How frequently is incident information updated?</dt>
            <dd>Update frequency depends on the configured data sources and sync interval. Check the freshness indicator (FRESH, UPDATING, or STALE) to see how recently information was synced.</dd>
            <dt>How can I report a new incident?</dt>
            <dd>To report an incident, contact your local disaster management authority or the relevant emergency services. INDRA's incident-reporting functionality may be introduced in a future platform release.</dd>
            <dt>How can I verify an incident report?</dt>
            <dd>Review the source information displayed on each alert card. Cross-reference with official weather, emergency management, or government sources as needed.</dd>
            <dt>How are alerts generated and prioritised?</dt>
            <dd>INDRA displays incident alerts classified by severity: Critical, High, Moderate, and Low. Alerts are ordered by severity, with Critical alerts receiving the most prominent visual emphasis. The displayed classification and ordering depend on the incident data available to the platform.</dd>
            <dt>What do confidence, source consensus and independent sources mean?</dt>
            <dd>Confidence indicates how certain the system is about an incident classification. Source consensus shows the level of agreement across data providers. Independent sources counts the number of separate providers confirming the same incident.</dd>
            <dt>Can I view historical incidents and disaster trends?</dt>
            <dd>Use the Analysis page to view trend charts, event distribution, state distribution, and week-over-week comparisons for your filtered data.</dd>
            <dt>How do I interpret the system health indicators?</dt>
            <dd>System Health shows data pipeline and infrastructure metrics such as service status, records received, processing latency, uptime, and throughput. These indicators help you assess the operational health of your deployment.</dd>
            <dt>How can I contact the support team?</dt>
            <dd>For assistance, contact your organisation's INDRA administrator or the platform operator through the official support channel provided with your deployment. Contact details will be published here when the platform's support arrangements are finalised.</dd>
            <dt>How can I use the Analysis page to understand disaster patterns?</dt>
            <dd>The Analysis page provides trend charts, event and state distribution, AI classification distribution, source consensus, and week-over-week comparisons. Select filters first to focus the analysis on your area of interest.</dd>
          </dl>
        </section>
        <section id="privacy" className="help-section" style={{ display: visibleSectionIds.includes('privacy') ? undefined : 'none' }}>
          <h2>Privacy Policy</h2>
          <p>INDRA's Privacy Policy explains how information is collected, processed, stored, and handled on the platform, including data minimisation, security, retention, disclosure, and privacy-related enquiries.</p>
          <p><Link href="/privacy" className="help-privacy-link">Read the Privacy Policy →</Link></p>
        </section>
      </div>
    </div>
    </main>
  )
}
