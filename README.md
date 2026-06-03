# Data Center & County Officials Map

Interactive US map of data center locations (IM3 / OpenStreetMap) with county elected officials. Officials start as **test seed data** for a few counties; signed-in users can **contribute** new records for moderation.

Built with **Vite**, **React**, **TypeScript**, **Leaflet**, and optional **Supabase** auth/database.

## Quick start (localhost)

```bash
cd C:\Users\jensc\Projects\datacenter-officials-map
npm install
npm run dev
```

Open **http://localhost:5173**

`npm run dev` runs `copy-data` first, copying `data/*.json` and `data/*.geojson` into `public/data/`.

## Data

| File | Source |
|------|--------|
| `data/datacenters.geojson` | [IM3 Open Source Data Center Atlas](https://data.msdlive.org/records/p147s-4h760) (ODbL) |
| `data/counties-index.json` | Derived from IM3 + Census FIPS |
| `src/data/mockOfficials.ts` | Test officials for 5 high-facility counties |

Refresh map data manually by updating files under `data/` and running `npm run copy-data`.

## Water risk (WRI Aqueduct)

The [Aqueduct Water Risk Atlas](https://www.wri.org/applications/aqueduct/water-risk-atlas/) web app does not expose a stable public API for live scraping. This project uses **Aqueduct 4.0** baseline data ([download page](https://www.wri.org/data/aqueduct-global-maps-40-data), CC BY 4.0), aligned with the atlas indicator **Overall water risk** (`w_awr_def_tot_cat`).

| File | Description |
|------|-------------|
| `data/raw/aqueduct_us_state_baseline.json` | US state-level proxy scores (included) |
| `data/us-states.geojson` | Local US state boundary GeoJSON for the water risk overlay |
| `public/data/county-water-risk.json` | Per-county scores (built from state proxy) |
| `public/data/aqueduct-us-risk.geojson` | Optional sub-basin polygons (from GeoPackage) |

```bash
npm run fetch:states      # download local US state boundaries for the overlay
npm run copy-data         # copy data/* files into public/data
npm run build:aqueduct    # writes public/data/county-water-risk.json
```

For **sub-basin** county scores and map polygons:

1. Download the Aqueduct 4.0 **baseline annual** GeoPackage from WRI and save as `data/raw/aqueduct_baseline_annual.gpkg`.
2. Install Python deps (`geopandas`, `shapely`) and run `python scripts/build_aqueduct_county_risk.py`.

For the water risk overlay state boundaries, run `npm run fetch:states` once to fetch `data/us-states.geojson`, then run `npm run copy-data`.

Toggle **Water risk (Aqueduct)** on the map toolbar; county scores appear in the officials panel when you select a county.

## Contributing officials (local demo)

1. Click **Sign in to contribute** → **Continue as demo contributor** (when Supabase is off).
2. Select a county (e.g. Loudoun County, VA).
3. Use **Suggest another official** and submit; entries stay **pending** in localStorage until you add moderation/DB.

## Supabase (when you add a database)

1. Create a project at [supabase.com](https://supabase.com).
2. Run SQL from [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql).
3. Copy `.env.example` → `.env` and set:

   ```
   VITE_USE_SUPABASE=true
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

4. Restart `npm run dev`. Auth and contributions use Postgres + RLS.

Approved officials are readable by everyone; new submissions are `pending` until a moderator approves (set `profiles.role = 'moderator'` in SQL for your account).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run copy-data` | Sync `data/` → `public/data/` |
| `npm run build:aqueduct` | Build `county-water-risk.json` from state proxy |

## Attribution

- Data centers: IM3 Open Source Data Center Atlas / OpenStreetMap ([ODbL](http://opendatacommons.org/licenses/odbl/1.0/)).
- Drought: [U.S. Drought Monitor](https://droughtmonitor.unl.edu/) (NDMC).
- Water risk: [WRI Aqueduct 4.0](https://www.wri.org/aqueduct) (CC BY 4.0).
- Officials: community-contributed and test seed data — verify before use.

## Deploy (optional)

Static hosting (GitHub Pages, Netlify, Vercel): build with `npm run build` and serve the `dist/` folder. Ensure `public/data` is included (via `copy-data` before build).
