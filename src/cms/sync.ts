import type {
  EvacuationSite,
  GuideArticle,
  ChecklistItem,
  EmergencyContact,
  AreaAnnotation,
} from '../types'
import {
  saveEvacuationSites,
  saveGuideArticles,
  saveChecklistItems,
  saveEmergencyContacts,
  saveAreaAnnotations,
  markSynced,
  isStale,
} from '../db/idb'

// ─── Config (replace with your Re:Earth CMS details) ──────────────────────────

const CMS_BASE = import.meta.env.VITE_CMS_BASE_URL   // e.g. https://cms.example.com
const CMS_WS   = import.meta.env.VITE_CMS_WORKSPACE  // workspace alias
const CMS_PROJ = import.meta.env.VITE_CMS_PROJECT     // project alias

function cmsUrl(model: string) {
  return `${CMS_BASE}/api/p/${CMS_WS}/${CMS_PROJ}/${model}`
}

// ─── Paginated fetch — handles Re:Earth CMS offset pagination ─────────────────

async function fetchAllPages<T>(model: string): Promise<T[]> {
  const results: T[] = []
  let page = 1
  const limit = 100

  while (true) {
    const url = `${cmsUrl(model)}?page=${page}&limit=${limit}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`CMS fetch failed: ${model} page ${page} → ${res.status}`)
    const data = await res.json()
    // Re:Earth CMS public API response shape: { items: [...], totalCount: N }
    const items: T[] = data.items ?? []
    results.push(...items)
    if (results.length >= (data.totalCount ?? 0) || items.length < limit) break
    page++
  }

  return results
}

// ─── Field extractors — map CMS public API item fields to typed objects ────────
// Re:Earth CMS public API returns fields as a flat key→value map on each item.

function extractEvacuationSite(raw: Record<string, unknown>): EvacuationSite {
  return {
    id:             raw.id as string,
    name:           raw.name as string,
    name_en:        raw.name_en as string | undefined,
    location:       raw.location as EvacuationSite['location'],
    address:        raw.address as string,
    capacity:       Number(raw.capacity ?? 0),
    disaster_types: (raw.disaster_types as string[] | undefined) ?? [],
    accessible:     Boolean(raw.accessible),
    accepts_pets:   Boolean(raw.accepts_pets),
    notes:          raw.notes as string | undefined,
    photo:          raw.photo as string | undefined,
    source_id:      raw.source_id as string | undefined,
    verified_at:    raw.verified_at as string | undefined,
  }
}

function extractGuideArticle(raw: Record<string, unknown>): GuideArticle {
  return {
    id:           raw.id as string,
    title:        raw.title as string,
    title_en:     raw.title_en as string | undefined,
    disaster_type: raw.disaster_type as GuideArticle['disaster_type'],
    phase:         raw.phase as GuideArticle['phase'],
    priority:      Number(raw.priority ?? 0),
    body:          raw.body as string,
    body_en:       raw.body_en as string | undefined,
    summary:       raw.summary as string,
    is_critical:   Boolean(raw.is_critical),
    icon_key:      (raw.icon_key as string) ?? 'default',
  }
}

function extractChecklistItem(raw: Record<string, unknown>): ChecklistItem {
  return {
    id:               raw.id as string,
    label:            raw.label as string,
    label_en:         raw.label_en as string | undefined,
    category:         raw.category as ChecklistItem['category'],
    priority:         Number(raw.priority ?? 0),
    detail:           raw.detail as string,
    detail_en:        raw.detail_en as string | undefined,
    quantity_hint:    raw.quantity_hint as string | undefined,
    coastal_only:     Boolean(raw.coastal_only),
    cold_region_only: Boolean(raw.cold_region_only),
    image:            raw.image as string | undefined,
  }
}

function extractEmergencyContact(raw: Record<string, unknown>): EmergencyContact {
  return {
    id:              raw.id as string,
    label:           raw.label as string,
    label_en:        raw.label_en as string | undefined,
    number:          raw.number as string,
    type:            raw.type as EmergencyContact['type'],
    scope:           raw.scope as EmergencyContact['scope'],
    available_hours: raw.available_hours as string,
    url:             raw.url as string | undefined,
    priority:        Number(raw.priority ?? 0),
    notes:           raw.notes as string | undefined,
  }
}

function extractAreaAnnotation(raw: Record<string, unknown>): AreaAnnotation {
  return {
    id:                  raw.id as string,
    title:               raw.title as string,
    body:                raw.body as string,
    location:            raw.location as AreaAnnotation['location'],
    zone:                raw.zone as AreaAnnotation['zone'] | undefined,
    annotation_type:     raw.annotation_type as AreaAnnotation['annotation_type'],
    disaster_relevance:  (raw.disaster_relevance as string[] | undefined) ?? [],
    severity:            raw.severity as AreaAnnotation['severity'],
    source:              raw.source as string | undefined,
    valid_until:         raw.valid_until as string | undefined,
  }
}

// ─── Per-model sync functions ──────────────────────────────────────────────────

export async function syncEvacuationSites(force = false) {
  if (!force && !(await isStale('cms:evacuation_site'))) return
  const raw = await fetchAllPages<Record<string, unknown>>('evacuation_site')
  await saveEvacuationSites(raw.map(extractEvacuationSite))
  await markSynced('cms:evacuation_site')
}

export async function syncGuideArticles(force = false) {
  if (!force && !(await isStale('cms:guide_article'))) return
  const raw = await fetchAllPages<Record<string, unknown>>('guide_article')
  await saveGuideArticles(raw.map(extractGuideArticle))
  await markSynced('cms:guide_article')
}

export async function syncChecklistItems(force = false) {
  if (!force && !(await isStale('cms:checklist_item'))) return
  const raw = await fetchAllPages<Record<string, unknown>>('checklist_item')
  await saveChecklistItems(raw.map(extractChecklistItem))
  await markSynced('cms:checklist_item')
}

export async function syncEmergencyContacts(force = false) {
  if (!force && !(await isStale('cms:emergency_contact'))) return
  const raw = await fetchAllPages<Record<string, unknown>>('emergency_contact')
  await saveEmergencyContacts(raw.map(extractEmergencyContact))
  await markSynced('cms:emergency_contact')
}

export async function syncAreaAnnotations(force = false) {
  if (!force && !(await isStale('cms:area_annotation'))) return
  const raw = await fetchAllPages<Record<string, unknown>>('area_annotation')
  await saveAreaAnnotations(raw.map(extractAreaAnnotation))
  await markSynced('cms:area_annotation')
}

// ─── Full sync — runs all models, best-effort (one failure won't block others) ─

export type SyncResult = {
  model: string
  ok: boolean
  error?: string
}

export async function syncAll(force = false): Promise<SyncResult[]> {
  const jobs: Array<{ model: string; fn: () => Promise<void> }> = [
    { model: 'evacuation_site', fn: () => syncEvacuationSites(force) },
    { model: 'guide_article',   fn: () => syncGuideArticles(force) },
    { model: 'checklist_item',  fn: () => syncChecklistItems(force) },
    { model: 'emergency_contact', fn: () => syncEmergencyContacts(force) },
    { model: 'area_annotation', fn: () => syncAreaAnnotations(force) },
  ]

  const results = await Promise.allSettled(jobs.map(j => j.fn()))
  return results.map((r, i) => ({
    model: jobs[i].model,
    ok: r.status === 'fulfilled',
    error: r.status === 'rejected' ? String(r.reason) : undefined,
  }))
}
