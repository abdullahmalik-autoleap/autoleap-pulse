"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ShortcutGroup {
  title: string;
  shortcuts: { key: string; description: string }[];
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: ShortcutGroup[];
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  groups,
}: KeyboardShortcutsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--pulse-border)",
          borderRadius: 16,
          padding: 28,
          width: 440,
          maxHeight: "80vh",
          overflowY: "auto",
          animation: "kpiFadeIn 200ms ease-out",
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors duration-200"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div className="flex flex-col" style={{ gap: 20 }}>
          {groups.map((group) => (
            <div key={group.title}>
              <h3
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: "var(--font-data)",
                  color: "var(--text-muted)",
                  marginBottom: 8,
                }}
              >
                {group.title}
              </h3>
              <div className="flex flex-col" style={{ gap: 4 }}>
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      background: "var(--surface-2)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: "var(--font-data)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {shortcut.description}
                    </span>
                    <kbd
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-data)",
                        fontWeight: 600,
                        color: "var(--brand)",
                        background: "var(--brand-dim)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        border: "1px solid var(--brand-border)",
                      }}
                    >
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
