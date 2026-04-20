import { useT } from '../i18n'
import type { SyncStatus } from '../hooks/useSyncEngine'
import './components.css'

interface SyncBarProps {
  status: SyncStatus
  isOnline: boolean
  isStale: boolean
  lastSyncAt: Date | null
}

export function SyncBar({ status, isOnline, isStale, lastSyncAt }: SyncBarProps) {
  const { t, formatRelativeTime } = useT()

  let variant: 'ok' | 'syncing' | 'stale' | 'offline' | 'error' = 'ok'
  let text = t('sync.cached')
  let showSpinner = false

  if (!isOnline) {
    variant = 'offline'
    text = t('sync.offline')
  } else if (status === 'syncing') {
    variant = 'syncing'
    text = t('sync.syncing')
    showSpinner = true
  } else if (status === 'error') {
    variant = 'error'
    text = t('sync.error')
  } else if (isStale) {
    variant = 'stale'
    text = t('sync.stale', { when: formatRelativeTime(lastSyncAt) })
  }

  return (
    <div className={`syncbar is-${variant}`} role="status">
      {showSpinner ? (
        <span className="syncbar-spinner" aria-hidden="true" />
      ) : (
        <span className="syncbar-dot" aria-hidden="true" />
      )}
      <span>{text}</span>
    </div>
  )
}
