import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getUserSettings } from '../db/idb'
import { useT } from '../i18n'
import './Map.css'

const TOKYO_CENTER: [number, number] = [139.767, 35.681]
const DEFAULT_ZOOM = 11
const HOME_ZOOM = 14

const GSI_TILES = 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'

export default function Map() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const { t } = useT()

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

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
      center: TOKYO_CENTER,
      zoom: DEFAULT_ZOOM,
    })
    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    getUserSettings().then((s) => {
      if (cancelled || !s?.homeLocation) return
      const { lat, lng } = s.homeLocation
      map.jumpTo({ center: [lng, lat], zoom: HOME_ZOOM })
      const el = document.createElement('div')
      el.className = 'map-home-pin'
      el.setAttribute('aria-label', s.homeAddress ?? 'Home')
      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map)
    })

    return () => {
      cancelled = true
      markerRef.current?.remove()
      markerRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <section className="screen map-screen">
      <header className="map-header">
        <h1 className="map-header-title">{t('tab.map')}</h1>
      </header>
      <div ref={containerRef} className="map-container" />
    </section>
  )
}
