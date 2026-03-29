"use client";

import { useEffect } from "react";

export default function Error({
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
        minHeight: "100vh",
        background: "var(--error-page-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "Syne, sans-serif",
        color: "var(--error-page-text)",
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
      <button
        onClick={reset}
        style={{
          marginTop: "8px",
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
    </div>
  );
}
