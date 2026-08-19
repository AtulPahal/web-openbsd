"use client";

import { useState, useMemo } from "react";
import {
  Brain,
  Cpu,
  Sparkles,
  Zap,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  Gauge,
  HelpCircle,
} from "lucide-react";
import { AI_MODELS, type ModelDefinition } from "@/lib/ai-models-data";

export function AIStudio({ windowId }: { windowId: string }) {
  const modelKeys = Object.keys(AI_MODELS);
  const [selectedModelKey, setSelectedModelKey] = useState<string>(modelKeys[0]);

  const activeModel: ModelDefinition = AI_MODELS[selectedModelKey] || AI_MODELS["precision-agriculture"];

  // Initialize input state with model defaults
  const [inputs, setInputs] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    activeModel.features.forEach((f) => {
      init[f.id] = f.defaultValue;
    });
    return init;
  });

  const handleModelChange = (key: string) => {
    setSelectedModelKey(key);
    const targetModel = AI_MODELS[key];
    if (targetModel) {
      const init: Record<string, number> = {};
      targetModel.features.forEach((f) => {
        init[f.id] = f.defaultValue;
      });
      setInputs(init);
    }
  };

  const handleInputChange = (featureId: string, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [featureId]: value,
    }));
  };

  const handleResetDefaults = () => {
    const init: Record<string, number> = {};
    activeModel.features.forEach((f) => {
      init[f.id] = f.defaultValue;
    });
    setInputs(init);
  };

  // Compute live prediction
  const prediction = useMemo(() => {
    return activeModel.predict(inputs);
  }, [activeModel, inputs]);

  const activeClassMeta = activeModel.classes.find((c) => c.label === prediction.predictedClass) || activeModel.classes[0];

  return (
    <div
      className="flex flex-col h-full w-full bg-background font-mono text-foreground text-xs select-none overflow-hidden"
      data-window-id={windowId}
    >
      {/* 1. App Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-card/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/15 border border-primary/30 text-primary">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground tracking-wide">AI/ML Studio</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/20 text-primary border border-primary/30">
                Web ONNX Engine
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-[11px] transition-colors cursor-pointer"
            title="Reset to default inputs"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* 2. Model Selector Strip */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 border-b border-border/40 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1 shrink-0 hidden sm:inline">
          Model:
        </span>
        {Object.values(AI_MODELS).map((m) => {
          const isSelected = m.id === selectedModelKey;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModelChange(m.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-primary/25 border border-primary/60 text-primary shadow-sm"
                  : "bg-card/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              {m.name}
            </button>
          );
        })}
      </div>

      {/* 3. Main Workspace: Feature Sliders (Left/Top) & Prediction Dashboard (Right/Bottom) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        {/* Left Column: Feature Controls */}
        <div className="w-full md:w-1/2 p-3 sm:p-4 border-b md:border-b-0 md:border-r border-border/60 overflow-y-auto space-y-3.5 bg-card/20 scrollbar-thin">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div>
              <h3 className="font-bold text-sm text-foreground">{activeModel.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{activeModel.description}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-primary" />
                Input Feature Parameters ({activeModel.features.length})
              </span>
            </div>

            {activeModel.features.map((f) => {
              const currentValue = inputs[f.id] ?? f.defaultValue;
              return (
                <div
                  key={f.id}
                  className="p-3 bg-card/40 border border-border/60 rounded-xl space-y-1.5 transition-colors hover:border-border"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{f.name}</span>
                    <span className="font-mono text-xs font-bold text-primary tabular-nums">
                      {currentValue} {f.unit}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={currentValue}
                    onChange={(e) => handleInputChange(f.id, Number(e.target.value))}
                    style={{ accentColor: "var(--primary)" }}
                    className="w-full cursor-pointer h-1.5 bg-muted rounded-lg"
                  />

                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>
                      Min: {f.min} {f.unit}
                    </span>
                    <span>{f.description}</span>
                    <span>
                      Max: {f.max} {f.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Real-Time Inference Results */}
        <div className="w-full md:w-1/2 p-3 sm:p-4 flex flex-col gap-3.5 overflow-y-auto bg-card/10 scrollbar-thin">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Inference Output</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Prediction
            </span>
          </div>

          {/* Primary Classification Result Card */}
          <div
            className="p-4 rounded-2xl border flex flex-col gap-2 shadow-lg transition-all"
            style={{
              backgroundColor: `${activeClassMeta.color}15`,
              borderColor: `${activeClassMeta.color}60`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                PREDICTED CLASSIFICATION
              </span>
              <span className="text-xs font-bold text-foreground">Confidence: {prediction.confidence}%</span>
            </div>

            <div className="text-lg font-bold tracking-tight" style={{ color: activeClassMeta.color }}>
              {prediction.predictedClass}
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed">{activeClassMeta.description}</p>
          </div>

          {/* Probability Distribution Bars */}
          <div className="p-3 bg-card/40 border border-border/60 rounded-xl space-y-2.5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Class Probability Distribution
            </div>
            <div className="space-y-2">
              {activeModel.classes.map((cls) => {
                const prob = prediction.probabilities[cls.label] ?? 0;
                const pct = Math.round(prob * 100);
                return (
                  <div key={cls.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-foreground/90">{cls.label}</span>
                      <span className="tabular-nums font-mono text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: cls.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculated Indices & Mathematical Metrics */}
          <div className="p-3 bg-card/40 border border-border/60 rounded-xl space-y-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Computed Model Metrics
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(prediction.metrics).map(([k, v]) => (
                <div key={k} className="p-2 bg-background/50 border border-border/40 rounded-lg">
                  <div className="text-[9px] text-muted-foreground truncate">{k}</div>
                  <div className="text-xs font-bold text-primary font-mono mt-0.5">{String(v)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hardware & Execution Engine Telemetry */}
          <div className="p-3 bg-background/40 border border-border/50 rounded-xl flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>
                Arch: <strong className="text-foreground">{activeModel.architecture}</strong>
              </span>
            </div>
            <div className="text-right font-mono">
              <span className="text-emerald-400 font-bold">~{activeModel.latencyMs} ms</span>
              <span className="text-muted-foreground text-[9px] ml-1">inference</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
