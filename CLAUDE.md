# 災害防止 PWA — CLAUDE.md

Offline-first disaster prevention PWA for Tokyo residents. Single-city POC.
React + TypeScript + Vite. Reads content from Re:Earth CMS; enriches with Japan gov APIs.

## Quick commands

```
npm run dev      # dev server (PWA enabled in dev mode)
npm run build    # production build
npm run preview  # preview built PWA locally
```

## Stack

- **Frontend**: React 18 + TypeScript + Vite 8
- **Map**: MapLibre GL JS (GSI tiles, no API key)
- **Offline**: IndexedDB via `idb` package + Workbox service worker via `vite-plugin-pwa`
- **CMS**: Re:Earth CMS public REST API (no auth, read-only)
- **Gov APIs**: JMA (no key), J-SHIS (no key), MLIT reinfolib (key in .env), MLIT river (mock for POC)

## Project layout

```
src/
  types/index.ts          ← All TypeScript types (CMS models + gov API responses)
  db/idb.ts               ← IndexedDB schema + CRUD helpers (idb package)
  cms/sync.ts             ← Fetches 5 CMS models → IDB (paginated, stale-check)
  gov/api.ts              ← JMA, J-SHIS, MLIT hazard zone, river level fetchers
  hooks/
    useSyncEngine.ts      ← Orchestrates CMS sync + gov refresh on app open
  screens/
    Home.tsx              ← Alert dashboard (JMA + river levels + last sync)
    Map.tsx               ← MapLibre GL + GSI tiles + hazard layers + evac sites
    Checklist.tsx         ← Prep checklist (state in IDB, content from CMS)
    Guide.tsx             ← Survival guide articles (from CMS, fully offline)
    Contacts.tsx          ← Emergency contacts (hardcoded nationals + CMS city contacts)
  components/
    OfflineBanner.tsx     ← Shown when navigator.onLine = false
    HazardScore.tsx       ← Risk bar component (flood/seismic/etc.)
    EvacSiteCard.tsx      ← Evacuation site card with distance + disaster types
    SyncStatus.tsx        ← Last-synced timestamp + spinner
  App.tsx                 ← Tab navigation shell
  main.tsx
importer/
  main.go                 ← One-time Go script: MLIT XKT007 → Re:Earth CMS items
```

## CMS models (Re:Earth CMS public API)

Base: `VITE_CMS_BASE_URL/api/p/VITE_CMS_WORKSPACE/VITE_CMS_PROJECT/{model}`

| Model key         | ~Items  | Key fields                                                                         |
| ----------------- | ------- | ---------------------------------------------------------------------------------- |
| evacuation_site   | 150–300 | location (Point), capacity, disaster_types[], accessible, accepts_pets             |
| guide_article     | 60–80   | disaster_type, phase (before/during/after), priority, body (Markdown), is_critical |
| checklist_item    | 40–50   | category, priority, label, detail, coastal_only                                    |
| emergency_contact | 15–20   | type, scope (national/city), number, available_hours                               |
| area_annotation   | 10–30   | location (Point), zone (Polygon?), annotation_type, severity                       |

## Gov APIs

| API                 | URL                                                                                         | Auth                               |
| ------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| JMA forecast        | `jma.go.jp/bosai/forecast/data/forecast/{areaCode}.json`                                    | none                               |
| JMA warnings        | `jma.go.jp/bosai/warning/data/warning/{areaCode}.json`                                      | none                               |
| J-SHIS seismic      | `j-shis.bosai.go.jp/map/api/pshm/Y2020/T30/ps/meshinfo.json?position={lng},{lat}&epsg=4326` | none                               |
| GSI tiles           | `cyberjapan.jp/xyz/std/{z}/{x}/{y}.png`                                                     | none                               |
| MLIT hazard (flood) | `reinfolib.mlit.go.jp/ex-api/external/XKT011?response_format=geojson&z={z}&x={x}&y={y}`     | `Ocp-Apim-Subscription-Key` header |
| MLIT landslide      | same but `XKT012`                                                                           | same                               |
| MLIT tsunami        | same but `XKT016`                                                                           | same                               |
| MLIT evac sites     | same but `XKT007`                                                                           | same (used by Go importer only)    |
| River levels        | mock in `gov/api.ts` for POC                                                                | —                                  |

## Offline rules

- ALL content shown to user when offline MUST come from IDB
- Never show a loading spinner for data that should be in IDB — show stale badge instead
- Stale threshold: 6 hours per model (`db/idb.ts` → `STALE_THRESHOLD_MS`)
- Home screen always shows last-sync timestamp for any data
- Tile cache: GSI tiles at z=12–15 cached by Workbox (CacheFirst, 30 day TTL)

## Coordinate conventions

- GeoJSON and MapLibre GL both use `[lng, lat]` order
- J-SHIS API takes `position={lng},{lat}` — same order
- Re:Earth CMS geometry field: `{ type: "Point", coordinates: [lng, lat] }`
- NEVER pass `[lat, lng]` to MapLibre or GeoJSON

## Design system

- Colour palette: dark navy base (`#1a1a2e`), emergency red (`#e63946`), safe green (`#2d6a4f`), alert amber (`#e9c46a`)
- Font: `Noto Sans JP` for Japanese text support
- Mobile-first, portrait orientation, large tap targets (min 44px)
- Disaster alert cards use colour-coded left border (red=warning, amber=advisory, green=clear)

## .env variables needed

Copy `.env.example` → `.env` and fill in:

- `VITE_CMS_BASE_URL`, `VITE_CMS_WORKSPACE`, `VITE_CMS_PROJECT`
- `VITE_MLIT_API_KEY` (apply free at reinfolib.mlit.go.jp/api/request/)
- `VITE_JMA_AREA_CODE` (default: 130000 for Tokyo)

## Next tasks for Claude Code

1. Build `App.tsx` tab shell with bottom nav (Home / Map / Kit / Guide / SOS)
2. Build `screens/Home.tsx` — JMA alerts + river status + stat cards + sync status
3. Build `screens/Map.tsx` — MapLibre GL with GSI tiles + hazard GeoJSON layers + evac site markers
4. Build `screens/Checklist.tsx` — grouped checklist with IDB state persistence
5. Build `screens/Guide.tsx` — disaster type selector + phase tabs + article list
6. Build `screens/Contacts.tsx` — national hardcoded + CMS city contacts
7. Build `importer/main.go` — MLIT XKT007 → Re:Earth CMS items
8. Setup screen (first-run) — pick home location on map
