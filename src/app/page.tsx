"use client";

import { useState } from "react";
import { Desktop } from "@/components/desktop/desktop";
import { SDDMLogin } from "@/components/login/sddm-login";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <SDDMLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return <Desktop />;
}
