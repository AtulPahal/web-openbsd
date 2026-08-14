"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProcessInfo } from "@/types";
import {
  INITIAL_CPU_USAGE,
  INITIAL_PROCESSES,
  INITIAL_RX_BYTES,
  INITIAL_TX_BYTES,
  INITIAL_UPTIME,
  NETWORK_CONFIG,
} from "@/lib/system-monitor-config";

function jitter(base: number, range: number): number {
  const delta = (Math.random() - 0.5) * 2 * range;
  return Math.max(0, +(base + delta).toFixed(1));
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  return `${h}h ${m}m ${s}s`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const colorClass =
    pct < 50
      ? "bg-green-500"
      : pct < 80
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-right text-muted-foreground">{label}</span>
      <div className="h-4 flex-1 border border-border bg-muted/30">
        <div
          className={`h-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-16 shrink-0 text-right tabular-nums">{pct.toFixed(1)}%</span>
    </div>
  );
}

function ProcessesTab({ processes }: { processes: ProcessInfo[] }) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="px-2 py-1 text-right">PID</th>
            <th className="px-2 py-1 text-left">NAME</th>
            <th className="px-2 py-1 text-right">CPU%</th>
            <th className="px-2 py-1 text-right">MEM%</th>
            <th className="px-2 py-1 text-left">STATE</th>
            <th className="px-2 py-1 text-left">USER</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p) => (
            <tr key={p.pid} className="border-b border-border/50 hover:bg-muted/20">
              <td className="px-2 py-1 text-right tabular-nums">{p.pid}</td>
              <td className="px-2 py-1 text-left">{p.name}</td>
              <td className="px-2 py-1 text-right tabular-nums">{p.cpu.toFixed(1)}</td>
              <td className="px-2 py-1 text-right tabular-nums">{p.memory.toFixed(1)}</td>
              <td className="px-2 py-1 text-left">
                <span
                  className={
                    p.state === "running"
                      ? "text-green-400"
                      : p.state === "sleeping"
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                  }
                >
                  {p.state}
                </span>
              </td>
              <td className="px-2 py-1 text-left text-muted-foreground">{p.user}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResourcesTab({
  cpuUsage,
  uptime,
}: {
  cpuUsage: number;
  uptime: number;
}) {
  const memUsed = 847;
  const memTotal = 2048;
  const swapUsed = 0;
  const swapTotal = 512;

  return (
    <div className="flex flex-col gap-4 p-2">
      <ProgressBar value={cpuUsage} max={100} label="CPU" />
      <ProgressBar value={memUsed} max={memTotal} label="MEM" />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="w-16" />
        <span>{memUsed}MB / {memTotal}MB used</span>
      </div>
      <ProgressBar value={swapUsed} max={swapTotal || 1} label="SWAP" />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="w-16" />
        <span>{swapUsed}MB / {swapTotal}MB used</span>
      </div>
      <div className="mt-2 border-t border-border pt-3 text-xs">
        <div className="flex gap-6">
          <span className="text-muted-foreground">Load avg:</span>
          <span className="tabular-nums">0.42, 0.38, 0.35</span>
        </div>
        <div className="mt-1 flex gap-6">
          <span className="text-muted-foreground">Uptime:</span>
          <span className="tabular-nums">{formatUptime(uptime)}</span>
        </div>
      </div>
    </div>
  );
}

function NetworkTab({ txBytes, rxBytes }: { txBytes: number; rxBytes: number }) {
  return (
    <div className="flex flex-col gap-4 p-2 text-xs">
      {/* em0 */}
      <div className="border border-border p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-bold">{NETWORK_CONFIG.interface}</span>
          <span className="text-green-400">● active</span>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <span className="text-muted-foreground">IPv4</span>
          <span>{NETWORK_CONFIG.ipv4}</span>
          <span className="text-muted-foreground">MAC</span>
          <span>{NETWORK_CONFIG.mac}</span>
          <span className="text-muted-foreground">TX</span>
          <span className="tabular-nums">{formatBytes(txBytes)}</span>
          <span className="text-muted-foreground">RX</span>
          <span className="tabular-nums">{formatBytes(rxBytes)}</span>
        </div>
      </div>
      {/* lo0 */}
      <div className="border border-border p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-bold">{NETWORK_CONFIG.loopbackInterface}</span>
          <span className="text-muted-foreground">loopback</span>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <span className="text-muted-foreground">IPv4</span>
          <span>{NETWORK_CONFIG.loopbackIpv4}</span>
          <span className="text-muted-foreground">IPv6</span>
          <span>{NETWORK_CONFIG.loopbackIpv6}</span>
          <span className="text-muted-foreground">TX</span>
          <span className="tabular-nums">0 B</span>
          <span className="text-muted-foreground">RX</span>
          <span className="tabular-nums">0 B</span>
        </div>
      </div>
    </div>
  );
}

export function SystemMonitor({ windowId }: { windowId: string }) {
  const [processes, setProcesses] = useState<ProcessInfo[]>(INITIAL_PROCESSES);
  const [cpuUsage, setCpuUsage] = useState(INITIAL_CPU_USAGE);
  const [uptime, setUptime] = useState(INITIAL_UPTIME);
  const [txBytes, setTxBytes] = useState(INITIAL_TX_BYTES);
  const [rxBytes, setRxBytes] = useState(INITIAL_RX_BYTES);
  const intervalRefs = useRef<ReturnType<typeof setInterval>[]>([]);

  const clearIntervals = useCallback(() => {
    intervalRefs.current.forEach(clearInterval);
    intervalRefs.current = [];
  }, []);

  useEffect(() => {
    clearIntervals();

    // Uptime: every second
    const uptimeId = setInterval(() => {
      setUptime((u) => u + 1);
    }, 1000);
    intervalRefs.current.push(uptimeId);

    // Process + CPU update: every 2 seconds
    const procId = setInterval(() => {
      setProcesses((prev) =>
        prev.map((p) => ({
          ...p,
          cpu: jitter(p.cpu, p.name === "Xorg" ? 0.5 : 0.2),
          memory: jitter(p.memory, 0.1),
        }))
      );
      setCpuUsage((prev) => {
        const next = prev + (Math.random() - 0.5) * 10;
        return Math.min(45, Math.max(15, +next.toFixed(1)));
      });
    }, 2000);
    intervalRefs.current.push(procId);

    // Network: every second
    const netId = setInterval(() => {
      setTxBytes((b) => b + Math.floor(Math.random() * 4096));
      setRxBytes((b) => b + Math.floor(Math.random() * 16384));
    }, 1000);
    intervalRefs.current.push(netId);

    return clearIntervals;
  }, [clearIntervals]);

  return (
    <div className="flex h-full flex-col bg-background font-mono text-foreground text-xs" data-window-id={windowId}>
      <Tabs defaultValue="processes" className="flex h-full flex-col">
        <TabsList className="shrink-0 rounded-none border-b border-border bg-muted/50">
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>
        <TabsContent value="processes" className="flex-1 overflow-auto p-1">
          <ProcessesTab processes={processes} />
        </TabsContent>
        <TabsContent value="resources" className="flex-1 overflow-auto">
          <ResourcesTab cpuUsage={cpuUsage} uptime={uptime} />
        </TabsContent>
        <TabsContent value="network" className="flex-1 overflow-auto">
          <NetworkTab txBytes={txBytes} rxBytes={rxBytes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
