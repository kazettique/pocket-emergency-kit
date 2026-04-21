// JMA warning/advisory code → display name.
// Source: https://www.jma.go.jp/jma/kishou/know/bosai/warning_kind.html
// Codes 02-09 are 警報 (warning), 10-27 are 注意報 (advisory), 32+ are
// 特別警報 (emergency warning).

export const JMA_WARNING_NAMES_JA: Record<string, string> = {
  '02': '暴風警報',
  '03': '大雨警報',
  '04': '洪水警報',
  '05': '暴風雪警報',
  '06': '大雪警報',
  '07': '波浪警報',
  '08': '高潮警報',
  '10': '大雨注意報',
  '12': '大雪注意報',
  '13': '風雪注意報',
  '14': '雷注意報',
  '15': '強風注意報',
  '16': '波浪注意報',
  '17': '融雪注意報',
  '18': '洪水注意報',
  '19': '高潮注意報',
  '20': '濃霧注意報',
  '21': '乾燥注意報',
  '22': 'なだれ注意報',
  '23': '低温注意報',
  '24': '霜注意報',
  '25': '着氷注意報',
  '26': '着雪注意報',
  '27': 'その他の注意報',
  '32': '暴風特別警報',
  '33': '大雨特別警報',
  '35': '暴風雪特別警報',
  '36': '大雪特別警報',
  '37': '波浪特別警報',
  '38': '高潮特別警報',
}

export const JMA_WARNING_NAMES_EN: Record<string, string> = {
  '02': 'Storm warning',
  '03': 'Heavy rain warning',
  '04': 'Flood warning',
  '05': 'Snow storm warning',
  '06': 'Heavy snow warning',
  '07': 'High waves warning',
  '08': 'Storm surge warning',
  '10': 'Heavy rain advisory',
  '12': 'Heavy snow advisory',
  '13': 'Snow-and-wind advisory',
  '14': 'Thunderstorm advisory',
  '15': 'Strong wind advisory',
  '16': 'High waves advisory',
  '17': 'Snowmelt advisory',
  '18': 'Flood advisory',
  '19': 'Storm surge advisory',
  '20': 'Dense fog advisory',
  '21': 'Dry air advisory',
  '22': 'Avalanche advisory',
  '23': 'Low temperature advisory',
  '24': 'Frost advisory',
  '25': 'Icing advisory',
  '26': 'Snow-sticking advisory',
  '27': 'Other advisory',
  '32': 'Storm emergency warning',
  '33': 'Heavy rain emergency warning',
  '35': 'Snow storm emergency warning',
  '36': 'Heavy snow emergency warning',
  '37': 'High waves emergency warning',
  '38': 'Storm surge emergency warning',
}

export function warningName(code: string, lang: 'ja' | 'en'): string {
  const table = lang === 'en' ? JMA_WARNING_NAMES_EN : JMA_WARNING_NAMES_JA
  return table[code] ?? `#${code}`
}

// JMA prefecture-level sub-region codes for Tokyo (area code 130000).
// Fetchable in full from https://www.jma.go.jp/bosai/common/const/area.json but
// hardcoded here for the Tokyo-only POC.

export const JMA_AREA_NAMES_JA: Record<string, string> = {
  '130010': '東京地方',
  '130020': '伊豆諸島北部',
  '130030': '伊豆諸島南部',
  '130040': '小笠原諸島',
}

export const JMA_AREA_NAMES_EN: Record<string, string> = {
  '130010': 'Tokyo metropolitan',
  '130020': 'Northern Izu Islands',
  '130030': 'Southern Izu Islands',
  '130040': 'Ogasawara Islands',
}

export function areaName(code: string, lang: 'ja' | 'en'): string {
  const table = lang === 'en' ? JMA_AREA_NAMES_EN : JMA_AREA_NAMES_JA
  return table[code] ?? code
}

export function severityFromCode(code: string): 'emergency' | 'warning' | 'advisory' {
  const n = parseInt(code, 10)
  if (Number.isFinite(n) && n >= 32) return 'emergency'
  if (Number.isFinite(n) && n < 10) return 'warning'
  return 'advisory'
}
