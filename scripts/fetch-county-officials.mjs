import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const API_KEY = process.env.VITE_GOOGLE_CIVICINFO_API_KEY
const API_BASE = 'https://www.googleapis.com/civicinfo/v2'

if (!API_KEY) {
  console.error(
    '❌ Error: VITE_GOOGLE_CIVICINFO_API_KEY not set in .env file',
  )
  process.exit(1)
}

// Load counties data
const countyPath = path.join(__dirname, '../public/data/counties-index.json')
const countyData = JSON.parse(fs.readFileSync(countyPath, 'utf-8'))
const counties = countyData.counties

console.log(`📍 Fetching officials for ${counties.length} counties...`)

const officialsCache = {}
let successCount = 0
let errorCount = 0

// Helper to construct a representative address from county data
// Return candidate address strings for the county to try against the API
function getCountyAddressCandidates(county) {
  const name = county.county
  const state = county.state
  const stateAbb = county.state_abb || ''

  const candidates = []

  // If county string already contains a type, prefer it
  if (/county|parish|borough|city/i.test(name)) {
    candidates.push(`${name}, ${stateAbb}`)
    candidates.push(`${name}, ${state}`)
  } else {
    candidates.push(`${name} County, ${stateAbb}`)
    candidates.push(`${name} County, ${state}`)
    candidates.push(`${name}, ${stateAbb}`)
    candidates.push(`${name}, ${state}`)
  }

  return candidates
}

async function fetchOfficials(county) {
  const candidates = getCountyAddressCandidates(county)
  let data = null
  let lastError = null

  for (const address of candidates) {
    try {
      const url = new URL(`${API_BASE}/representatives`)
      url.searchParams.append('address', address)
      url.searchParams.append('key', API_KEY)

      const res = await fetch(url.toString())

      if (res.status === 429) {
        // Too many requests — wait and retry with backoff
        await new Promise((r) => setTimeout(r, 500))
        lastError = new Error(`HTTP 429: Too Many Requests`)
        continue
      }

      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}: ${res.statusText}`)
        continue
      }

      data = await res.json()
      // success
      lastError = null
      break
    } catch (err) {
      lastError = err
    }
  }

  if (!data) {
    errorCount++
    console.error(
      `\n⚠️  Error fetching ${county.county}, ${county.state}: ${lastError?.message || 'No data returned'}`,
    )
    return
  }

    // Extract officials info
    const officials = (data.officials || []).map((official) => ({
      name: official.name,
      title: official.title,
      party: official.party || null,
      emails: official.emails || [],
      phones: official.phones || [],
      urls: official.urls || [],
      photoUrl: official.photoUrl || null,
      channels: official.channels || [],
    }))

    // Group by division offices to organize by level
    const officesByLevel = {}
    if (data.offices) {
      for (const office of data.offices) {
        const level = office.levels?.[0] || 'other'
        if (!officesByLevel[level]) {
          officesByLevel[level] = []
        }
        for (const officialIndex of office.officialIndices || []) {
          officesByLevel[level].push({
            ...officials[officialIndex],
            office: office.name,
            level,
          })
        }
      }
    }

    officialsCache[county.fips] = {
      county: county.county,
      state: county.state,
      state_abb: county.state_abb,
      fips: county.fips,
      officials,
      officesByLevel,
      fetchedAt: new Date().toISOString(),
    }

    successCount++
    process.stdout.write(`\r✓ ${successCount}/${counties.length}`)

  // Rate limiting: 100ms between requests
  await new Promise((resolve) => setTimeout(resolve, 100))
}

async function main() {
  // Fetch in batches
  const batchSize = 5
  for (let i = 0; i < counties.length; i += batchSize) {
    const batch = counties.slice(i, i + batchSize)
    await Promise.all(batch.map(fetchOfficials))
  }

  console.log(`\n\n📊 Results:`)
  console.log(`  ✓ Successful: ${successCount}`)
  console.log(`  ⚠️  Errors: ${errorCount}`)
  console.log(`  📦 Total cached: ${Object.keys(officialsCache).length}`)

  // Save to file
  const outputPath = path.join(__dirname, '../public/data/county-officials.json')
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        officials_count: Object.keys(officialsCache).length,
        officials: officialsCache,
      },
      null,
      2,
    ),
  )

  console.log(`\n✅ Wrote ${outputPath}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
