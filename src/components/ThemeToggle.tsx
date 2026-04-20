import { useT } from '../i18n'
import { useTheme, type ThemeMode } from '../theme'
import './components.css'

const NEXT: Record<ThemeMode, ThemeMode> = {
  light: 'system',
  system: 'dark',
  dark: 'light',
}

const GLYPH: Record<ThemeMode, string> = {
  light: '☀',
  system: '◐',
  dark: '☾',
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useT()
  return (
    <button
      type="button"
      className="toggle-btn"
      aria-label={t('toggle.theme.aria')}
      onClick={() => setTheme(NEXT[theme])}
    >
      {GLYPH[theme]}
    </button>
  )
}
