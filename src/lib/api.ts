const AUTH_URL = "https://functions.poehali.dev/a50c161f-1ea8-4131-9f69-ec917a414a0b";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  avatar_text: string;
  status_text: string;
};

async function call(action: string, body: object = {}, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["X-Auth-Token"] = token;
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...body }),
  });
  const text = await res.text();
  let data: Record<string, unknown>;
  try {
    const parsed = JSON.parse(text);
    data = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch {
    data = { error: text };
  }
  return { ok: res.ok, status: res.status, data };
}

export async function apiRegister(username: string, email: string, password: string) {
  return call("register", { username, email, password });
}

export async function apiLogin(login: string, password: string) {
  return call("login", { login, password });
}

export async function apiMe(token: string) {
  return call("me", {}, token);
}

export async function apiLogout(token: string) {
  return call("logout", {}, token);
}

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem("nc_token", token);
  localStorage.setItem("nc_user", JSON.stringify(user));
}

export function loadSession(): { token: string; user: AuthUser } | null {
  const token = localStorage.getItem("nc_token");
  const raw = localStorage.getItem("nc_user");
  if (!token || !raw) return null;
  try {
    return { token, user: JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("nc_token");
  localStorage.removeItem("nc_user");
}
