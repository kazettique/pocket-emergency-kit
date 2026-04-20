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

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: ResolvedTheme
  setTheme: (mode: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function resolve(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return mode
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system')
  const [resolvedTheme, setResolved] = useState<ResolvedTheme>(() => resolve('system'))

  useEffect(() => {
    let cancelled = false
    getUserSettings().then((s) => {
      if (cancelled) return
      const stored = s?.theme ?? 'system'
      setThemeState(stored)
      setResolved(resolve(stored))
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setResolved(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
    setResolved(resolve(mode))
    void (async () => {
      const existing = await getUserSettings()
      const next: UserSettings = {
        homeLocation: existing?.homeLocation ?? null,
        homeAddress: existing?.homeAddress,
        chosenEvacSiteId: existing?.chosenEvacSiteId,
        language: existing?.language ?? 'ja',
        theme: mode,
        setupComplete: existing?.setupComplete ?? false,
      }
      await saveUserSettings(next)
    })()
  }, [])

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
