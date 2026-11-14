'use client'

import type { Incident } from '@/lib/types'
import { Activity, AlertTriangle, Bot, Radio } from 'lucide-react'
import type { ComponentType } from 'react'

export interface KPIChangeData {
  totalIncidentsDelta?: string
  activeIncidentsDelta?: string
  criticalAlertsDelta?: string
  aiDetectedDelta?: string
}

const DEMO_DELTAS: KPIChangeData = {
  totalIncidentsDelta: '+12.8%',
  activeIncidentsDelta: '+4.2%',
  criticalAlertsDelta: '+2',
  aiDetectedDelta: '+23.1%',
}

function kpis(incidents: Incident[], kpiData?: KPIChangeData) {
  const d: Required<KPIChangeData> = {
    ...DEMO_DELTAS,
    ...kpiData,
  } as Required<KPIChangeData>
  return [
    { icon: Radio, label: 'Total incident reports', value: incidents.length.toLocaleString(), delta: d.totalIncidentsDelta },
    { icon: Activity, label: 'Active incidents', value: incidents.filter((i) => i.status !== 'Resolved').length.toString(), delta: d.activeIncidentsDelta },
    { icon: AlertTriangle, label: 'Critical alerts', value: incidents.filter((i) => i.severity === 'critical').length.toString(), delta: d.criticalAlertsDelta },
    { icon: Bot, label: 'AI-detected incidents', value: incidents.filter((i) => i.confidence > 90).length.toString(), delta: d.aiDetectedDelta },
  ]
}

function Stat({
icon: Icon,
label,
value,
delta,
}: {
icon: ComponentType<{ size?: number }>
label: string
value: string
delta: string
}) {
return ( <div className="stat panel">
<div className="stat-icon"> <Icon size={18} /> </div> <div className="stat-copy"> <span>{label}</span> <strong>{value}</strong>
<small className="">
{delta} </small> </div> </div>
)
}

export default function KPISection({ incidents, kpiData }: { incidents: Incident[]; kpiData?: KPIChangeData }) {
return ( <div className="stats">
{kpis(incidents, kpiData).map(kpi => (
<Stat key={kpi.label} {...kpi} />
))} </div>
)
}

