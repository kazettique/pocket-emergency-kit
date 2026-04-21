# Evacuation-site importer

One-shot Go script that fetches shelter data from the **Overpass API**
(OpenStreetMap: `emergency=assembly_point` and `amenity=shelter` nodes & ways
inside a Tokyo bbox) and writes each result as a Re:Earth CMS
`evacuation_site` item via the integration API.

Dedup is keyed on `source_id` (e.g. `osm:node/12345`) so re-runs are
idempotent, and when a different data source lands later (MLIT XKT007 once
the API key arrives) a second pass with a different `source_id` prefix
will merge without duplicates.

## Prerequisites (CMS side)

1. **`evacuation_site` model exists** with exactly these fields:

   | Field key        | Type        | Required | Unique |
   |------------------|-------------|----------|--------|
   | `name`           | Text        | yes      | no     |
   | `name_en`        | Text        | no       | no     |
   | `location`       | GeoObject   | yes      | no     |
   | `address`        | Text        | no       | no     |
   | `capacity`       | Integer     | yes      | no     |
   | `disaster_types` | Tag (multi) | yes      | no     |
   | `accessible`     | Boolean     | yes      | no     |
   | `accepts_pets`   | Boolean     | yes      | no     |
   | `notes`          | TextArea    | no       | no     |
   | `photo`          | Asset       | no       | no     |
   | `source_id`      | Text        | yes      | **yes** |
   | `verified_at`    | Date        | yes      | no     |

   Allowed tag values for `disaster_types`: `earthquake`, `flood`,
   `tsunami`, `fire`, `landslide`, `storm_surge`, `typhoon`, `heatwave`.

2. **Public API enabled** on the project (so the PWA can read). Project
   settings → API → toggle on, set `evacuation_site` publicly readable.

3. **Integration token** with write scope on this project. Workspace →
   My Integrations → create → grant to project → copy token.

## Usage

```sh
cd importer
cp .env.example .env
# edit .env: paste CMS_INTEGRATION_TOKEN, adjust other values if needed

# Preview first 3 payloads without writing (no CMS token required here)
go run . --dry-run --limit 3

# Full import
go run .

# Capped import for smoke-testing
go run . --limit 5
```

Expected full-run behaviour: Overpass returns ~400-500 shelter features
for the Tokyo 23-wards bbox, rate-limited writes take ~1-2 minutes, and
the PWA's Map tab shows markers after the next sync pass (you can force
a sync by reloading the PWA while online, or wait for the 6-hour stale
threshold).

## Environment variables

| Name                     | Required | Default                                  |
|--------------------------|----------|------------------------------------------|
| `CMS_BASE_URL`           | yes†     | —                                        |
| `CMS_WORKSPACE`          | yes†     | —                                        |
| `CMS_PROJECT`            | yes†     | —                                        |
| `CMS_EVAC_MODEL_KEY`     | yes†     | —                                        |
| `CMS_INTEGRATION_TOKEN`  | yes†     | —                                        |
| `IMPORT_BBOX`            | no       | `139.58,35.50,139.92,35.83` (Tokyo)      |
| `OVERPASS_ENDPOINT`      | no       | `https://overpass-api.de/api/interpreter` |

† Skipped when running with `--dry-run`.

`IMPORT_BBOX` is `minLng,minLat,maxLng,maxLat`.

The importer does not auto-load `.env`; either export vars first or use
something like [`dotenv`](https://github.com/motdotla/dotenv):

```sh
set -a; source .env; set +a
go run .
```

## Troubleshooting

- **401 on writes** — integration token missing write scope, or wrong
  project granted. Regenerate / grant in CMS UI.
- **404 on writes** — `CMS_WORKSPACE`, `CMS_PROJECT`, or
  `CMS_EVAC_MODEL_KEY` doesn't match your CMS. Verify each by opening
  the model in the CMS UI and checking the URL.
- **400 on writes with "type mismatch"** — the `type` string in the
  payload doesn't match what your CMS model expects. Edit the constants
  at the top of `transform.go` (`typeText`, `typeGeometryObject`,
  `typeTag`, `typeBool`, etc.) and re-run.
- **429 from Overpass** — the public endpoint throttles. Either wait
  a few minutes or set `OVERPASS_ENDPOINT` to a mirror (e.g.
  `https://overpass.kumi.systems/api/interpreter`).
- **Empty result from Overpass** — double-check `IMPORT_BBOX` (lng/lat
  order, not lat/lng).

## Extending

When an MLIT API key arrives, adding a second source is straightforward:

1. New file `mlit.go` mirroring `overpass.go` signature.
2. `transform.go` gains a `mlitFeatureToFields` that emits
   `source_id = "mlit:XKT007/<feature-id>"`.
3. `main.go` gains `--source=overpass|mlit` flag.

The `source_id` dedup keeps both passes idempotent against each other.
