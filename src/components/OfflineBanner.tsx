import { useT } from '../i18n'
import './components.css'

export function OfflineBanner() {
  const { t } = useT()
  return <div className="offline-banner" role="status">{t('offlineBanner.text')}</div>
}
