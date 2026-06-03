import { LayerToggle } from './LayerToggle'

interface WaterRiskToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  opacity: number
  onOpacityChange: (opacity: number) => void
}

export function WaterRiskToggle(props: WaterRiskToggleProps) {
  return (
    <LayerToggle
      id="water-risk-overlay"
      label="Water risk (Aqueduct)"
      compactLabel="Water risk"
      {...props}
    />
  )
}
