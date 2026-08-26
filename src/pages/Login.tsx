import { useState } from "react";
import type { User } from "../types";
import { login } from "../api";

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
    try { onLogin(await login(email, password)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to sign in"); setLoading(false); }
  };

  return (
    <div
      className="h-full flex items-center justify-center"
      style={{ background: "var(--page-bg)" }}
    >
      <div className="w-full max-w-sm px-4">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Technician Portal
          </h1>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-7"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@bmwdealer.com"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-primary)",
                  background: "#fff",
                  transition: "border-color 0.15s",
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
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-primary)",
                  background: "#fff",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--bmw-blue)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: "var(--status-revision)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-1"
              style={{
                background: loading ? "#93C5FD" : "var(--bmw-blue)",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "var(--text-muted)" }}>
          Demo credentials — password is{" "}
          <span style={{ fontFamily: "var(--font-mono)" }}>bmw</span> for all accounts
          <br />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem" }}>
            ali.raza@bmwdealer.test · manager@bmwdealer.test · admin@bmwdealer.test
          </span>
        </p>

        <p
          className="text-center text-[10px] mt-4 tracking-widest uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Powered by NetSol Technologies
        </p>
      </div>
    </div>
  );
}
