import { useState } from 'react'
import { AQUEDUCT_CAT_COLORS, AQUEDUCT_CAT_LABELS } from '../utils/aqueduct'

interface WaterRiskLegendProps {
  indicatorLabel: string
  sourceNote: string
  overlayMode: 'subbasin' | 'state' | null
}

export function WaterRiskLegend({
  indicatorLabel,
  sourceNote,
  overlayMode,
}: WaterRiskLegendProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={`water-risk-legend${collapsed ? ' collapsed' : ''}`}
      aria-label="Aqueduct water risk legend"
      aria-expanded={!collapsed}
    >
      <div className="water-risk-legend-header">
        <div>
          <strong>Aqueduct water risk</strong>
          {!collapsed && (
            <>
              <span className="water-risk-legend-sub muted">{indicatorLabel}</span>
              {overlayMode === 'state' && (
                <span className="badge badge-outline">State-level overlay</span>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          className="water-risk-legend-toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expand water risk legend' : 'Collapse water risk legend'}
        >
          {collapsed ? '+' : '−'}
        </button>
      </div>
      <div className="water-risk-legend-body">
        <ul className="water-risk-legend-items">
          {[0, 1, 2, 3, 4].map((level) => (
            <li key={level}>
              <span
                className="drought-swatch"
                style={{ backgroundColor: AQUEDUCT_CAT_COLORS[level] }}
              />
              <span>{AQUEDUCT_CAT_LABELS[level]}</span>
            </li>
          ))}
        </ul>
        <p className="water-risk-legend-note muted">{sourceNote}</p>
        <p className="water-risk-legend-note muted">
          Source:{' '}
          <a
            href="https://www.wri.org/applications/aqueduct/water-risk-atlas/"
            target="_blank"
            rel="noreferrer"
          >
            WRI Aqueduct Water Risk Atlas
          </a>
        </p>
      </div>
    </div>
  )
}
