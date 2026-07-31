"use client";

import { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_URL = "https://duckduckgo.com/search.html"; // DuckDuckGo has an embeddable search page, or just regular DDG. Let's use Wikipedia main page as default since it's generally embeddable, or DDG.
const HOME_URL = "https://en.wikipedia.org/wiki/OpenBSD";

export function Firefox({ windowId }: { windowId: string }) {
  const [url, setUrl] = useState(HOME_URL);
  const [inputUrl, setInputUrl] = useState(HOME_URL);
  const [history, setHistory] = useState<string[]>([HOME_URL]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (newUrl: string) => {
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
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const newUrl = history[newIndex];
      setUrl(newUrl);
      setInputUrl(newUrl);
    }
  };

  const reload = () => {
    if (iframeRef.current) {
      // Hack to force iframe reload in React
      const currentUrl = url;
      setUrl("about:blank");
      setTimeout(() => setUrl(currentUrl), 10);
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
    <div className="h-full flex flex-col bg-background">
      {/* Browser Chrome */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#2a2a2a] border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-none text-muted-foreground hover:bg-[#3a3a3a] hover:text-foreground"
          onClick={goBack}
          disabled={historyIndex === 0}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-none text-muted-foreground hover:bg-[#3a3a3a] hover:text-foreground"
          onClick={goForward}
          disabled={historyIndex === history.length - 1}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-none text-muted-foreground hover:bg-[#3a3a3a] hover:text-foreground"
          onClick={reload}
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-none text-muted-foreground hover:bg-[#3a3a3a] hover:text-foreground"
          onClick={goHome}
        >
          <Home className="w-4 h-4" />
        </Button>

        {/* URL Bar */}
        <div className="flex-1 flex items-center bg-[#1a1a1a] border border-[#333] px-2 h-7 focus-within:border-amber-500/50">
          <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-sm font-sans text-foreground placeholder:text-muted-foreground"
            placeholder="Search or enter address"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Info bar for iframe restrictions */}
      <div className="bg-amber-950/40 border-b border-amber-900/50 p-1.5 text-[10px] text-amber-400 font-mono text-center shrink-0">
        Note: Many modern websites block embedding via X-Frame-Options or CSP. If a site refuses to connect, try Wikipedia or example.com.
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white relative">
        <iframe
          ref={iframeRef}
          src={url}
          className="absolute inset-0 w-full h-full border-none bg-white"
          title="Browser Content"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
