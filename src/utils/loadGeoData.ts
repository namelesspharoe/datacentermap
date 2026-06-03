import type { DataCenterFeature, DataCentersGeoJSON } from '../types/geo'

function sanitizeValue<T>(value: T): T | null {
  if (typeof value === 'number' && Number.isNaN(value)) return null
  if (value === 'NaN' || value === 'nan') return null
  return value
}

function sanitizeFeature(feature: DataCenterFeature): DataCenterFeature {
  const p = feature.properties
  return {
    ...feature,
    properties: {
      ...p,
      name: sanitizeValue(p.name) as string | null,
      operator: sanitizeValue(p.operator) as string | null,
      sqft: sanitizeValue(p.sqft) as number | null,
    },
  }
}

export async function loadDataCenters(): Promise<DataCentersGeoJSON> {
  const res = await fetch('/data/datacenters.geojson')
  if (!res.ok) throw new Error('Failed to load data centers GeoJSON')
  const raw = (await res.json()) as DataCentersGeoJSON
  return {
    ...raw,
    features: raw.features.map(sanitizeFeature),
  }
}
