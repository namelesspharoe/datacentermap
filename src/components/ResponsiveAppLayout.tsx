import { useEffect, useState, type ReactNode } from 'react'
import { useLayoutMode } from '../hooks/useLayoutMode'
import { MobileMapLegendsBar } from './MobileMapLegendsBar'
import { MobileToolbar } from './MobileToolbar'

type SheetState = 'collapsed' | 'peek' | 'expanded'

interface ResponsiveAppLayoutProps {
  header: ReactNode
  toolbarPrimary: ReactNode
  toolbarSecondary: ReactNode
  toolbarControlsActive?: boolean
  banners?: ReactNode
  map: ReactNode
  legends?: ReactNode
  panel: ReactNode
  footer: ReactNode
  panelActive?: boolean
  panelPeekLabel?: string
}

export function ResponsiveAppLayout({
  header,
  toolbarPrimary,
  toolbarSecondary,
  toolbarControlsActive,
  banners,
  map,
  legends,
  panel,
  footer,
  panelActive = false,
  panelPeekLabel,
}: ResponsiveAppLayoutProps) {
  const layoutMode = useLayoutMode()
  const [sheetState, setSheetState] = useState<SheetState>('collapsed')

  useEffect(() => {
    if (layoutMode === 'desktop') {
      setSheetState('collapsed')
    }
  }, [layoutMode])

  useEffect(() => {
    if (layoutMode !== 'mobile') return
    setSheetState('collapsed')
  }, [panelActive, layoutMode])

  const handleSheetHandleClick = () => {
    setSheetState((prev) => {
      if (prev === 'expanded') return 'collapsed'
      if (panelActive) return 'expanded'
      return 'collapsed'
    })
  }

  if (layoutMode === 'desktop') {
    return (
      <div className="app app--desktop">
        {header}
        {banners}
        <div className="toolbar">
          <div className="toolbar-primary">{toolbarPrimary}</div>
          <div className="toolbar-secondary">{toolbarSecondary}</div>
        </div>
        <main className="main-layout main-layout--desktop">
          <div className="map-wrap">
            {map}
            {legends}
          </div>
          {panel}
        </main>
        <footer className="app-footer">{footer}</footer>
      </div>
    )
  }

  const sheetExpanded = sheetState === 'expanded'

  return (
    <div className={`app app--mobile app--sheet-${sheetState}`}>
      {header}
      {banners}
      <MobileToolbar
        primary={toolbarPrimary}
        secondary={toolbarSecondary}
        controlsActive={toolbarControlsActive}
      />
      {legends && <MobileMapLegendsBar>{legends}</MobileMapLegendsBar>}
      <main className="main-layout main-layout--mobile">
        <div className="map-stage">
          <div className="map-wrap">{map}</div>
        </div>
      </main>
      <div
        className={`bottom-sheet bottom-sheet--${sheetState}`}
        role="dialog"
        aria-label="County officials"
        aria-expanded={sheetExpanded}
      >
        <button
          type="button"
          className="bottom-sheet__handle"
          onClick={handleSheetHandleClick}
          aria-label={
            sheetState === 'expanded'
              ? 'Collapse officials panel'
              : panelActive
                ? 'Expand officials panel to full height'
                : 'Show county officials'
          }
        >
          <span className="bottom-sheet__grab" aria-hidden="true" />
          {panelPeekLabel && sheetState !== 'expanded' && (
            <span className="bottom-sheet__label">{panelPeekLabel}</span>
          )}
        </button>
        <div className="bottom-sheet__content">{panel}</div>
      </div>
      <footer className="app-footer app-footer--mobile">{footer}</footer>
    </div>
  )
}
