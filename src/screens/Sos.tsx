import { useEffect, useState } from 'react'
import type { EmergencyContact, ContactType } from '../types'
import { getAllEmergencyContacts } from '../db/idb'
import { useT } from '../i18n'
import {
  EMERGENCY_PHONES,
  INFO_LINKS,
  telUri,
  type ContactBadge,
  type NationalContact,
} from '../data/nationalContacts'
import './Sos.css'

const CITY_BADGE_BY_TYPE: Record<ContactType, ContactBadge> = {
  police: 'danger',
  fire: 'danger',
  ambulance: 'danger',
  disaster_line: 'info',
  river: 'warn',
  welfare: 'ok',
  hospital: 'ok',
  city_hall: 'info',
}

export default function Sos() {
  const { t, lang, localize } = useT()
  const [cityContacts, setCityContacts] = useState<EmergencyContact[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const all = await getAllEmergencyContacts()
      if (cancelled) return
      setCityContacts(
        all
          .filter((c) => c.scope === 'city')
          .sort((a, b) => b.priority - a.priority),
      )
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="screen sos-screen">
      <h1 className="sos-title">{t('sos.title')}</h1>

      <div className="sos-section">
        <div className="sos-section-head">{t('sos.sectionEmergency')}</div>
        {EMERGENCY_PHONES.map((c) => (
          <NationalRow key={c.id} contact={c} lang={lang} ariaLabel={t('sos.tapToCall')} />
        ))}
      </div>

      {cityContacts.length > 0 ? (
        <div className="sos-section">
          <div className="sos-section-head">{t('sos.sectionCity')}</div>
          {cityContacts.map((c) => (
            <a
              key={c.id}
              className="sos-row"
              href={telUri(c.number)}
              aria-label={`${localize(c, 'label') || c.label}: ${t('sos.tapToCall')}`}
            >
              <span className={`sos-badge is-${CITY_BADGE_BY_TYPE[c.type]}`}>{c.number}</span>
              <div className="sos-body">
                <div className="sos-body-label">{localize(c, 'label') || c.label}</div>
                <div className="sos-body-meta">{c.available_hours}</div>
              </div>
              <span className="sos-chevron" aria-hidden="true">›</span>
            </a>
          ))}
        </div>
      ) : null}

      <div className="sos-section">
        <div className="sos-section-head">{t('sos.sectionInfo')}</div>
        {INFO_LINKS.map((c) => (
          <NationalRow key={c.id} contact={c} lang={lang} ariaLabel={t('sos.tapToVisit')} />
        ))}
      </div>
    </section>
  )
}

function NationalRow({
  contact,
  lang,
  ariaLabel,
}: {
  contact: NationalContact
  lang: 'ja' | 'en'
  ariaLabel: string
}) {
  const label = lang === 'en' ? contact.label_en : contact.label_ja
  const meta =
    contact.kind === 'phone'
      ? lang === 'en'
        ? contact.hours_en
        : contact.hours_ja
      : lang === 'en'
        ? contact.meta_en
        : contact.meta_ja

  const href = contact.kind === 'phone' ? telUri(contact.number) : contact.url
  const isExternal = contact.kind === 'link'

  return (
    <a
      className="sos-row"
      href={href}
      aria-label={`${label}: ${ariaLabel}`}
      {...(isExternal ? { target: '_blank', rel: 'noopener' } : {})}
    >
      <span className={`sos-badge is-${contact.badge}`}>{contact.display}</span>
      <div className="sos-body">
        <div className="sos-body-label">{label}</div>
        <div className="sos-body-meta">{meta}</div>
      </div>
      <span className="sos-chevron" aria-hidden="true">{isExternal ? '↗' : '›'}</span>
    </a>
  )
}
