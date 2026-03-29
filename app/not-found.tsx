import Link from "next/link";

export default function NotFound() {
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
      <div style={{ fontSize: "64px", fontWeight: 700 }}>404</div>
      <div style={{ fontSize: "18px", fontWeight: 600 }}>Page not found</div>
      <div
        style={{
          fontSize: "13px",
          color: "var(--error-page-sub)",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        The page you're looking for doesn't exist or has been moved.
      </div>
      <Link
        href="/dashboard"
        style={{
          marginTop: "8px",
            color: "var(--brand)",
          fontSize: "14px",
          textDecoration: "none",
          fontFamily: "Syne, sans-serif",
        }}
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
