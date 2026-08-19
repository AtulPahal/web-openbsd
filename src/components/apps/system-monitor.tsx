"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Search,
  XCircle,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  Server,
  Zap,
} from "lucide-react";
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

/** SVG Sparkline Line Chart for real-time history */
function SparklineChart({
  data,
  color = "#f0c040",
  height = 40,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 100);
  const min = 0;
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = height - ((val - min) / (max - min)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} 100,${height}`;

  return (
    <svg className="w-full h-full overflow-visible" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace("#", "")})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProcessesTab({
  processes,
  onKillProcess,
}: {
  processes: ProcessInfo[];
  onKillProcess: (pid: number) => void;
}) {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<"pid" | "name" | "cpu" | "memory">("cpu");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    return processes.filter(
      (p) =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.user.toLowerCase().includes(filter.toLowerCase()) ||
        String(p.pid).includes(filter)
    );
  }, [processes, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: "pid" | "name" | "cpu" | "memory") => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="flex flex-col h-full gap-2 p-2">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2 bg-card/60 border border-border/60 px-2.5 py-1.5 rounded-md">
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter processes by name, PID, or user..."
          className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/60 flex-1 font-mono"
        />
        {filter && (
          <button type="button" onClick={() => setFilter("")} className="text-muted-foreground hover:text-foreground">
            <XCircle className="w-3.5 h-3.5" />
          </button>
        )}
        <span className="text-[10px] text-muted-foreground/60 border-l border-border/40 pl-2">
          {sorted.length} processes
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-border/60 rounded-md bg-card/30 scrollbar-thin">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider select-none">
              <th onClick={() => handleSort("pid")} className="px-2 sm:px-3 py-1.5 text-right cursor-pointer hover:text-amber-400">
                PID {sortKey === "pid" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th onClick={() => handleSort("name")} className="px-2 sm:px-3 py-1.5 text-left cursor-pointer hover:text-amber-400">
                PROCESS {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th onClick={() => handleSort("cpu")} className="px-2 sm:px-3 py-1.5 text-right cursor-pointer hover:text-amber-400">
                CPU % {sortKey === "cpu" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th onClick={() => handleSort("memory")} className="hidden sm:table-cell px-3 py-1.5 text-right cursor-pointer hover:text-amber-400">
                MEM % {sortKey === "memory" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="hidden md:table-cell px-3 py-1.5 text-left">STATE</th>
              <th className="hidden lg:table-cell px-3 py-1.5 text-left">USER</th>
              <th className="px-2 sm:px-3 py-1.5 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.pid} className="border-b border-border/40 hover:bg-amber-500/10 transition-colors group">
                <td className="px-2 sm:px-3 py-1.5 text-right tabular-nums text-muted-foreground">{p.pid}</td>
                <td className="px-2 sm:px-3 py-1.5 font-bold text-foreground flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-none">
                  <Zap className="w-3 h-3 text-amber-400 opacity-60 shrink-0" />
                  <span className="truncate">{p.name}</span>
                </td>
                <td className="px-2 sm:px-3 py-1.5 text-right tabular-nums">
                  <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                    <span className={p.cpu > 2 ? "text-amber-400 font-semibold" : "text-foreground/80"}>
                      {p.cpu.toFixed(1)}%
                    </span>
                    <div className="w-8 sm:w-12 h-1.5 bg-muted/40 rounded-full overflow-hidden shrink-0">
                      <div
                        className={`h-full ${p.cpu > 2 ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{ width: `${Math.min(100, p.cpu * 20)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-3 py-1.5 text-right tabular-nums text-foreground/80">
                  {p.memory.toFixed(1)}%
                </td>
                <td className="hidden md:table-cell px-3 py-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      p.state === "running"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${p.state === "running" ? "bg-emerald-400" : "bg-amber-400"}`} />
                    {p.state}
                  </span>
                </td>
                <td className="hidden lg:table-cell px-3 py-1.5 text-muted-foreground/80">{p.user}</td>
                <td className="px-2 sm:px-3 py-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => onKillProcess(p.pid)}
                    className="sm:opacity-0 group-hover:opacity-100 px-1.5 sm:px-2 py-0.5 text-[10px] bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/40 rounded transition-all cursor-pointer"
                    title={`Kill process ${p.name} (${p.pid})`}
                  >
                    Kill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResourcesTab({
  cpuHistory,
  memHistory,
  cpuUsage,
  uptime,
}: {
  cpuHistory: number[];
  memHistory: number[];
  cpuUsage: number;
  uptime: number;
}) {
  const memUsed = 847;
  const memTotal = 2048;
  const memPct = Math.round((memUsed / memTotal) * 100);

  return (
    <div className="flex flex-col gap-3 p-3 font-mono text-xs">
      {/* CPU Live Chart Card */}
      <div className="p-3 bg-card/40 border border-border/60 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>CPU History (Virtual CPU @ 3.00GHz)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground tabular-nums">{cpuUsage.toFixed(1)}%</span>
          </div>
        </div>
        <div className="h-20 bg-background/60 border border-border/40 p-1.5 rounded relative overflow-hidden">
          <SparklineChart data={cpuHistory} color="#f0c040" height={60} />
        </div>
      </div>

      {/* Memory Live Chart Card */}
      <div className="p-3 bg-card/40 border border-border/60 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sky-400">
            <HardDrive className="w-4 h-4 text-sky-400" />
            <span>Memory History (RAM & Swap)</span>
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">
            {memUsed} MB / {memTotal} MB ({memPct}%)
          </div>
        </div>
        <div className="h-20 bg-background/60 border border-border/40 p-1.5 rounded relative overflow-hidden">
          <SparklineChart data={memHistory} color="#38bdf8" height={60} />
        </div>
      </div>

      {/* Load & Uptime Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 bg-background/40 border border-border/40 rounded-lg flex items-center justify-between">
          <span className="text-muted-foreground">Load Average:</span>
          <span className="font-bold text-amber-400 tabular-nums">0.12, 0.08, 0.06</span>
        </div>
        <div className="p-2.5 bg-background/40 border border-border/40 rounded-lg flex items-center justify-between">
          <span className="text-muted-foreground">System Uptime:</span>
          <span className="font-bold text-emerald-400 tabular-nums">{formatUptime(uptime)}</span>
        </div>
      </div>
    </div>
  );
}

function NetworkTab({
  txBytes,
  rxBytes,
  netHistory,
}: {
  txBytes: number;
  rxBytes: number;
  netHistory: number[];
}) {
  return (
    <div className="flex flex-col gap-3 p-3 font-mono text-xs">
      {/* Network Traffic Live Graph */}
      <div className="p-3 bg-card/40 border border-border/60 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>Network Throughput History</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <ArrowDownLeft className="w-3 h-3" /> RX {formatBytes(rxBytes)}
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <ArrowUpRight className="w-3 h-3" /> TX {formatBytes(txBytes)}
            </span>
          </div>
        </div>
        <div className="h-20 bg-background/60 border border-border/40 p-1.5 rounded relative overflow-hidden">
          <SparklineChart data={netHistory} color="#34d399" height={60} />
        </div>
      </div>

      {/* Interfaces List */}
      <div className="grid grid-cols-2 gap-3">
        {/* em0 */}
        <div className="p-3 bg-card/30 border border-border/60 rounded-lg space-y-2">
          <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>{NETWORK_CONFIG.interface}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              UP
            </span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">IPv4 Address:</span>
              <span className="font-semibold text-foreground">{NETWORK_CONFIG.ipv4}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MAC Address:</span>
              <span className="text-foreground/80">{NETWORK_CONFIG.mac}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Packets RX:</span>
              <span className="tabular-nums text-emerald-400">{formatBytes(rxBytes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Packets TX:</span>
              <span className="tabular-nums text-sky-400">{formatBytes(txBytes)}</span>
            </div>
          </div>
        </div>

        {/* lo0 */}
        <div className="p-3 bg-card/30 border border-border/60 rounded-lg space-y-2">
          <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>{NETWORK_CONFIG.loopbackInterface}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted/40 text-muted-foreground border border-border/40">
              LOOPBACK
            </span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">IPv4 Address:</span>
              <span className="font-semibold text-foreground">{NETWORK_CONFIG.loopbackIpv4}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IPv6 Address:</span>
              <span className="text-foreground/80">{NETWORK_CONFIG.loopbackIpv6}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Packets RX:</span>
              <span className="tabular-nums text-muted-foreground">0 B</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Packets TX:</span>
              <span className="tabular-nums text-muted-foreground">0 B</span>
            </div>
          </div>
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

  const [cpuHistory, setCpuHistory] = useState<number[]>([25, 28, 30, 24, 29, 32, 28, 35, 27, 30]);
  const [memHistory, setMemHistory] = useState<number[]>([40, 41, 41, 42, 41, 41, 42, 41, 41, 41]);
  const [netHistory, setNetHistory] = useState<number[]>([10, 15, 20, 18, 25, 30, 22, 28, 35, 40]);
  const handleKillProcess = (pid: number) => {
    setProcesses((prev) => prev.filter((p) => p.pid !== pid));
  };

  useEffect(() => {
    const timerId = setInterval(() => {
      setUptime((u) => u + 1);

      setProcesses((prev) =>
        prev.map((p) => ({
          ...p,
          cpu: jitter(p.cpu, p.name === "Xorg" ? 0.5 : 0.2),
          memory: jitter(p.memory, 0.1),
        }))
      );

      setCpuUsage((prev) => {
        const next = Math.min(45, Math.max(15, +(prev + (Math.random() - 0.5) * 6).toFixed(1)));
        setCpuHistory((h) => [...h.slice(-19), next]);
        return next;
      });

      setMemHistory((h) => [...h.slice(-19), +(41 + (Math.random() - 0.5) * 1.5).toFixed(1)]);

      const deltaTx = Math.floor(Math.random() * 3000);
      const deltaRx = Math.floor(Math.random() * 12000);
      setTxBytes((b) => b + deltaTx);
      setRxBytes((b) => b + deltaRx);
      setNetHistory((h) => [...h.slice(-19), +((deltaRx + deltaTx) / 200).toFixed(1)]);
    }, 1500);

    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="flex h-full flex-col bg-background font-mono text-foreground text-xs select-none" data-window-id={windowId}>
      {/* Top Real-time Header Cards */}
      <div className="grid grid-cols-3 gap-2 p-2 border-b border-border/60 bg-card/40">
        <div className="p-2 bg-background/60 border border-border/50 rounded flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold">CPU</span>
          </div>
          <span className="font-bold text-amber-400 tabular-nums">{cpuUsage.toFixed(1)}%</span>
        </div>

        <div className="p-2 bg-background/60 border border-border/50 rounded flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-bold">RAM</span>
          </div>
          <span className="font-bold text-sky-400 tabular-nums">847 / 2048 MB</span>
        </div>

        <div className="p-2 bg-background/60 border border-border/50 rounded flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold">NET</span>
          </div>
          <span className="font-bold text-emerald-400 tabular-nums">{formatBytes(rxBytes)}</span>
        </div>
      </div>

      <Tabs defaultValue="processes" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="shrink-0 rounded-none border-b border-border/60 bg-muted/40">
          <TabsTrigger value="processes" className="gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Processes</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Resources</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Network</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processes" className="flex-1 overflow-hidden">
          <ProcessesTab processes={processes} onKillProcess={handleKillProcess} />
        </TabsContent>
        <TabsContent value="resources" className="flex-1 overflow-auto">
          <ResourcesTab cpuHistory={cpuHistory} memHistory={memHistory} cpuUsage={cpuUsage} uptime={uptime} />
        </TabsContent>
        <TabsContent value="network" className="flex-1 overflow-auto">
          <NetworkTab txBytes={txBytes} rxBytes={rxBytes} netHistory={netHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
