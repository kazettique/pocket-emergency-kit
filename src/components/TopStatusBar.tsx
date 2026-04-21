import { useT } from '../i18n'
import type { SyncStatus } from '../hooks/useSyncEngine'
import { LanguageToggle } from './LanguageToggle'
import { ThemeToggle } from './ThemeToggle'
import { RefreshButton } from './RefreshButton'

interface TopStatusBarProps {
  isOnline: boolean
  lastSyncAt: Date | null
  status: SyncStatus
  onRefresh: () => void
}

export function TopStatusBar({ isOnline, lastSyncAt, status, onRefresh }: TopStatusBarProps) {
  const { t, formatRelativeTime } = useT()

  const text = !isOnline
    ? t('status.offline')
    : status === 'syncing'
      ? `${t('status.online')} — ${t('sync.syncing')}`
      : `${t('status.online')} — ${t('status.lastSync', { when: formatRelativeTime(lastSyncAt) })}`

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <span className="topbar-status">
          <span className={`topbar-dot${isOnline ? '' : ' offline'}`} aria-hidden="true" />
          <span className="topbar-text">{text}</span>
        </span>
        <span className="topbar-toggles">
          <RefreshButton status={status} isOnline={isOnline} onRefresh={onRefresh} />
          <LanguageToggle />
          <ThemeToggle />
        </span>
      </div>
    </div>
  )
}
