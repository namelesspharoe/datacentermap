import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useId,
  useLayoutEffect,
} from 'react'
import { createPortal } from 'react-dom'
import { useLayoutMode } from '../hooks/useLayoutMode'

interface DatacenterFiltersProps {
  onFilterChange: (filters: { operator: string; minSqft: number | null }) => void
  totalFacilities: number
  filteredFacilities: number
}

interface FilterPanelContentProps {
  operator: string
  minSqft: string
  activeFilterCount: number
  filteredFacilities: number
  totalFacilities: number
  onOperatorChange: (value: string) => void
  onMinSqftChange: (value: string) => void
  onReset: () => void
}

function FilterPanelContent({
  operator,
  minSqft,
  activeFilterCount,
  filteredFacilities,
  totalFacilities,
  onOperatorChange,
  onMinSqftChange,
  onReset,
}: FilterPanelContentProps) {
  return (
    <>
      <div className="filter-group">
        <label htmlFor="operator-filter">Operator</label>
        <input
          id="operator-filter"
          type="text"
          placeholder="Search operator name…"
          value={operator}
          onChange={(e) => onOperatorChange(e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="sqft-filter">Minimum Sqft</label>
        <input
          id="sqft-filter"
          type="number"
          placeholder="e.g., 100000"
          value={minSqft}
          onChange={(e) => onMinSqftChange(e.target.value)}
          className="filter-input"
          min="0"
          step="10000"
        />
      </div>

      <div className="filter-stats">
        <span>
          {filteredFacilities.toLocaleString()} of {totalFacilities.toLocaleString()}{' '}
          facilities
        </span>
      </div>

      {activeFilterCount > 0 && (
        <button type="button" onClick={onReset} className="filter-reset-btn">
          Clear Filters
        </button>
      )}
    </>
  )
}

export function DatacenterFilters({
  onFilterChange,
  totalFacilities,
  filteredFacilities,
}: DatacenterFiltersProps) {
  const layoutMode = useLayoutMode()
  const isMobile = layoutMode === 'mobile'

  const [operator, setOperator] = useState('')
  const [minSqft, setMinSqft] = useState('')
  const [open, setOpen] = useState(false)
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (operator.trim()) count++
    if (minSqft) count++
    return count
  }, [operator, minSqft])

  const closePanel = useCallback(() => setOpen(false), [])

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current
    const dropdown = dropdownRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const padding = 12
    const dropdownWidth = dropdown?.offsetWidth ?? 280
    const dropdownHeight = dropdown?.offsetHeight ?? 280

    let left = rect.left
    let top = rect.bottom + 8

    left = Math.max(padding, Math.min(left, window.innerWidth - dropdownWidth - padding))

    if (top + dropdownHeight > window.innerHeight - padding) {
      top = rect.top - dropdownHeight - 8
    }
    top = Math.max(padding, top)

    setPanelPos({ top, left })
  }, [])

  useLayoutEffect(() => {
    if (!open || isMobile) return
    updatePanelPosition()
    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)
    return () => {
      window.removeEventListener('resize', updatePanelPosition)
      window.removeEventListener('scroll', updatePanelPosition, true)
    }
  }, [open, isMobile, updatePanelPosition])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const handleOperatorChange = useCallback(
    (value: string) => {
      setOperator(value)
      onFilterChange({
        operator: value,
        minSqft: minSqft ? parseInt(minSqft, 10) : null,
      })
    },
    [minSqft, onFilterChange],
  )

  const handleMinSqftChange = useCallback(
    (value: string) => {
      setMinSqft(value)
      onFilterChange({
        operator,
        minSqft: value ? parseInt(value, 10) : null,
      })
    },
    [operator, onFilterChange],
  )

  const handleReset = useCallback(() => {
    setOperator('')
    setMinSqft('')
    onFilterChange({
      operator: '',
      minSqft: null,
    })
  }, [onFilterChange])

  const panelContent = (
    <FilterPanelContent
      operator={operator}
      minSqft={minSqft}
      activeFilterCount={activeFilterCount}
      filteredFacilities={filteredFacilities}
      totalFacilities={totalFacilities}
      onOperatorChange={handleOperatorChange}
      onMinSqftChange={handleMinSqftChange}
      onReset={handleReset}
    />
  )

  const dropdown = open ? (
    <>
      {isMobile && (
        <button
          type="button"
          className="filter-sheet-backdrop"
          aria-label="Close filters"
          onClick={closePanel}
        />
      )}
      <div
        id={panelId}
        ref={dropdownRef}
        className={`filter-dropdown${isMobile ? ' filter-dropdown--sheet' : ''}`}
        role="dialog"
        aria-label="Data center filters"
        aria-modal={isMobile ? true : undefined}
        style={
          isMobile
            ? undefined
            : {
                position: 'fixed',
                top: panelPos.top,
                left: panelPos.left,
              }
        }
      >
        {isMobile && (
          <header className="filter-sheet-header">
            <h3>Filters</h3>
            <button
              type="button"
              className="filter-sheet-close"
              onClick={closePanel}
              aria-label="Close filters"
            >
              ×
            </button>
          </header>
        )}
        {panelContent}
        {isMobile && (
          <button type="button" className="btn btn-primary filter-sheet-done" onClick={closePanel}>
            Done
          </button>
        )}
      </div>
    </>
  ) : null

  return (
    <div className="datacenter-filters">
      <button
        ref={triggerRef}
        type="button"
        className={`filter-trigger${open ? ' filter-trigger--open' : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        Filters
        {activeFilterCount > 0 && (
          <span className="filter-badge">{activeFilterCount}</span>
        )}
      </button>
      {dropdown && createPortal(dropdown, document.body)}
    </div>
  )
}
