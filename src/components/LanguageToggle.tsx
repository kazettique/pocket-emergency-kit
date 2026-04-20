import { useT } from '../i18n'
import './components.css'

export function LanguageToggle() {
  const { lang, setLang, t } = useT()
  const next = lang === 'ja' ? 'en' : 'ja'
  return (
    <button
      type="button"
      className="toggle-btn"
      aria-label={t('toggle.lang.aria')}
      onClick={() => setLang(next)}
    >
      {lang === 'ja' ? 'JP' : 'EN'}
    </button>
  )
}
