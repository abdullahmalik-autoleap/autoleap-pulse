"use client";

import { useLiveFeed } from "@/lib/hooks/useLiveFeed";

const SEVERITY_COLORS: Record<string, string> = {
  success: "#0E7169",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  signup: { bg: "var(--brand-dim)", text: "var(--brand)" },
  churn: { bg: "var(--danger-dim)", text: "var(--danger)" },
  ticket: { bg: "var(--warning-dim)", text: "var(--warning)" },
  nps: { bg: "var(--info-dim)", text: "var(--info)" },
  air_trial: { bg: "var(--brand-dim)", text: "var(--brand)" },
  feature_request: { bg: "var(--info-dim)", text: "var(--info)" },
};

function isRecent(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 5 * 60 * 1000;
}

export function ActivityFeed() {
  const { events, isLoading } = useLiveFeed();

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--pulse-border)",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="flex items-center justify-between shrink-0"
        style={{ padding: "16px 20px", borderBottom: "1px solid var(--pulse-border)" }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Live Activity
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: "#22c55e" }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: "#22c55e" }}
            />
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "var(--font-data)",
              color: "#22c55e",
            }}
          >
            Live
          </span>
        </div>
      </div>

      <div style={{ maxHeight: 380, overflowY: "auto", flex: 1 }}>
        {isLoading && events.length === 0 ? (
          <div style={{ padding: "20px 16px" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shimmer" style={{ height: 40, borderRadius: 6, marginBottom: 8 }} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p
            style={{
              padding: "20px 16px",
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            No recent activity.
          </p>
        ) : (
          events.map((event, i) => {
            const sevColor = SEVERITY_COLORS[event.severity] ?? SEVERITY_COLORS.info;
            const typeStyle = TYPE_COLORS[event.type] ?? { bg: "var(--surface-2)", text: "var(--text-muted)" };
            const recent = isRecent(event.createdAt);

            return (
              <div
                key={event.id}
                className={`transition-colors duration-150 ${event.isNew ? "feed-slide-in" : ""}`}
                style={{
                  padding: "12px 16px",
                  borderBottom: i < events.length - 1 ? "1px solid var(--pulse-border)" : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={recent ? "pulse-dot" : ""}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: sevColor,
                      boxShadow: `0 0 6px ${sevColor}40`,
                      flexShrink: 0,
                      marginTop: 5,
                      color: sevColor,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text-primary)",
                          lineHeight: 1.5,
                          flex: 1,
                        }}
                      >
                        {event.message}
                      </p>
                      <span
                        className="shrink-0 rounded-full px-1.5 py-0.5"
                        style={{
                          fontSize: 10,
                          fontFamily: "var(--font-data)",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          background: typeStyle.bg,
                          color: typeStyle.text,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {event.type.replace("_", " ")}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-data)",
                        color: "var(--text-muted)",
                        marginTop: 3,
                        textAlign: "right",
                      }}
                    >
                      {event.timeAgo}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div
        className="shrink-0"
        style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--pulse-border)",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontFamily: "var(--font-data)",
            color: "var(--brand)",
            cursor: "pointer",
          }}
        >
          View all activity →
        </span>
      </div>
    </div>
  );
}
