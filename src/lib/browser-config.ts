import { SYSTEM_CONFIG } from "./system-config";

export const PROXY_PATH = "/api/proxy";
export const BROWSER_HOME_URL = SYSTEM_CONFIG.browserHome;

export function buildProxyUrl(url: string): string {
  return `${PROXY_PATH}?url=${encodeURIComponent(url)}`;
}
