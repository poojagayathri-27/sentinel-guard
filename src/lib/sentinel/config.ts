export type ExecutionMode = "SIMULATION" | "LIVE";

const CONFIG_KEY = "sentinel_config";

interface SentinelConfig {
  mode: ExecutionMode;
}

export function getConfig(): SentinelConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : { mode: "SIMULATION" };
  } catch {
    return { mode: "SIMULATION" };
  }
}

export function setConfig(config: SentinelConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function getMode(): ExecutionMode {
  return getConfig().mode;
}

export function setMode(mode: ExecutionMode): void {
  setConfig({ ...getConfig(), mode });
}
