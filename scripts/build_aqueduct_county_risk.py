#!/usr/bin/env python3
"""
Build Aqueduct water risk files for the map app.

Outputs:
  - public/data/county-water-risk.json  (per county FIPS)
  - public/data/aqueduct-us-risk.geojson (optional sub-basin overlay, US bbox)

Data sources (pick one):
  1. Aqueduct 4.0 baseline annual GeoPackage (recommended for county-accurate scores)
     Download from https://www.wri.org/data/aqueduct-global-maps-40-data
     Place at: data/raw/aqueduct_baseline_annual.gpkg

  2. State-level proxy (default): data/raw/aqueduct_us_state_baseline.json
     Maps each county to its state's overall water risk category.

Indicator: w_awr_def_tot (default overall water risk) — matches the Water Risk Atlas URL.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
PUBLIC_DATA = ROOT / "public" / "data"
COUNTIES_PATH = ROOT / "data" / "counties-index.json"
STATE_PROXY_PATH = RAW_DIR / "aqueduct_us_state_baseline.json"
GPKG_PATH = RAW_DIR / "aqueduct_baseline_annual.gpkg"
FILEGDB_PATH = RAW_DIR / "Aq40_Y2023D07M05.gdb"

INDICATOR = "w_awr_def_tot"
CAT_FIELD = "w_awr_def_tot_cat"
SCORE_FIELD = "w_awr_def_tot_score"
LABEL_FIELD = "w_awr_def_tot_label"

US_BBOX = (-125.0, 24.0, -66.0, 50.0)


def load_counties() -> list[dict]:
    with open(COUNTIES_PATH, encoding="utf-8") as f:
        data = json.load(f)
    return data["counties"]


def build_from_state_proxy(counties: list[dict]) -> dict:
    with open(STATE_PROXY_PATH, encoding="utf-8") as f:
        proxy = json.load(f)

    states = proxy["states"]
    out: dict[str, dict] = {}
    for c in counties:
        abb = c["state_abb"]
        st = states.get(abb)
        if not st:
            out[c["fips"]] = {
                "fips": c["fips"],
                "cat": -1,
                "score": None,
                "label": "No data",
                "source": "state",
            }
            continue
        out[c["fips"]] = {
            "fips": c["fips"],
            "cat": st["cat"],
            "score": st["score"],
            "label": st["label"],
            "source": "state",
        }
    return out


def build_from_gpkg(counties: list[dict], data_path: Path) -> tuple[dict, object | None]:
    try:
        import geopandas as gpd
    except ImportError as e:
        raise SystemExit("geopandas required for GPKG processing. pip install geopandas") from e

    gdf = gpd.read_file(data_path)
    if gdf.crs and gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(4326)

    # US filter
    gdf = gdf[gdf["gid_0"] == "USA"].copy()
    minx, miny, maxx, maxy = US_BBOX
    gdf = gdf.cx[minx:maxx, miny:maxy]

    for col in (CAT_FIELD, SCORE_FIELD, LABEL_FIELD):
        if col not in gdf.columns:
            raise SystemExit(f"Column {col} not found in {data_path}. Check Aqueduct 4.0 baseline annual layer.")

    county_gdf = gpd.GeoDataFrame(
        counties,
        geometry=gpd.points_from_xy(
            [c["centroid_lon"] for c in counties],
            [c["centroid_lat"] for c in counties],
        ),
        crs="EPSG:4326",
    )

    joined = gpd.sjoin(county_gdf, gdf, how="left", predicate="within")
    out: dict[str, dict] = {}
    for _, row in joined.iterrows():
        fips = row["fips"]
        if fips in out:
            continue
        cat = row.get(CAT_FIELD)
        if cat is None or (isinstance(cat, float) and str(cat) == "nan"):
            out[fips] = {
                "fips": fips,
                "cat": -1,
                "score": None,
                "label": "No data",
                "source": "subbasin",
            }
        else:
            cat_int = int(cat)
            score = row.get(SCORE_FIELD)
            label = row.get(LABEL_FIELD) or ""
            out[fips] = {
                "fips": fips,
                "cat": cat_int,
                "score": float(score) if score == score else None,
                "label": str(label),
                "source": "subbasin",
            }

    # Simplify for map overlay
    simp = gdf.copy()
    simp["geometry"] = simp.geometry.simplify(0.05, preserve_topology=False)
    features = []
    for _, row in simp.iterrows():
        cat = row.get(CAT_FIELD)
        if cat is None or (isinstance(cat, float) and str(cat) == "nan"):
            continue
        geom = row.geometry.__geo_interface__
        features.append(
            {
                "type": "Feature",
                "properties": {
                    "cat": int(cat),
                    "score": float(row[SCORE_FIELD]) if row[SCORE_FIELD] == row[SCORE_FIELD] else None,
                    "label": str(row.get(LABEL_FIELD) or ""),
                },
                "geometry": geom,
            }
        )
    geojson = {"type": "FeatureCollection", "features": features}
    return out, geojson


def main() -> None:
    PUBLIC_DATA.mkdir(parents=True, exist_ok=True)
    counties = load_counties()
    source_note = ""
    geojson = None

    if FILEGDB_PATH.exists():
        print(f"Using sub-basin FileGDB: {FILEGDB_PATH}")
        county_map, geojson = build_from_gpkg(counties, FILEGDB_PATH)
        source_note = (
            "County scores from Aqueduct 4.0 baseline annual sub-basins (point-in-polygon). "
            "Download: https://www.wri.org/data/aqueduct-global-maps-40-data"
        )
    elif GPKG_PATH.exists():
        print(f"Using sub-basin GPKG: {GPKG_PATH}")
        county_map, geojson = build_from_gpkg(counties, GPKG_PATH)
        source_note = (
            "County scores from Aqueduct 4.0 baseline annual sub-basins (point-in-polygon). "
            "Download: https://www.wri.org/data/aqueduct-global-maps-40-data"
        )
    else:
        print(f"GeoPackage/FileGDB not found; using state-level proxy.")
        county_map = build_from_state_proxy(counties)
        source_note = (
            "County scores use state-level Aqueduct baseline proxy. "
            "For sub-basin accuracy, add data/raw/aqueduct_baseline_annual.gpkg or data/raw/Aq40_Y2023D07M05.gdb and re-run."
        )

    with open(STATE_PROXY_PATH, encoding="utf-8") as f:
        meta = json.load(f)

    index = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "indicator": INDICATOR,
        "indicator_label": meta.get("indicator_label", "Overall water risk (default)"),
        "source_note": source_note,
        "counties": county_map,
    }

    out_path = PUBLIC_DATA / "county-water-risk.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2)
    print(f"Wrote {out_path} ({len(county_map)} counties)")

    if geojson is not None:
        geo_path = PUBLIC_DATA / "aqueduct-us-risk.geojson"
        with open(geo_path, "w", encoding="utf-8") as f:
            json.dump(geojson, f)
        print(f"Wrote {geo_path} ({len(geojson['features'])} features)")


if __name__ == "__main__":
    main()
