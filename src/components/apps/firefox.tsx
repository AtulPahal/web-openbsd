"use client";

import { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, ExternalLink, Globe, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BROWSER_HOME_URL, buildProxyUrl } from "@/lib/browser-config";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import { PORTFOLIO_DATA } from "@/lib/portfolio-data";

const HOME_URL: string = BROWSER_HOME_URL;

export function Firefox({ windowId }: { windowId: string }) {
  const [url, setUrl] = useState(HOME_URL);
  const [inputUrl, setInputUrl] = useState(HOME_URL);
  const [history, setHistory] = useState<string[]>([HOME_URL]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [useProxy, setUseProxy] = useState(true);
  const [currentIframeSrc, setCurrentIframeSrc] = useState(() => buildProxyUrl(HOME_URL));
  const [loadError, setLoadError] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (newUrl: string, proxyState = useProxy) => {
    let finalUrl = newUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      if (finalUrl.includes(".") && !finalUrl.includes(" ")) {
        finalUrl = `https://${finalUrl}`;
      } else {
        finalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(finalUrl)}`;
      }
    }

    setUrl(finalUrl);
    setInputUrl(finalUrl);
    setLoadError(false);

    const iframeSrc = proxyState ? buildProxyUrl(finalUrl) : finalUrl;
    setCurrentIframeSrc(iframeSrc);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(finalUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const newUrl = history[newIndex];
      setUrl(newUrl);
      setInputUrl(newUrl);
      setLoadError(false);
      setCurrentIframeSrc(useProxy ? buildProxyUrl(newUrl) : newUrl);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const newUrl = history[newIndex];
      setUrl(newUrl);
      setInputUrl(newUrl);
      setLoadError(false);
      setCurrentIframeSrc(useProxy ? buildProxyUrl(newUrl) : newUrl);
    }
  };

  const reload = () => {
    if (iframeRef.current) {
      const currentSrc = currentIframeSrc;
      setCurrentIframeSrc("about:blank");
      setLoadError(false);
      setTimeout(() => setCurrentIframeSrc(currentSrc), 10);
    }
  };

  const goHome = () => {
    navigate(HOME_URL);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate(inputUrl);
    }
  };

  // Check if URL is GitHub or external site that blocks direct frame embedding
  const isDirectFrameBlocked = !useProxy && (url.includes("github.com") || url.includes("google.com"));

  return (
    <div className="h-full flex flex-col bg-background font-mono select-none" data-window-id={windowId}>
      {/* Browser Chrome */}
      <div className="flex items-center gap-1.5 p-1.5 bg-card border-b border-border/80 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 cursor-pointer"
          onClick={goBack}
          disabled={historyIndex === 0}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 cursor-pointer"
          onClick={goForward}
          disabled={historyIndex === history.length - 1}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 cursor-pointer"
          onClick={reload}
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 cursor-pointer"
          onClick={goHome}
        >
          <Home className="w-4 h-4" />
        </Button>

        {/* URL Bar */}
        <div className="flex-1 flex items-center bg-background border border-border/80 px-2 h-7 rounded focus-within:border-amber-500/50 min-w-0">
          <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-foreground placeholder:text-muted-foreground min-w-0"
            placeholder="Search or enter address"
            spellCheck={false}
          />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-muted-foreground hover:text-amber-400 transition-colors ml-1"
            title="Open original website in new browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Proxy Toggle */}
        <label className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer shrink-0 ml-1">
          <input
            type="checkbox"
            checked={useProxy}
            onChange={(e) => {
              setUseProxy(e.target.checked);
              navigate(url, e.target.checked);
            }}
            className="accent-amber-500 rounded"
          />
          Proxy Mode
        </label>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white relative">
        {isDirectFrameBlocked ? (
          <div className="absolute inset-0 bg-card p-6 flex flex-col items-center justify-center text-center space-y-4 font-mono text-xs select-none">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Direct Frame Embedding Restricted</h3>
              <p className="text-muted-foreground max-w-md">
                <span className="text-amber-400 font-semibold">{url}</span> restricts direct iframe embedding via <span className="font-semibold">X-Frame-Options: DENY</span> security headers.
              </p>
            </div>

            <div className="p-3 bg-background/60 border border-border/60 rounded-xl max-w-sm w-full text-left space-y-2">
              <div className="text-[10px] font-bold text-amber-400 uppercase">Solutions to View:</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Enable <strong>Proxy Mode</strong> in the top right to strip headers.</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Click below to open the original live website directly.</span>
                </div>
              </div>
            </div>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2"
            >
              <span>Open Original {url} ↗</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={currentIframeSrc}
            className="absolute inset-0 w-full h-full border-none bg-white"
            title="Browser Content"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            onError={() => setLoadError(true)}
          />
        )}

        {loadError && !isDirectFrameBlocked && (
          <div className="absolute inset-0 bg-card p-8 flex flex-col items-center justify-center text-center space-y-3 font-mono text-xs">
            <Globe className="w-10 h-10 text-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold text-foreground">Web Page Connection Notice</h3>
            <p className="text-muted-foreground max-w-sm">
              The site <span className="text-amber-400 font-semibold">{url}</span> could not be loaded inside the frame.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded font-semibold hover:bg-amber-500/30 transition-colors"
            >
              Open Original Website in New Tab ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
