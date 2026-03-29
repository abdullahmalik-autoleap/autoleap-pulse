"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/dashboard/PageTransition";
import { LoadingBar } from "@/components/loading-bar";
import { CommandCentre } from "@/components/command-centre";

const STORAGE_KEY = "sidebar-collapsed";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    ["/dashboard/signups", "/dashboard/revenue", "/dashboard/support", "/dashboard/settings", "/dashboard/overview"].forEach((r) => router.prefetch(r));
  }, [router]);

  useEffect(() => {
    setIsCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
    setMounted(true);

    const mq = window.matchMedia("(max-width: 768px)");
    function handleChange(e: MediaQueryListEvent | MediaQueryList) {
      if (e.matches) setIsCollapsed(true);
    }
    handleChange(mq);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  function handleToggle() {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  if (!mounted) {
    return (
      <div className="flex h-screen" style={{ background: "var(--bg)" }} />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar collapsed={isCollapsed} onToggle={handleToggle} />
      <LoadingBar />
      <PageTransition>{children}</PageTransition>
      <CommandCentre />
    </div>
  );
}
