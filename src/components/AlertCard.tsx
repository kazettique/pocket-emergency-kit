import { useT } from '../i18n'
import './components.css'

export type AlertVariant = 'warn' | 'ok' | 'danger'

interface AlertCardProps {
  variant: AlertVariant
  title: string
  body: string
  source?: string
  updatedAt?: number | Date | null
}

export function AlertCard({ variant, title, body, source, updatedAt }: AlertCardProps) {
  const { formatRelativeTime } = useT()

  const hasMeta = Boolean(source || updatedAt)
  const metaText = [source, updatedAt ? formatRelativeTime(updatedAt) : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className={`alert-card is-${variant}`}>
      <div className="alert-card-title">{title}</div>
      <div className="alert-card-body">{body}</div>
      {hasMeta ? <div className="alert-card-meta">{metaText}</div> : null}
    </div>
  )
}
