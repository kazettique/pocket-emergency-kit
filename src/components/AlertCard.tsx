import { useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import './components.css'

export type AlertVariant = 'warn' | 'ok' | 'danger'

interface AlertCardProps {
  variant: AlertVariant
  title: string
  body: string
  source?: string
  updatedAt?: number | Date | null
  /** Additional content revealed when the card is expanded. If omitted, the card renders non-collapsible. */
  children?: ReactNode
  /** Initial expanded state when collapsible. Defaults to false. */
  defaultExpanded?: boolean
}

export function AlertCard({
  variant,
  title,
  body,
  source,
  updatedAt,
  children,
  defaultExpanded = false,
}: AlertCardProps) {
  const { formatRelativeTime } = useT()
  const [expanded, setExpanded] = useState(defaultExpanded)

  const hasMeta = Boolean(source || updatedAt)
  const metaText = [source, updatedAt ? formatRelativeTime(updatedAt) : null]
    .filter(Boolean)
    .join(' · ')

  const expandable = children !== undefined

  const header = (
    <div className="alert-card-header-inner">
      <div className="alert-card-title">{title}</div>
      <div className="alert-card-body">{body}</div>
      {hasMeta ? <div className="alert-card-meta">{metaText}</div> : null}
    </div>
  )

  return (
    <div className={`alert-card is-${variant}${expanded ? ' is-expanded' : ''}`}>
      {expandable ? (
        <button
          type="button"
          className="alert-card-header"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {header}
          <svg
            className="alert-card-chevron"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            aria-hidden="true"
          >
            <path d="M4 2l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      ) : (
        <div className="alert-card-header is-static">{header}</div>
      )}
      {expandable && expanded ? <div className="alert-card-extra">{children}</div> : null}
    </div>
  )
}
