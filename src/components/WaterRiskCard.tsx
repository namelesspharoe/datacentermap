import { AQUEDUCT_CAT_COLORS } from '../utils/aqueduct'
import type { WaterRiskRegion } from '../types/geo'

interface WaterRiskCardProps {
  region: WaterRiskRegion
  state?: string
  isHovered?: boolean
  isSelected?: boolean
  compact?: boolean
}

/**
 * Water Risk Card Component
 *
 * A reusable, polished card for displaying water risk information.
 * Used both in sidebar hover previews and selected state.
 *
 * Features:
 * - Color-coded left border matching risk category
 * - Hierarchical information display
 * - Hover animation for interactivity feedback
 * - Supports compact and full layouts
 * - Accessibility-friendly markup
 */
export function WaterRiskCard({
  region,
  state,
  isHovered = false,
  isSelected = false,
  compact = false,
}: WaterRiskCardProps) {
  const borderColor = AQUEDUCT_CAT_COLORS[region.cat] ?? AQUEDUCT_CAT_COLORS[-1]
  const stateDisplay = state || region.state_abb || 'Unknown'

  if (compact) {
    return (
      <div
        className={`water-risk-card ${isSelected ? 'water-risk-card--selected' : ''} ${isHovered ? 'water-risk-card--hover' : ''}`}
        role="status"
        style={{ borderLeftColor: borderColor }}
      >
        <div className="water-risk-card-header">
          <strong>{region.name}</strong>
          {stateDisplay && <span className="water-risk-card-state">{stateDisplay}</span>}
        </div>
        <div className="water-risk-score">
          <span
            className="water-risk-swatch"
            style={{ backgroundColor: borderColor }}
            aria-hidden="true"
          />
          <span className="water-risk-label">{region.label}</span>
          {region.score != null && (
            <span className="water-risk-score-value">{region.score.toFixed(2)}</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`water-risk-card water-risk-card--full ${isSelected ? 'water-risk-card--selected' : ''} ${isHovered ? 'water-risk-card--hover' : ''}`}
      role="region"
      aria-label={`Water risk for ${region.name}`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="water-risk-card-header">
        <div className="water-risk-card-title">
          <h3>{region.name}</h3>
          {stateDisplay && <p className="water-risk-card-location">{stateDisplay}</p>}
        </div>
        <span className={`badge ${isSelected ? 'badge-selected' : 'badge-hover'}`}>
          {isSelected ? 'Selected' : 'Hovering'}
        </span>
      </div>

      <div className="water-risk-card-body">
        <div className="water-risk-category">
          <p className="water-risk-label-title">Risk Category</p>
          <div className="water-risk-category-display">
            <span
              className="water-risk-swatch-large"
              style={{ backgroundColor: borderColor }}
              aria-hidden="true"
            />
            <span className="water-risk-category-label">{region.label}</span>
          </div>
        </div>

        {region.score != null && (
          <div className="water-risk-score-section">
            <p className="water-risk-label-title">Overall Water Risk Score</p>
            <p className="water-risk-score-display">{region.score.toFixed(2)}</p>
          </div>
        )}

        <div className="water-risk-source">
          <p className="water-risk-label-title">Data Source</p>
          <p className="water-risk-source-label">
            {region.source === 'subbasin' ? 'Aqueduct 4.0 Subbasin' : 'Aqueduct 4.0 State'}
          </p>
        </div>
      </div>

      {isHovered && !isSelected && (
        <div className="water-risk-card-hint">
          <p>Click to select this region</p>
        </div>
      )}
    </div>
  )
}
