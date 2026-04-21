import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type {
  EvacuationSite,
  UserSettings,
  DisasterType,
  HazardZoneData,
  GeoJSONFeatureCollection,
  JshisRisk,
} from '../types'
import { getAllEvacuationSites, getGovCache, getUserSettings } from '../db/idb'
import { useT } from '../i18n'
import type { StringKey } from '../i18n'
import { haversineDistance, formatDistance } from '../utils/geo'
import './Map.css'

const TOKYO_CENTER: [number, number] = [139.767, 35.681]
const DEFAULT_ZOOM = 11
const HOME_ZOOM = 14
const GSI_TILES = 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'
const NEAREST_COUNT = 5

type HazardKey = 'flood' | 'landslide' | 'tsunami'
const HAZARD_KEYS: readonly HazardKey[] = ['flood', 'landslide', 'tsunami']

const HAZARD_COLOR: Record<HazardKey, string> = {
  flood: '#4da6ff',
  landslide: '#b8651d',
  tsunami: '#0c447c',
}

const ROUTE_SOURCE_ID = 'route-line-source'
const ROUTE_LAYER_ID = 'route-line'
const ROUTE_COLOR = '#d85a30'

const HAZARD_LABEL_KEY: Record<HazardKey, StringKey> = {
  flood: 'map.layers.flood',
  landslide: 'map.layers.landslide',
  tsunami: 'map.layers.tsunami',
}

function hasFeatures(fc: GeoJSONFeatureCollection | undefined): boolean {
  return !!fc && Array.isArray(fc.features) && fc.features.length > 0
}

function riskColor(prob30yr: number): string {
  if (prob30yr >= 0.6) return 'var(--c-danger)'
  if (prob30yr >= 0.3) return 'var(--c-warn-border)'
  return 'var(--c-ok)'
}

const DISASTER_TYPE_KEY: Record<DisasterType, StringKey> = {
  earthquake: 'disaster.earthquake',
  flood: 'disaster.flood',
  tsunami: 'disaster.tsunami',
  fire: 'disaster.fire',
  landslide: 'disaster.landslide',
  storm_surge: 'disaster.storm_surge',
  typhoon: 'disaster.typhoon',
  heatwave: 'disaster.heatwave',
}

interface SiteWithDistance {
  site: EvacuationSite
  distanceM: number | null
}

function escapeHTML(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;'
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '"': return '&quot;'
      case "'": return '&#39;'
      default: return c
    }
  })
}

