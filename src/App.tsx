import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Header } from './components/Header'
import { MapView } from './components/MapView'
import { CountySearch } from './components/CountySearch'
import { OfficialsPanel } from './components/OfficialsPanel'
import { ContributeForm } from './components/ContributeForm'
import { AuthModal } from './components/AuthModal'
import { DroughtToggle } from './components/DroughtToggle'
import { DroughtLegend } from './components/DroughtLegend'
import { WaterRiskToggle } from './components/WaterRiskToggle'
import { WaterRiskLegend } from './components/WaterRiskLegend'
import { DatacenterFilters } from './components/DatacenterFilters'
import type { CountyWaterRiskIndex, WaterRiskRegion } from './utils/aqueduct'
import { useCounties } from './hooks/useCounties'
import { useOfficials } from './hooks/useOfficials'
import { loadDataCenters } from './utils/loadGeoData'
import type { CountyRecord } from './types/geo'
import type { DataCenterFeature } from './types/geo'

function AppContent() {
  const { counties, loading: countiesLoading, error: countiesError } = useCounties()
  const [features, setFeatures] = useState<DataCenterFeature[]>([])
  const [geoLoading, setGeoLoading] = useState(true)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [selectedCounty, setSelectedCounty] = useState<CountyRecord | null>(null)
  const [hoverRegion, setHoverRegion] = useState<WaterRiskRegion | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showContribute, setShowContribute] = useState(false)
  const [showDrought, setShowDrought] = useState(true)
  const [droughtOpacity, setDroughtOpacity] = useState(0.7)
  const [droughtMapDate, setDroughtMapDate] = useState<string | null>(null)
  const [droughtLoading, setDroughtLoading] = useState(false)
  const [droughtError, setDroughtError] = useState<string | null>(null)
  const [showWaterRisk, setShowWaterRisk] = useState(false)
  const [waterRiskOpacity, setWaterRiskOpacity] = useState(0.55)
  const [waterRiskIndex, setWaterRiskIndex] = useState<CountyWaterRiskIndex | null>(null)
  const [waterRiskMode, setWaterRiskMode] = useState<'subbasin' | 'state' | null>(null)
  const [waterRiskError, setWaterRiskError] = useState<string | null>(null)
  const [datacenterFilters, setDatacenterFilters] = useState({
    operator: '',
    minSqft: null as number | null,
  })
  const { user } = useAuth()

  const selectedFips = selectedCounty?.fips ?? null
  const { officials, pending, loading: officialsLoading, refresh } =
    useOfficials(selectedFips)

  useEffect(() => {
    loadDataCenters()
      .then((geo) => setFeatures(geo.features))
      .catch((e: unknown) => {
        setGeoError(e instanceof Error ? e.message : 'Failed to load map data')
      })
      .finally(() => setGeoLoading(false))
  }, [])

  useEffect(() => {
    fetch('/data/county-water-risk.json')
      .then((res) => {
        if (!res.ok) throw new Error('County water risk data not found')
        return res.json() as Promise<CountyWaterRiskIndex>
      })
      .then(setWaterRiskIndex)
      .catch(() => {
        setWaterRiskIndex(null)
      })
  }, [])

  const countyByFips = useMemo(() => {
    const map = new Map<string, CountyRecord>()
    for (const c of counties) map.set(c.fips, c)
    return map
  }, [counties])

  const filteredFeatures = useMemo(() => {
    let filtered = features
    if (datacenterFilters.operator.trim()) {
      const operatorLower = datacenterFilters.operator.toLowerCase()
      filtered = filtered.filter(
        (f) =>
          f.properties.operator && f.properties.operator.toLowerCase().includes(operatorLower),
      )
    }
    if (datacenterFilters.minSqft !== null) {
      filtered = filtered.filter((f) => {
        const minSqft = datacenterFilters.minSqft
        return f.properties.sqft !== null && minSqft !== null && f.properties.sqft >= minSqft
      })
    }
    return filtered
  }, [features, datacenterFilters])

  const selectCountyByFips = useCallback(
    (fips: string) => {
      const county = countyByFips.get(fips)
      if (county) setSelectedCounty(county)
    },
    [countyByFips],
  )

  const handleSelectFeature = useCallback(
    (featureInfo: any) => {
      // If feature has FIPS code, use it directly
      if (featureInfo.fips) {
        selectCountyByFips(featureInfo.fips)
        return
      }

      // If feature has state abbreviation, find counties in that state
      if (featureInfo.state_abb) {
        const countyList = counties.filter((c) => c.state_abb === featureInfo.state_abb)
        if (countyList.length > 0) {
          // Sort by facility count descending and pick the one with most data centers
          const sorted = [...countyList].sort((a, b) => b.facility_count - a.facility_count)
          setSelectedCounty(sorted[0])
        }
      }
    },
    [counties, selectCountyByFips],
  )

  const handleContribute = useCallback(() => {
    if (!selectedCounty) return
    if (!user) {
      setShowAuth(true)
      return
    }
    setShowContribute(true)
  }, [selectedCounty, user])

  const dataGeneratedAt = useMemo(() => {
    return counties.length > 0 ? 'IM3 / OpenStreetMap' : ''
  }, [counties.length])

  const selectedWaterRisk = useMemo(() => {
    if (!selectedCounty || !waterRiskIndex) return null
    return waterRiskIndex.counties[selectedCounty.fips] ?? null
  }, [selectedCounty, waterRiskIndex])

  return (
    <div className="app">
      <Header onSignInClick={() => setShowAuth(true)} />

      {(geoError || countiesError) && (
        <div className="banner banner-error" role="alert">
          {geoError || countiesError}
          <p className="muted">
            Ensure <code>public/data/datacenters.geojson</code> and{' '}
            <code>counties-index.json</code> exist. Run <code>npm run copy-data</code>.
          </p>
        </div>
      )}

      <div className="toolbar">
        <CountySearch
          counties={counties}
          selectedFips={selectedFips}
          onSelect={setSelectedCounty}
          loading={countiesLoading}
        />
        <DroughtToggle
          enabled={showDrought}
          onChange={(on) => {
            setShowDrought(on)
            if (on) setDroughtLoading(true)
          }}
          opacity={droughtOpacity}
          onOpacityChange={setDroughtOpacity}
        />
        <WaterRiskToggle
          enabled={showWaterRisk}
          onChange={setShowWaterRisk}
          opacity={waterRiskOpacity}
          onOpacityChange={setWaterRiskOpacity}
        />
        <DatacenterFilters
          onFilterChange={setDatacenterFilters}
          totalFacilities={features.length}
          filteredFacilities={filteredFeatures.length}
        />
      </div>

      {droughtError && showDrought && (
        <div className="banner banner-warn" role="status">
          Drought overlay: {droughtError}
        </div>
      )}
      {waterRiskError && showWaterRisk && (
        <div className="banner banner-warn" role="status">
          Water risk overlay: {waterRiskError}
        </div>
      )}
      {showWaterRisk && !waterRiskIndex && (
        <div className="banner banner-warn" role="status">
          Water risk scores unavailable. Run{' '}
          <code>npm run build:aqueduct</code> to generate county data.
        </div>
      )}

      <main className="main-layout">
        <div className="map-wrap">
          {geoLoading ? (
            <div className="map-loading">Loading data centers…</div>
          ) : (
            <MapView
              features={filteredFeatures}
              selectedCounty={selectedCounty}
              onSelectCountyByFips={selectCountyByFips}
              onHoverRegion={setHoverRegion}
              onSelectFeature={handleSelectFeature}
              showDrought={showDrought}
              droughtOpacity={droughtOpacity}
              onDroughtDateLoaded={(date) => {
                setDroughtMapDate(date)
                setDroughtLoading(false)
              }}
              onDroughtError={(msg) => {
                setDroughtError(msg)
                setDroughtLoading(false)
              }}
              showWaterRisk={showWaterRisk}
              waterRiskOpacity={waterRiskOpacity}
              countyWaterRisk={waterRiskIndex}
              onWaterRiskModeLoaded={setWaterRiskMode}
              onWaterRiskError={setWaterRiskError}
            />
          )}
          {showDrought && !geoLoading && (
            <DroughtLegend mapDate={droughtMapDate} loading={droughtLoading} />
          )}
          {showWaterRisk && waterRiskIndex && !geoLoading && (
            <WaterRiskLegend
              indicatorLabel={waterRiskIndex.indicator_label}
              sourceNote={waterRiskIndex.source_note}
              overlayMode={waterRiskMode}
            />
          )}
        </div>
          <OfficialsPanel
            county={selectedCounty}
            hoverRegion={hoverRegion}
            officials={officials}
            pending={pending}
            loading={officialsLoading}
            onContribute={handleContribute}
            waterRisk={selectedWaterRisk}
          />
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <p className="footer-attribution">
            Data centers:{' '}
            <a href="https://data.msdlive.org/records/p147s-4h760" target="_blank" rel="noreferrer">
              IM3 Open Source Data Center Atlas
            </a>{' '}
            (ODbL) · map © OpenStreetMap · © CARTO · drought ©{' '}
            <a href="https://droughtmonitor.unl.edu/" target="_blank" rel="noreferrer">
              U.S. Drought Monitor
            </a>
            . Water risk:{' '}
            <a href="https://www.wri.org/aqueduct" target="_blank" rel="noreferrer">
              WRI Aqueduct 4.0
            </a>{' '}
            (CC BY 4.0). Officials: community-contributed.
          </p>
          {dataGeneratedAt && (
            <p className="footer-stat muted">
              {features.length.toLocaleString()} facilities mapped
            </p>
          )}
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showContribute && selectedCounty && (
        <ContributeForm
          county={selectedCounty}
          onClose={() => setShowContribute(false)}
          onSuccess={() => void refresh()}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
