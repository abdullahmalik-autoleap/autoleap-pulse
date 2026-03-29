"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "Syne, sans-serif",
        color: "var(--error-page-text)",
        padding: "48px 24px",
      }}
    >
      <div style={{ fontSize: "32px" }}>⚠</div>
      <div style={{ fontSize: "18px", fontWeight: 600 }}>
        Something went wrong
      </div>
      <div
        style={{
          fontSize: "13px",
          color: "var(--error-page-sub)",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        {error.message || "An unexpected error occurred."}
      </div>
      <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
        <button
          onClick={reset}
          style={{
            background: "var(--brand)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 24px",
            fontSize: "14px",
            cursor: "pointer",
            fontFamily: "Syne, sans-serif",
          }}
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          style={{
            color: "var(--brand)",
            fontSize: "14px",
            textDecoration: "none",
            fontFamily: "Syne, sans-serif",
            display: "flex",
            alignItems: "center",
          }}
        >
          ← Back to Overview
        </Link>
      </div>
    </div>
  );
}
