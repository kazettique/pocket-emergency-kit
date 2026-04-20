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
  'setup.cta.change.title': { ja: '自宅の位置', en: 'Home location' },
  'setup.cta.change.button': { ja: '変更', en: 'Change' },

  'setup.header.title': { ja: '自宅の位置を設定', en: 'Set home location' },
  'setup.header.back': { ja: '戻る', en: 'Back' },
  'setup.intro': {
    ja: '自宅の位置を設定すると、付近の避難場所・地震リスク・浸水想定を表示できます。位置情報はこの端末内にのみ保存されます。',
    en: "Setting your home location enables nearby evac sites, seismic risk, and flood projections. Location is stored only on this device.",
  },
  'setup.geo.title': { ja: '現在地を使用', en: 'Use current location' },
  'setup.geo.body': { ja: 'ブラウザの位置情報を使います。', en: "Uses your browser's location." },
  'setup.geo.button': { ja: '現在地を取得', en: 'Detect location' },
  'setup.geo.requesting': { ja: '位置情報を取得中…', en: 'Requesting location…' },
  'setup.geo.denied': {
    ja: '位置情報の利用が拒否されました。ブラウザの設定から許可してください。',
    en: 'Location permission denied. Enable it in your browser settings.',
  },
  'setup.geo.unavailable': {
    ja: '位置情報を取得できませんでした。区から選択してください。',
    en: 'Could not get your location. Please pick a ward instead.',
  },
  'setup.geo.timeout': {
    ja: 'タイムアウトしました。もう一度お試しください。',
    en: 'Request timed out. Please try again.',
  },
  'setup.wards.title': { ja: '23区から選ぶ', en: 'Pick a Tokyo ward' },
  'setup.wards.body': {
    ja: '大まかな位置で十分です。あとで変更できます。',
    en: 'Approximate is fine. You can change this later.',
  },
  'setup.wards.other': { ja: 'その他（23区外）', en: 'Other (outside 23 wards)' },
  'setup.preview.title': { ja: '設定する位置', en: 'Selected location' },
  'setup.preview.source.geo': { ja: '現在地から取得', en: 'from current location' },
  'setup.preview.source.ward': { ja: '{ward}を選択', en: 'Selected {ward}' },
  'setup.preview.source.other': { ja: '端末の位置情報', en: 'Device location' },
  'setup.save': { ja: '保存', en: 'Save' },
  'setup.saving': { ja: '保存中…', en: 'Saving…' },
  'setup.saveError': {
    ja: '保存に失敗しました。もう一度お試しください。',
    en: 'Save failed. Please try again.',
  },
  'setup.footer.note': {
    ja: '位置情報はホーム画面からいつでも変更できます。',
    en: 'You can change this anytime from the home screen.',
  },
  'setup.address.tokyoGeo': { ja: '東京都 (現在地)', en: 'Tokyo (current location)' },

  'map.nearestTitle': { ja: '近くの避難場所', en: 'Nearest evacuation sites' },
  'map.allSitesTitle': { ja: '避難場所', en: 'Evacuation sites' },
  'map.sitesEmpty': {
    ja: '避難場所データがまだ同期されていません。',
    en: 'Evacuation sites have not been synced yet.',
  },
  'map.siteCapacity': { ja: '収容 {n}人', en: 'Capacity {n}' },
  'map.siteAccessible': { ja: 'バリアフリー', en: 'Accessible' },
  'map.siteAcceptsPets': { ja: 'ペット可', en: 'Pets OK' },
  'map.siteDisasterTypes': { ja: '対応災害', en: 'Covers' },

  'disaster.earthquake': { ja: '地震', en: 'Earthquake' },
  'disaster.flood': { ja: '洪水', en: 'Flood' },
  'disaster.tsunami': { ja: '津波', en: 'Tsunami' },
  'disaster.fire': { ja: '火災', en: 'Fire' },
  'disaster.landslide': { ja: '土砂災害', en: 'Landslide' },
  'disaster.storm_surge': { ja: '高潮', en: 'Storm surge' },
  'disaster.typhoon': { ja: '台風', en: 'Typhoon' },
  'disaster.heatwave': { ja: '猛暑', en: 'Heatwave' },

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
