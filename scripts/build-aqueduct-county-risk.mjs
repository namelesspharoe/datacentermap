import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = dirname(fileURLToPath(import.meta.url))
const counties = JSON.parse(
  readFileSync(join(root, '..', 'data', 'counties-index.json'), 'utf8'),
)
const proxy = JSON.parse(
  readFileSync(join(root, '..', 'data', 'raw', 'aqueduct_us_state_baseline.json'), 'utf8'),
)

const countyMap = {}
for (const c of counties.counties) {
  const st = proxy.states[c.state_abb]
  countyMap[c.fips] = st
    ? { fips: c.fips, cat: st.cat, score: st.score, label: st.label, source: 'state' }
    : { fips: c.fips, cat: -1, score: null, label: 'No data', source: 'state' }
}

const outDir = join(root, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
const index = {
  generated_at: new Date().toISOString(),
  indicator: proxy.indicator,
  indicator_label: proxy.indicator_label,
  source_note:
    'County scores use state-level Aqueduct baseline proxy. Add data/raw/aqueduct_baseline_annual.gpkg and run scripts/build_aqueduct_county_risk.py for sub-basin accuracy.',
  counties: countyMap,
  states: proxy.states,
}
writeFileSync(join(outDir, 'county-water-risk.json'), JSON.stringify(index, null, 2))
console.log(`Wrote county-water-risk.json (${Object.keys(countyMap).length} counties)`)
