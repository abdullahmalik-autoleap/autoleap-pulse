"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/lib/theme";
import {
  LayoutDashboard,
  UserPlus,
  TrendingUp,
  Headphones,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/signups", label: "Signups", icon: UserPlus },
  { href: "/dashboard/revenue", label: "Revenue", icon: TrendingUp },
  { href: "/dashboard/support", label: "Support", icon: Headphones },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme } = useTheme();

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="flex flex-col h-full transition-all duration-200 ease-in-out shrink-0"
      style={{
        width: collapsed ? 64 : 220,
        background: "var(--surface-1)",
        borderRight: "1px solid var(--pulse-border)",
      }}
    >
      <div
        className="flex items-center gap-2.5 px-4 shrink-0"
        style={{ height: 56, borderBottom: "1px solid var(--pulse-border)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5">
          {collapsed ? (
            <Image
              src="/logos/Compact.svg"
              alt="AutoLeap Pulse"
              width={28}
              height={28}
              className="shrink-0"
            />
          ) : (
            <Image
              src={theme === "light" ? "/logos/Light.svg" : "/logos/Dark.svg"}
              alt="AutoLeap Pulse"
              width={120}
              height={28}
              className="shrink-0"
              style={{ height: 28, width: "auto" }}
            />
          )}
        </Link>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200${collapsed ? " justify-center" : ""}`}
              style={{
                color: active ? "var(--active-nav-text)" : "var(--text-secondary)",
                background: active ? "var(--brand-dim)" : "transparent",
                borderLeft: active ? "2px solid var(--brand)" : "2px solid transparent",
              }}
              data-tooltip={collapsed ? item.label : undefined}
              onMouseEnter={(e) => {
                router.prefetch(item.href);
                if (!active)
                  e.currentTarget.style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <item.icon
                className="shrink-0"
                style={{
                  width: 16,
                  height: 16,
                  color: active ? "var(--brand)" : undefined,
                }}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className="shrink-0 px-2 pb-3 space-y-2"
        style={{ borderTop: "1px solid var(--pulse-border)" }}
      >
        {session?.user && !collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div
              className="flex items-center justify-center rounded-full text-[10px] font-bold shrink-0"
              style={{
                width: 28,
                height: 28,
                background: "var(--brand)",
                color: "var(--active-nav-text)",
              }}
            >
              {(session.user.name?.[0] ?? session.user.email?.[0] ?? "U").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[12px] font-medium truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {session.user.name ?? session.user.email}
              </p>
              <p
                className="text-[11px] truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {session.user.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="shrink-0 p-1 rounded transition-colors duration-200"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--danger)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
              title="Sign out"
            >
              <LogOut style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}

        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full rounded-lg py-1.5 transition-all duration-200"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--surface-2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen style={{ width: 16, height: 16 }} />
          ) : (
            <PanelLeftClose style={{ width: 16, height: 16 }} />
          )}
        </button>
      </div>
    </aside>
  );
}
