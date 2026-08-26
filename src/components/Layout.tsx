import { useState } from "react";
import type { User } from "../types";

interface Props {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  breadcrumb?: { label: string; onClick?: () => void }[];
  children: React.ReactNode;
}

const NAV: Record<string, { key: string; label: string; roles: User["role"][] }[]> = {
  main: [
    { key: "dashboard", label: "Inspections", roles: ["technician", "manager", "admin"] },
    { key: "analytics", label: "Analytics", roles: ["technician", "manager", "admin"] },
  ],
  admin: [
    { key: "settings", label: "Settings", roles: ["admin"] },
  ],
};

const Icons: Record<string, React.ReactNode> = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 3v18h18" />
      <path d="M18 9l-5 5-4-4-3 3" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

const ROLE_LABELS: Record<User["role"], string> = {
  technician: "Technician",
  manager: "Manager",
  admin: "Admin",
};

export default function Layout({ user, currentPage, onNavigate, onLogout, breadcrumb, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const allNav = [...NAV.main, ...NAV.admin].filter((item) => item.roles.includes(user.role));

  return (
    <div className="flex h-full" style={{ background: "var(--page-bg)" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0"
        style={{
          width: collapsed ? 60 : 220,
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
          transition: "width 0.18s ease",
        }}
      >
        <div
          className="flex items-center gap-2.5 px-3 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--sidebar-border)" }}
        >
          {!collapsed && (
            <span className="text-white text-base font-semibold leading-tight">Technician Portal</span>
          )}
          <button
            className="ml-auto flex-shrink-0 p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "var(--sidebar-text)" }}
            onClick={() => setCollapsed(!collapsed)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1.5">
          {allNav.map((item) => {
            const active = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                title={collapsed ? item.label : undefined}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors text-left"
                style={{
                  color: active ? "#fff" : "var(--sidebar-text)",
                  background: active ? "var(--sidebar-active)" : "transparent",
                  borderLeft: active ? "3px solid var(--bmw-blue)" : "3px solid transparent",
                }}
              >
                <span className="flex-shrink-0">{Icons[item.key]}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ borderTop: "1px solid var(--sidebar-border)" }}>
          <div className="px-3 py-4 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: "var(--bmw-blue)", color: "#fff" }}
            >
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{user.name}</div>
                  <div className="text-xs capitalize" style={{ color: "var(--sidebar-text)" }}>
                    {ROLE_LABELS[user.role]}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 rounded opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
                  style={{ color: "var(--sidebar-text)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </>
            )}
          </div>
          {!collapsed && (
            <div
              className="px-3 py-3 text-center"
              style={{ borderTop: "1px solid var(--sidebar-border)" }}
            >
              <span
                className="text-[10px] tracking-widest uppercase font-medium"
                style={{ color: "var(--sidebar-text)" }}
              >
                NetSol Technologies
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center gap-3 px-6 h-16 flex-shrink-0"
          style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--border-color)" }}
        >
          {breadcrumb && (
            <nav className="flex items-center gap-1.5 flex-1 min-w-0 text-base">
              {breadcrumb.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  )}
                  {crumb.onClick ? (
                    <button
                      onClick={crumb.onClick}
                      className="font-medium hover:underline"
                      style={{ color: i === breadcrumb.length - 1 ? "var(--text-primary)" : "var(--bmw-blue)" }}
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span
                      className="font-medium"
                      style={{ color: i === breadcrumb.length - 1 ? "var(--text-primary)" : "var(--text-muted)" }}
                    >
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span
              className="text-sm px-2.5 py-1 rounded-md font-medium capitalize"
              style={{ background: "var(--page-bg)", color: "var(--text-muted)" }}
            >
              {ROLE_LABELS[user.role]}
            </span>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--bmw-blue)", color: "#fff" }}
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
