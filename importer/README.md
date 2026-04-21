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
   | `disaster_types` | Select (multi) | yes   | no     |
   | `accessible`     | Boolean     | yes      | no     |
   | `accepts_pets`   | Boolean     | yes      | no     |
   | `notes`          | TextArea    | no       | no     |
   | `photo`          | Asset       | no       | no     |
   | `source_id`      | Text        | yes      | **yes** |
   | `verified_at`    | Date        | yes      | no     |

   Configure `disaster_types` as a **Select** field with **multiple
   values enabled** and these 8 allowed values: `earthquake`, `flood`,
   `tsunami`, `fire`, `landslide`, `storm_surge`, `typhoon`, `heatwave`.

2. **Public API enabled** on the project (so the PWA can read). Project
   settings → API → toggle on, set `evacuation_site` publicly readable.

3. **Integration token** with write scope on this project. Workspace →
   My Integrations → create → grant to project → copy token.

## Other CMS models used by the PWA

The PWA reads four more models beyond `evacuation_site`. They're **not**
populated by this importer — you author them directly in the CMS UI
(they're editorial content, not pulled from a third-party source). The
PWA's sync code treats a missing model as empty, so it's safe to create
them incrementally.

All five models need to be **publicly readable** once created.

### `guide_article` — survival-guide articles

| Field key       | Type          | Required | Unique | Notes |
|-----------------|---------------|----------|--------|-------|
| `title`         | Text          | yes      | no     | |
| `title_en`      | Text          | no       | no     | |
| `disaster_type` | Select        | yes      | no     | single value; same 8 options as above |
| `phase`         | Select        | yes      | no     | single value; options: `before`, `during`, `after` |
| `priority`      | Integer       | yes      | no     | higher = shown first |
| `body`          | Markdown      | yes      | no     | rendered via react-markdown |
| `body_en`       | Markdown      | no       | no     | |
| `summary`       | TextArea      | no       | no     | 1-2 line preview in the list |
| `is_critical`   | Boolean       | yes      | no     | red dot in the list, sorted first |
| `icon_key`      | Text          | no       | no     | unused in v1; leave blank |

### `checklist_item` — prep-checklist items

| Field key         | Type     | Required | Unique | Notes |
|-------------------|----------|----------|--------|-------|
| `label`           | Text     | yes      | no     | |
| `label_en`        | Text     | no       | no     | |
| `category`        | Select   | yes      | no     | single value; options: `water_food`, `medical`, `tools`, `documents`, `plan`, `communication` |
| `priority`        | Integer  | yes      | no     | higher = appears higher within its category |
| `detail`          | TextArea | no       | no     | not shown in v1 UI but read by the sync for future detail view |
| `detail_en`       | TextArea | no       | no     | |
| `quantity_hint`   | Text     | no       | no     | e.g. "3日分" / "3 days" |
| `coastal_only`    | Boolean  | yes      | no     | v1 shows all items regardless; reserved for later regional filtering |
| `cold_region_only`| Boolean  | yes      | no     | same |
| `image`           | Asset    | no       | no     | unused in v1 |

### `emergency_contact` — municipal / CMS-managed contacts

| Field key         | Type     | Required | Unique | Notes |
|-------------------|----------|----------|--------|-------|
| `label`           | Text     | yes      | no     | e.g. 「新宿区防災課」 |
| `label_en`        | Text     | no       | no     | |
| `number`          | Text     | yes      | no     | e.g. `03-5273-4467`; stored as text because of `#7119`-style non-numeric dials |
| `type`            | Select   | yes      | no     | single value; options: `police`, `fire`, `ambulance`, `disaster_line`, `river`, `welfare`, `hospital`, `city_hall` |
| `scope`           | Select   | yes      | no     | single value; options: `national`, `city`. PWA's SOS screen shows `city`-scope items in the "City contacts" section; hard-coded nationals (110/119/#7119/171) are not stored in the CMS. |
| `available_hours` | Text     | no       | no     | e.g. `24時間` / `Weekdays 9:00-17:00` |
| `url`             | URL      | no       | no     | optional web link |
| `priority`        | Integer  | yes      | no     | sort order within the scope |
| `notes`           | TextArea | no       | no     | |

### `area_annotation` — municipal notes / warnings on the map

| Field key             | Type           | Required | Unique | Notes |
|-----------------------|----------------|----------|--------|-------|
| `title`               | Text           | yes      | no     | |
| `body`                | TextArea       | yes      | no     | |
| `location`            | GeoObject      | yes      | no     | Point |
| `zone`                | GeoObject      | no       | no     | optional Polygon describing the affected area |
| `annotation_type`     | Select         | yes      | no     | single value; options: `warning`, `tip`, `facility_note`, `route_note`, `historical` |
| `disaster_relevance`  | Select (multi) | yes      | no     | same 8 options as `disaster_types` on `evacuation_site` |
| `severity`            | Select         | yes      | no     | single value; options: `info`, `caution`, `danger` |
| `source`              | Text           | no       | no     | attribution |
| `valid_until`         | Date           | no       | no     | optional expiry |

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
| `CMS_API_URL`            | yes†     | —                                        |
| `CMS_WORKSPACE`          | yes†     | —                                        |
| `CMS_PROJECT`            | yes†     | —                                        |
| `CMS_EVAC_MODEL_KEY`     | yes†     | —                                        |
| `CMS_INTEGRATION_TOKEN`  | yes†     | —                                        |
| `IMPORT_BBOX`            | no       | `139.58,35.50,139.92,35.83` (Tokyo)      |
| `OVERPASS_ENDPOINT`      | no       | `https://overpass-api.de/api/interpreter` |

† Skipped when running with `--dry-run`.

**Important:** `CMS_API_URL` points at the integration-API host
(`https://api.cms.test.reearth.dev` for the test env), **not** the UI
host the PWA reads from (`https://cms.test.reearth.dev`). They are
separate deployments.

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
- **HTML response / "invalid character '<'"** — `CMS_API_URL` is
  pointing at the UI host instead of the integration-API host. Use the
  `api.` subdomain (e.g. `https://api.cms.test.reearth.dev`).
- **404 on writes** — `CMS_WORKSPACE`, `CMS_PROJECT`, or
  `CMS_EVAC_MODEL_KEY` doesn't match your CMS. Verify each by opening
  the model in the CMS UI and checking the URL.
- **400 on writes with "type mismatch"** — the `type` string in the
  payload doesn't match what your CMS model expects. Edit the constants
  at the top of `transform.go` (`typeText`, `typeGeometryObject`,
  `typeSelect`, `typeBool`, etc.) and re-run.
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
