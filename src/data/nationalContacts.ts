export type ContactBadge = 'danger' | 'warn' | 'info' | 'ok'

export interface NationalPhone {
  id: string
  kind: 'phone'
  number: string
  display: string
  label_ja: string
  label_en: string
  hours_ja: string
  hours_en: string
  badge: ContactBadge
}

export interface NationalLink {
  id: string
  kind: 'link'
  url: string
  display: string
  label_ja: string
  label_en: string
  meta_ja: string
  meta_en: string
  badge: ContactBadge
}

export type NationalContact = NationalPhone | NationalLink

export const EMERGENCY_PHONES: readonly NationalPhone[] = [
  {
    id: 'police-110',
    kind: 'phone',
    number: '110',
    display: '110',
    label_ja: '警察',
    label_en: 'Police',
    hours_ja: '24時間',
    hours_en: '24 hours',
    badge: 'danger',
  },
  {
    id: 'fire-ambulance-119',
    kind: 'phone',
    number: '119',
    display: '119',
    label_ja: '消防・救急',
    label_en: 'Fire / Ambulance',
    hours_ja: '24時間',
    hours_en: '24 hours',
    badge: 'danger',
  },
  {
    id: 'ambulance-advice-7119',
    kind: 'phone',
    number: '#7119',
    display: '#7119',
    label_ja: '救急安心センター',
    label_en: 'Ambulance advice line',
    hours_ja: '救急車を呼ぶか迷ったら',
    hours_en: 'Should I call an ambulance?',
    badge: 'warn',
  },
  {
    id: 'disaster-dial-171',
    kind: 'phone',
    number: '171',
    display: '171',
    label_ja: '災害用伝言ダイヤル',
    label_en: 'Disaster message dial',
    hours_ja: '災害発生時のみ',
    hours_en: 'During disasters only',
    badge: 'info',
  },
]

export const INFO_LINKS: readonly NationalLink[] = [
  {
    id: 'nhk-saigai',
    kind: 'link',
    url: 'https://www.nhk.or.jp/kishou-saigai/',
    display: 'NHK',
    label_ja: 'NHK緊急速報',
    label_en: 'NHK emergency broadcast',
    meta_ja: 'テレビ・ラジオ・Web',
    meta_en: 'TV / Radio / Web',
    badge: 'ok',
  },
]

/** `#` in `tel:` URIs must be percent-encoded to route through the dialer reliably. */
export function telUri(number: string): string {
  return `tel:${number.replace(/#/g, '%23')}`
}
