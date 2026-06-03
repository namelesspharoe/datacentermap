import { useState } from 'react'
import { USDM_COLORS, USDM_LABELS } from '../utils/usdm'

interface DroughtLegendProps {
  mapDate: string | null
  loading?: boolean
}

export function DroughtLegend({ mapDate, loading }: DroughtLegendProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={`drought-legend${collapsed ? ' collapsed' : ''}`}
      aria-label="U.S. Drought Monitor legend"
      aria-expanded={!collapsed}
    >
      <div className="drought-legend-header">
        <div>
          <strong>U.S. Drought Monitor</strong>
          {loading ? (
            <span className="drought-legend-date muted">Loading…</span>
          ) : mapDate ? (
            <span className="drought-legend-date muted">Week of {mapDate}</span>
          ) : (
            <span className="drought-legend-date muted">Weekly update (Thu)</span>
          )}
        </div>
        <button
          type="button"
          className="drought-legend-toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expand drought legend' : 'Collapse drought legend'}
        >
          {collapsed ? '+' : '−'}
        </button>
      </div>
      <div className="drought-legend-body">
        <ul className="drought-legend-items">
          {[4, 3, 2, 1, 0].map((level) => (
            <li key={level}>
              <span
                className="drought-swatch"
                style={{ backgroundColor: USDM_COLORS[level] }}
              />
              <span>{USDM_LABELS[level]}</span>
            </li>
          ))}
        </ul>
        <p className="drought-legend-note muted">
          Overlay shows drought intensity where data centers sit. Source:{' '}
          <a href="https://droughtmonitor.unl.edu/" target="_blank" rel="noreferrer">
            droughtmonitor.unl.edu
          </a>
        </p>
      </div>
    </div>
  )
}
