import { useState, useCallback, useMemo } from 'react'

interface DatacenterFiltersProps {
  onFilterChange: (filters: { operator: string; minSqft: number | null }) => void
  totalFacilities: number
  filteredFacilities: number
}

export function DatacenterFilters({
  onFilterChange,
  totalFacilities,
  filteredFacilities,
}: DatacenterFiltersProps) {
  const [operator, setOperator] = useState('')
  const [minSqft, setMinSqft] = useState<string>('')

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (operator.trim()) count++
    if (minSqft) count++
    return count
  }, [operator, minSqft])

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

  return (
    <div className="datacenter-filters">
      <details className="filter-details">
        <summary className="filter-summary">
          Filters
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
        </summary>
        <div className="filter-content">
          <div className="filter-group">
            <label htmlFor="operator-filter">Operator</label>
            <input
              id="operator-filter"
              type="text"
              placeholder="Search operator name…"
              value={operator}
              onChange={(e) => handleOperatorChange(e.target.value)}
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
              onChange={(e) => handleMinSqftChange(e.target.value)}
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
            <button onClick={handleReset} className="filter-reset-btn">
              Clear Filters
            </button>
          )}
        </div>
      </details>
    </div>
  )
}
