/** WRI Aqueduct 4.0 overall water risk category colors (w_awr_def_tot_cat). */
export const AQUEDUCT_CAT_COLORS: Record<number, string> = {
  [-1]: '#6b7280', // No data
  0: '#4ade80', // Low
  1: '#facc15', // Low-medium
  2: '#fb923c', // Medium-high
  3: '#ef4444', // High
  4: '#7f1d1d', // Extremely high
}

export const AQUEDUCT_CAT_LABELS: Record<number, string> = {
  [-1]: 'No data',
  0: 'Low',
  1: 'Low–medium',
  2: 'Medium–high',
  3: 'High',
  4: 'Extremely high',
}

export const AQUEDUCT_ATTRIBUTION =
  '<a href="https://www.wri.org/aqueduct" target="_blank" rel="noreferrer">WRI Aqueduct 4.0</a> (CC BY 4.0)'

export const US_STATES_GEOJSON_PATH = '/data/us-states.geojson'

export interface CountyWaterRisk {
  fips: string
  cat: number
  score: number | null
  label: string
  source: 'subbasin' | 'state' | 'seed'
}

export interface StateWaterRisk {
  cat: number
  score: number | null
  label: string
}

export interface CountyWaterRiskIndex {
  generated_at: string
  indicator: string
  indicator_label: string
  source_note: string
  counties: Record<string, CountyWaterRisk>
  states?: Record<string, StateWaterRisk>
}

export interface WaterRiskRegion {
  id: string
  name: string
  state_abb?: string
  state?: string
  cat: number
  score: number | null
  label: string
  source: 'subbasin' | 'state' | 'seed'
}

