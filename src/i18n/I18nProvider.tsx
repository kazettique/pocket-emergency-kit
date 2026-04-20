import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getUserSettings, saveUserSettings } from '../db/idb'
import type { UserSettings } from '../types'
import { strings, type Lang, type StringKey } from './strings'

export type TranslateFn = (key: StringKey, vars?: Record<string, string | number>) => string
export type LocalizeFn = <T extends Record<string, unknown>>(item: T | null | undefined, field: string) => string

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: TranslateFn
  localize: LocalizeFn
  formatRelativeTime: (date: Date | number | null | undefined) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key]
    return v === undefined || v === null ? `{${key}}` : String(v)
  })
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ja')

  useEffect(() => {
    let cancelled = false
    getUserSettings().then((s) => {
      if (cancelled) return
      if (s?.language) setLangState(s.language)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    void (async () => {
      const existing = await getUserSettings()
      const settings: UserSettings = {
        homeLocation: existing?.homeLocation ?? null,
        homeAddress: existing?.homeAddress,
        chosenEvacSiteId: existing?.chosenEvacSiteId,
        language: next,
        theme: existing?.theme,
        setupComplete: existing?.setupComplete ?? false,
      }
      await saveUserSettings(settings)
    })()
  }, [])

  const t: TranslateFn = useCallback(
    (key, vars) => {
      const entry = strings[key]
      if (!entry) return key
      const raw = entry[lang] ?? entry.ja ?? key
      return interpolate(raw, vars)
    },
    [lang],
  )

  const localize: LocalizeFn = useCallback(
    (item, field) => {
      if (!item) return ''
      if (lang === 'en') {
        const enField = `${field}_en` as keyof typeof item
        const enVal = item[enField]
        if (typeof enVal === 'string' && enVal.length > 0) return enVal
      }
      const baseVal = item[field as keyof typeof item]
      return typeof baseVal === 'string' ? baseVal : ''
    },
    [lang],
  )

  const formatRelativeTime = useCallback(
    (input: Date | number | null | undefined): string => {
      if (input === null || input === undefined) return t('status.neverSynced')
      const ms = input instanceof Date ? input.getTime() : input
      const diffSec = Math.round((ms - Date.now()) / 1000)
      const abs = Math.abs(diffSec)

      if (abs < 45) return t('time.justNow')

      const rtf = new Intl.RelativeTimeFormat(lang === 'ja' ? 'ja' : 'en', { numeric: 'auto' })
      if (abs < 60 * 60) return rtf.format(Math.round(diffSec / 60), 'minute')
      if (abs < 60 * 60 * 24) return rtf.format(Math.round(diffSec / 3600), 'hour')
      return rtf.format(Math.round(diffSec / 86400), 'day')
    },
    [lang, t],
  )

  const value = useMemo(
    () => ({ lang, setLang, t, localize, formatRelativeTime }),
    [lang, setLang, t, localize, formatRelativeTime],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
