"use client";

import { useToast } from "@/lib/hooks/useToast";
import type { ToastType } from "@/lib/hooks/useToast";
import { X } from "lucide-react";

const ACCENT: Record<ToastType, string> = {
  success: "var(--success)",
  info: "var(--info)",
  warning: "var(--warning)",
  error: "var(--danger)",
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 360,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={t.exiting ? "toast-exit" : "toast-enter"}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--pulse-border)",
            borderLeft: `3px solid ${ACCENT[t.type]}`,
            borderRadius: 8,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "var(--shadow-md)",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "var(--text-primary)",
              flex: 1,
              lineHeight: 1.4,
            }}
          >
            {t.message}
          </p>
          <button
            onClick={() => dismiss(t.id)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              padding: 2,
              flexShrink: 0,
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      ))}
    </div>
  );
}
