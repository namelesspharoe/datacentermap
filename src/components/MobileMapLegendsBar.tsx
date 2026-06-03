import { useState, type ReactNode } from 'react'

interface MobileMapLegendsBarProps {
  children: ReactNode
}

export function MobileMapLegendsBar({ children }: MobileMapLegendsBarProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`map-legends-bar${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="map-legends-bar__toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-map-legends"
      >
        <span>Map legends</span>
        <span className="map-legends-bar__chevron" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div id="mobile-map-legends" className="map-legends-bar__content">
          {children}
        </div>
      )}
    </div>
  )
}
