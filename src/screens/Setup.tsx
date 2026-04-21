import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import { getUserSettings, saveUserSettings } from '../db/idb'
import type { SyncState } from '../hooks/useSyncEngine'
import { TOKYO_23_WARDS, type Ward } from '../data/tokyoWards'
import './Setup.css'

type GeoStatus = 'idle' | 'requesting' | 'denied' | 'unavailable' | 'timeout'

type PendingSource = 'geo' | 'ward' | 'other'

interface PendingLocation {
  lat: number
  lng: number
  address: string
  source: PendingSource
  wardId?: string
}

const JP_BOUNDS = { minLat: 20, maxLat: 46, minLng: 122, maxLng: 154 }

function inJapan(lat: number, lng: number) {
  return (
    lat >= JP_BOUNDS.minLat &&
    lat <= JP_BOUNDS.maxLat &&
    lng >= JP_BOUNDS.minLng &&
    lng <= JP_BOUNDS.maxLng
  )
}

export default function Setup({ sync, onClose }: { sync: SyncState; onClose: () => void }) {
  const { t, lang } = useT()
  const [pending, setPending] = useState<PendingLocation | null>(null)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const backRef = useRef<HTMLButtonElement>(null)
  const geoAvailable = typeof navigator !== 'undefined' && 'geolocation' in navigator

  useEffect(() => {
    backRef.current?.focus()
  }, [])

  function handleDetectLocation() {
    if (!geoAvailable) return
    setGeoStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        if (!inJapan(latitude, longitude)) {
          setGeoStatus('unavailable')
          return
        }
        setGeoStatus('idle')
        setPending({
          lat: latitude,
          lng: longitude,
          address: t('setup.address.tokyoGeo'),
          source: 'geo',
        })
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setGeoStatus('denied')
        else if (err.code === err.TIMEOUT) setGeoStatus('timeout')
        else setGeoStatus('unavailable')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  function handlePickWard(ward: Ward) {
    setPending({
      lat: ward.lat,
      lng: ward.lng,
      address: lang === 'en' ? ward.name_en : ward.name_ja,
      source: 'ward',
      wardId: ward.id,
    })
  }

  function handlePickOther() {
    if (!geoAvailable) return
    handleDetectLocation()
  }

  async function handleSave() {
    if (!pending) return
    setSaving(true)
    setSaveError(false)
    try {
      const existing = await getUserSettings()
      await saveUserSettings({
        homeLocation: { lat: pending.lat, lng: pending.lng },
        homeAddress: pending.address,
        chosenEvacSiteId: existing?.chosenEvacSiteId,
        language: existing?.language ?? lang,
        theme: existing?.theme,
        setupComplete: true,
      })
      void sync.triggerSync(true)
      onClose()
    } catch {
      setSaving(false)
      setSaveError(true)
    }
  }

  const geoHintKey =
    geoStatus === 'requesting'
      ? 'setup.geo.requesting'
      : geoStatus === 'denied'
        ? 'setup.geo.denied'
        : geoStatus === 'unavailable'
          ? 'setup.geo.unavailable'
          : geoStatus === 'timeout'
            ? 'setup.geo.timeout'
            : null

  const previewSource =
    pending?.source === 'geo'
      ? t('setup.preview.source.geo')
      : pending?.source === 'other'
        ? t('setup.preview.source.other')
        : pending?.wardId
          ? t('setup.preview.source.ward', {
              ward: lang === 'en'
                ? TOKYO_23_WARDS.find((w) => w.id === pending.wardId)?.name_en ?? ''
                : TOKYO_23_WARDS.find((w) => w.id === pending.wardId)?.name_ja ?? '',
            })
          : ''

  return (
    <div
      className="setup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-title"
    >
      <header className="setup-header">
        <div className="setup-header-inner">
          <button ref={backRef} type="button" className="setup-header-back" onClick={onClose}>
            ← {t('setup.header.back')}
          </button>
          <h1 id="setup-title" className="setup-header-title">
            {t('setup.header.title')}
          </h1>
        </div>
      </header>

      <div className="setup-body">
        <p className="setup-intro">{t('setup.intro')}</p>

        {pending ? (
          <div className="setup-preview" aria-live="polite">
            <div className="setup-preview-label">{t('setup.preview.title')}</div>
            <div className="setup-preview-address">{pending.address}</div>
            <div className="setup-preview-source">{previewSource}</div>
            <div className="setup-preview-coords">
              {pending.lat.toFixed(4)}, {pending.lng.toFixed(4)}
            </div>
            <button
              type="button"
              className="setup-save-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? t('setup.saving') : t('setup.save')}
            </button>
            {saveError ? <div className="setup-save-error">{t('setup.saveError')}</div> : null}
          </div>
        ) : null}

        {geoAvailable ? (
          <section className="setup-section">
            <h2 className="setup-section-title">{t('setup.geo.title')}</h2>
            <p className="setup-section-body">{t('setup.geo.body')}</p>
            <button
              type="button"
              className="setup-geo-button"
              onClick={handleDetectLocation}
              disabled={geoStatus === 'requesting'}
            >
              {t('setup.geo.button')}
            </button>
            {geoHintKey ? (
              <div
                className={`setup-geo-hint${geoStatus === 'denied' || geoStatus === 'unavailable' ? ' is-error' : ''}`}
              >
                {t(geoHintKey)}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="setup-section">
          <h2 className="setup-section-title">{t('setup.wards.title')}</h2>
          <p className="setup-section-body">{t('setup.wards.body')}</p>
          <div className="setup-wards-grid">
            {TOKYO_23_WARDS.map((w) => {
              const isSelected = pending?.source === 'ward' && pending.wardId === w.id
              return (
                <button
                  key={w.id}
                  type="button"
                  className={`setup-ward-btn${isSelected ? ' is-selected' : ''}`}
                  onClick={() => handlePickWard(w)}
                >
                  {lang === 'en' ? w.name_en : w.name_ja}
                </button>
              )
            })}
          </div>
          {geoAvailable ? (
            <button
              type="button"
              className={`setup-ward-other${pending?.source === 'other' ? ' is-selected' : ''}`}
              onClick={handlePickOther}
            >
              {t('setup.wards.other')}
            </button>
          ) : null}
        </section>

        <p className="setup-footer-note">{t('setup.footer.note')}</p>
      </div>
    </div>
  )
}
