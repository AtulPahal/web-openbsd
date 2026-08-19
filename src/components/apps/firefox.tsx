"use client";

import { useState, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Search,
  ExternalLink,
  Globe,
  Shield,
  Lock,
  Star,
  Plus,
  X,
  Menu,
  Bookmark,
  Share2,
  SlidersHorizontal,
  Flame,
} from "lucide-react";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import { PORTFOLIO_DATA } from "@/lib/portfolio-data";
import { GitHubIcon } from "@/lib/social-icons";
import { buildProxyUrl } from "@/lib/browser-config";

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  history: string[];
  historyIndex: number;
}
function getDomainFromUrl(url: string): string {
  if (url === "about:home" || url === "about:newtab" || !url) return "Firefox Home";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 30);
  }
}

const DEFAULT_BOOKMARKS = [
  { title: "Atul Pahal (GitHub)", url: "https://github.com/AtulPahal", icon: GitHubIcon, isSvg: true },
  { title: "OpenBSD.org", url: "https://www.openbsd.org", icon: Globe, isSvg: false },
  { title: "DuckDuckGo", url: "https://duckduckgo.com", icon: Search, isSvg: false },
  { title: "Hacker News", url: "https://news.ycombinator.com", icon: Globe, isSvg: false },
  { title: "Wikipedia", url: "https://en.wikipedia.org", icon: Globe, isSvg: false },
];

