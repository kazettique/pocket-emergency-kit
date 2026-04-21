import { useState, useEffect, useCallback } from "react";
import { syncAll, type SyncResult } from "../cms/sync";
import { refreshGovData } from "../gov/api";
import { getUserSettings } from "../db/idb";

export type SyncStatus = "idle" | "syncing" | "done" | "offline" | "error";

export interface SyncState {
  status: SyncStatus;
  results: SyncResult[];
  lastSyncAt: Date | null;
  isOnline: boolean;
  triggerSync: (force?: boolean) => Promise<void>;
}

export function useSyncEngine(): SyncState {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [results, setResults] = useState<SyncResult[]>([]);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online/offline
  useEffect(() => {
    const online = () => {
      setIsOnline(true);
    };
    const offline = () => {
      setIsOnline(false);
      setStatus("offline");
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  const triggerSync = useCallback(async (force = false) => {
    if (!navigator.onLine) {
      setStatus("offline");
      return;
    }
    setStatus("syncing");
    try {
      // 1. Sync CMS content
      const cmsResults = await syncAll(force);
      setResults(cmsResults);

      // 2. Refresh gov data using home location
      const settings = await getUserSettings();
      if (settings?.homeLocation) {
        const { lat, lng } = settings.homeLocation;
        await refreshGovData(lat, lng);
      }

      const anyFailed = cmsResults.some((r) => !r.ok);
      setStatus(anyFailed ? "error" : "done");
      setLastSyncAt(new Date());
    } catch {
      setStatus("error");
    }
  }, []);

  // Auto-sync on mount when online
  useEffect(() => {
    if (isOnline) triggerSync(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && status === "offline") triggerSync();
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, results, lastSyncAt, isOnline, triggerSync };
}
