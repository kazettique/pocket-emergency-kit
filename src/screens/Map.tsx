import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { EvacuationSite, UserSettings, DisasterType } from '../types'
import { getAllEvacuationSites, getUserSettings } from '../db/idb'
import { useT } from '../i18n'
import type { StringKey } from '../i18n'
import { haversineDistance, formatDistance } from '../utils/geo'
import './Map.css'

const TOKYO_CENTER: [number, number] = [139.767, 35.681]
const DEFAULT_ZOOM = 11
const HOME_ZOOM = 14
const GSI_TILES = 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'
const NEAREST_COUNT = 5

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
  const siteMarkersRef = useRef<maplibregl.Marker[]>([])
  const { t, lang } = useT()
  const [sites, setSites] = useState<EvacuationSite[]>([])
  const [home, setHome] = useState<UserSettings['homeLocation']>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [allSites, settings] = await Promise.all([
        getAllEvacuationSites(),
        getUserSettings(),
      ])
      if (cancelled) return
      setSites(allSites)
      setHome(settings?.homeLocation ?? null)
      setLoaded(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
      siteMarkersRef.current.push(marker)
    }

    return () => {
      homeMarkerRef.current?.remove()
      homeMarkerRef.current = null
      siteMarkersRef.current.forEach((m) => m.remove())
      siteMarkersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [loaded, sites, home, lang, t])

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

  return (
    <section className="screen map-screen">
      <header className="map-header">
        <h1 className="map-header-title">{t('tab.map')}</h1>
      </header>
      <div ref={containerRef} className="map-container" />
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
): string {
  const name = lang === 'en' && site.name_en ? site.name_en : site.name
  const types = site.disaster_types.map((dt) => t(DISASTER_TYPE_KEY[dt])).join(' · ')
  const cap = t('map.siteCapacity', { n: site.capacity })
  const badges: string[] = []
  if (site.accessible) badges.push(t('map.siteAccessible'))
  if (site.accepts_pets) badges.push(t('map.siteAcceptsPets'))
  const metaParts = [cap, ...badges]
  return `
    <div class="map-popup">
      <div class="map-popup-name">${escapeHTML(name)}</div>
      ${types ? `<div class="map-popup-types">${escapeHTML(types)}</div>` : ''}
      <div class="map-popup-meta">${escapeHTML(metaParts.join(' · '))}</div>
    </div>
  `
}
