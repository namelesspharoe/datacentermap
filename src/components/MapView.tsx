import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { CountyRecord, DataCenterFeature } from '../types/geo'
import { MarkerClusterLayer } from './MarkerClusterLayer'
import { DroughtOverlay } from './DroughtOverlay'
import { WaterRiskOverlay } from './WaterRiskOverlay'
import type { CountyWaterRiskIndex } from '../utils/aqueduct'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

function FitBounds({ features }: { features: DataCenterFeature[] }) {
  const map = useMap()
  useEffect(() => {
    if (features.length === 0) return
    const bounds = L.latLngBounds(
      features.map((f) => {
        const [lon, lat] = f.geometry.coordinates
        return [lat, lon] as [number, number]
      }),
    )
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 })
  }, [features, map])
  return null
}

function FlyToCounty({ county }: { county: CountyRecord | null }) {
  const map = useMap()
  useEffect(() => {
    if (!county) return
    map.flyTo([county.centroid_lat, county.centroid_lon], 9, { duration: 0.8 })
  }, [county, map])
  return null
}

interface MapViewProps {
  features: DataCenterFeature[]
  selectedCounty: CountyRecord | null
  onSelectCountyByFips: (fips: string) => void
  onHoverRegion?: (info: any | null) => void
  onSelectFeature?: (info: any) => void
  showDrought: boolean
  droughtOpacity: number
  onDroughtDateLoaded?: (date: string | null) => void
  onDroughtError?: (message: string | null) => void
  showWaterRisk: boolean
  waterRiskOpacity: number
  countyWaterRisk: CountyWaterRiskIndex | null
  onWaterRiskModeLoaded?: (mode: 'subbasin' | 'state' | null) => void
  onWaterRiskError?: (message: string | null) => void
}

export function MapView({
  features,
  selectedCounty,
  onSelectCountyByFips,
  onHoverRegion,
  onSelectFeature,
  showDrought,
  droughtOpacity,
  onDroughtDateLoaded,
  onDroughtError,
  showWaterRisk,
  waterRiskOpacity,
  countyWaterRisk,
  onWaterRiskModeLoaded,
  onWaterRiskError,
}: MapViewProps) {
  const center = useMemo<[number, number]>(() => [39.5, -98.35], [])

  return (
    <MapContainer
      center={center}
      zoom={4}
      className="map-container"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <DroughtOverlay
        visible={showDrought}
        opacity={droughtOpacity}
        onDateLoaded={onDroughtDateLoaded}
        onError={onDroughtError}
      />
      <WaterRiskOverlay
        visible={showWaterRisk}
        opacity={waterRiskOpacity}
        countyRisk={countyWaterRisk}
        onModeLoaded={onWaterRiskModeLoaded}
        onError={onWaterRiskError}
        onHover={onHoverRegion}
        onSelectFeature={onSelectFeature}
      />
      <FitBounds features={features} />
      <FlyToCounty county={selectedCounty} />
      <MarkerClusterLayer
        features={features}
        onSelectCountyByFips={onSelectCountyByFips}
      />
    </MapContainer>
  )
}
