import { useEffect, useMemo, useState } from 'react'
import type { GuideArticle, DisasterType } from '../types'
import { getAllGuideArticles } from '../db/idb'
import { useT } from '../i18n'
import type { StringKey } from '../i18n'
import { MarkdownView } from '../components/MarkdownView'
import './Guide.css'

type Phase = 'before' | 'during' | 'after'

const TYPE_ORDER: readonly DisasterType[] = [
  'earthquake',
  'flood',
  'tsunami',
  'typhoon',
  'landslide',
  'fire',
  'storm_surge',
  'heatwave',
]

const TYPE_KEY: Record<DisasterType, StringKey> = {
  earthquake: 'disaster.earthquake',
  flood: 'disaster.flood',
  tsunami: 'disaster.tsunami',
  fire: 'disaster.fire',
  landslide: 'disaster.landslide',
  storm_surge: 'disaster.storm_surge',
  typhoon: 'disaster.typhoon',
  heatwave: 'disaster.heatwave',
}

const PHASE_ORDER: readonly Phase[] = ['before', 'during', 'after']

const PHASE_KEY: Record<Phase, StringKey> = {
  before: 'phase.before',
  during: 'phase.during',
  after: 'phase.after',
}

export default function Guide() {
  const { t, localize } = useT()
  const [articles, setArticles] = useState<GuideArticle[]>([])
  const [type, setType] = useState<DisasterType>('earthquake')
  const [phase, setPhase] = useState<Phase>('during')
  const [openArticle, setOpenArticle] = useState<GuideArticle | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const all = await getAllGuideArticles()
      if (cancelled) return
      setArticles(all)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(
    () =>
      articles
        .filter((a) => a.disaster_type === type && a.phase === phase)
        .sort(
          (a, b) =>
            Number(b.is_critical) - Number(a.is_critical) || b.priority - a.priority,
        ),
    [articles, type, phase],
  )

  if (openArticle) {
    return (
      <GuideDetail
        article={openArticle}
        type={type}
        phase={phase}
        onClose={() => setOpenArticle(null)}
        t={t}
        localize={localize}
      />
    )
  }

  return (
    <section className="screen guide-screen">
      <h1 className="guide-title">{t('tab.guide')}</h1>
      <div className="guide-offline">{t('guide.offlineNote')}</div>

      <div className="guide-types" role="tablist" aria-label="Disaster type">
        {TYPE_ORDER.map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={type === d}
            className={`guide-type-chip${type === d ? ' is-on' : ''}`}
            onClick={() => setType(d)}
          >
            {t(TYPE_KEY[d])}
          </button>
        ))}
      </div>

      <div className="guide-phase-tabs" role="tablist" aria-label="Phase">
        {PHASE_ORDER.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={phase === p}
            className={`guide-phase-tab${phase === p ? ' is-on' : ''}`}
            onClick={() => setPhase(p)}
          >
            {t(PHASE_KEY[p])}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="guide-empty">{t('guide.empty')}</div>
      ) : (
        <ul className="guide-articles">
          {filtered.map((article) => {
            const title = localize(article, 'title') || article.title
            const summary = article.summary
            return (
              <li key={article.id}>
                <button
                  type="button"
                  className={`guide-article${article.is_critical ? ' is-critical' : ''}`}
                  onClick={() => setOpenArticle(article)}
                >
                  <div className="guide-article-body">
                    <div className="guide-article-title-row">
                      {article.is_critical ? (
                        <span className="guide-article-critical-dot" aria-hidden="true" />
                      ) : null}
                      <span className="guide-article-title">{title}</span>
                    </div>
                    {summary ? (
                      <div className="guide-article-summary">{summary}</div>
                    ) : null}
                  </div>
                  <span className="guide-article-chevron" aria-hidden="true">›</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function GuideDetail({
  article,
  type,
  phase,
  onClose,
  t,
  localize,
}: {
  article: GuideArticle
  type: DisasterType
  phase: Phase
  onClose: () => void
  t: (key: StringKey, vars?: Record<string, string | number>) => string
  localize: <T extends object>(item: T | null | undefined, field: string) => string
}) {
  const title = localize(article, 'title') || article.title
  const body = localize(article, 'body') || article.body

  return (
    <div
      className="guide-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-detail-title"
    >
      <header className="guide-detail-header">
        <div className="guide-detail-header-inner">
          <button type="button" className="guide-detail-back" onClick={onClose} autoFocus>
            ← {t('guide.back')}
          </button>
          <span className="guide-detail-context">
            {t(TYPE_KEY[type])} · {t(PHASE_KEY[phase])}
          </span>
        </div>
      </header>
      <div className="guide-detail-body">
        <h1 id="guide-detail-title" className="guide-detail-title">
          {title}
        </h1>
        {article.is_critical ? (
          <div className="guide-critical-badge">{t('guide.critical')}</div>
        ) : null}
        <MarkdownView source={body} />
        <div className="guide-detail-footer">{t('guide.offlineReady')}</div>
      </div>
    </div>
  )
}
