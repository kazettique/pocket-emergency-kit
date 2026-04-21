import { useT } from '../i18n'
import type { SyncStatus } from '../hooks/useSyncEngine'
import './components.css'

interface RefreshButtonProps {
  status: SyncStatus
  isOnline: boolean
  onRefresh: () => void
}

export function RefreshButton({ status, isOnline, onRefresh }: RefreshButtonProps) {
  const { t } = useT()
  const syncing = status === 'syncing'
  const disabled = syncing || !isOnline

  return (
    <button
      type="button"
      className={`toggle-btn refresh-btn${syncing ? ' is-spinning' : ''}`}
      aria-label={t('toggle.refresh.aria')}
      onClick={onRefresh}
      disabled={disabled}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path
          d="M12 7a5 5 0 1 1-1.46-3.54"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path d="M12 1.5v3h-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
