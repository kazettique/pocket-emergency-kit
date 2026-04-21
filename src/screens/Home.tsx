import { useEffect, useState } from "react";
import type {
  JmaAlert,
  JmaWarning,
  RiverLevel,
  UserSettings,
  ChecklistItem,
  ChecklistState,
  JshisRisk,
} from "../types";
import {
  getGovCache,
  getLastSyncedAt,
  isStale,
  getUserSettings,
  getAllEvacuationSites,
  getAllChecklistItems,
  getChecklistState,
} from "../db/idb";
import { useT } from "../i18n";
import type { StringKey } from "../i18n";
import type { SyncState } from "../hooks/useSyncEngine";
import { SyncBar } from "../components/SyncBar";
import { AlertCard, type AlertVariant } from "../components/AlertCard";
import { StatCard } from "../components/StatCard";
import { haversineDistance } from "../utils/geo";
import { warningName, areaName } from "../data/jmaCodes";
import "./Home.css";

const NEARBY_RADIUS_M = 2000;

function seismicColor(prob30yr: number): string {
  if (prob30yr >= 0.6) return "var(--c-danger)";
  if (prob30yr >= 0.3) return "var(--c-warn-border)";
  return "var(--c-ok)";
}

function jmaVariant(severity: JmaWarning["severity"], status: JmaWarning["status"]): AlertVariant {
  if (status === "cleared") return "ok";
  if (severity === "emergency") return "danger";
  return "warn";
}

const JMA_STATUS_KEY: Record<JmaWarning["status"], StringKey> = {
  issued: "home.jmaStatusIssued",
  continuing: "home.jmaStatusContinuing",
  cleared: "home.jmaStatusCleared",
};

const JMA_SEVERITY_KEY: Record<JmaWarning["severity"], StringKey> = {
  emergency: "home.jmaSeverityEmergency",
  warning: "home.jmaSeverityWarning",
  advisory: "home.jmaSeverityAdvisory",
};

interface HomeData {
  jma: JmaAlert | null;
  rivers: RiverLevel[];
  settings: UserSettings | null;
  evacSiteCount: number;
  checklistItems: ChecklistItem[];
  checklistState: ChecklistState;
  seismicRisk: JshisRisk | null;
  lastSyncAt: Date | null;
  jmaIsStale: boolean;
}

const EMPTY: HomeData = {
  jma: null,
  rivers: [],
  settings: null,
  evacSiteCount: 0,
  checklistItems: [],
  checklistState: {},
  seismicRisk: null,
  lastSyncAt: null,
  jmaIsStale: true,
};

function riverVariant(status: RiverLevel["status"]): AlertVariant {
  if (status === "danger" || status === "alert") return "danger";
  if (status === "caution") return "warn";
  return "ok";
}

function kitPercent(items: ChecklistItem[], state: ChecklistState): number {
  if (items.length === 0) return 0;
  const done = items.reduce((n, item) => (state[item.id] ? n + 1 : n), 0);
  return Math.round((done / items.length) * 100);
}

