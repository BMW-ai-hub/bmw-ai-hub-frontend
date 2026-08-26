import type { User } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
};

type BackendUser = {
  id: string;
  email: string;
  name: string;
  role: User["role"];
  dealer_id: string | null;
};

function errorMessage(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "error" in body) {
    const error = (body as { error?: { message?: string } }).error;
    if (error?.message) return error.message;
  }
  return fallback;
}

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(body, "Unable to sign in"));

  const tokens = body as TokenPair;
  localStorage.setItem("bmw_access_token", tokens.access_token);
  localStorage.setItem("bmw_refresh_token", tokens.refresh_token);

  const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const meBody = await meResponse.json().catch(() => null);
  if (!meResponse.ok) {
    clearSession();
    throw new Error(errorMessage(meBody, "Unable to load your account"));
  }

  const account = meBody as BackendUser;
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    dealership: account.dealer_id ? "BMW of Lahore" : "BMW Technician Network",
  };
}

export function clearSession() {
  localStorage.removeItem("bmw_access_token");
  localStorage.removeItem("bmw_refresh_token");
}