export default function Map() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const homeMarkerRef = useRef<maplibregl.Marker | null>(null)
  const siteMarkersRef = useRef<globalThis.Map<string, maplibregl.Marker>>(new globalThis.Map())
  const userPositionRef = useRef<[number, number] | null>(null)
  const { t, lang } = useT()
  const [sites, setSites] = useState<EvacuationSite[]>([])
  const [home, setHome] = useState<UserSettings['homeLocation']>(null)
  const [hazards, setHazards] = useState<HazardZoneData | null>(null)
  const [seismicRisk, setSeismicRisk] = useState<JshisRisk | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [layerVis, setLayerVis] = useState<Record<HazardKey, boolean>>({
    flood: true,
    landslide: true,
    tsunami: true,
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [allSites, settings, cachedHazards, cachedRisk] = await Promise.all([
        getAllEvacuationSites(),
        getUserSettings(),
        getGovCache<HazardZoneData>('mlit:hazard_zones'),
        getGovCache<JshisRisk>('jshis:risk'),
      ])
      if (cancelled) return
      setSites(allSites)
      setHome(settings?.homeLocation ?? null)
      setHazards(cachedHazards ?? null)
      setSeismicRisk(cachedRisk ?? null)
      setLoaded(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function handleSelectSite(site: EvacuationSite) {
    const map = mapRef.current
    const marker = siteMarkersRef.current.get(site.id)
    if (!map || !marker) return
    siteMarkersRef.current.forEach((m) => {
      if (m !== marker) m.getPopup()?.remove()
    })
    const [lng, lat] = site.location.coordinates
    const origin =
      userPositionRef.current ?? (home ? ([home.lng, home.lat] as [number, number]) : null)
    const originKind: 'current' | 'home' | null = userPositionRef.current
      ? 'current'
      : home
        ? 'home'
        : null
    const popup = marker.getPopup()
    popup?.setHTML(renderPopupHTML(site, lang, t, origin, originKind))
    if (origin) {
      drawRoute(map, origin, [lng, lat])
      map.fitBounds(
        [
          [Math.min(origin[0], lng), Math.min(origin[1], lat)],
          [Math.max(origin[0], lng), Math.max(origin[1], lat)],
        ],
        { padding: 80, maxZoom: 15, duration: 900 },
      )
    } else {
      clearRoute(map)
      map.flyTo({ center: [lng, lat], zoom: 15, speed: 1.2, essential: true })
    }
    if (!popup?.isOpen()) marker.togglePopup()
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    setSelectedId(site.id)
  }

  function toggleLayer(key: HazardKey) {
    const next = !layerVis[key]
    setLayerVis((prev) => ({ ...prev, [key]: next }))
    const map = mapRef.current
    if (!map) return
    const fillId = `hazard-${key}-fill`
    const lineId = `hazard-${key}-line`
    if (map.getLayer(fillId)) {
      map.setLayoutProperty(fillId, 'visibility', next ? 'visible' : 'none')
    }
    if (map.getLayer(lineId)) {
      map.setLayoutProperty(lineId, 'visibility', next ? 'visible' : 'none')
    }
  }

  useEffect(() => {
    if (!containerRef.current || !loaded) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          gsi: {
            type: 'raster',
            tiles: [GSI_TILES],
            tileSize: 256,
            attribution:
              '<a href="https://www.gsi.go.jp/" target="_blank" rel="noopener">地理院タイル</a>',
            maxzoom: 18,
          },
        },
        layers: [{ id: 'gsi-layer', type: 'raster', source: 'gsi' }],
      },
      center: home ? [home.lng, home.lat] : TOKYO_CENTER,
      zoom: home ? HOME_ZOOM : DEFAULT_ZOOM,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true, timeout: 10000 },
      trackUserLocation: false,
      showUserLocation: true,
      fitBoundsOptions: { maxZoom: 15 },
    })
    geolocate.on('geolocate', (e) => {
      const coords = (e as unknown as { coords: GeolocationCoordinates }).coords
      userPositionRef.current = [coords.longitude, coords.latitude]
    })
    map.addControl(geolocate, 'top-right')

    if (home) {
      const el = document.createElement('div')
      el.className = 'map-home-pin'
      el.setAttribute('aria-label', 'Home')
      homeMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([home.lng, home.lat])
        .addTo(map)
    }

    for (const site of sites) {
      const [lng, lat] = site.location.coordinates
      const el = document.createElement('div')
      el.className = 'map-site-pin'
      const name = lang === 'en' && site.name_en ? site.name_en : site.name
      el.setAttribute('aria-label', name)
      const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(
        renderPopupHTML(site, lang, t),
      )
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map)
      siteMarkersRef.current.set(site.id, marker)
    }

    function addHazardLayers() {
      if (!hazards) return
      for (const key of HAZARD_KEYS) {
        const data = hazards[key]
        if (!hasFeatures(data)) continue
        const sourceId = `hazard-${key}`
        const fillId = `hazard-${key}-fill`
        const lineId = `hazard-${key}-line`
        map.addSource(sourceId, {
          type: 'geojson',
          data: data as GeoJSON.FeatureCollection,
        })
        const visibility = layerVis[key] ? 'visible' : 'none'
        map.addLayer({
          id: fillId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': HAZARD_COLOR[key],
            'fill-opacity': 0.3,
          },
          layout: { visibility },
        })
        map.addLayer({
          id: lineId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': HAZARD_COLOR[key],
            'line-width': 1,
            'line-opacity': 0.6,
          },
          layout: { visibility },
        })
      }
    }

    if (map.isStyleLoaded()) addHazardLayers()
    else map.once('load', addHazardLayers)

    return () => {
      homeMarkerRef.current?.remove()
      homeMarkerRef.current = null
      siteMarkersRef.current.forEach((m) => m.remove())
      siteMarkersRef.current.clear()
      map.remove()
      mapRef.current = null
    }
    // layerVis is intentionally read as initial value on each map init; toggles happen imperatively
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, sites, home, hazards, lang, t])

  const nearest: SiteWithDistance[] = home
    ? sites
        .map((s) => ({
          site: s,
          distanceM: haversineDistance(home, {
            lat: s.location.coordinates[1],
            lng: s.location.coordinates[0],
          }),
        }))
        .sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0))
        .slice(0, NEAREST_COUNT)
    : sites.slice(0, NEAREST_COUNT).map((s) => ({ site: s, distanceM: null }))

  const anyHazardPresent = HAZARD_KEYS.some((k) => hasFeatures(hazards?.[k]))

  return (
    <section className="screen map-screen">
      <header className="map-header">
        <h1 className="map-header-title">{t('tab.map')}</h1>
        {seismicRisk ? (
          <span
            className="map-header-risk"
            style={{ color: riskColor(seismicRisk.prob30yr) }}
          >
            {t('stat.seismic30yr')}: {Math.round(seismicRisk.prob30yr * 100)}%
          </span>
        ) : null}
      </header>
      <div ref={containerRef} className="map-container" />
      {anyHazardPresent ? (
        <div className="map-layers" role="group" aria-label={t('map.layers.title')}>
          {HAZARD_KEYS.map((key) => {
            const available = hasFeatures(hazards?.[key])
            const on = layerVis[key]
            return (
              <button
                key={key}
                type="button"
                className={`map-layer-chip${on && available ? ' is-on' : ''}`}
                onClick={() => available && toggleLayer(key)}
                disabled={!available}
                aria-pressed={on && available}
              >
                <span
                  className="map-layer-chip-swatch"
                  style={{ background: HAZARD_COLOR[key] }}
                  aria-hidden="true"
                />
                <span>{t(HAZARD_LABEL_KEY[key])}</span>
              </button>
            )
          })}
        </div>
      ) : null}
      <div className="map-list">
        <div className="map-list-title">
          {home ? t('map.nearestTitle') : t('map.allSitesTitle')}
        </div>
        {sites.length === 0 ? (
          <div className="map-list-empty">{t('map.sitesEmpty')}</div>
        ) : (
          <ul className="map-list-items">
            {nearest.map(({ site, distanceM }) => (
              <li key={site.id} className="map-list-item">
                <button
                  type="button"
                  className={`map-list-item-btn${site.id === selectedId ? ' is-selected' : ''}`}
                  onClick={() => handleSelectSite(site)}
                  aria-pressed={site.id === selectedId}
                >
                  <div className="map-list-item-body">
                    <div className="map-list-item-name">
                      {lang === 'en' && site.name_en ? site.name_en : site.name}
                    </div>
                    <div className="map-list-item-meta">
                      {site.disaster_types
                        .map((dt) => t(DISASTER_TYPE_KEY[dt]))
                        .join(' · ')}
                    </div>
                  </div>
                  {distanceM !== null ? (
                    <span className="map-list-item-distance">
                      {formatDistance(distanceM, lang)}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function renderPopupHTML(
  site: EvacuationSite,
  lang: 'ja' | 'en',
  t: (key: StringKey, vars?: Record<string, string | number>) => string,
  origin: [number, number] | null = null,
  originKind: 'current' | 'home' | null = null,
): string {
  const name = lang === 'en' && site.name_en ? site.name_en : site.name
  const types = site.disaster_types.map((dt) => t(DISASTER_TYPE_KEY[dt])).join(' · ')
  const cap = t('map.siteCapacity', { n: site.capacity })
  const badges: string[] = []
  if (site.accessible) badges.push(t('map.siteAccessible'))
  if (site.accepts_pets) badges.push(t('map.siteAcceptsPets'))
  const metaParts = [cap, ...badges]
  const [lng, lat] = site.location.coordinates
  const mapsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking` +
    (origin ? `&origin=${origin[1]},${origin[0]}` : '')
  const originLabel =
    originKind === 'current'
      ? t('map.directions.from.current')
      : originKind === 'home'
        ? t('map.directions.from.home')
        : ''
  const distanceLabel =
    origin !== null
      ? formatDistance(
          haversineDistance(
            { lat: origin[1], lng: origin[0] },
            { lat, lng },
          ) ?? 0,
          lang,
        )
      : ''
  return `
    <div class="map-popup">
      <div class="map-popup-name">${escapeHTML(name)}</div>
      ${types ? `<div class="map-popup-types">${escapeHTML(types)}</div>` : ''}
      <div class="map-popup-meta">${escapeHTML(metaParts.join(' · '))}</div>
      ${
        originLabel
          ? `<div class="map-popup-route">${escapeHTML(originLabel)} · ${escapeHTML(distanceLabel)}</div>`
          : ''
      }
      <a class="map-popup-action" href="${escapeHTML(mapsUrl)}" target="_blank" rel="noopener noreferrer">
        ${escapeHTML(t('map.directions.open'))}
      </a>
    </div>
  `
}

function drawRoute(
  map: maplibregl.Map,
  from: [number, number],
  to: [number, number],
): void {
  const data: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: [from, to] },
  }
  const existing = map.getSource(ROUTE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
  if (existing) {
    existing.setData(data)
    return
  }
  map.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data })
  map.addLayer({
    id: ROUTE_LAYER_ID,
    type: 'line',
    source: ROUTE_SOURCE_ID,
    paint: {
      'line-color': ROUTE_COLOR,
      'line-width': 3,
      'line-dasharray': [2, 2],
      'line-opacity': 0.9,
    },
  })
}

function clearRoute(map: maplibregl.Map): void {
  if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID)
  if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID)
}