export function Firefox({ windowId }: { windowId: string }) {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "tab-1",
      title: "Firefox Home",
      url: "about:home",
      history: ["about:home"],
      historyIndex: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [inputUrl, setInputUrl] = useState("about:home");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showBookmarksBar, setShowBookmarksBar] = useState(true);
  const [showAppMenu, setShowAppMenu] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const navigateTo = (rawUrl: string, tabId = activeTabId) => {
    let finalUrl = rawUrl.trim();
    if (!finalUrl) return;

    if (finalUrl === "about:home" || finalUrl === "about:newtab") {
      finalUrl = "about:home";
    } else if (!/^https?:\/\//i.test(finalUrl)) {
      if (finalUrl.includes(".") && !finalUrl.includes(" ")) {
        finalUrl = `https://${finalUrl}`;
      } else {
        finalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(finalUrl)}`;
      }
    }

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === tabId) {
          const newHistory = t.history.slice(0, t.historyIndex + 1);
          newHistory.push(finalUrl);
          const domain = getDomainFromUrl(finalUrl);

          return {
            ...t,
            url: finalUrl,
            title: domain,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        }
        return t;
      })
    );

    if (tabId === activeTabId) {
      setInputUrl(finalUrl === "about:home" ? "" : finalUrl);
    }
  };

  const createTab = (url = "about:home") => {
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      title: "New Tab",
      url,
      history: [url],
      historyIndex: 0,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setInputUrl(url === "about:home" ? "" : url);
  };

  const closeTab = (tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (tabs.length === 1) {
      // Keep at least one tab open
      setTabs([
        {
          id: `tab-${Date.now()}`,
          title: "Firefox Home",
          url: "about:home",
          history: ["about:home"],
          historyIndex: 0,
        },
      ]);
      setInputUrl("");
      return;
    }

    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);
    if (activeTabId === tabId) {
      const fallback = nextTabs[nextTabs.length - 1];
      setActiveTabId(fallback.id);
      setInputUrl(fallback.url === "about:home" ? "" : fallback.url);
    }
  };

  const goBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const prevUrl = activeTab.history[newIndex];
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                url: prevUrl,
                title: getDomainFromUrl(prevUrl),
                historyIndex: newIndex,
              }
            : t
        )
      );
      setInputUrl(prevUrl === "about:home" ? "" : prevUrl);
    }
  };

  const goForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const nextUrl = activeTab.history[newIndex];
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                url: nextUrl,
                title: getDomainFromUrl(nextUrl),
                historyIndex: newIndex,
              }
            : t
        )
      );
      setInputUrl(nextUrl === "about:home" ? "" : nextUrl);
    }
  };

  const reload = () => {
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = "about:blank";
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = src;
      }, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigateTo(inputUrl);
    }
  };

  const isHome = activeTab.url === "about:home";
  const isDirectFrameBlocked = !isHome && (activeTab.url.includes("github.com") || activeTab.url.includes("google.com"));

  return (
    <div
      className="h-full w-full flex flex-col bg-[#1c1b22] text-[#fbfbfe] font-sans select-none overflow-hidden"
      data-window-id={windowId}
    >
      {/* 1. Firefox Tab Strip */}
      <div className="flex items-center px-2 pt-1.5 gap-1 bg-[#1c1b22] border-b border-[#2b2a33] shrink-0 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id);
                setInputUrl(tab.url === "about:home" ? "" : tab.url);
              }}
              className={`group relative flex items-center gap-2 px-3 py-1.5 min-w-[120px] max-w-[200px] text-xs font-medium rounded-t-lg transition-all cursor-pointer ${
                isActive
                  ? "bg-[#2b2a33] text-[#fbfbfe] shadow-sm font-semibold"
                  : "bg-transparent text-[#9f9fa6] hover:bg-[#2b2a33]/50 hover:text-[#fbfbfe]"
              }`}
            >
              {tab.url.includes("github.com") ? (
                <GitHubIcon className="w-3.5 h-3.5 text-primary shrink-0" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
              )}
              <span className="truncate flex-1">{tab.title}</span>

              {/* Close Tab Button */}
              <button
                type="button"
                onClick={(e) => closeTab(tab.id, e)}
                className="w-4 h-4 rounded hover:bg-[#383740] hover:text-white flex items-center justify-center transition-colors opacity-60 group-hover:opacity-100"
                title="Close tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* New Tab Button (+) */}
        <button
          type="button"
          onClick={() => createTab()}
          className="p-1 text-[#9f9fa6] hover:text-[#fbfbfe] hover:bg-[#2b2a33] rounded-md transition-colors cursor-pointer ml-1"
          title="Open a new tab (Ctrl+T)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Firefox Navigation & Awesomebar Toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2b2a33] border-b border-[#383740] shrink-0 text-xs">
        {/* Navigation Buttons */}
        <button
          type="button"
          onClick={goBack}
          disabled={activeTab.historyIndex === 0}
          className="p-1.5 rounded-full hover:bg-[#383740] text-[#fbfbfe] disabled:opacity-30 transition-colors cursor-pointer"
          title="Click to go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={goForward}
          disabled={activeTab.historyIndex >= activeTab.history.length - 1}
          className="p-1.5 rounded-full hover:bg-[#383740] text-[#fbfbfe] disabled:opacity-30 transition-colors cursor-pointer"
          title="Click to go forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={reload}
          className="p-1.5 rounded-full hover:bg-[#383740] text-[#fbfbfe] transition-colors cursor-pointer"
          title="Reload current page"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => navigateTo("about:home")}
          className="p-1.5 rounded-full hover:bg-[#383740] text-[#fbfbfe] transition-colors cursor-pointer"
          title="Firefox Home Page"
        >
          <Home className="w-4 h-4" />
        </button>

        {/* Unified Firefox Awesomebar */}
        <div className="flex-1 flex items-center bg-[#1c1b22] border border-[#42414d] focus-within:border-[#00ddff] focus-within:ring-2 focus-within:ring-[#00ddff]/30 px-2.5 h-8 rounded-lg transition-all min-w-0">
          {/* Tracking Protection & SSL Lock */}
          <div className="flex items-center gap-1.5 text-[#00ddff] mr-2 shrink-0">
            <span title="Enhanced Tracking Protection: ON">
              <Shield className="w-3.5 h-3.5" />
            </span>
            <span title="Connection is secure">
              <Lock className="w-3 h-3 text-emerald-400" />
            </span>
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search with DuckDuckGo or enter address"
            className="flex-1 bg-transparent border-none outline-none text-xs text-[#fbfbfe] placeholder-[#8f8f9d] min-w-0"
            spellCheck={false}
          />

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 text-[#8f8f9d] ml-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-1 hover:text-[#fbfbfe] transition-colors ${
                isBookmarked ? "text-primary fill-primary" : ""
              }`}
              title="Bookmark this page"
            >
              <Star className="w-3.5 h-3.5" />
            </button>
            {!isHome && (
              <a
                href={activeTab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:text-[#00ddff] transition-colors"
                title="Open page in a new browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Hamburger Application Menu */}
        <button
          type="button"
          onClick={() => setShowAppMenu(!showAppMenu)}
          className="p-1.5 rounded-lg hover:bg-[#383740] text-[#fbfbfe] transition-colors cursor-pointer"
          title="Open Application Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Firefox Bookmarks Toolbar */}
      {showBookmarksBar && (
        <div className="flex items-center gap-2 px-3 py-1 bg-[#2b2a33]/60 border-b border-[#383740]/60 text-[11px] shrink-0 overflow-x-auto scrollbar-none">
          {DEFAULT_BOOKMARKS.map((bm) => {
            const Icon = bm.icon;
            return (
              <button
                key={bm.title}
                type="button"
                onClick={() => navigateTo(bm.url)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#383740] text-[#cfcfd8] hover:text-white transition-colors shrink-0 cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{bm.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Main Viewport Area */}
      <div className="flex-1 bg-[#1c1b22] relative overflow-hidden">
        {isHome ? (
          /* --- Authentic Firefox New Tab / Home Page --- */
          <div className="h-full w-full overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-start space-y-8 scrollbar-thin">
            {/* Firefox Brand Wordmark */}
            <div className="flex flex-col items-center gap-2 mt-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-xl shadow-rose-500/20">
                <Flame className="w-10 h-10 text-white fill-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#fbfbfe] flex items-center gap-2">
                <span>Firefox</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  OpenBSD Edition
                </span>
              </h1>
            </div>

            {/* Central Search Bar */}
            <div className="w-full max-w-xl">
              <div className="flex items-center bg-[#2b2a33] hover:bg-[#383740]/80 focus-within:bg-[#2b2a33] border border-[#42414d] focus-within:border-[#00ddff] focus-within:ring-4 focus-within:ring-[#00ddff]/20 px-4 h-12 rounded-xl transition-all shadow-lg">
                <Search className="w-4 h-4 text-[#8f8f9d] mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search with DuckDuckGo or enter address"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigateTo((e.target as HTMLInputElement).value);
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[#fbfbfe] placeholder-[#8f8f9d]"
                  autoFocus
                />
              </div>
            </div>

            {/* Top Sites Shortcuts Grid */}
            <div className="w-full max-w-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8f8f9d] px-1 uppercase tracking-wider">
                <span>Top Sites</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    title: "Atul Pahal",
                    subtitle: "GitHub Profile",
                    url: "https://github.com/AtulPahal",
                    icon: GitHubIcon,
                    color: "bg-primary/15 text-primary border-primary/30",
                  },
                  {
                    title: "OpenBSD",
                    subtitle: "Official Project",
                    url: "https://www.openbsd.org",
                    icon: Globe,
                    color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
                  },
                  {
                    title: "DuckDuckGo",
                    subtitle: "Private Search",
                    url: "https://duckduckgo.com",
                    icon: Search,
                    color: "bg-sky-500/15 text-sky-400 border-sky-500/30",
                  },
                  {
                    title: "Hacker News",
                    subtitle: "Tech News",
                    url: "https://news.ycombinator.com",
                    icon: Globe,
                    color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
                  },
                ].map((site) => {
                  const Icon = site.icon;
                  return (
                    <button
                      key={site.title}
                      type="button"
                      onClick={() => navigateTo(site.url)}
                      className="p-3.5 bg-[#2b2a33]/70 hover:bg-[#383740] border border-[#42414d]/60 hover:border-primary/50 rounded-xl flex flex-col items-center text-center gap-2 transition-all group cursor-pointer shadow-sm"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${site.color} group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="truncate w-full">
                        <div className="font-semibold text-xs text-[#fbfbfe] truncate group-hover:text-primary">
                          {site.title}
                        </div>
                        <div className="text-[10px] text-[#8f8f9d] truncate">{site.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy & System Highlights */}
            <div className="w-full max-w-xl p-4 bg-[#2b2a33]/40 border border-[#383740]/60 rounded-xl flex items-center gap-3 text-xs text-[#9f9fa6]">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[#fbfbfe] font-semibold">Enhanced Tracking Protection:</span>{" "}
                Firefox automatically blocks known social media trackers, cross-site tracking cookies, and cryptominers.
              </div>
            </div>
          </div>
        ) : isDirectFrameBlocked ? (
          /* --- External Frame Protection View --- */
          <div className="h-full w-full bg-[#1c1b22] p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
              <Shield className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="text-base font-bold text-[#fbfbfe]">Secure External Page</h3>
              <p className="text-xs text-[#8f8f9d] leading-relaxed">
                <span className="text-primary font-semibold">{activeTab.url}</span> is an external secure web resource.
              </p>
            </div>

            <a
              href={activeTab.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-primary hover:opacity-90 text-black font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Open in Firefox Tab ↗</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          /* Embedded Webpage Frame */
          <iframe
            ref={iframeRef}
            src={buildProxyUrl(activeTab.url)}
            className="w-full h-full border-none bg-white"
            title={activeTab.title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </div>
    </div>
  );
}
