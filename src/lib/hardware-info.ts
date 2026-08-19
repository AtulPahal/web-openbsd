/**
 * Real-time Hardware & Network Prober for OpenBSD Portfolio OS.
 * Uses Web APIs (Hardware Concurrency, Device Memory, Network Information, Performance API)
 * to provide real system telemetry instead of hardcoded numbers.
 */

export interface SystemHardwareInfo {
  cpuCores: number;
  memoryGb: number;
  screenResolution: string;
  pixelRatio: number;
  networkType: string;
  downlinkMbps: number;
  rttMs: number;
  platform: string;
  language: string;
  online: boolean;
}

export function getRealHardwareInfo(): SystemHardwareInfo {
  if (typeof window === "undefined") {
    return {
      cpuCores: 4,
      memoryGb: 8,
      screenResolution: "1920x1080",
      pixelRatio: 1,
      networkType: "Ethernet (em0)",
      downlinkMbps: 100,
      rttMs: 20,
      platform: "OpenBSD/amd64",
      language: "en-US",
      online: true,
    };
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      type?: string;
    };
  };

  const cpuCores = nav.hardwareConcurrency || 4;
  const memoryGb = nav.deviceMemory || 8;
  const screenResolution = `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`;
  const pixelRatio = window.devicePixelRatio || 1;

  const conn = nav.connection;
  const networkType = conn?.effectiveType ? `${conn.effectiveType.toUpperCase()} (${conn.type || "Wi-Fi"})` : "OpenBSD-5G";
  const downlinkMbps = conn?.downlink || 100;
  const rttMs = conn?.rtt || 25;

  return {
    cpuCores,
    memoryGb,
    screenResolution,
    pixelRatio,
    networkType,
    downlinkMbps,
    rttMs,
    platform: nav.platform || "amd64",
    language: nav.language || "en-US",
    online: nav.onLine !== false,
  };
}