export default function Home({ sync, onOpenSetup }: { sync: SyncState; onOpenSetup: () => void }) {
  const { t, lang } = useT();
  const [data, setData] = useState<HomeData>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [jma, rivers, settings, sites, checklistItems, checklistState, seismicRisk, lastSyncAt, jmaIsStale] =
        await Promise.all([
          getGovCache<JmaAlert>("jma:alerts"),
          getGovCache<RiverLevel[]>("mlit:river_levels"),
          getUserSettings(),
          getAllEvacuationSites(),
          getAllChecklistItems(),
          getChecklistState(),
          getGovCache<JshisRisk>("jshis:risk"),
          getLastSyncedAt("gov:jma"),
          isStale("gov:jma"),
        ]);
      if (cancelled) return;
      const home = settings?.homeLocation ?? null;
      const evacSiteCount = home
        ? sites.filter(
            (s) =>
              haversineDistance(home, {
                lat: s.location.coordinates[1],
                lng: s.location.coordinates[0],
              }) <= NEARBY_RADIUS_M,
          ).length
        : sites.length;
      setData({
        jma: jma ?? null,
        rivers: rivers ?? [],
        settings: settings ?? null,
        evacSiteCount,
        checklistItems,
        checklistState,
        seismicRisk: seismicRisk ?? null,
        lastSyncAt,
        jmaIsStale,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [sync.status, sync.lastSyncAt]);

  const { jma, rivers, settings, evacSiteCount, checklistItems, checklistState, seismicRisk, lastSyncAt, jmaIsStale } =
    data;
  const warningsCount = jma?.warnings.length ?? 0;
  const kitPct = kitPercent(checklistItems, checklistState);
  const jmaAreaName = jma?.areaName ?? (lang === "en" ? "Tokyo" : "東京都");

  return (
    <section className="home screen">
      <SyncBar status={sync.status} isOnline={sync.isOnline} isStale={jmaIsStale} lastSyncAt={lastSyncAt} />

      {!settings?.homeLocation ? (
        <div className="home-cta">
          <div className="home-cta-title">{t("setup.cta.title")}</div>
          <p className="home-cta-body">{t("setup.cta.body")}</p>
          <button type="button" className="home-cta-button" onClick={onOpenSetup}>
            {t("setup.cta.button")}
          </button>
        </div>
      ) : (
        <div className="home-cta is-compact">
          <div className="home-cta-compact-inner">
            <span className="home-cta-compact-label">{t("setup.cta.change.title")}</span>
            <span className="home-cta-compact-value">
              {settings.homeAddress ??
                `${settings.homeLocation.lat.toFixed(3)}, ${settings.homeLocation.lng.toFixed(3)}`}
            </span>
          </div>
          <button type="button" className="home-cta-compact-button" onClick={onOpenSetup}>
            {t("setup.cta.change.button")}
          </button>
        </div>
      )}

      <h2 className="home-title">{t("home.title")}</h2>

      <div className="home-section">
        {jma?.headlineText ? (
          <AlertCard
            variant="warn"
            title={t("home.jmaHeadline")}
            body={jma.headlineText}
            source={t("home.source.jma")}
            updatedAt={jma.reportDatetime ? new Date(jma.reportDatetime) : jma.fetchedAt}
          />
        ) : null}

        {warningsCount === 0 ? (
          <AlertCard
            variant="ok"
            title={t("home.jmaOk", { area: jmaAreaName })}
            body={t("home.noWarnings")}
            source={t("home.source.jma")}
            updatedAt={jma?.fetchedAt}
          />
        ) : (
          jma!.warnings.map((w) => {
            const name = warningName(w.code, lang);
            const severityLabel = t(JMA_SEVERITY_KEY[w.severity]);
            const statusLabel = t(JMA_STATUS_KEY[w.status]);
            const areasLabel = w.areas
              .map((code) => areaName(code, lang))
              .join(lang === "en" ? ", " : "・");
            const body = `${severityLabel}・${statusLabel} — ${areasLabel}`;
            return (
              <AlertCard
                key={w.code}
                variant={jmaVariant(w.severity, w.status)}
                title={name}
                body={body}
                source={t("home.source.jma")}
                updatedAt={jma!.reportDatetime ? new Date(jma!.reportDatetime) : jma!.fetchedAt}
              >
                <dl className="home-jma-detail">
                  <dt>{t("home.jmaStatus")}</dt>
                  <dd>
                    {severityLabel}・{statusLabel}
                  </dd>
                  <dt>{t("home.jmaAreas")}</dt>
                  <dd>
                    <ul className="home-jma-areas">
                      {w.areas.map((code) => (
                        <li key={code}>
                          {areaName(code, lang)} <span className="home-jma-area-code">({code})</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                  {jma!.reportDatetime ? (
                    <>
                      <dt>{t("home.jmaIssuedAt")}</dt>
                      <dd>{new Date(jma!.reportDatetime).toLocaleString(lang === "en" ? "en-US" : "ja-JP")}</dd>
                    </>
                  ) : null}
                </dl>
              </AlertCard>
            );
          })
        )}
      </div>

      {rivers.length > 0 ? (
        <div className="home-section">
          {rivers.map((r) => {
            const levelKey =
              r.status === "danger"
                ? "home.riverDanger"
                : r.status === "alert"
                  ? "home.riverAlert"
                  : r.status === "caution"
                    ? "home.riverCaution"
                    : "home.riverNormal";
            return (
              <AlertCard
                key={r.stationId}
                variant={riverVariant(r.status)}
                title={t("home.riverTitle", { river: r.riverName })}
                body={t(levelKey, { level: r.level.toFixed(1) })}
                source={t("home.source.river")}
                updatedAt={r.fetchedAt}
              />
            );
          })}
        </div>
      ) : null}

      <div className="home-stats">
        <StatCard value={String(warningsCount)} valueColor="var(--c-accent)" label={t("stat.warnings")} />
        <StatCard value={String(evacSiteCount)} valueColor="var(--c-ok)" label={t("stat.evacSites")} />
        <StatCard value={`${kitPct}%`} label={t("stat.kitComplete")} />
        {seismicRisk ? (
          <StatCard
            value={`${Math.round(seismicRisk.prob30yr * 100)}%`}
            valueColor={seismicColor(seismicRisk.prob30yr)}
            label={t("stat.seismic30yr")}
          />
        ) : (
          <StatCard value="—" valueColor="var(--c-info-text)" label={t("stat.seismic30yr")} />
        )}
      </div>
    </section>
  );
}
