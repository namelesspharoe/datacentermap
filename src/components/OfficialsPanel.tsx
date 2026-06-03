import type { CountyRecord } from '../types/geo'
import type { Official, PendingContribution } from '../types/officials'
import type { CountyWaterRisk, WaterRiskRegion } from '../utils/aqueduct'
import { getInitials } from '../utils/initials'
import { WaterRiskCard } from './WaterRiskCard'

interface OfficialsPanelProps {
  county: CountyRecord | null
  hoverRegion?: WaterRiskRegion | null
  officials: Official[]
  pending: PendingContribution[]
  loading: boolean
  onContribute: () => void
  waterRisk?: CountyWaterRisk | null
}

function OfficialsSkeleton() {
  return (
    <div className="officials-skeleton" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-avatar" />
          <div className="skeleton-lines">
            <div className="skeleton-line skeleton-line--wide" />
            <div className="skeleton-line skeleton-line--medium" />
            <div className="skeleton-line skeleton-line--short" />
          </div>
        </div>
      ))}
    </div>
  )
}

function sourceLabel(source: Official['source']): string {
  return source === 'seed' ? 'Verified sample' : 'Community'
}

export function OfficialsPanel({
  county,
  hoverRegion,
  officials,
  pending,
  loading,
  onContribute,
  waterRisk,
}: OfficialsPanelProps) {
  // Priority ordering: Selected county > Selected region > Hovered region > Empty
  
  // No selection - show empty state
  if (!county && !hoverRegion) {
    return (
      <section className="panel officials-panel">
        <div className="panel-empty-hero">
          <div className="panel-empty-icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <h2>County officials</h2>
          <p className="muted">
            Select a county from the list or click a data center marker to view
            elected officials and contact information.
          </p>
        </div>
      </section>
    )
  }

  // Show county with officials (highest priority)
  if (county) {
    return (
      <section className="panel officials-panel">
        <header className="panel-header">
          <div>
            <h2>{county.county}</h2>
            <p className="subtitle">
              {county.state} · {county.facility_count} data centers in dataset
            </p>
          </div>
          <span className="badge badge-outline">Test / community data</span>
        </header>

        {waterRisk && waterRisk.cat >= 0 && (
          <WaterRiskCard
            region={{
              id: `county-${county.fips}`,
              name: county.county,
              state_abb: county.state_abb,
              state: county.state,
              cat: waterRisk.cat,
              score: waterRisk.score,
              label: waterRisk.label,
              source: waterRisk.source,
            }}
            compact
          />
        )}

        {loading ? (
          <OfficialsSkeleton />
        ) : officials.length === 0 ? (
          <div className="empty-state">
            <div className="panel-empty-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>No officials yet</h3>
            <p className="muted">Be the first to add contact information for this county.</p>
            <button type="button" className="btn btn-primary" onClick={onContribute}>
              Add an official
            </button>
          </div>
        ) : (
          <>
            <ul className="officials-list">
              {officials.map((o) => (
                <li key={o.id} className="official-card">
                  <div className="official-card-inner">
                    <div className="official-avatar" aria-hidden="true">
                      {getInitials(o.name)}
                    </div>
                    <div className="official-body">
                      <div className="official-header">
                        <strong className="official-name">{o.name}</strong>
                        <span className={`badge badge-source badge-source--${o.source}`}>
                          {sourceLabel(o.source)}
                        </span>
                      </div>
                      <p className="position">{o.position}</p>
                      <div className="contact-chips">
                        {o.phone && (
                          <a className="contact-chip" href={`tel:${o.phone.replace(/\D/g, '')}`}>
                            <span className="chip-icon" aria-hidden="true">☎</span>
                            {o.phone}
                          </a>
                        )}
                        {o.email && (
                          <a className="contact-chip" href={`mailto:${o.email}`}>
                            <span className="chip-icon" aria-hidden="true">✉</span>
                            {o.email}
                          </a>
                        )}
                        {o.website && (
                          <a
                            className="contact-chip"
                            href={o.website}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span className="chip-icon" aria-hidden="true">↗</span>
                            Website
                          </a>
                        )}
                      </div>
                      <p className="updated muted">
                        Updated {new Date(o.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-secondary btn-block" onClick={onContribute}>
              Suggest another official
            </button>
          </>
        )}

        {pending.length > 0 && (
          <div className="pending-block">
            <h3>Your pending submissions</h3>
            <ul className="pending-list">
              {pending.map((p) => (
                <li key={p.id} className="pending-item">
                  <span className="pending-item-text">
                    <strong>{p.name}</strong>
                    <span className="muted"> — {p.position}</span>
                  </span>
                  <span className="badge badge-pending">Pending review</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    )
  }

  // Show hovered water region preview (no county selected)
  if (hoverRegion) {
    return (
      <section className="panel officials-panel">
        <header className="panel-header">
          <div>
            <h2>Water Risk Preview</h2>
            <p className="subtitle">Hover over map regions</p>
          </div>
          <span className="badge badge-hover">Hovering</span>
        </header>

        <WaterRiskCard region={hoverRegion} state={hoverRegion.state_abb} isHovered compact={false} />

        <div className="water-risk-hint-section">
          <p className="water-risk-hint-text">
            🔍 Click on a region to select it and view more details, or click a county to see officials.
          </p>
        </div>
      </section>
    )
  }

  return null
}
