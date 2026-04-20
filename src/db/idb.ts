import { openDB, type IDBPDatabase } from 'idb'
import type {
  EvacuationSite,
  GuideArticle,
  ChecklistItem,
  EmergencyContact,
  AreaAnnotation,
  JmaAlert,
  JshisRisk,
  RiverLevel,
  HazardZoneData,
  UserSettings,
  ChecklistState,
} from '../types'

// ─── Schema ────────────────────────────────────────────────────────────────────

interface SyncTimestamps {
  [key: string]: number
}

interface SaigaiDB {
  // CMS content stores — keyed by CMS item ID
  evacuation_sites: {
    key: string
    value: EvacuationSite
    indexes: { 'by-disaster-type': string }
  }
  guide_articles: {
    key: string
    value: GuideArticle
    indexes: { 'by-disaster-type': string; 'by-phase': string }
  }
  checklist_items: {
    key: string
    value: ChecklistItem
    indexes: { 'by-category': string }
  }
  emergency_contacts: {
    key: string
    value: EmergencyContact
    indexes: { 'by-scope': string }
  }
  area_annotations: {
    key: string
    value: AreaAnnotation
    indexes: { 'by-severity': string }
  }
  // Gov API cache — single-row stores keyed by a string
  gov_cache: {
    key: string
    value: JmaAlert | JshisRisk | RiverLevel[] | HazardZoneData
  }
  // User state
  user_settings: {
    key: 'settings'
    value: UserSettings
  }
  checklist_state: {
    key: 'state'
    value: ChecklistState
  }
  sync_timestamps: {
    key: 'timestamps'
    value: SyncTimestamps
  }
}

// ─── DB singleton ──────────────────────────────────────────────────────────────

let _db: IDBPDatabase<SaigaiDB> | null = null

export async function getDB(): Promise<IDBPDatabase<SaigaiDB>> {
  if (_db) return _db
  _db = await openDB<SaigaiDB>('saigai-pwa', 1, {
    upgrade(db) {
      // CMS stores
      const evac = db.createObjectStore('evacuation_sites', { keyPath: 'id' })
      evac.createIndex('by-disaster-type', 'disaster_types', { multiEntry: true })

      const guide = db.createObjectStore('guide_articles', { keyPath: 'id' })
      guide.createIndex('by-disaster-type', 'disaster_type')
      guide.createIndex('by-phase', 'phase')

      const checklist = db.createObjectStore('checklist_items', { keyPath: 'id' })
      checklist.createIndex('by-category', 'category')

      const contacts = db.createObjectStore('emergency_contacts', { keyPath: 'id' })
      contacts.createIndex('by-scope', 'scope')

      const annotations = db.createObjectStore('area_annotations', { keyPath: 'id' })
      annotations.createIndex('by-severity', 'severity')

      // Gov + user stores
      db.createObjectStore('gov_cache')
      db.createObjectStore('user_settings')
      db.createObjectStore('checklist_state')
      db.createObjectStore('sync_timestamps')
    },
  })
  return _db
}

// ─── CMS content helpers ───────────────────────────────────────────────────────

export async function saveEvacuationSites(items: EvacuationSite[]) {
  const db = await getDB()
  const tx = db.transaction('evacuation_sites', 'readwrite')
  await Promise.all([...items.map(i => tx.store.put(i)), tx.done])
}

export async function getAllEvacuationSites(): Promise<EvacuationSite[]> {
  return (await getDB()).getAll('evacuation_sites')
}

export async function saveGuideArticles(items: GuideArticle[]) {
  const db = await getDB()
  const tx = db.transaction('guide_articles', 'readwrite')
  await Promise.all([...items.map(i => tx.store.put(i)), tx.done])
}

export async function getGuideArticlesByType(type: string): Promise<GuideArticle[]> {
  return (await getDB()).getAllFromIndex('guide_articles', 'by-disaster-type', type)
}

export async function getAllGuideArticles(): Promise<GuideArticle[]> {
  return (await getDB()).getAll('guide_articles')
}

export async function saveChecklistItems(items: ChecklistItem[]) {
  const db = await getDB()
  const tx = db.transaction('checklist_items', 'readwrite')
  await Promise.all([...items.map(i => tx.store.put(i)), tx.done])
}

export async function getAllChecklistItems(): Promise<ChecklistItem[]> {
  return (await getDB()).getAll('checklist_items')
}

export async function saveEmergencyContacts(items: EmergencyContact[]) {
  const db = await getDB()
  const tx = db.transaction('emergency_contacts', 'readwrite')
  await Promise.all([...items.map(i => tx.store.put(i)), tx.done])
}

export async function getAllEmergencyContacts(): Promise<EmergencyContact[]> {
  return (await getDB()).getAll('emergency_contacts')
}

export async function saveAreaAnnotations(items: AreaAnnotation[]) {
  const db = await getDB()
  const tx = db.transaction('area_annotations', 'readwrite')
  await Promise.all([...items.map(i => tx.store.put(i)), tx.done])
}

export async function getAllAreaAnnotations(): Promise<AreaAnnotation[]> {
  return (await getDB()).getAll('area_annotations')
}

// ─── Gov API cache helpers ─────────────────────────────────────────────────────

export async function saveGovCache(key: string, value: unknown) {
  const db = await getDB()
  await db.put('gov_cache', value as JmaAlert, key)
}

export async function getGovCache<T>(key: string): Promise<T | undefined> {
  return (await getDB()).get('gov_cache', key) as Promise<T | undefined>
}

// ─── User state helpers ────────────────────────────────────────────────────────

export async function getUserSettings(): Promise<UserSettings | undefined> {
  return (await getDB()).get('user_settings', 'settings')
}

export async function saveUserSettings(settings: UserSettings) {
  await (await getDB()).put('user_settings', settings, 'settings')
}

export async function getChecklistState(): Promise<ChecklistState> {
  const db = await getDB()
  return (await db.get('checklist_state', 'state')) ?? {}
}

export async function saveChecklistState(state: ChecklistState) {
  await (await getDB()).put('checklist_state', state, 'state')
}

// ─── Sync timestamp helpers ────────────────────────────────────────────────────

const STALE_THRESHOLD_MS = 6 * 60 * 60 * 1000 // 6 hours

export async function getSyncTimestamps(): Promise<SyncTimestamps> {
  const db = await getDB()
  return (await db.get('sync_timestamps', 'timestamps')) ?? {}
}

export async function markSynced(key: string) {
  const db = await getDB()
  const current = (await db.get('sync_timestamps', 'timestamps')) ?? {}
  await db.put('sync_timestamps', { ...current, [key]: Date.now() }, 'timestamps')
}

export async function isStale(key: string): Promise<boolean> {
  const ts = await getSyncTimestamps()
  if (!ts[key]) return true
  return Date.now() - ts[key] > STALE_THRESHOLD_MS
}

export async function getLastSyncedAt(key: string): Promise<Date | null> {
  const ts = await getSyncTimestamps()
  return ts[key] ? new Date(ts[key]) : null
}
