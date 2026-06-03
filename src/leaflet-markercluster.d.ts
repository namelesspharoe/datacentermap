import 'leaflet'

declare module 'leaflet' {
  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup

  interface MarkerClusterGroupOptions {
    chunkedLoading?: boolean
    maxClusterRadius?: number
  }

  interface MarkerClusterGroup extends Layer {
    addLayer(layer: Layer): this
    clearLayers(): this
  }
}

declare module 'leaflet.markercluster' {}
