import type { CountyRecord } from '../types/geo'

interface CountySearchProps {
  counties: CountyRecord[]
  selectedFips: string | null
  onSelect: (county: CountyRecord) => void
  loading: boolean
}

export function CountySearch({
  counties,
  selectedFips,
  onSelect,
  loading,
}: CountySearchProps) {
  const selected = counties.find((c) => c.fips === selectedFips)

  return (
    <div className="county-search">
      <label className="county-search-label" htmlFor="county-select">
        <span className="label">Filter by county</span>
        {selected && (
          <span className="county-search-helper">
            {selected.facility_count.toLocaleString()} facilities in dataset
          </span>
        )}
      </label>
      <div className="county-search-field">
        <span className="county-search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <select
          id="county-select"
          value={selectedFips ?? ''}
          disabled={loading}
          onChange={(e) => {
            const county = counties.find((c) => c.fips === e.target.value)
            if (county) onSelect(county)
          }}
        >
          <option value="">
            {loading ? 'Loading counties…' : 'Select a county…'}
          </option>
          {counties.map((c) => (
            <option key={c.fips} value={c.fips}>
              {c.county}, {c.state_abb} ({c.facility_count} facilities)
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
