'use client'

import type { Incident } from '@/lib/types'
import { Activity, AlertTriangle, Bot, Radio } from 'lucide-react'
import type { ComponentType } from 'react'

const kpis = (incidents: Incident[]) => [
  { icon: Radio, label: 'Total incident reports', value: incidents.length.toLocaleString(), delta: '+12.8%' },
  { icon: Activity, label: 'Active incidents', value: incidents.filter((i) => i.status !== 'Resolved').length.toString(), delta: '+4.2%' },
  { icon: AlertTriangle, label: 'Critical alerts', value: incidents.filter((i) => i.severity === 'critical').length.toString(), delta: '+2' },
  { icon: Bot, label: 'AI-detected incidents', value: incidents.filter((i) => i.confidence > 90).length.toString(), delta: '+23.1%' },
]

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

export default function KPISection({ incidents }: { incidents: Incident[] }) {
return ( <div className="stats">
{kpis(incidents).map(kpi => (
<Stat key={kpi.label} {...kpi} />
))} </div>
)
}

