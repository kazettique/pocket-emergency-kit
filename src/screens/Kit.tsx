import { useT } from '../i18n'
import './Placeholder.css'

export default function Kit() {
  const { t } = useT()
  return (
    <section className="screen screen-placeholder">
      <h1>{t('tab.kit')}</h1>
      <p className="screen-placeholder-tag">{t('screen.comingSoon')}</p>
      <p>{t('screen.kit.body')}</p>
    </section>
  )
}
