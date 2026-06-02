const AUTH_URL = "https://functions.poehali.dev/a50c161f-1ea8-4131-9f69-ec917a414a0b";
const CHAT_URL = "https://functions.poehali.dev/b42a8f0c-a5f5-48c1-9bcf-dea3c25dd954";

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

// ── Chat types ──────────────────────────────────────────────

export type RealChat = {
  id: number;
  is_group: boolean;
  name: string;
  avatar_text: string;
  other_user_id: number | null;
  last_message: string;
  last_at: string;
  online: boolean;
};

export type RealMessage = {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar: string;
  text: string;
  created_at: string;
  is_out: boolean;
};

export type UserResult = {
  id: number;
  username: string;
  avatar_text: string;
  online: boolean;
};

// ── Chat API ────────────────────────────────────────────────

async function chatCall(action: string, body: object = {}, token: string) {
  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Auth-Token": token },
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

export async function apiListChats(token: string) {
  return chatCall("list_chats", {}, token);
}

export async function apiGetMessages(token: string, chat_id: number) {
  return chatCall("get_messages", { chat_id }, token);
}

export async function apiSendMessage(token: string, chat_id: number, text: string) {
  return chatCall("send_message", { chat_id, text }, token);
}

export async function apiFindUsers(token: string, query: string) {
  return chatCall("find_users", { query }, token);
}

export async function apiOpenChat(token: string, other_user_id: number) {
  return chatCall("open_chat", { other_user_id }, token);
}

export function formatTime(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "вчера";
    if (diffDays < 7) return d.toLocaleDateString("ru", { weekday: "short" });
    return d.toLocaleDateString("ru", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}