"use client";

import { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BROWSER_HOME_URL, buildProxyUrl } from "@/lib/browser-config";

const HOME_URL: string = BROWSER_HOME_URL;

export function Firefox({ windowId }: { windowId: string }) {
  const [url, setUrl] = useState(HOME_URL);
  const [inputUrl, setInputUrl] = useState(HOME_URL);
  const [history, setHistory] = useState<string[]>([HOME_URL]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [useProxy, setUseProxy] = useState(false);
  const [currentIframeSrc, setCurrentIframeSrc] = useState(HOME_URL);

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
      setCurrentIframeSrc(useProxy ? buildProxyUrl(newUrl) : newUrl);
    }
  };

  const reload = () => {
    if (iframeRef.current) {
      const currentSrc = currentIframeSrc;
      setCurrentIframeSrc("about:blank");
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

  return (
    <div className="h-full flex flex-col bg-background" data-window-id={windowId}>
      {/* Browser Chrome */}
      <div className="flex items-center gap-1.5 p-1.5 bg-muted border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-none text-muted-foreground hover:bg-secondary hover:text-foreground shrink-0"
          onClick={goBack}
          disabled={historyIndex === 0}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-none text-muted-foreground hover:bg-secondary hover:text-foreground shrink-0"
          onClick={goForward}
          disabled={historyIndex === history.length - 1}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-none text-muted-foreground hover:bg-secondary hover:text-foreground shrink-0"
          onClick={reload}
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-none text-muted-foreground hover:bg-secondary hover:text-foreground shrink-0"
          onClick={goHome}
        >
          <Home className="w-4 h-4" />
        </Button>

        {/* URL Bar */}
        <div className="flex-1 flex items-center bg-background border border-border px-2 h-7 focus-within:border-amber-500/50 min-w-0">
          <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-sm font-sans text-foreground placeholder:text-muted-foreground min-w-0"
            placeholder="Search or enter address"
            spellCheck={false}
          />
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
            className="rounded-none accent-amber-500"
          />
          Proxy Mode
        </label>
      </div>

      {/* Info bar for iframe restrictions */}
      <div className="bg-amber-950/40 border-b border-amber-900/50 p-1.5 text-[10px] text-amber-400 font-mono text-center shrink-0">
        If a site refuses to connect, check &lsquo;Proxy Mode&rsquo; to bypass headers. Clicking links inside a proxied page may break.
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white relative">
        <iframe
          ref={iframeRef}
          src={currentIframeSrc}
          className="absolute inset-0 w-full h-full border-none bg-white"
          title="Browser Content"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
