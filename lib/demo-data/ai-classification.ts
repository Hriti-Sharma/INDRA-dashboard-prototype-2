// Demo AI classification distribution data for the "AI Classification Distribution" panel.
// These values are sample/demo data and must not be confused with live backend ML assessments.
export interface DemoAIClassificationEntry {
  eventType: string
  count: number
}

export const demoAIClassification: DemoAIClassificationEntry[] = [
  { eventType: 'Flood', count: 31 },
  { eventType: 'Heatwave', count: 24 },
  { eventType: 'Rainfall', count: 19 },
  { eventType: 'Cyclone', count: 14 },
  { eventType: 'Other', count: 12 },
]