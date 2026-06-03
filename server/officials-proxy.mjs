import 'dotenv/config'
import express from 'express'
import fs from 'fs'
import path from 'path'

const app = express()
const port = process.env.PORT || 3000

const API_KEY = process.env.GOOGLE_CIVICINFO_API_KEY || process.env.VITE_GOOGLE_CIVICINFO_API_KEY
const API_BASE = 'https://www.googleapis.com/civicinfo/v2'

if (!API_KEY) {
  console.error('ERROR: GOOGLE_CIVICINFO_API_KEY not set in environment')
  process.exit(1)
}

const countyIndexPath = path.join(process.cwd(), 'public', 'data', 'counties-index.json')
let counties = []
try {
  const raw = fs.readFileSync(countyIndexPath, 'utf8')
  const parsed = JSON.parse(raw)
  counties = parsed.counties || []
} catch (err) {
  console.warn('Warning: Could not load counties-index.json, address matching may be less accurate')
}

function getCountyByFips(fips) {
  return counties.find((c) => c.fips === fips) || null
}

function getCountyAddressCandidates(county) {
  if (!county) return []
  const name = county.county
  const state = county.state
  const stateAbb = county.state_abb || ''

  const candidates = []
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

async function fetchWithBackoff(url, retries = 3) {
  let wait = 300
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url)
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, wait))
      wait *= 2
      continue
    }
    return res
  }
  // final attempt
  return fetch(url)
}

app.get('/api/officials', async (req, res) => {
  const { fips } = req.query
  if (!fips) return res.status(400).json({ error: 'Missing fips' })

  const county = getCountyByFips(String(fips))
  const candidates = getCountyAddressCandidates(county)
  let lastError = null
  let data = null

  for (const address of candidates) {
    try {
      const url = new URL(`${API_BASE}/representatives`)
      url.searchParams.append('address', address)
      url.searchParams.append('key', API_KEY)

      const r = await fetchWithBackoff(url.toString(), 4)
      if (!r.ok) {
        lastError = `HTTP ${r.status} ${r.statusText}`
        continue
      }
      data = await r.json()
      break
    } catch (err) {
      lastError = err.message || String(err)
    }
  }

  if (!data) {
    return res.status(502).json({ error: 'No data', detail: lastError })
  }

  // Simplify response to just officials and offices
  const officials = (data.officials || []).map((o) => ({
    name: o.name,
    party: o.party || null,
    phones: o.phones || [],
    emails: o.emails || [],
    urls: o.urls || [],
    photoUrl: o.photoUrl || null,
  }))

  return res.json({ officials, offices: data.offices || [], fetchedAt: new Date().toISOString() })
})

app.listen(port, () => {
  console.log(`Officials proxy listening at http://localhost:${port}`)
})
