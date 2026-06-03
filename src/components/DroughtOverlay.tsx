import { useEffect, useState } from 'react'
import { GeoJSON, TileLayer, useMap } from 'react-leaflet'
import type { PathOptions } from 'leaflet'
import type { FeatureCollection, Geometry } from 'geojson'
import {
  USDM_ATTRIBUTION,
  USDM_COLORS,
  USDM_GEOJSON_URL,
  USDM_TILE_URL,
} from '../utils/usdm'

interface UsdmFeatureProperties {
  dm?: number
  date?: string
}

type UsdmFeatureCollection = FeatureCollection<Geometry, UsdmFeatureProperties>

function dmStyle(dm: number): PathOptions {
  const level = Math.max(0, Math.min(4, Math.round(dm)))
  const color = USDM_COLORS[level] ?? '#888'
  return {
    fillColor: color,
    fillOpacity: 0.55,
    color: color,
    weight: 0.5,
    opacity: 0.85,
  }
}

interface DroughtOverlayProps {
  visible: boolean
  opacity: number
  onDateLoaded?: (date: string | null) => void
  onError?: (message: string | null) => void
}

function DroughtGeoJSONFallback({
  opacity,
  onDateLoaded,
  onError,
}: Omit<DroughtOverlayProps, 'visible'>) {
  const map = useMap()
  const [data, setData] = useState<UsdmFeatureCollection | null>(null)

  useEffect(() => {
    let cancelled = false
    onError?.(null)

    fetch(USDM_GEOJSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load drought data')
        return res.json() as Promise<UsdmFeatureCollection>
      })
      .then((geo) => {
        if (cancelled) return
        setData(geo)
        const date = geo.features[0]?.properties?.date ?? null
        onDateLoaded?.(date)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        onError?.(e instanceof Error ? e.message : 'Drought layer unavailable')
      })

    return () => {
      cancelled = true
    }
  }, [onDateLoaded, onError])

  useEffect(() => {
    if (data) {
      map.attributionControl?.addAttribution(USDM_ATTRIBUTION)
      return () => {
        map.attributionControl?.removeAttribution(USDM_ATTRIBUTION)
      }
    }
  }, [data, map])

  if (!data) return null

  return (
    <GeoJSON
      key={`usdm-geo-${data.features.length}`}
      data={data}
      style={(feature) => {
        const dm = feature?.properties?.dm ?? 0
        const style = dmStyle(Number(dm))
        return { ...style, fillOpacity: (style.fillOpacity ?? 0.55) * opacity }
      }}
    />
  )
}

export function DroughtOverlay({
  visible,
  opacity,
  onDateLoaded,
  onError,
}: DroughtOverlayProps) {
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    if (!visible) {
      setUseFallback(false)
      return
    }

    const probe = new Image()
    probe.onload = () => setUseFallback(false)
    probe.onerror = () => setUseFallback(true)
    // Probe a continental US tile at zoom 4
    probe.src =
      'https://services5.arcgis.com/0OTVzJS4K09zlixn/arcgis/rest/services/US_Drought_Monitor/MapServer/tile/4/6/4'

    return () => {
      probe.onload = null
      probe.onerror = null
    }
  }, [visible])

  useEffect(() => {
    if (!visible || useFallback) return

    fetch(
      'https://services5.arcgis.com/0OTVzJS4K09zlixn/arcgis/rest/services/US_Drought_Monitor/MapServer/0/query?where=1%3D1&outFields=MapDate&returnGeometry=false&resultRecordCount=1&f=json&orderByFields=MapDate+DESC',
    )
      .then((r) => r.json())
      .then((json) => {
        const raw = json?.features?.[0]?.attributes?.MapDate as number | undefined
        if (raw) {
          onDateLoaded?.(new Date(raw).toISOString().slice(0, 10))
        }
      })
      .catch(() => {
        onDateLoaded?.(null)
      })
  }, [visible, useFallback, onDateLoaded])

  if (!visible) return null

  if (useFallback) {
    return (
      <DroughtGeoJSONFallback
        opacity={opacity}
        onDateLoaded={onDateLoaded}
        onError={onError}
      />
    )
  }

  return (
    <TileLayer
      url={USDM_TILE_URL}
      opacity={opacity}
      attribution={USDM_ATTRIBUTION}
      zIndex={250}
      eventHandlers={{
        tileerror: () => setUseFallback(true),
      }}
    />
  )
}
