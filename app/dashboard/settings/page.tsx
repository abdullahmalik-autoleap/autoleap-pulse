"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Toggle } from "@/components/dashboard/Toggle";

const DATA_SOURCES = [
  {
    id: "stripe",
    name: "Stripe",
    description: "MRR, churn data, subscription analytics",
    color: "#635BFF",
    letter: "S",
  },
  {
    id: "intercom",
    name: "Intercom",
    description: "Support tickets, conversations, resolution times",
    color: "#1F8DED",
    letter: "I",
  },
  {
    id: "delighted",
    name: "Delighted",
    description: "NPS surveys, customer satisfaction scores",
    color: "#35B55F",
    letter: "D",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Leads, trial signups, sales pipeline",
    color: "#FF7A59",
    letter: "H",
  },
  {
    id: "ga",
    name: "Google Analytics",
    description: "Website signups, traffic, conversion funnels",
    color: "#E37400",
    letter: "G",
  },
] as const;

const NOTIFICATION_ITEMS = [
  { id: "churn", label: "Alert on churn event", defaultOn: true },
  { id: "mrr", label: "Alert on MRR milestone", defaultOn: true },
  { id: "email", label: "Daily summary email", defaultOn: false },
  { id: "sla", label: "Support ticket SLA breach", defaultOn: true },
] as const;

interface ConnectionState {
  connected: boolean;
  lastSynced: string | null;
}

interface AISettings {
  autoGenerate: boolean;
  frequency: string;
  context: string;
}

function buildInitialConnections(): Record<string, ConnectionState> {
  const map: Record<string, ConnectionState> = {};
  for (const s of DATA_SOURCES) {
    map[s.id] = {
      connected: s.id === "stripe" || s.id === "intercom",
      lastSynced: s.id === "stripe" ? "2 min ago" : s.id === "intercom" ? "14 min ago" : null,
    };
  }
  return map;
}

function buildInitialNotifications(): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  for (const n of NOTIFICATION_ITEMS) {
    map[n.id] = n.defaultOn;
  }
  return map;
}

const INITIAL_AI: AISettings = {
  autoGenerate: true,
  frequency: "daily",
  context: "",
};

