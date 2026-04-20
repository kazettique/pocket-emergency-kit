export interface Ward {
  id: string
  name_ja: string
  name_en: string
  lat: number
  lng: number
}

export const TOKYO_23_WARDS: readonly Ward[] = [
  { id: 'chiyoda',   name_ja: '千代田区', name_en: 'Chiyoda',   lat: 35.6940, lng: 139.7536 },
  { id: 'chuo',      name_ja: '中央区',   name_en: 'Chuo',      lat: 35.6706, lng: 139.7720 },
  { id: 'minato',    name_ja: '港区',     name_en: 'Minato',    lat: 35.6580, lng: 139.7516 },
  { id: 'shinjuku',  name_ja: '新宿区',   name_en: 'Shinjuku',  lat: 35.6938, lng: 139.7036 },
  { id: 'bunkyo',    name_ja: '文京区',   name_en: 'Bunkyo',    lat: 35.7080, lng: 139.7522 },
  { id: 'taito',     name_ja: '台東区',   name_en: 'Taito',     lat: 35.7127, lng: 139.7800 },
  { id: 'sumida',    name_ja: '墨田区',   name_en: 'Sumida',    lat: 35.7106, lng: 139.8013 },
  { id: 'koto',      name_ja: '江東区',   name_en: 'Koto',      lat: 35.6730, lng: 139.8170 },
  { id: 'shinagawa', name_ja: '品川区',   name_en: 'Shinagawa', lat: 35.6093, lng: 139.7302 },
  { id: 'meguro',    name_ja: '目黒区',   name_en: 'Meguro',    lat: 35.6413, lng: 139.6983 },
  { id: 'ota',       name_ja: '大田区',   name_en: 'Ota',       lat: 35.5614, lng: 139.7161 },
  { id: 'setagaya',  name_ja: '世田谷区', name_en: 'Setagaya',  lat: 35.6465, lng: 139.6533 },
  { id: 'shibuya',   name_ja: '渋谷区',   name_en: 'Shibuya',   lat: 35.6639, lng: 139.6980 },
  { id: 'nakano',    name_ja: '中野区',   name_en: 'Nakano',    lat: 35.7073, lng: 139.6636 },
  { id: 'suginami',  name_ja: '杉並区',   name_en: 'Suginami',  lat: 35.6995, lng: 139.6364 },
  { id: 'toshima',   name_ja: '豊島区',   name_en: 'Toshima',   lat: 35.7261, lng: 139.7156 },
  { id: 'kita',      name_ja: '北区',     name_en: 'Kita',      lat: 35.7528, lng: 139.7336 },
  { id: 'arakawa',   name_ja: '荒川区',   name_en: 'Arakawa',   lat: 35.7361, lng: 139.7831 },
  { id: 'itabashi',  name_ja: '板橋区',   name_en: 'Itabashi',  lat: 35.7512, lng: 139.7093 },
  { id: 'nerima',    name_ja: '練馬区',   name_en: 'Nerima',    lat: 35.7356, lng: 139.6517 },
  { id: 'adachi',    name_ja: '足立区',   name_en: 'Adachi',    lat: 35.7750, lng: 139.8046 },
  { id: 'katsushika', name_ja: '葛飾区',  name_en: 'Katsushika', lat: 35.7434, lng: 139.8473 },
  { id: 'edogawa',   name_ja: '江戸川区', name_en: 'Edogawa',   lat: 35.7067, lng: 139.8683 },
]
