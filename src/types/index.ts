// ─── Re:Earth CMS model types ─────────────────────────────────────────────────

export interface GeoPoint {
  type: 'Point'
  coordinates: [number, number] // [lng, lat]
}

export interface GeoPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

export interface EvacuationSite {
  id: string
  name: string
  name_en?: string
  location: GeoPoint
  address: string
  capacity: number
  disaster_types: DisasterType[]
  accessible: boolean
  accepts_pets: boolean
  notes?: string
  photo?: string // asset URL
  source_id?: string
  verified_at?: string
}

export interface GuideArticle {
  id: string
  title: string
  title_en?: string
  disaster_type: DisasterType
  phase: 'before' | 'during' | 'after'
  priority: number
  body: string       // Markdown
  body_en?: string
  summary: string
  is_critical: boolean
  icon_key: string
}

export interface ChecklistItem {
  id: string
  label: string
  label_en?: string
  category: ChecklistCategory
  priority: number
  detail: string
  detail_en?: string
  quantity_hint?: string
  coastal_only: boolean
  cold_region_only: boolean
  image?: string // asset URL
}

export interface EmergencyContact {
  id: string
  label: string
  label_en?: string
  number: string
  type: ContactType
  scope: 'national' | 'city'
  available_hours: string
  url?: string
  priority: number
  notes?: string
}

export interface AreaAnnotation {
  id: string
  title: string
  body: string
  location: GeoPoint
  zone?: GeoPolygon
  annotation_type: 'warning' | 'tip' | 'facility_note' | 'route_note' | 'historical'
  disaster_relevance: DisasterType[]
  severity: 'info' | 'caution' | 'danger'
  source?: string
  valid_until?: string
}

// ─── Domain enums ──────────────────────────────────────────────────────────────

export type DisasterType =
  | 'earthquake'
  | 'flood'
  | 'tsunami'
  | 'fire'
  | 'landslide'
  | 'storm_surge'
  | 'typhoon'
  | 'heatwave'

export type ChecklistCategory =
  | 'water_food'
  | 'medical'
  | 'tools'
  | 'documents'
  | 'plan'
  | 'communication'

export type ContactType =
  | 'police'
  | 'fire'
  | 'ambulance'
  | 'disaster_line'
  | 'river'
  | 'welfare'
  | 'hospital'
  | 'city_hall'

// ─── Gov API response types ────────────────────────────────────────────────────

export interface JmaAlert {
  areaCode: string
  areaName: string
  warnings: Array<{
    type: string         // e.g. "強風注意報"
    status: 'warning' | 'advisory' | 'clear'
    text?: string
  }>
  fetchedAt: number      // Date.now()
}

export interface JshisRisk {
  lat: number
  lng: number
  meshCode: string
  prob30yr: number       // probability 0–1 of intensity ≥5 in 30 years
  intensityClass: string // e.g. "X" = very high
  siteAmplification: number
  fetchedAt: number
}

export interface RiverLevel {
  stationId: string
  stationName: string
  riverName: string
  level: number          // metres
  alertLevel: number     // evacuation judgement water level
  dangerLevel: number
  status: 'normal' | 'caution' | 'alert' | 'danger'
  fetchedAt: number
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: unknown
    properties: Record<string, unknown> | null
  }>
}

export interface HazardZoneData {
  flood: GeoJSONFeatureCollection
  landslide: GeoJSONFeatureCollection
  tsunami: GeoJSONFeatureCollection
  fetchedAt: number
}

// ─── User / app state types ────────────────────────────────────────────────────

export interface UserSettings {
  homeLocation: { lat: number; lng: number } | null
  homeAddress?: string
  chosenEvacSiteId?: string
  language: 'ja' | 'en'
  theme?: 'light' | 'dark' | 'system'
  setupComplete: boolean
}

export interface ChecklistState {
  [itemId: string]: boolean  // true = checked
}

// ─── IDB store key map ─────────────────────────────────────────────────────────

export type IDBStoreKey =
  | 'cms:evacuation_site'
  | 'cms:guide_article'
  | 'cms:checklist_item'
  | 'cms:emergency_contact'
  | 'cms:area_annotation'
  | 'gov:jma_alerts'
  | 'gov:jshis_risk'
  | 'gov:river_levels'
  | 'gov:hazard_zones'
  | 'user:settings'
  | 'user:checklist_state'
  | 'sync:timestamps'
