"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundColor: "#050D18",
        animation: "fadeIn 0.5s ease-out",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          backgroundColor: "#0A1628",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold text-lg"
            style={{ backgroundColor: "#0E7169" }}
          >
            AL
          </div>
          <div className="text-center">
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              AutoLeap Pulse
            </h1>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Internal Intelligence Dashboard
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@autoleap.com"
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "#0E1524",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #0E7169")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "#0E1524",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #0E7169")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#0E7169" }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "#0E7169E6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#0E7169";
            }}
          >
            {isLoading ? (
              <div
                className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                style={{ animation: "spin 0.6s linear infinite" }}
              />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          admin@autoleap.com / pulse2026
        </p>
      </div>
    </div>
  );
}
