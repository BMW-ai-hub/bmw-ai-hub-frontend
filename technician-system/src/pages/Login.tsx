import { useState } from "react";
import type { User } from "../types";
import { login } from "../api";
import bmwLogo from "@/imports/bmw_logo.png";

interface Props {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      onLogin(await login(email, password));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in");
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex" style={{ background: "var(--sidebar-bg)" }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col items-center justify-between w-[420px] flex-shrink-0 p-12"
        style={{
          background: "linear-gradient(160deg, #0D1B2E 0%, #162840 60%, #1E3359 100%)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        <div />
        <div className="flex flex-col items-center gap-8 text-center">
          <img
            src={bmwLogo}
            alt="BMW"
            className="object-contain drop-shadow-xl"
            style={{ width: 120, height: 120 }}
          />
          <div>
            <h1 className="text-white text-3xl font-bold tracking-tight">
              BMW Technician Portal
            </h1>
            <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--sidebar-text)" }}>
              AI-powered walkaround video grading and customer delivery platform
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-[280px]">
            {[
              { icon: "📋", text: "Manage your inspection queue" },
              { icon: "🎥", text: "Upload and grade walkaround videos" },
              { icon: "📊", text: "Track your performance over time" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-left px-4 py-3 rounded-lg"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--sidebar-text)" }}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-[11px] tracking-widest uppercase font-medium" style={{ color: "var(--sidebar-text)" }}>
            Powered by NetSol Technologies
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: "var(--page-bg)" }}>
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <img src={bmwLogo} alt="BMW" className="object-contain" style={{ width: 44, height: 44 }} />
            <div>
              <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                BMW Technician Portal
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Powered by NetSol Technologies
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-8 shadow-sm"
            style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
          >
            <div className="mb-7">
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Sign in to your account
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                BMW of Lahore — Technician Portal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@bmwdealer.test"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-shadow"
                  style={{
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-primary)",
                    background: "#fff",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--bmw-blue)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-shadow"
                  style={{
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-primary)",
                    background: "#fff",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--bmw-blue)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
                />
              </div>

              {error && (
                <div
                  className="text-sm px-3.5 py-3 rounded-lg"
                  style={{
                    color: "var(--status-revision)",
                    background: "var(--status-revision-bg)",
                    border: "1px solid #FCA5A5",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity"
                style={{
                  background: loading ? "#93C5FD" : "var(--bmw-blue)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div
              className="mt-6 pt-5 text-center text-xs"
              style={{ borderTop: "1px solid var(--border-color)", color: "var(--text-muted)" }}
            >
              Having trouble signing in? Contact your{" "}
              <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                dealership admin
              </span>
            </div>
          </div>

          {/* Demo hint */}
          <div
            className="mt-4 px-4 py-3 rounded-lg text-xs"
            style={{
              background: "var(--bmw-blue-light, #EBF3FF)",
              color: "var(--bmw-blue)",
              border: "1px solid #BFDBFE",
            }}
          >
            <strong>Demo:</strong> ali.raza@bmwdealer.test / bmw &nbsp;·&nbsp; manager@bmwdealer.test / bmw
          </div>
        </div>
      </div>
    </div>
  );
}
