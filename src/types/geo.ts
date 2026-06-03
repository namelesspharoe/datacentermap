export interface DataCenterProperties {
  id: string
  name: string | null
  operator: string | null
  state: string
  state_abb: string
  county: string
  sqft: number | null
  type: string
  fips: string
}

export interface DataCenterFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: DataCenterProperties
}

export interface DataCentersGeoJSON {
  type: 'FeatureCollection'
  metadata?: {
    source?: string
    license?: string
    generated_at?: string
    feature_count?: number
  }
  features: DataCenterFeature[]
}

export interface CountyRecord {
  fips: string
  county: string
  state: string
  state_abb: string
  facility_count: number
  centroid_lat: number
  centroid_lon: number
  county_norm: string
}

export interface CountiesIndex {
  generated_at: string
  county_count: number
  counties: CountyRecord[]
}

/** Water risk region from overlay (state, subbasin, or seed data) */
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

/** Hover state for water risk regions */
export interface HoveredWaterRegion {
  region: WaterRiskRegion
  timestamp: number
}
