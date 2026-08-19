"use client";

import { useState, useEffect } from "react";
import { User, ArrowRight, Power, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SYSTEM_CONFIG } from "@/lib/system-config";

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
      className="min-h-[100dvh] h-full w-full bg-cover bg-center flex flex-col justify-between p-4 sm:p-8 select-none overflow-y-auto"
      style={{ backgroundImage: `url('${SYSTEM_CONFIG.wallpaper}')` }}
    >
      {/* Top section: Clock */}
      <div className="flex flex-col items-center mt-6 sm:mt-12 md:mt-16 drop-shadow-md">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-wider font-sans">
          {time}
        </h1>
        <p className="text-sm sm:text-lg md:text-xl text-white/80 mt-1 sm:mt-2 font-medium text-center">
          {date}
        </p>
      </div>

      {/* Center section: Login Box */}
      <div className="flex flex-col items-center my-6 sm:my-12">
        <div className="bg-black/45 backdrop-blur-md border border-white/15 p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-[320px]">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mb-3 sm:mb-4 overflow-hidden">
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-white/80" />
          </div>

          <h2 className="text-lg sm:text-xl text-white font-semibold mb-4 sm:mb-6">
            AtulPahal
          </h2>

          <form onSubmit={handleSubmit} className="w-full relative" suppressHydrationWarning>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder={`Enter password (${SYSTEM_CONFIG.loginPassword})...`}
              className={`w-full bg-white/10 border ${
                error ? "border-red-500/80" : "border-white/20"
              } text-white text-base rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-white/40`}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1 w-8 h-8 rounded-md text-white/70 hover:bg-white/20 hover:text-white cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="h-5 mt-2">
            {error && (
              <p className="text-red-400 text-xs sm:text-sm animate-in fade-in slide-in-from-top-1">
                Login failed
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section: Power Controls & System Info */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-center sm:items-end px-2 sm:px-4 pb-2 sm:pb-4">
        <div className="text-white/60 text-xs sm:text-sm font-mono text-center sm:text-left">
          {SYSTEM_CONFIG.name} {SYSTEM_CONFIG.desktopVersion} ({SYSTEM_CONFIG.architecture})
        </div>
        <div className="flex gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:bg-white/10 hover:text-white gap-1.5 cursor-pointer text-xs"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reboot</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:bg-white/10 hover:text-white gap-1.5 cursor-pointer text-xs"
            onClick={() => window.close()}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Shutdown</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
