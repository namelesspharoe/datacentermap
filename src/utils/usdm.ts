/** U.S. Drought Monitor classification colors (NDMC standard). */
export const USDM_COLORS: Record<number, string> = {
  0: '#FFFF00', // D0 Abnormally Dry
  1: '#FCD37F', // D1 Moderate
  2: '#FFAA00', // D2 Severe
  3: '#E60000', // D3 Extreme
  4: '#730000', // D4 Exceptional
}

export const USDM_LABELS: Record<number, string> = {
  0: 'D0 — Abnormally dry',
  1: 'D1 — Moderate drought',
  2: 'D2 — Severe drought',
  3: 'D3 — Extreme drought',
  4: 'D4 — Exceptional drought',
}

export const USDM_TILE_URL =
  'https://services5.arcgis.com/0OTVzJS4K09zlixn/arcgis/rest/services/US_Drought_Monitor/MapServer/tile/{z}/{y}/{x}'

export const USDM_GEOJSON_URL = 'https://mesonet.agron.iastate.edu/geojson/usdm.py'

export const USDM_ATTRIBUTION =
  '<a href="https://droughtmonitor.unl.edu/" target="_blank" rel="noreferrer">U.S. Drought Monitor</a> (NDMC)'
