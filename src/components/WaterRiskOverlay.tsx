import { useEffect, useState } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { PathOptions } from 'leaflet'
import type { FeatureCollection, Geometry } from 'geojson'
import { AQUEDUCT_CAT_COLORS, US_STATES_GEOJSON_PATH } from '../utils/aqueduct'
import type { CountyWaterRiskIndex, WaterRiskRegion } from '../utils/aqueduct'

interface StateFeatureProperties {
  name?: string
  NAME?: string
  STUSPS?: string
  abbreviation?: string
  cat?: number
  score?: number | null
  label?: string
}

type StatesCollection = FeatureCollection<Geometry, StateFeatureProperties>

/**
 * Base style for water risk polygons
 * Uses opacity multiplier for layer-level control
 */
function riskStyle(cat: number, opacity: number): PathOptions {
  const level = Math.max(-1, Math.min(4, Math.round(cat)))
  const color = AQUEDUCT_CAT_COLORS[level] ?? '#6b7280'
  return {
    fillColor: color,
    fillOpacity: 0.5 * opacity,
    color,
    weight: 1,
    opacity: 0.85 * opacity,
  }
}

/**
 * Hover state styling - much more prominent than base style
 * Increases border weight, adds opacity, and uses brighter fill
 */
function hoverStyle(cat: number, opacity: number): PathOptions {
  const level = Math.max(-1, Math.min(4, Math.round(cat)))
  const color = AQUEDUCT_CAT_COLORS[level] ?? '#6b7280'
  return {
    fillColor: color,
    fillOpacity: Math.min(1, 0.75 * opacity + 0.3),
    color,
    weight: 3,
    opacity: 1,
  }
}

interface WaterRiskOverlayProps {
  visible: boolean
  opacity: number
  countyRisk: CountyWaterRiskIndex | null
  onModeLoaded?: (mode: 'subbasin' | 'state' | null) => void
  onError?: (message: string | null) => void
  onHover?: (region: WaterRiskRegion | null) => void
  onSelectFeature?: (region: WaterRiskRegion) => void
}

