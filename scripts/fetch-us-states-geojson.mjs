import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = dirname(fileURLToPath(import.meta.url))
const outPath = join(root, '..', 'data', 'us-states.geojson')
const url = 'https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_040_00_500k.json'

mkdirSync(join(root, '..', 'data'), { recursive: true })

console.log(`Downloading US state boundaries from ${url}`)
const res = await fetch(url)
if (!res.ok) {
  throw new Error(`Failed to download state boundaries: ${res.status} ${res.statusText}`)
}

const text = await res.text()
writeFileSync(outPath, text, 'utf8')
console.log(`Wrote ${outPath}`)
console.log('Run npm run copy-data to publish the state boundaries into public/data/')
