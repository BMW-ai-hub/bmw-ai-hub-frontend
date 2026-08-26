import type { ReactNode } from "react";
import type { User } from "../types";
import bmwLogo from "@/imports/bmw_logo.png";

type Breadcrumb = { label: string; onClick?: () => void };

export default function Layout({ user, currentPage, onNavigate, onLogout, breadcrumb, children }: {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  breadcrumb: Breadcrumb[];
  children: ReactNode;
}) {
  const nav = [
    { key: "dashboard", label: "Inspections", icon: "▤" },
    { key: "analytics", label: "Analytics", icon: "⌁" },
  ];
  return (
    <div className="flex h-full min-h-0">
      <aside className="hidden w-60 flex-shrink-0 flex-col md:flex" style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}>
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
          <img src={bmwLogo} alt="BMW" className="h-10 w-10 object-contain" />
          <div><div className="text-sm font-bold text-white">Technician Portal</div><div className="text-[10px]" style={{ color: "var(--sidebar-text)" }}>BMW AI Hub</div></div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => <button key={item.key} onClick={() => onNavigate(item.key)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium" style={{ color: currentPage === item.key ? "#fff" : "var(--sidebar-text)", background: currentPage === item.key ? "var(--sidebar-active)" : "transparent" }}><span>{item.icon}</span>{item.label}</button>)}
        </nav>
        <div className="p-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
          <div className="truncate text-sm font-semibold text-white">{user.name}</div>
          <div className="truncate text-xs capitalize" style={{ color: "var(--sidebar-text)" }}>{user.role} · {user.dealership}</div>
          <button onClick={onLogout} className="mt-3 text-xs font-medium" style={{ color: "var(--sidebar-text)" }}>Sign out</button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 items-center justify-between gap-3 bg-white px-4 sm:px-6" style={{ borderBottom: "1px solid var(--border-color)" }}>
          <div className="flex min-w-0 items-center gap-2 text-sm">{breadcrumb.map((item, index) => <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">{index > 0 && <span style={{ color: "var(--text-muted)" }}>/</span>}<button disabled={!item.onClick} onClick={item.onClick} className="truncate" style={{ color: item.onClick ? "var(--bmw-blue)" : "var(--text-secondary)", cursor: item.onClick ? "pointer" : "default" }}>{item.label}</button></span>)}</div>
          <button onClick={onLogout} className="md:hidden text-xs font-semibold" style={{ color: "var(--bmw-blue)" }}>Sign out</button>
        </header>
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
