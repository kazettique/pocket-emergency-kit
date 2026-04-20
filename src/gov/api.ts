import type { JmaAlert, JshisRisk, RiverLevel, HazardZoneData } from '../types'
import { saveGovCache, markSynced, isStale } from '../db/idb'

// ─── JMA weather alerts ────────────────────────────────────────────────────────
// No API key needed. Tokyo area code: 130000

const JMA_AREA_CODE = import.meta.env.VITE_JMA_AREA_CODE ?? '130000'

export async function fetchJmaAlerts(): Promise<JmaAlert | null> {
  try {
    const res = await fetch(
      `https://www.jma.go.jp/bosai/forecast/data/overview_week/${JMA_AREA_CODE}.json`
    )
    if (!res.ok) return null
    const data = await res.json()

    // Also fetch active warnings
    const warnRes = await fetch(
      `https://www.jma.go.jp/bosai/warning/data/warning/${JMA_AREA_CODE}.json`
    )
    const warnData = warnRes.ok ? await warnRes.json() : null

    const alert: JmaAlert = {
      areaCode: JMA_AREA_CODE,
      areaName: data.areaName ?? '東京都',
      warnings: extractWarnings(warnData),
      fetchedAt: Date.now(),
    }

    await saveGovCache('jma:alerts', alert)
    await markSynced('gov:jma')
    return alert
  } catch {
    return null
  }
}

function extractWarnings(warnData: unknown): JmaAlert['warnings'] {
  if (!warnData || typeof warnData !== 'object') return []
  try {
    const data = warnData as Record<string, unknown>
    const areas = (data.areaTypes as unknown[]) ?? []
    const warnings: JmaAlert['warnings'] = []
    for (const area of areas) {
      const a = area as Record<string, unknown>
      const items = (a.areas as unknown[]) ?? []
      for (const item of items) {
        const i = item as Record<string, unknown>
        const warnItems = (i.warnings as unknown[]) ?? []
        for (const w of warnItems) {
          const wi = w as Record<string, unknown>
          if (wi.status !== 'なし') {
            warnings.push({
              type: wi.type as string,
              status: wi.status === '警報' ? 'warning' : 'advisory',
              text: wi.text as string | undefined,
            })
          }
        }
      }
    }
    return warnings
  } catch {
    return []
  }
}

// ─── J-SHIS seismic risk ───────────────────────────────────────────────────────
// No API key needed. Returns mesh-level seismic hazard probability.

export async function fetchJshisRisk(lat: number, lng: number): Promise<JshisRisk | null> {
  try {
    const url = `https://www.j-shis.bosai.go.jp/map/api/pshm/Y2020/T30/ps/meshinfo.json?position=${lng},${lat}&epsg=4326`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()

    const result = data.RESULT ?? {}
    const risk: JshisRisk = {
      lat,
      lng,
      meshCode: result.MCODE ?? '',
      prob30yr: parseFloat(result.PROB ?? '0') / 100, // API returns percentage
      intensityClass: result.RANK ?? 'unknown',
      siteAmplification: parseFloat(result.AVS30 ?? '0'),
      fetchedAt: Date.now(),
    }

    await saveGovCache('jshis:risk', risk)
    await markSynced('gov:jshis')
    return risk
  } catch {
    return null
  }
}

// ─── MLIT hazard zones ─────────────────────────────────────────────────────────
// Requires MLIT API key. Tiles at z=14.

const MLIT_API_KEY = import.meta.env.VITE_MLIT_API_KEY ?? ''

// Convert lat/lng to XYZ tile coordinates
function lngLatToTile(lng: number, lat: number, zoom: number) {
  const n = Math.pow(2, zoom)
  const x = Math.floor((lng + 180) / 360 * n)
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  return { x, y, z: zoom }
}

async function fetchMlitGeoJSON(endpoint: string, z: number, x: number, y: number) {
  const url = `https://www.reinfolib.mlit.go.jp/ex-api/external/${endpoint}?response_format=geojson&z=${z}&x=${x}&y=${y}`
  const res = await fetch(url, {
    headers: { 'Ocp-Apim-Subscription-Key': MLIT_API_KEY },
  })
  if (!res.ok) return null
  return res.json()
}

export async function fetchHazardZones(lat: number, lng: number): Promise<HazardZoneData | null> {
  if (!MLIT_API_KEY) {
    console.warn('VITE_MLIT_API_KEY not set — skipping hazard zone fetch')
    return null
  }
  if (!(await isStale('gov:hazard_zones'))) return null

  try {
    const { x, y, z } = lngLatToTile(lng, lat, 14)

    const [flood, landslide, tsunami] = await Promise.allSettled([
      fetchMlitGeoJSON('XKT011', z, x, y),  // flood inundation
      fetchMlitGeoJSON('XKT012', z, x, y),  // landslide warning
      fetchMlitGeoJSON('XKT016', z, x, y),  // tsunami inundation
    ])

    const data: HazardZoneData = {
      flood:     flood.status === 'fulfilled'     ? flood.value     : { type: 'FeatureCollection', features: [] },
      landslide: landslide.status === 'fulfilled' ? landslide.value : { type: 'FeatureCollection', features: [] },
      tsunami:   tsunami.status === 'fulfilled'   ? tsunami.value   : { type: 'FeatureCollection', features: [] },
      fetchedAt: Date.now(),
    }

    await saveGovCache('mlit:hazard_zones', data)
    await markSynced('gov:hazard_zones')
    return data
  } catch {
    return null
  }
}

// ─── MLIT evacuation sites (for Go importer reference — not called from PWA) ──
// The PWA reads evacuation sites from Re:Earth CMS, not directly from MLIT.
// The Go importer (importer/main.go) fetches from XKT007 and writes to CMS.

// ─── River water levels ────────────────────────────────────────────────────────
// MLIT water disaster open data. Registration required for real-time socket feed.
// This uses the simpler HTTP polling approach for the POC.

export async function fetchRiverLevels(): Promise<RiverLevel[]> {
  // TODO: Replace with actual MLIT water disaster API endpoint after registration.
  // For POC, returns mock data structure matching the real API shape.
  // Real endpoint: https://www.river.go.jp/ (requires registration)
  const mock: RiverLevel[] = [
    {
      stationId: 'ARAKA-001',
      stationName: '荒川上流観測所',
      riverName: '荒川',
      level: 2.4,
      alertLevel: 4.2,
      dangerLevel: 5.8,
      status: 'normal',
      fetchedAt: Date.now(),
    },
    {
      stationId: 'EDOGA-001',
      stationName: '江戸川観測所',
      riverName: '江戸川',
      level: 1.8,
      alertLevel: 3.5,
      dangerLevel: 4.8,
      status: 'normal',
      fetchedAt: Date.now(),
    },
  ]

  await saveGovCache('mlit:river_levels', mock)
  await markSynced('gov:river')
  return mock
}

// ─── All gov data refresh ──────────────────────────────────────────────────────

export async function refreshGovData(lat: number, lng: number) {
  await Promise.allSettled([
    fetchJmaAlerts(),
    fetchJshisRisk(lat, lng),
    fetchHazardZones(lat, lng),
    fetchRiverLevels(),
  ])
}
