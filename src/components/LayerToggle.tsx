interface LayerToggleProps {
  id: string
  label: string
  compactLabel?: string
  enabled: boolean
  onChange: (enabled: boolean) => void
  opacity: number
  onOpacityChange: (opacity: number) => void
}

export function LayerToggle({
  id,
  label,
  compactLabel,
  enabled,
  onChange,
  opacity,
  onOpacityChange,
}: LayerToggleProps) {
  return (
    <div className="layer-toggle">
      <label className="layer-toggle-label" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="layer-toggle-label-full">{label}</span>
        {compactLabel && (
          <span className="layer-toggle-label-compact">{compactLabel}</span>
        )}
      </label>
      {enabled && (
        <label className="layer-opacity-label">
          <span className="label">Intensity</span>
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            aria-valuemin={0.2}
            aria-valuemax={1}
            aria-valuenow={opacity}
          />
        </label>
      )}
    </div>
  )
}
