"use client";

import { useState, useEffect } from "react";
import { User, ArrowRight, Power, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import { PORTFOLIO_DATA } from "@/lib/portfolio-data";

interface SDDMLoginProps {
  onLogin: () => void;
}

export function SDDMLogin({ onLogin }: SDDMLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SYSTEM_CONFIG.loginPassword) {
      setError(false);
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex flex-col justify-between p-8 select-none"
      style={{ backgroundImage: `url('${SYSTEM_CONFIG.wallpaper}')` }}
    >
      {/* Top section: Clock */}
      <div className="flex flex-col items-center mt-16 drop-shadow-md">
        <h1 className="text-7xl font-bold text-white tracking-wider font-sans">
          {time}
        </h1>
        <p className="text-xl text-white/80 mt-2 font-medium">{date}</p>
      </div>

      {/* Center section: Login Box */}
      <div className="flex flex-col items-center mb-24">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col items-center w-80">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mb-4 overflow-hidden">
            <User className="w-12 h-12 text-white/80" />
          </div>

          <h2 className="text-xl text-white font-semibold mb-6">{SYSTEM_CONFIG.username}</h2>

          <form onSubmit={handleSubmit} className="w-full relative" suppressHydrationWarning>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder={`Enter password (demo: ${SYSTEM_CONFIG.loginPassword})...`}
              className={`w-full bg-white/10 border ${
                error ? "border-red-500/80" : "border-white/20"
              } text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-white/40`}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1 w-8 h-8 rounded-md text-white/70 hover:bg-white/20 hover:text-white"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="h-6 mt-2">
            {error && (
              <p className="text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                Login failed
              </p>
            )}
          </div>
        </div>

        {/* Portfolio Hint */}
        <div className="flex flex-col items-center gap-1.5 mt-3 pt-2 border-t border-white/5">
          <div className="text-center text-white/40 text-[10px]">
            Password: {SYSTEM_CONFIG.loginPassword} (demo)
          </div>
          <div className="flex gap-3 text-[10px]">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400/60 hover:text-amber-300 transition-colors"
            >
              View Resume (PDF)
            </a>
            <span className="text-white/20">·</span>
            <a
              href={PORTFOLIO_DATA.social.find((s) => s.icon === "github")?.href ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400/60 hover:text-amber-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Bottom section: Power Controls */}
      <div className="flex justify-between items-end px-4 pb-4">
        <div className="text-white/50 text-sm font-mono">
          {SYSTEM_CONFIG.name} {SYSTEM_CONFIG.desktopVersion} ({SYSTEM_CONFIG.architecture})
        </div>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="text-white/70 hover:bg-white/10 hover:text-white gap-2"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reboot</span>
          </Button>
          <Button
            variant="ghost"
            className="text-white/70 hover:bg-white/10 hover:text-white gap-2"
            onClick={() => window.close()}
          >
            <Power className="w-4 h-4" />
            <span>Shutdown</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
