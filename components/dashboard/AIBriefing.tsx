"use client";

import { useState, useRef, useCallback } from "react";
import { RotateCw, ExternalLink, Sparkles, Eye } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Status = "idle" | "loading" | "streaming" | "done" | "error";

const DEFAULT_SNAPSHOT = {
  newSignups: 91,
  activeShops: 4382,
  mrr: 465,
  churnRate: 2.1,
  openTickets: 34,
  npsScore: 67,
  trialToPaid: 34.2,
  airTrials: 12,
};

interface AIBriefingProps {
  metricsSnapshot?: Record<string, unknown>;
}

export function AIBriefing({ metricsSnapshot }: AIBriefingProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [generatedAt, setGeneratedAt] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const generate = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setText("");
    setError("");
    setStatus("loading");

    await new Promise((r) => setTimeout(r, 800));

    if (controller.signal.aborted) return;
    setStatus("streaming");

    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metricsSnapshot: metricsSnapshot ?? DEFAULT_SNAPSHOT,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setText(accumulated);
      }

      const now = new Date();
      setGeneratedAt(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      );
      setStatus("done");
      toast("✦ Briefing generated", "success");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Failed to generate summary");
      setStatus("error");
    }
  }, [metricsSnapshot, toast]);

  const isIdle = status === "idle";
  const hasContent = status === "streaming" || status === "done";

  if (isIdle) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={generate}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") generate(); }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="ai-briefing-idle"
        style={{
          borderRadius: 16,
          padding: 32,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: isHovered
            ? "1px solid rgba(14, 113, 105, 0.3)"
            : "1px solid var(--ai-border)",
          transform: isHovered ? "translateY(-1px)" : "translateY(0)",
          boxShadow: isHovered
            ? "0 8px 24px rgba(14, 113, 105, 0.08)"
            : "none",
          transition: "all 200ms ease",
          outline: "none",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Icon circle */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: isHovered
              ? "rgba(14, 113, 105, 0.15)"
              : "rgba(14, 113, 105, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 200ms ease",
          }}
        >
          <Sparkles
            style={{
              width: 32,
              height: 32,
              color: "#0E7169",
              opacity: isHovered ? 1 : 0.7,
              transition: "opacity 200ms ease",
            }}
          />
        </div>

        {/* Title */}
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
            marginTop: 16,
          }}
        >
          AI Daily Briefing
        </span>

        {/* Description */}
        <span
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            textAlign: "center",
            maxWidth: 300,
            marginTop: 4,
            lineHeight: 1.5,
          }}
        >
          Generate an executive summary from today&apos;s metrics and activity
        </span>

        {/* Inline CTA */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#0E7169",
            marginTop: 16,
            fontFamily: "var(--font-data)",
            textDecoration: isHovered ? "underline" : "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Generate Briefing
          <span
            style={{
              display: "inline-block",
              transform: isHovered ? "translateX(2px)" : "translateX(0)",
              transition: "transform 200ms ease",
            }}
          >
            →
          </span>
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative overflow-hidden"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--pulse-border)",
          borderRadius: 16,
          padding: 24,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="relative flex flex-col" style={{ flex: 1, overflow: "hidden" }}>
          {/* Badge label */}
          <div className="flex items-center gap-2 self-start">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: "var(--brand-dim)",
                border: "1px solid var(--brand-border)",
                color: "var(--brand)",
                fontFamily: "var(--font-data)",
                fontSize: 10,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              <Sparkles style={{ width: 10, height: 10 }} />
              AI Daily Briefing
            </span>
            {status === "done" && generatedAt && (
              <span
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                {generatedAt}
              </span>
            )}
          </div>

          <div style={{ marginTop: 16, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {status === "loading" && (
              <div style={{ animation: "fadeIn 300ms ease" }}>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginBottom: 12,
                  }}
                >
                  Analyzing 47 data signals
                  <span className="loading-dots" />
                </p>
                <div
                  className="shimmer"
                  style={{ height: 4, borderRadius: 2, width: "100%" }}
                />
              </div>
            )}

            {hasContent && (
              <div style={{ animation: "fadeIn 300ms ease", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1, overflowY: "auto", maxHeight: 120 }}>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.75,
                      color: "var(--ai-text)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {text}
                    {status === "streaming" && (
                      <span className="ai-cursor" style={{ color: "var(--brand)" }}>
                        |
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div style={{ animation: "fadeIn 300ms ease" }}>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--danger)",
                    marginBottom: 12,
                  }}
                >
                  {error}
                </p>
                <button
                  onClick={generate}
                  style={{
                    background: "transparent",
                    color: "var(--danger)",
                    border: "1px solid var(--danger-dim)",
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 8,
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {status === "done" && (
            <div style={{ animation: "fadeIn 300ms ease", flexShrink: 0 }}>
              <div
                style={{
                  borderTop: "1px solid var(--pulse-border)",
                  marginTop: 12,
                  paddingTop: 12,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 transition-all duration-200"
                  style={{
                    background: "var(--brand-dim)",
                    color: "var(--brand)",
                    border: "1px solid var(--brand-border)",
                    fontFamily: "var(--font-data)",
                    fontSize: 11,
                    fontWeight: 500,
                    borderRadius: 6,
                    padding: "5px 12px",
                    cursor: "pointer",
                  }}
                >
                  <Eye style={{ width: 11, height: 11 }} />
                  View All
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); generate(); }}
                  className="flex items-center gap-1.5 transition-all duration-200"
                  style={{
                    background: "transparent",
                    color: "var(--text-muted)",
                    border: "none",
                    fontFamily: "var(--font-data)",
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "5px 8px",
                    cursor: "pointer",
                    marginLeft: "auto",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                  <RotateCw style={{ width: 11, height: 11 }} />
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="sm:max-w-lg"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--pulse-border)",
            maxHeight: "80vh",
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              Executive Summary
            </DialogTitle>
            <DialogDescription
              style={{
                fontFamily: "var(--font-data)",
                color: "var(--text-muted)",
                fontSize: 12,
              }}
            >
              Generated at {generatedAt} · Based on live data
            </DialogDescription>
          </DialogHeader>
          <div style={{ overflowY: "auto", maxHeight: "60vh", paddingRight: 4 }}>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: "var(--ai-text)",
                whiteSpace: "pre-wrap",
              }}
            >
              {text}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