export default function SettingsPage() {
  const [connections, setConnections] = useState(buildInitialConnections);
  const [aiSettings, setAISettings] = useState<AISettings>(INITIAL_AI);
  const [notifications, setNotifications] = useState(buildInitialNotifications);

  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({ aiSettings: INITIAL_AI, notifications: buildInitialNotifications() })
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const currentSnapshot = JSON.stringify({ aiSettings, notifications });
  const isDirty = currentSnapshot !== savedSnapshot;

  const handleSave = useCallback(() => {
    setSavedSnapshot(currentSnapshot);
    setSavedMessage("Saved ✓");
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSavedMessage(null), 2000);
  }, [currentSnapshot]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  function toggleConnection(id: string) {
    setConnections((prev) => {
      const current = prev[id];
      return {
        ...prev,
        [id]: {
          connected: !current.connected,
          lastSynced: !current.connected ? "just now" : null,
        },
      };
    });
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 shrink-0"
        style={{
          height: 56,
          background: "var(--surface-1)",
          borderBottom: "1px solid var(--pulse-border)",
        }}
      >
        <div className="flex items-center gap-2">
          <h1
            className="text-[15px] font-semibold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            Settings
          </h1>
          <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            /
          </span>
          <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Dashboard
          </span>
        </div>
      </header>

      {/* Unsaved changes banner */}
      {isDirty && (
        <div
          className="flex items-center gap-3 px-6 py-2.5 shrink-0"
          style={{
            background: "var(--surface-2)",
            borderBottom: "1px solid var(--pulse-border)",
            borderLeft: "3px solid var(--warning)",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "var(--warning)",
              flex: 1,
            }}
          >
            You have unsaved changes
          </p>
          <button
            onClick={handleSave}
            className="rounded-md px-3 py-1 text-xs font-medium"
            style={{
              background: "var(--brand)",
              color: "#fff",
              border: "none",
              fontFamily: "var(--font-data)",
            }}
          >
            Save
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="mx-auto flex flex-col gap-8" style={{ maxWidth: 860 }}>

          {/* SECTION 1: Data Connections */}
          <section>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              Data Connections
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginBottom: 16,
              }}
            >
              Connect external services to pull live data into your dashboard.
            </p>

            <div className="flex flex-col gap-3">
              {DATA_SOURCES.map((source) => {
                const conn = connections[source.id];
                return (
                  <div
                    key={source.id}
                    className="flex items-center gap-4"
                    style={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--pulse-border)",
                      borderRadius: 14,
                      padding: 20,
                    }}
                  >
                    {/* Logo placeholder */}
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: source.color,
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#fff",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {source.letter}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {source.name}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          marginTop: 2,
                        }}
                      >
                        {source.description}
                      </p>
                      {conn.connected && conn.lastSynced && (
                        <p
                          style={{
                            fontSize: 11,
                            fontFamily: "var(--font-data)",
                            color: "var(--text-muted)",
                            marginTop: 4,
                          }}
                        >
                          Last synced: {conn.lastSynced}
                        </p>
                      )}
                    </div>

                    {/* Status + action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="rounded-full px-2.5 py-0.5"
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: "var(--font-data)",
                          background: conn.connected ? "var(--brand-dim)" : "var(--surface-3)",
                          color: conn.connected ? "var(--brand)" : "var(--text-muted)",
                        }}
                      >
                        {conn.connected ? "Connected" : "Not Connected"}
                      </span>
                      <button
                        onClick={() => toggleConnection(source.id)}
                        className="rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200"
                        style={{
                          background: conn.connected ? "transparent" : "var(--brand)",
                          color: conn.connected ? "var(--text-secondary)" : "#fff",
                          border: conn.connected
                            ? "1px solid var(--pulse-border)"
                            : "1px solid var(--brand)",
                          fontFamily: "var(--font-data)",
                        }}
                        onMouseEnter={(e) => {
                          if (conn.connected) {
                            e.currentTarget.style.borderColor = "var(--danger)";
                            e.currentTarget.style.color = "var(--danger)";
                          } else {
                            e.currentTarget.style.background = "var(--brand-hover)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (conn.connected) {
                            e.currentTarget.style.borderColor = "var(--pulse-border)";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          } else {
                            e.currentTarget.style.background = "var(--brand)";
                          }
                        }}
                      >
                        {conn.connected ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--pulse-border)" }} />

          {/* SECTION 2: AI Briefing Settings */}
          <section>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              AI Briefing Settings
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginBottom: 16,
              }}
            >
              Configure how the AI executive briefing is generated.
            </p>

            <div
              className="flex flex-col gap-5"
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--pulse-border)",
                borderRadius: 14,
                padding: 24,
              }}
            >
              {/* Auto-generate toggle */}
              <div className="flex items-center justify-between">
                <label
                  style={{
                    fontSize: 14,
                    color: "var(--text-primary)",
                  }}
                >
                  Auto-generate briefing on page load
                </label>
                <Toggle
                  checked={aiSettings.autoGenerate}
                  onChange={(v) => setAISettings((p) => ({ ...p, autoGenerate: v }))}
                />
              </div>

              {/* Frequency select */}
              <div className="flex flex-col gap-2">
                <label
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-data)",
                  }}
                >
                  Briefing frequency
                </label>
                <select
                  value={aiSettings.frequency}
                  onChange={(e) =>
                    setAISettings((p) => ({ ...p, frequency: e.target.value }))
                  }
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--pulse-border)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-data)",
                    outline: "none",
                    appearance: "none",
                    WebkitAppearance: "none",
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A8FA8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    paddingRight: 36,
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="6h">Every 6 hours</option>
                  <option value="manual">Manual only</option>
                </select>
              </div>

              {/* Context textarea */}
              <div className="flex flex-col gap-2">
                <label
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-data)",
                  }}
                >
                  Additional context for AI
                </label>
                <textarea
                  rows={4}
                  value={aiSettings.context}
                  onChange={(e) =>
                    setAISettings((p) => ({ ...p, context: e.target.value }))
                  }
                  placeholder="E.g. We're running a spring promo this week..."
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--pulse-border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-data)",
                    resize: "vertical",
                    outline: "none",
                    lineHeight: 1.6,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand-border)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--pulse-border)";
                  }}
                />
              </div>

              {/* Save button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200"
                  style={{
                    background: "var(--brand)",
                    color: "#fff",
                    border: "none",
                    fontFamily: "var(--font-display)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--brand-hover)";
                    e.currentTarget.style.boxShadow = "0 0 16px var(--brand-glow)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--brand)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Save Settings
                </button>
                {savedMessage && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "var(--font-data)",
                      color: "var(--success)",
                      animation: "fadeIn 200ms ease",
                    }}
                  >
                    {savedMessage}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--pulse-border)" }} />

          {/* SECTION 3: Notifications */}
          <section>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              Notifications
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginBottom: 16,
              }}
            >
              Choose which alerts and updates you want to receive.
            </p>

            <div
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--pulse-border)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              {NOTIFICATION_ITEMS.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                  style={{
                    padding: "16px 24px",
                    borderBottom:
                      i < NOTIFICATION_ITEMS.length - 1
                        ? "1px solid var(--pulse-border)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--text-primary)",
                    }}
                  >
                    {item.label}
                  </span>
                  <Toggle
                    checked={notifications[item.id]}
                    onChange={(v) =>
                      setNotifications((p) => ({ ...p, [item.id]: v }))
                    }
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Bottom spacer */}
          <div style={{ height: 24 }} />
        </div>
      </main>
    </div>
  );
}
