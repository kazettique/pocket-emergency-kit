import { useEffect, useState } from 'react'
import type { ChecklistItem, ChecklistState, ChecklistCategory } from '../types'
import { getAllChecklistItems, getChecklistState, saveChecklistState } from '../db/idb'
import { useT } from '../i18n'
import type { StringKey } from '../i18n'
import './Kit.css'

const CATEGORY_KEY: Record<ChecklistCategory, StringKey> = {
  water_food: 'category.water_food',
  medical: 'category.medical',
  tools: 'category.tools',
  documents: 'category.documents',
  plan: 'category.plan',
  communication: 'category.communication',
}

function sortItems(items: ChecklistItem[]): ChecklistItem[] {
  return items.slice().sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category)
    return b.priority - a.priority
  })
}

export default function Kit() {
  const { t, localize } = useT()
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [state, setState] = useState<ChecklistState>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [rawItems, rawState] = await Promise.all([
        getAllChecklistItems(),
        getChecklistState(),
      ])
      if (cancelled) return
      setItems(sortItems(rawItems))
      setState(rawState)
      setLoaded(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function toggle(id: string) {
    setState((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      void saveChecklistState(next)
      return next
    })
  }

  const pct =
    items.length === 0
      ? 0
      : Math.round((items.filter((it) => state[it.id]).length / items.length) * 100)

  return (
    <section className="screen kit-screen">
      <h1 className="kit-title">{t('tab.kit')}</h1>

      <div className="kit-progress">
        <div
          className="kit-progress-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className="kit-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="kit-progress-label">{t('kit.progress', { pct })}</span>
      </div>

      {loaded && items.length === 0 ? (
        <div className="kit-empty">{t('kit.empty')}</div>
      ) : (
        <ul className="kit-list">
          {items.map((item) => {
            const done = !!state[item.id]
            const label = localize(item, 'label') || item.label
            return (
              <li key={item.id} className="kit-row" data-done={done}>
                <label className="kit-row-label-wrap">
                  <input
                    type="checkbox"
                    className="kit-checkbox"
                    checked={done}
                    onChange={() => toggle(item.id)}
                  />
                  <span className="kit-row-label">{label}</span>
                </label>
                <span className={`kit-cat is-${item.category}`}>
                  {t(CATEGORY_KEY[item.category])}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
