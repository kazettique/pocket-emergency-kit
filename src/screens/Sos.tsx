import { useT } from '../i18n'
import './Placeholder.css'

export default function Sos() {
  const { t } = useT()
  return (
    <section className="screen screen-placeholder">
      <h1>{t('tab.sos')}</h1>
      <p className="screen-placeholder-tag">{t('screen.comingSoon')}</p>
      <p>{t('screen.sos.body')}</p>
    </section>
  )
}
