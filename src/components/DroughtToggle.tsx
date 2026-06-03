import { LayerToggle } from './LayerToggle'

interface DroughtToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  opacity: number
  onOpacityChange: (opacity: number) => void
}

export function DroughtToggle(props: DroughtToggleProps) {
  return (
    <LayerToggle
      id="drought-overlay"
      label="Drought overlay"
      {...props}
    />
  )
}
