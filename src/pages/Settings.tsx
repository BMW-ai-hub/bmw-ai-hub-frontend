import { useEffect, useState } from "react";
import type { Config, User } from "../types";
import { getConfig } from "../api";
import { MOCK_USERS } from "../mockData";
import Layout from "../components/Layout";

interface Props { user: User; onNavigate: (page: string) => void; onLogout: () => void }
type Tab = "grading" | "users" | "notifications";
const STORE = "bmw_admin_frontend_settings";
const NOTICES = ["Video below threshold", "Video cleared for delivery", "Video sent to customer", "New inspection assigned", "Daily performance summary"];

export default function Settings({ user, onNavigate, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("grading");
  const [config, setConfig] = useState<Config>();
  const [threshold, setThreshold] = useState(80);
  const [maxUploadMb, setMaxUploadMb] = useState(500);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => Object.fromEntries(NOTICES.map(n => [n, true])));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const local = localStorage.getItem(STORE);
    if (local) {
      try { const p = JSON.parse(local); setThreshold(p.threshold ?? 80); setMaxUploadMb(p.maxUploadMb ?? 500); setUsers(p.users ?? MOCK_USERS); setNotifications(p.notifications ?? notifications); } catch { /* use defaults */ }
    }
    getConfig().then(c => { setConfig(c); if (!local) { setThreshold(c.grading_threshold_percent); setMaxUploadMb(c.max_upload_mb); } }).catch(e => setError(e instanceof Error ? e.message : "Unable to load configuration"));
  }, []);

  const save = () => {
    localStorage.setItem(STORE, JSON.stringify({ threshold, maxUploadMb, users, notifications }));
    setSaved(true); window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <Layout user={user} currentPage="settings" onNavigate={onNavigate} onLogout={onLogout} breadcrumb={[{ label: "Settings" }]}>
      <div className="p-6 space-y-5 w-full">
        <div className="flex items-end justify-between gap-4"><div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1><p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Administration and portal preferences</p></div><button onClick={save} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: saved ? "var(--score-pass)" : "var(--bmw-blue)" }}>{saved ? "Saved" : "Save changes"}</button></div>
        {error && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "var(--status-revision-bg)", color: "var(--status-revision)" }}>{error}</div>}
        <div className="flex gap-2">{(["grading", "users", "notifications"] as Tab[]).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-lg text-sm font-medium capitalize" style={{ background: tab === t ? "var(--bmw-blue)" : "#fff", color: tab === t ? "#fff" : "var(--text-secondary)", border: "1px solid var(--border-color)" }}>{t === "users" ? "User Management" : t}</button>)}</div>

        {tab === "grading" && <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card title="Grading"><Field label="Pass threshold" description={`Gateway currently reports ${config?.grading_threshold_percent ?? "…"}%`}><div className="flex items-center gap-3"><input type="range" min="50" max="100" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-52"/><strong className="text-lg">{threshold}%</strong></div></Field></Card>
          <Card title="Upload Limits"><Field label="Maximum upload size" description={`Gateway currently enforces ${config?.max_upload_mb ?? "…"} MB`}><div className="flex items-center gap-2"><input type="number" min="1" value={maxUploadMb} onChange={e => setMaxUploadMb(Number(e.target.value))} className="w-28 px-3 py-2 rounded-lg outline-none" style={{ border: "1px solid var(--border-strong)" }}/><span className="text-sm">MB</span></div></Field><Field label="Accepted formats" description="Formats accepted by the gateway"><span className="text-sm font-medium">{config?.accepted_video_types.join(", ") || "Loading…"}</span></Field></Card>
        </div>}

        {tab === "users" && <Card title="User Management"><div className="overflow-x-auto"><table className="w-full"><thead><tr style={{ borderBottom: "1px solid var(--border-color)" }}>{["Name", "Email", "Role"].map(h => <th key={h} className="text-left text-xs uppercase px-4 py-3" style={{ color: "var(--text-muted)" }}>{h}</th>)}</tr></thead><tbody>{users.map(u => <tr key={u.id} style={{ borderBottom: "1px solid var(--border-color)" }}><td className="px-4 py-4 font-medium">{u.name}</td><td className="px-4 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>{u.email}</td><td className="px-4 py-4"><select value={u.role} disabled={u.id === user.id} onChange={e => setUsers(list => list.map(x => x.id === u.id ? { ...x, role: e.target.value as User["role"] } : x))} className="px-3 py-2 rounded-lg capitalize" style={{ border: "1px solid var(--border-strong)", background: "#fff" }}><option value="technician">Technician</option><option value="manager">Manager</option><option value="admin">Admin</option></select></td></tr>)}</tbody></table></div></Card>}

        {tab === "notifications" && <Card title="Email Notifications"><div className="divide-y" style={{ borderColor: "var(--border-color)" }}>{NOTICES.map(n => <label key={n} className="flex items-center justify-between py-4 cursor-pointer"><span className="text-sm font-medium">{n}</span><input type="checkbox" checked={notifications[n] ?? false} onChange={e => setNotifications(p => ({ ...p, [n]: e.target.checked }))} className="w-5 h-5"/></label>)}</div></Card>}
      </div>
    </Layout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}><h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>{title}</h2>{children}</section> }
function Field({ label, description, children }: { label: string; description: string; children: React.ReactNode }) { return <div className="flex items-center justify-between gap-5 py-4" style={{ borderTop: "1px solid var(--border-color)" }}><div><div className="text-sm font-medium">{label}</div><div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{description}</div></div>{children}</div> }
