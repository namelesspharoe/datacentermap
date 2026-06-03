import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import type { DataCenterFeature } from '../types/geo'

interface MarkerClusterLayerProps {
  features: DataCenterFeature[]
  onSelectCountyByFips: (fips: string) => void
}

export function MarkerClusterLayer({
  features,
  onSelectCountyByFips,
}: MarkerClusterLayerProps) {
  const map = useMap()

  useEffect(() => {
    const cluster = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 50 })

    for (const feature of features) {
      const [lon, lat] = feature.geometry.coordinates
      const p = feature.properties
      const label = p.name || p.operator || 'Data center'

      let popupHtml = `<strong>${escapeHtml(label)}</strong>`
      if (p.operator && p.name) {
        popupHtml += `<p class="popup-meta">Operator: ${escapeHtml(p.operator)}</p>`
      }
      popupHtml += `<p class="popup-meta">${escapeHtml(p.county)}, ${escapeHtml(p.state_abb)}</p>`
      if (p.sqft != null) {
        popupHtml += `<p class="popup-meta">Area: ${Math.round(p.sqft).toLocaleString()} sq ft</p>`
      }
      popupHtml += `<button type="button" class="leaflet-popup-btn" data-fips="${escapeHtml(p.fips)}">View county officials</button>`

      const marker = L.marker([lat, lon]).bindPopup(popupHtml)
      cluster.addLayer(marker)
    }

    map.addLayer(cluster)

    const onPopupOpen = (e: L.PopupEvent) => {
      const btn = (e.popup.getElement()?.querySelector(
        '.leaflet-popup-btn',
      ) as HTMLButtonElement | null)
      if (!btn) return
      const fips = btn.getAttribute('data-fips')
      if (fips) {
        btn.onclick = () => onSelectCountyByFips(fips)
      }
    }

    map.on('popupopen', onPopupOpen)

    return () => {
      map.off('popupopen', onPopupOpen)
      map.removeLayer(cluster)
      cluster.clearLayers()
    }
  }, [features, map, onSelectCountyByFips])

  return null
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
