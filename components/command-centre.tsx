"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  UserPlus,
  TrendingUp,
  Headphones,
  Settings,
  Sparkles,
  Download,
  Sun,
  Moon,
  RotateCw,
  DollarSign,
  TrendingDown,
  ThumbsUp,
  Ticket,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

interface CommandItem {
  id: string;
  label: string;
  icon: LucideIcon;
  section: string;
  action: () => void;
  keywords?: string;
}

function fuzzyMatch(text: string, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const target = text.toLowerCase();
  return words.every((w) => target.includes(w));
}

function highlightMatch(text: string, query: string): ReactNode {
  if (!query.trim()) return text;

  const lower = text.toLowerCase();
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const highlighted = new Array(text.length).fill(false);

  for (const word of words) {
    let idx = 0;
    while (idx < lower.length) {
      const pos = lower.indexOf(word, idx);
      if (pos === -1) break;
      for (let i = pos; i < pos + word.length; i++) highlighted[i] = true;
      idx = pos + 1;
    }
  }

  const spans: ReactNode[] = [];
  let i = 0;
  while (i < text.length) {
    const isH = highlighted[i];
    let j = i;
    while (j < text.length && highlighted[j] === isH) j++;
    const segment = text.slice(i, j);
    if (isH) {
      spans.push(
        <span key={i} style={{ color: "var(--brand)", fontWeight: 600 }}>
          {segment}
        </span>
      );
    } else {
      spans.push(<span key={i}>{segment}</span>);
    }
    i = j;
  }
  return <>{spans}</>;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export function CommandCentre() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, toggleTheme: toggle } = useTheme();

  const close = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setQuery("");
      setSelectedIndex(0);
    }, 100);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  const items: CommandItem[] = [
    { id: "p-overview", label: "Overview", icon: LayoutDashboard, section: "Pages", action: () => navigate("/dashboard/overview") },
    { id: "p-signups", label: "Signups", icon: UserPlus, section: "Pages", action: () => navigate("/dashboard/signups") },
    { id: "p-revenue", label: "Revenue", icon: TrendingUp, section: "Pages", action: () => navigate("/dashboard/revenue") },
    { id: "p-support", label: "Support", icon: Headphones, section: "Pages", action: () => navigate("/dashboard/support") },
    { id: "p-settings", label: "Settings", icon: Settings, section: "Pages", action: () => navigate("/dashboard/settings") },

    {
      id: "a-briefing",
      label: "Generate AI Briefing",
      icon: Sparkles,
      section: "Quick Actions",
      action: () => navigate("/dashboard/overview"),
      keywords: "ai summary brief",
    },
    {
      id: "a-export",
      label: "Export CSV",
      icon: Download,
      section: "Quick Actions",
      action: () => navigate("/dashboard/revenue"),
      keywords: "download data",
    },
    {
      id: "a-theme",
      label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      icon: theme === "dark" ? Sun : Moon,
      section: "Quick Actions",
      action: () => {
        toggle();
        close();
      },
      keywords: "dark light mode theme",
    },
    {
      id: "a-refresh",
      label: "Refresh Data",
      icon: RotateCw,
      section: "Quick Actions",
      action: () => {
        close();
        router.refresh();
      },
      keywords: "reload update",
    },

    { id: "m-mrr", label: "MRR", icon: DollarSign, section: "Metrics", action: () => navigate("/dashboard/revenue"), keywords: "monthly recurring revenue" },
    { id: "m-churn", label: "Churn Rate", icon: TrendingDown, section: "Metrics", action: () => navigate("/dashboard/revenue"), keywords: "churn attrition" },
    { id: "m-nps", label: "NPS Score", icon: ThumbsUp, section: "Metrics", action: () => navigate("/dashboard/overview"), keywords: "net promoter score" },
    { id: "m-tickets", label: "Open Tickets", icon: Ticket, section: "Metrics", action: () => navigate("/dashboard/support"), keywords: "support tickets" },
    { id: "m-trial", label: "Trial Conversion", icon: ArrowRight, section: "Metrics", action: () => navigate("/dashboard/signups"), keywords: "trial paid conversion" },
  ];

  const filtered = query.trim()
    ? items.filter((item) => fuzzyMatch(`${item.label} ${item.keywords ?? ""}`, query))
    : items;

  const sections: { label: string; items: CommandItem[] }[] = [];
  for (const item of filtered) {
    let section = sections.find((s) => s.label === item.section);
    if (!section) {
      section = { label: item.section, items: [] };
      sections.push(section);
    }
    section.items.push(item);
  }

  const flatFiltered = sections.flatMap((s) => s.items);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          setIsOpen(true);
        }
        return;
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatFiltered.length);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatFiltered.length) % flatFiltered.length);
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        flatFiltered[selectedIndex]?.action();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close, flatFiltered, selectedIndex]);

  useEffect(() => {
    function handleOpen() {
      setIsOpen(true);
    }
    window.addEventListener("open-command-centre", handleOpen);
    return () => window.removeEventListener("open-command-centre", handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector("[data-active='true']") as HTMLElement | null;
    active?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!isOpen) return null;

  const animationClass = isClosing ? "cmdk-out" : "cmdk-in";
  const backdropClass = isClosing ? "cmdk-backdrop-out" : "cmdk-backdrop-in";

  return createPortal(
    <div
      className={backdropClass}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "min(20vh, 160px)",
        background: "var(--cmdk-backdrop)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={animationClass}
        style={{
          width: 560,
          maxHeight: 420,
          background: "var(--surface-1)",
          border: "1px solid var(--pulse-border)",
          borderRadius: 12,
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          className="flex items-center gap-3"
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--pulse-border)",
          }}
        >
          <Search style={{ width: 18, height: 18, color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, metrics, actions..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 15,
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-data)",
              color: "var(--text-muted)",
              background: "var(--surface-3)",
              borderRadius: 4,
              padding: "2px 6px",
              flexShrink: 0,
            }}
          >
            ESC
          </span>
        </div>

        <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {flatFiltered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 16px",
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.label}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-muted)",
                    padding: "8px 16px 4px",
                    fontFamily: "var(--font-data)",
                  }}
                >
                  {section.label}
                </div>
                {section.items.map((item) => {
                  const globalIdx = flatFiltered.indexOf(item);
                  const isSelected = globalIdx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      data-active={isSelected}
                      onClick={() => item.action()}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className="flex items-center gap-3 w-full text-left transition-colors duration-75"
                      style={{
                        height: 40,
                        padding: "0 16px",
                        borderRadius: 8,
                        margin: "0 8px",
                        width: "calc(100% - 16px)",
                        background: isSelected ? "var(--surface-3)" : "transparent",
                        color: "var(--text-primary)",
                      }}
                    >
                      <item.icon
                        style={{
                          width: 18,
                          height: 18,
                          color: isSelected ? "var(--brand)" : "var(--text-muted)",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 14, flex: 1 }}>
                        {highlightMatch(item.label, query)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div
          className="flex items-center justify-between"
          style={{
            padding: "8px 16px",
            borderTop: "1px solid var(--pulse-border)",
            fontSize: 11,
            color: "var(--text-muted)",
            fontFamily: "var(--font-data)",
          }}
        >
          <div className="flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </div>
          <span style={{ color: "var(--text-muted)", opacity: 0.6 }}>
            {isMac ? "⌘" : "Ctrl+"}K to toggle
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
