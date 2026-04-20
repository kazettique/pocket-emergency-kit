import { useT } from '../i18n'
import './Placeholder.css'

export default function Map() {
  const { t } = useT()
  return (
    <section className="screen screen-placeholder">
      <h1>{t('tab.map')}</h1>
      <p className="screen-placeholder-tag">{t('screen.comingSoon')}</p>
      <p>{t('screen.map.body')}</p>
    </section>
  )
}
