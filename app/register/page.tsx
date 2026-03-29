"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

function validate(
  name: string,
  email: string,
  password: string,
  confirm: string,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!name.trim() || name.trim().length < 2)
    errors.name = "Name must be at least 2 characters";
  if (!email.trim()) errors.email = "Email is required";
  else if (!email.trim().toLowerCase().endsWith("@autoleap.com"))
    errors.email = "Only @autoleap.com emails are allowed";
  if (!password) errors.password = "Password is required";
  else if (password.length < 8)
    errors.password = "Password must be at least 8 characters";
  if (password !== confirm) errors.confirm = "Passwords do not match";
  return errors;
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const { theme } = useTheme();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");

    const errors = validate(name, email, password, confirm);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Account created! Signing you in...");

      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setApiError("Account created but sign-in failed. Please sign in manually.");
        setIsLoading(false);
        setSuccessMessage("");
        return;
      }

      router.push("/dashboard/signups");
    } catch {
      setApiError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none";
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
          <div className="text-center">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              Create Account
            </h1>
            <p
              className="mt-1 text-sm"
            style={{ color: "var(--auth-subtitle)" }}
          >
            Join AutoLeap Pulse
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-xs font-medium"
              style={{ color: "var(--auth-label)" }}
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="Your full name"
              className={inputClass}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {fieldErrors.name && (
              <p className="text-xs" style={{ color: "var(--danger)" }}>
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Work Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-medium"
              style={{ color: "var(--auth-label)" }}
            >
              Work Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="you@autoleap.com"
              className={inputClass}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {fieldErrors.email && (
              <p className="text-xs" style={{ color: "var(--danger)" }}>
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password)
                    setFieldErrors((p) => ({ ...p, password: undefined }));
                }}
                placeholder="Min 8 characters"
                className={`${inputClass} pr-10`}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0"
                style={{ color: "var(--text-muted)", transition: "color 200ms ease" }}
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
            {fieldErrors.password && (
              <p className="text-xs" style={{ color: "var(--danger)" }}>
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirm"
              className="block text-xs font-medium"
              style={{ color: "var(--auth-label)" }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (fieldErrors.confirm)
                    setFieldErrors((p) => ({ ...p, confirm: undefined }));
                }}
                placeholder="Repeat your password"
                className={`${inputClass} pr-10`}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0"
                style={{ color: "var(--text-muted)", transition: "color 200ms ease" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.confirm && (
              <p className="text-xs" style={{ color: "var(--danger)" }}>
                {fieldErrors.confirm}
              </p>
            )}
          </div>

          {apiError && <p className="text-sm" style={{ color: "var(--danger)" }}>{apiError}</p>}

          {successMessage && (
            <p className="text-sm" style={{ color: "var(--brand)" }}>
              {successMessage}
            </p>
          )}

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
              "Create Account"
            )}
          </button>
        </form>

        <p
          className="mt-5 text-center"
          style={{ fontSize: 13, color: "var(--text-secondary)" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="no-underline hover:underline"
            style={{ color: "var(--brand)", transition: "color 200ms ease" }}
          >
            Sign in &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
