import { useEffect, useState } from 'react'
import type { JmaAlert, RiverLevel, UserSettings, ChecklistItem, ChecklistState } from '../types'
import {
  getGovCache,
  getLastSyncedAt,
  isStale,
  getUserSettings,
  getAllEvacuationSites,
  getAllChecklistItems,
  getChecklistState,
} from '../db/idb'
import { useT } from '../i18n'
import type { SyncState } from '../hooks/useSyncEngine'
import { SyncBar } from '../components/SyncBar'
import { AlertCard, type AlertVariant } from '../components/AlertCard'
import { StatCard } from '../components/StatCard'
import './Home.css'

interface HomeData {
  jma: JmaAlert | null
  rivers: RiverLevel[]
  settings: UserSettings | null
  evacSiteCount: number
  checklistItems: ChecklistItem[]
  checklistState: ChecklistState
  lastSyncAt: Date | null
  jmaIsStale: boolean
}

const EMPTY: HomeData = {
  jma: null,
  rivers: [],
  settings: null,
  evacSiteCount: 0,
  checklistItems: [],
  checklistState: {},
  lastSyncAt: null,
  jmaIsStale: true,
}

function riverVariant(status: RiverLevel['status']): AlertVariant {
  if (status === 'danger' || status === 'alert') return 'danger'
  if (status === 'caution') return 'warn'
  return 'ok'
}

function kitPercent(items: ChecklistItem[], state: ChecklistState): number {
  if (items.length === 0) return 0
  const done = items.reduce((n, item) => (state[item.id] ? n + 1 : n), 0)
  return Math.round((done / items.length) * 100)
}

export default function Home({ sync }: { sync: SyncState }) {
  const { t, lang } = useT()
  const [data, setData] = useState<HomeData>(EMPTY)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [jma, rivers, settings, sites, checklistItems, checklistState, lastSyncAt, jmaIsStale] =
        await Promise.all([
          getGovCache<JmaAlert>('jma:alerts'),
          getGovCache<RiverLevel[]>('mlit:river_levels'),
          getUserSettings(),
          getAllEvacuationSites(),
          getAllChecklistItems(),
          getChecklistState(),
          getLastSyncedAt('gov:jma'),
          isStale('gov:jma'),
        ])
      if (cancelled) return
      setData({
        jma: jma ?? null,
        rivers: rivers ?? [],
        settings: settings ?? null,
        evacSiteCount: sites.length,
        checklistItems,
        checklistState,
        lastSyncAt,
        jmaIsStale,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [sync.status, sync.lastSyncAt])

  const { jma, rivers, settings, evacSiteCount, checklistItems, checklistState, lastSyncAt, jmaIsStale } = data
  const warningsCount = jma?.warnings.length ?? 0
  const kitPct = kitPercent(checklistItems, checklistState)
  const areaName = jma?.areaName ?? (lang === 'en' ? 'Tokyo' : '東京都')

  return (
    <section className="home screen">
      <SyncBar
        status={sync.status}
        isOnline={sync.isOnline}
        isStale={jmaIsStale}
        lastSyncAt={lastSyncAt}
      />

      {!settings?.homeLocation ? (
        <div className="home-cta">
          <div className="home-cta-title">{t('setup.cta.title')}</div>
          <p className="home-cta-body">{t('setup.cta.body')}</p>
          <button type="button" className="home-cta-button" disabled>
            {t('setup.cta.button')}
          </button>
        </div>
      ) : null}

      <h2 className="home-title">{t('home.title')}</h2>

      <div className="home-section">
        {warningsCount === 0 ? (
          <AlertCard
            variant="ok"
            title={t('home.jmaOk', { area: areaName })}
            body={t('home.noWarnings')}
            source={t('home.source.jma')}
            updatedAt={jma?.fetchedAt}
          />
        ) : (
          jma!.warnings.map((w, i) => (
            <AlertCard
              key={`${w.type}-${i}`}
              variant="warn"
              title={
                w.status === 'warning'
                  ? t('home.jmaWarning', { area: areaName })
                  : t('home.jmaAdvisory', { area: areaName })
              }
              body={w.text ?? w.type}
              source={t('home.source.jma')}
              updatedAt={jma!.fetchedAt}
            />
          ))
        )}
      </div>

      {rivers.length > 0 ? (
        <div className="home-section">
          {rivers.map((r) => {
            const levelKey =
              r.status === 'danger'
                ? 'home.riverDanger'
                : r.status === 'alert'
                  ? 'home.riverAlert'
                  : r.status === 'caution'
                    ? 'home.riverCaution'
                    : 'home.riverNormal'
            return (
              <AlertCard
                key={r.stationId}
                variant={riverVariant(r.status)}
                title={t('home.riverTitle', { river: r.riverName })}
                body={t(levelKey, { level: r.level.toFixed(1) })}
                source={t('home.source.river')}
                updatedAt={r.fetchedAt}
              />
            )
          })}
        </div>
      ) : null}

      <div className="home-stats">
        <StatCard
          value={String(warningsCount)}
          valueColor="var(--c-accent)"
          label={t('stat.warnings')}
        />
        <StatCard
          value={String(evacSiteCount)}
          valueColor="var(--c-ok)"
          label={t('stat.evacSites')}
        />
        <StatCard value={`${kitPct}%`} label={t('stat.kitComplete')} />
        <StatCard value="—" valueColor="var(--c-info-text)" label={t('stat.lastQuake')} />
      </div>
    </section>
  )
}
