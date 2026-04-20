export type Lang = 'ja' | 'en'

type Entry = { ja: string; en: string }

export const strings = {
  'app.title': { ja: '防災ポケット', en: 'Pocket Emergency Kit' },

  'tab.home': { ja: 'ホーム', en: 'Home' },
  'tab.map': { ja: 'マップ', en: 'Map' },
  'tab.kit': { ja: '備蓄', en: 'Kit' },
  'tab.guide': { ja: 'ガイド', en: 'Guide' },
  'tab.sos': { ja: 'SOS', en: 'SOS' },

  'status.online': { ja: 'オンライン', en: 'Online' },
  'status.offline': { ja: 'オフライン — キャッシュ表示中', en: 'Offline — showing cached data' },
  'status.lastSync': { ja: '最終同期 {when}', en: 'last sync {when}' },
  'status.neverSynced': { ja: '未同期', en: 'not synced yet' },

  'offlineBanner.text': {
    ja: 'オフライン中 — 保存済みのデータを表示しています',
    en: 'Offline — showing saved data',
  },

  'sync.cached': { ja: 'データ保存済み · オフラインで動作', en: 'Data cached · works offline' },
  'sync.syncing': { ja: '同期中…', en: 'Syncing…' },
  'sync.stale': { ja: '古いデータ · {when}更新', en: 'Stale · updated {when}' },
  'sync.offline': { ja: 'オフライン · 最新の保存データを表示', en: 'Offline · showing latest saved' },
  'sync.error': { ja: '同期エラー · 保存データを表示', en: 'Sync failed · showing saved data' },

  'home.title': { ja: '今日の状況', en: "Today's status" },
  'home.noWarnings': { ja: '現在発令中の警報・注意報はありません。', en: 'No active warnings or advisories.' },
  'home.jmaOk': { ja: '{area} — 警報なし', en: '{area} — all clear' },
  'home.jmaWarning': { ja: '警報 — {area}', en: 'Warning — {area}' },
  'home.jmaAdvisory': { ja: '注意報 — {area}', en: 'Advisory — {area}' },
  'home.source.jma': { ja: '気象庁', en: 'Japan Meteorological Agency' },
  'home.source.river': { ja: '水防災オープンデータ', en: 'MLIT Water Disaster Open Data' },
  'home.riverTitle': { ja: '河川水位 — {river}', en: 'River level — {river}' },
  'home.riverNormal': { ja: '水位 {level}m — 平常範囲内', en: 'Level {level}m — normal range' },
  'home.riverCaution': {
    ja: '水位 {level}m — 注意水位に接近',
    en: 'Level {level}m — approaching caution threshold',
  },
  'home.riverAlert': {
    ja: '水位 {level}m — 避難判断水位超過',
    en: 'Level {level}m — evacuation judgement level exceeded',
  },
  'home.riverDanger': {
    ja: '水位 {level}m — 氾濫危険水位',
    en: 'Level {level}m — flood danger level',
  },

  'stat.warnings': { ja: '発令中の警報', en: 'warnings active' },
  'stat.evacSites': { ja: '付近の避難場所', en: 'evac sites nearby' },
  'stat.kitComplete': { ja: '備蓄の進捗', en: 'kit complete' },
  'stat.lastQuake': { ja: '直近の地震', en: 'last quake' },

  'setup.cta.title': { ja: '自宅の位置を設定してください', en: 'Set your home location' },
  'setup.cta.body': {
    ja: '位置を設定すると、付近の避難場所と地震リスクを表示します。',
    en: 'Setting your location enables nearby evac sites and seismic risk.',
  },
  'setup.cta.button': { ja: '位置を設定', en: 'Set location' },

  'screen.comingSoon': { ja: '準備中です', en: 'Coming soon' },
  'screen.map.body': {
    ja: 'MapLibre GL による災害リスクマップ。',
    en: 'Hazard map powered by MapLibre GL.',
  },
  'screen.kit.body': { ja: '備蓄チェックリスト。', en: 'Emergency kit checklist.' },
  'screen.guide.body': {
    ja: '災害別・時期別の防災ガイド。',
    en: 'Survival guide by disaster type and phase.',
  },
  'screen.sos.body': { ja: '緊急連絡先と SOS。', en: 'Emergency contacts and SOS.' },

  'toggle.lang.aria': { ja: '言語を切り替え', en: 'Toggle language' },
  'toggle.theme.aria': { ja: 'テーマを切り替え', en: 'Toggle theme' },

  'time.justNow': { ja: 'たった今', en: 'just now' },
} satisfies Record<string, Entry>

export type StringKey = keyof typeof strings
