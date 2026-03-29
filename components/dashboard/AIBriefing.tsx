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

  return (
    <>
      <div
        className="relative overflow-hidden"
        style={{
          background: "var(--ai-bg)",
          border: "1px solid var(--ai-border)",
          borderRadius: 16,
          padding: 24,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              "radial-gradient(ellipse 50% 40% at 80% 10%, var(--ai-glow-1), transparent 70%)",
              "radial-gradient(ellipse 40% 50% at 10% 90%, var(--ai-glow-2), transparent 70%)",
            ].join(", "),
          }}
        />

        <div className="relative flex flex-col" style={{ flex: 1, overflow: "hidden" }}>
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
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
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

          <div style={{ marginTop: 16, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {isIdle && (
              <div
                style={{
                  animation: "fadeIn 300ms ease",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  Generate an AI-powered executive summary based on your current
                  metrics and activity signals.
                </p>
                <div>
                  <button
                    onClick={generate}
                    className="inline-flex items-center gap-2 transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, var(--brand), var(--brand-hover))",
                      color: "#fff",
                      fontFamily: "var(--font-display)",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 22px",
                      boxShadow: "var(--shadow-md)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <Sparkles style={{ width: 14, height: 14 }} />
                    Generate Briefing
                  </button>
                </div>
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
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--brand-dim)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--brand-dim)";
                  }}
                >
                  <Eye style={{ width: 11, height: 11 }} />
                  View All
                </button>
                <button
                  onClick={generate}
                  className="flex items-center gap-1.5 transition-all duration-200"
                  style={{
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--pulse-border)",
                    fontFamily: "var(--font-data)",
                    fontSize: 11,
                    fontWeight: 500,
                    borderRadius: 6,
                    padding: "5px 12px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <RotateCw style={{ width: 11, height: 11 }} />
                  Regenerate
                </button>
                <button
                  className="flex items-center gap-1.5 transition-all duration-200 ml-auto"
                  style={{
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--pulse-border)",
                    fontFamily: "var(--font-data)",
                    fontSize: 11,
                    fontWeight: 500,
                    borderRadius: 6,
                    padding: "5px 12px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <ExternalLink style={{ width: 11, height: 11 }} />
                  Share
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
