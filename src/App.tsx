import { useEffect, useState } from "react";
import type { User } from "./types";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InspectionDetail from "./pages/InspectionDetail";
import GradingResult from "./pages/GradingResult";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import { clearSession, getMe, hasSession } from "./api";

type Page =
  | { name: "login" }
  | { name: "dashboard" }
  | { name: "inspection"; inspectionId: string }
  | { name: "grading"; inspectionId: string; videoId: string }
  | { name: "analytics" }
  | { name: "settings" };

export default function App() {
  const [page, setPage] = useState<Page>({ name: "login" });
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(hasSession());

  useEffect(() => {
    if (!hasSession()) return;
    getMe().then((account) => { setUser(account); setPage({ name: "dashboard" }); })
      .catch(clearSession).finally(() => setRestoring(false));
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setPage({ name: "dashboard" });
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setPage({ name: "login" });
  };

  const navigate = (target: string) => {
    if (target === "dashboard") setPage({ name: "dashboard" });
    else if (target === "analytics") setPage({ name: "analytics" });
    else if (target === "settings") setPage({ name: "settings" });
  };

  if (restoring) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <span className="spin size-7 rounded-full border-2 border-well-deep border-t-ink" />
        <p className="eyebrow">Restoring session</p>
      </div>
    );
  }
  if (!user || page.name === "login") {
    return <Login onLogin={handleLogin} />;
  }

  if (page.name === "dashboard") {
    return (
      <Dashboard
        user={user}
        onNavigate={navigate}
        onLogout={handleLogout}
        onOpenInspection={(id) => setPage({ name: "inspection", inspectionId: id })}
      />
    );
  }

  if (page.name === "inspection") {
    return (
      <InspectionDetail
        user={user}
        inspectionId={page.inspectionId}
        onNavigate={navigate}
        onLogout={handleLogout}
        onViewScore={(inspectionId, videoId) =>
          setPage({ name: "grading", inspectionId, videoId })
        }
        onVideoProcesed={(inspectionId, videoId) =>
          setPage({ name: "grading", inspectionId, videoId })
        }
      />
    );
  }

  if (page.name === "grading") {
    return (
      <GradingResult
        user={user}
        inspectionId={page.inspectionId}
        videoId={page.videoId}
        onNavigate={navigate}
        onLogout={handleLogout}
        onBackToInspection={() =>
          setPage({ name: "inspection", inspectionId: page.inspectionId })
        }
        onSendSuccess={() => setPage({ name: "dashboard" })}
      />
    );
  }

  if (page.name === "analytics") {
    return (
      <Analytics
        user={user}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
    );
  }

  if (page.name === "settings" && user.role === "admin") {
    return (
      <Settings
        user={user}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}
