import { useT } from '../i18n'
import './Placeholder.css'

export default function Guide() {
  const { t } = useT()
  return (
    <section className="screen screen-placeholder">
      <h1>{t('tab.guide')}</h1>
      <p className="screen-placeholder-tag">{t('screen.comingSoon')}</p>
      <p>{t('screen.guide.body')}</p>
    </section>
  )
}