export function WaterRiskOverlay({
  visible,
  opacity,
  countyRisk,
  onModeLoaded,
  onError,
  onHover,
  onSelectFeature,
}: WaterRiskOverlayProps) {
  const [subbasinData, setSubbasinData] = useState<FeatureCollection | null>(null)
  const [statesData, setStatesData] = useState<StatesCollection | null>(null)
  const [mode, setMode] = useState<'subbasin' | 'state' | null>(null)
  const [layerRefs, setLayerRefs] = useState<Map<string, any>>(new Map())

  useEffect(() => {
    if (!visible) {
      setSubbasinData(null)
      setStatesData(null)
      setMode(null)
      setLayerRefs(new Map())
      onModeLoaded?.(null)
      return
    }

    let cancelled = false
    onError?.(null)

    async function loadWaterRisk() {
      try {
        const subbasinRes = await fetch('/data/aqueduct-us-risk.geojson')
        const subbasinType = subbasinRes.headers.get('content-type') ?? ''
        const subbasinIsJson = /(application\/json|application\/geo\+json|application\/vnd\.geo\+json)/i.test(subbasinType)

        if (subbasinRes.ok && subbasinIsJson) {
          const geo = (await subbasinRes.json()) as FeatureCollection
          if (cancelled) return
          setSubbasinData(geo)
          setMode('subbasin')
          onModeLoaded?.('subbasin')
          return
        }

        if (!countyRisk?.states) {
          throw new Error('Water risk state proxy unavailable')
        }

        const statesRes = await fetch(US_STATES_GEOJSON_PATH)
        const statesType = statesRes.headers.get('content-type') ?? ''
        const statesIsJson = /(application\/json|application\/geo\+json|application\/vnd\.geo\+json)/i.test(statesType)
        if (!statesRes.ok || !statesIsJson) {
          throw new Error('Failed to load local state boundaries')
        }

        const states = (await statesRes.json()) as StatesCollection
        if (cancelled) return
        const stateRisk = countyRisk.states!
        const enriched: StatesCollection = {
          type: 'FeatureCollection',
          features: states.features.map((f) => {
            const abb =
              f.properties?.STUSPS ??
              f.properties?.abbreviation ??
              nameToAbb(f.properties?.name ?? f.properties?.NAME ?? '')
            const risk = abb ? stateRisk[abb] : undefined
            return {
              ...f,
              properties: {
                ...f.properties,
                cat: risk?.cat ?? -1,
                score: risk?.score ?? null,
                label: risk?.label ?? 'No data',
              },
            }
          }),
        }
        setStatesData(enriched)
        setMode('state')
        onModeLoaded?.('state')
      } catch (e: unknown) {
        if (!cancelled) {
          onError?.(e instanceof Error ? e.message : 'Water risk layer unavailable')
        }
      }
    }

    loadWaterRisk()

    return () => {
      cancelled = true
    }
  }, [visible, countyRisk, onError, onModeLoaded])

  if (!visible || !mode) return null

  if (mode === 'subbasin' && subbasinData) {
    return (
      <GeoJSON
        key="aqueduct-subbasin"
        data={subbasinData}
        style={(feature) => {
          const cat = feature?.properties?.cat ?? -1
          return riskStyle(Number(cat), opacity)
        }}
        onEachFeature={(feature, layer: any) => {
          const props: any = feature?.properties ?? {}
          const name = props.label || props.NAME || props.name || ''
          const cat = props.cat ?? -1
          const score = props.score ?? null
          const label = props.label ?? 'No data'

          const region: WaterRiskRegion = {
            id: `subbasin-${name}`,
            name,
            cat,
            score,
            label,
            source: 'subbasin',
          }

          layer.on('mouseover', () => {
            try {
              layer.setStyle(hoverStyle(Number(cat), opacity))
              layer.bringToFront?.()
            } catch {}
            onHover?.(region)
          })

          layer.on('mouseout', () => {
            try {
              layer.setStyle(riskStyle(Number(cat), opacity))
            } catch {}
            onHover?.(null)
          })

          layer.on('click', () => {
            onSelectFeature?.(region)
          })

          // Store layer reference for potential cleanup
          const refs = new Map(layerRefs)
          refs.set(region.id, layer)
          setLayerRefs(refs)
        }}
      />
    )
  }

  if (mode === 'state' && statesData) {
    return (
      <GeoJSON
        key="aqueduct-states"
        data={statesData}
        style={(feature) => {
          const cat = feature?.properties?.cat ?? -1
          return riskStyle(Number(cat), opacity)
        }}
        onEachFeature={(feature, layer: any) => {
          const props: any = feature?.properties ?? {}
          const name = props.NAME || props.name || ''
          const abb = props.STUSPS ?? props.abbreviation ?? nameToAbb(name)
          const cat = props.cat ?? -1
          const score = props.score ?? null
          const label = props.label ?? 'No data'

          const region: WaterRiskRegion = {
            id: `state-${abb}`,
            name,
            state_abb: abb,
            cat,
            score,
            label,
            source: 'state',
          }

          layer.on('mouseover', () => {
            try {
              layer.setStyle(hoverStyle(Number(cat), opacity))
              layer.bringToFront?.()
            } catch {}
            onHover?.(region)
          })

          layer.on('mouseout', () => {
            try {
              layer.setStyle(riskStyle(Number(cat), opacity))
            } catch {}
            onHover?.(null)
          })

          layer.on('click', () => {
            onSelectFeature?.(region)
          })

          // Store layer reference for potential cleanup
          const refs = new Map(layerRefs)
          refs.set(region.id, layer)
          setLayerRefs(refs)
        }}
      />
    )
  }

  return null
}

function nameToAbb(name: string): string {
  const lookup: Record<string, string> = {
    Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
    Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC',
    Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL',
    Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA',
    Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN',
    Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR',
    Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD',
    Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA',
    Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
  }
  return lookup[name] ?? ''
}

