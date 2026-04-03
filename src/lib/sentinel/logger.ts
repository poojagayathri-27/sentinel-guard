import { LogEntry, PipelineResult } from "./types";

const STORAGE_KEY = "sentinel_logs";

export function saveLogs(entry: PipelineResult): LogEntry {
  const logEntry: LogEntry = { ...entry, id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
  const logs = getLogs();
  logs.unshift(logEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, 500)));
  return logEntry;
}

export function getLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearLogs(): void {
  localStorage.removeItem(STORAGE_KEY);
}
