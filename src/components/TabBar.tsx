import type { ReactElement } from 'react'
import { useT } from '../i18n'
import './components.css'

export type TabKey = 'home' | 'map' | 'kit' | 'guide' | 'sos'

const ICONS: Record<TabKey, ReactElement> = {
  home: (
    <svg viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2 7L7 2l5 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="4" y="7" width="6" height="5" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="6" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 1C4.8 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  kit: (
    <svg viewBox="0 0 14 14" aria-hidden="true">
      <rect x="2" y="4" width="10" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 4V3a2 2 0 014 0v1" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 7v2M6 8h2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  guide: (
    <svg viewBox="0 0 14 14" aria-hidden="true">
      <rect x="3" y="1" width="8" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 5h4M5 7h4M5 9h2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  sos: (
    <svg viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
}

const TABS: TabKey[] = ['home', 'map', 'kit', 'guide', 'sos']

const LABEL_KEY = {
  home: 'tab.home',
  map: 'tab.map',
  kit: 'tab.kit',
  guide: 'tab.guide',
  sos: 'tab.sos',
} as const

export function TabBar({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  const { t } = useT()

  return (
    <nav className="tabbar" aria-label="Primary">
      {TABS.map((key) => {
        const label = t(LABEL_KEY[key])
        const isActive = key === active
        return (
          <button
            key={key}
            className="tabbar-item"
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
            onClick={() => onChange(key)}
            type="button"
          >
            {ICONS[key]}
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
