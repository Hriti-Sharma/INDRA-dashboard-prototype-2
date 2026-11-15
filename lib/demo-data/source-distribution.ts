// Demo source distribution data for the "Reports by source" panel.
// These values are sample/demo data and must not be confused with live backend intelligence.
export interface DemoSourceDistributionEntry {
  source: string
  count: number
}

export const demoSourceDistribution: DemoSourceDistributionEntry[] = [
  { source: 'APIs', count: 46 },
  { source: 'Citizen reports', count: 24 },
  { source: 'Public posts', count: 15 },
  { source: 'Websites', count: 9 },
  { source: 'Datasets', count: 6 },
]