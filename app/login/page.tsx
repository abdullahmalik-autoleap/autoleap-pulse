"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Check } from "lucide-react";
import { useTheme } from "@/lib/theme";

const REMEMBER_KEY = "rememberMe";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REMEMBER_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored === "true") setRememberMe(true);
    } catch {}
  }, []);

  function toggleRemember() {
    const next = !rememberMe;
    setRememberMe(next);
    try {
      localStorage.setItem(REMEMBER_KEY, String(next));
    } catch {}
  }

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
      router.push("/dashboard/signups");
    }
  }

  const inputStyle = {
    backgroundColor: "var(--auth-input-bg)",
    border: "1px solid var(--auth-input-border)",
  };

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.boxShadow = "0 0 0 2px var(--brand)";
  }
  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.boxShadow = "none";
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundColor: "var(--auth-bg)",
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
          backgroundColor: "var(--auth-card)",
          border: "1px solid var(--auth-card-border)",
        }}
      >
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Image
            src={theme === "light" ? "/logos/Light.svg" : "/logos/Dark.svg"}
            alt="AutoLeap Pulse"
            width={180}
            height={40}
            style={{ height: 40, width: "auto" }}
            priority
          />
          <p
            className="text-sm"
            style={{ color: "var(--auth-subtitle)" }}
          >
            Internal Intelligence Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-medium"
              style={{ color: "var(--auth-label)" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@autoleap.com"
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Password with toggle */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-medium"
              style={{ color: "var(--auth-label)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder:text-white/25 focus:outline-none"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0"
                style={{
                  color: "var(--text-muted)",
                  transition: "color 200ms ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={toggleRemember}
              className="flex items-center justify-center shrink-0"
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                border: rememberMe
                  ? "1.5px solid var(--brand)"
                  : "1.5px solid var(--pulse-border)",
                backgroundColor: rememberMe ? "var(--brand)" : "transparent",
                transition: "all 200ms ease",
              }}
            >
              {rememberMe && <Check size={11} color="#fff" strokeWidth={3} />}
            </button>
            <span
              style={{ fontSize: 13, color: "var(--text-secondary)" }}
              className="select-none cursor-pointer"
              onClick={toggleRemember}
            >
              Remember me
            </span>
          </div>

          {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "var(--brand)" }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "var(--brand-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--brand)";
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
          className="text-center"
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginTop: 20,
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="no-underline hover:underline"
            style={{ color: "var(--brand)", transition: "color 200ms ease" }}
          >
            Create one &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
