import type { ProcessInfo } from "@/types";
import { SYSTEM_CONFIG } from "@/lib/system-config";

export const INITIAL_PROCESSES: ProcessInfo[] = [
  { pid: 1, name: "init", cpu: 0.0, memory: 0.1, state: "running", user: "root" },
  { pid: 23, name: "sshd", cpu: 0.1, memory: 0.5, state: "running", user: "root" },
  { pid: 45, name: "cron", cpu: 0.0, memory: 0.2, state: "sleeping", user: "root" },
  { pid: 67, name: "Xorg", cpu: 2.3, memory: 4.1, state: "running", user: "user" },
  { pid: 89, name: "fvwm", cpu: 0.8, memory: 1.2, state: "running", user: "user" },
  { pid: 112, name: "xterm", cpu: 0.2, memory: 0.8, state: "running", user: "user" },
  { pid: 134, name: "httpd", cpu: 0.5, memory: 1.5, state: "running", user: "www" },
];

export const INITIAL_CPU_USAGE = 28;
export const INITIAL_UPTIME = 43217;
export const INITIAL_TX_BYTES = 1_572_864;
export const INITIAL_RX_BYTES = 8_912_043;

export const NETWORK_CONFIG = {
  interface: "em0",
  ipv4: SYSTEM_CONFIG.localIp,
  mac: "00:0c:29:3a:bc:d5",
  loopbackInterface: "lo0",
  loopbackIpv4: "127.0.0.1",
  loopbackIpv6: "::1",
} as const;
