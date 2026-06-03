import { useState, type ReactNode } from 'react'

interface MobileToolbarProps {
  primary: ReactNode
  secondary: ReactNode
  controlsActive?: boolean
}

export function MobileToolbar({
  primary,
  secondary,
  controlsActive = false,
}: MobileToolbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`toolbar toolbar--mobile${open ? ' toolbar--mobile--open' : ''}`}>
      <div className="toolbar-mobile__row">
        <div className="toolbar-mobile__primary">{primary}</div>
        <button
          type="button"
          className="toolbar-mobile__toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-toolbar-controls"
        >
          <span className="toolbar-mobile__toggle-label">Layers</span>
          <span className="toolbar-mobile__chevron" aria-hidden="true">
            {open ? '−' : '+'}
          </span>
          {controlsActive && !open && (
            <span className="toolbar-mobile__active-dot" aria-label="Layers or filters active" />
          )}
        </button>
      </div>
      {open && (
        <div id="mobile-toolbar-controls" className="toolbar-mobile__controls">
          {secondary}
        </div>
      )}
    </div>
  )
}
