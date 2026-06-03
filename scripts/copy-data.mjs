import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'data')
const destDir = join(root, 'public', 'data')

/** Pandas/IM3 exports use NaN which is not valid JSON — normalize for browsers. */
function sanitizeGeoJsonText(text) {
  return text
    .replace(/:\s*NaN\b/g, ': null')
    .replace(/:\s*-Infinity\b/g, ': null')
    .replace(/:\s*Infinity\b/g, ': null')
}

mkdirSync(destDir, { recursive: true })

const geoSrc = join(srcDir, 'datacenters.geojson')
const geoDest = join(destDir, 'datacenters.geojson')
if (existsSync(geoSrc)) {
  const raw = readFileSync(geoSrc, 'utf8')
  const sanitized = sanitizeGeoJsonText(raw)
  writeFileSync(geoDest, sanitized, 'utf8')
  // Validate
  JSON.parse(sanitized)
  const fixes = (raw.match(/:\s*NaN\b/g) ?? []).length
  console.log(
    `Wrote datacenters.geojson -> public/data/ (${fixes} NaN values -> null)`,
  )
} else {
  console.warn('Skip datacenters.geojson: not found at', geoSrc)
}

const countiesSrc = join(srcDir, 'counties-index.json')
const countiesDest = join(destDir, 'counties-index.json')
if (existsSync(countiesSrc)) {
  copyFileSync(countiesSrc, countiesDest)
  console.log('Copied counties-index.json -> public/data/')
} else {
  console.warn('Skip counties-index.json: not found at', countiesSrc)
}

const statesSrc = join(srcDir, 'us-states.geojson')
const statesDest = join(destDir, 'us-states.geojson')
if (existsSync(statesSrc)) {
  copyFileSync(statesSrc, statesDest)
  console.log('Copied us-states.geojson -> public/data/')
} else {
  console.warn('Skip us-states.geojson: not found at', statesSrc)
}
