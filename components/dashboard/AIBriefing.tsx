"use client";

import { useState, useRef, useCallback } from "react";
import { RotateCw, ExternalLink } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";

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

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0B1E2D 0%, #0A1A28 100%)",
        border: "1px solid rgba(14,113,105,0.25)",
        borderRadius: 16,
        padding: 28,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(14,113,105,0.08), transparent 70%)",
        }}
      />

      <div className="relative flex-1 flex flex-col" style={{ overflow: "auto" }}>
        <span
          className="inline-block rounded-full px-3 py-1 self-start"
          style={{
            background: "rgba(14,113,105,0.15)",
            border: "1px solid rgba(14,113,105,0.3)",
            color: "#0E7169",
            fontFamily: "var(--font-data)",
            fontSize: 10,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          ✦ AI Daily Briefing
        </span>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginTop: 12,
          }}
        >
          Today&apos;s Executive Summary
        </h2>

        {status === "done" && generatedAt && (
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Generated at {generatedAt} · Based on live data
          </p>
        )}

        <div style={{ marginTop: 20, flex: 1 }}>
          {status === "idle" && (
            <div style={{ animation: "fadeIn 300ms ease" }}>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                Generate an AI-powered executive summary based on your current
                metrics and activity signals.
              </p>
              <button
                onClick={generate}
                className="transition-all duration-200"
                style={{
                  background: "var(--brand)",
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 20px var(--brand-glow)";
                  e.currentTarget.style.background = "var(--brand-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "var(--brand)";
                }}
              >
                ✦ Generate Briefing
              </button>
            </div>
          )}

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

          {(status === "streaming" || status === "done") && (
            <div style={{ animation: "fadeIn 300ms ease", minHeight: 120 }}>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: "#C5D3E0",
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
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {status === "done" && (
          <div style={{ animation: "fadeIn 300ms ease" }}>
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                marginTop: 20,
                paddingTop: 16,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={generate}
                className="flex items-center gap-1.5 transition-all duration-200"
                style={{
                  background: "transparent",
                  color: "var(--brand)",
                  border: "1px solid var(--brand-border)",
                  fontFamily: "var(--font-data)",
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 6,
                  padding: "6px 14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--brand-dim)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <RotateCw style={{ width: 12, height: 12 }} />
                Regenerate
              </button>
              <button
                className="flex items-center gap-1.5 transition-all duration-200"
                style={{
                  background: "transparent",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--pulse-border)",
                  fontFamily: "var(--font-data)",
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 6,
                  padding: "6px 14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <ExternalLink style={{ width: 12, height: 12 }} />
                Share briefing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
