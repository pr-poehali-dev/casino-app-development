import { useState } from "react";
import Icon from "@/components/ui/icon";
import { apiLogin, apiRegister, saveSession, AuthUser } from "@/lib/api";

interface AuthScreenProps {
  onAuth: (user: AuthUser, token: string) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", email: "", login: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let res;
    if (mode === "register") {
      res = await apiRegister(form.username, form.email, form.password);
    } else {
      res = await apiLogin(form.login, form.password);
    }

    setLoading(false);

    if (!res.ok) {
      setError((res.data as Record<string, string>).error || "Ошибка сервера");
      return;
    }

    const { token, user } = res.data as { token: string; user: AuthUser };
    saveSession(token, user);
    onAuth(user, token);
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-mesh">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
      </div>

      <div className="relative w-full max-w-sm mx-4 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl gradient-purple-cyan flex items-center justify-center mb-4 neon-glow">
            <span className="text-white text-2xl font-black">N</span>
          </div>
          <h1 className="text-white text-2xl font-black tracking-tight mb-1">NexChat</h1>
          <p className="text-white/40 text-sm">Защищённый мессенджер с E2E</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 glass-strong">
          {/* Tabs */}
          <div className="flex p-1 rounded-2xl mb-6" style={{ background: "rgba(255,255,255,0.05)" }}>
            {(["login", "register"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setError(""); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  mode === tab
                    ? "text-white shadow-lg"
                    : "text-white/40 hover:text-white/60"
                }`}
                style={mode === tab ? { background: "linear-gradient(135deg, #7c3aed, #4f46e5)" } : {}}
              >
                {tab === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === "register" && (
              <div className="animate-fade-in">
                <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-1.5 ml-1">
                  Имя пользователя
                </label>
                <div className="relative">
                  <Icon name="User" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => set("username", e.target.value)}
                    placeholder="username"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onFocus={e => (e.target.style.border = "1px solid rgba(139,92,246,0.5)")}
                    onBlur={e => (e.target.style.border = "1px solid rgba(255,255,255,0.1)")}
                  />
                </div>
              </div>
            )}

            {mode === "register" && (
              <div className="animate-fade-in">
                <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-1.5 ml-1">
                  Email
                </label>
                <div className="relative">
                  <Icon name="Mail" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onFocus={e => (e.target.style.border = "1px solid rgba(139,92,246,0.5)")}
                    onBlur={e => (e.target.style.border = "1px solid rgba(255,255,255,0.1)")}
                  />
                </div>
              </div>
            )}

            {mode === "login" && (
              <div>
                <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-1.5 ml-1">
                  Логин или Email
                </label>
                <div className="relative">
                  <Icon name="AtSign" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={form.login}
                    onChange={e => set("login", e.target.value)}
                    placeholder="username или email"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onFocus={e => (e.target.style.border = "1px solid rgba(139,92,246,0.5)")}
                    onBlur={e => (e.target.style.border = "1px solid rgba(255,255,255,0.1)")}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-1.5 ml-1">
                Пароль
              </label>
              <div className="relative">
                <Icon name="Lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={e => (e.target.style.border = "1px solid rgba(139,92,246,0.5)")}
                  onBlur={e => (e.target.style.border = "1px solid rgba(255,255,255,0.1)")}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl animate-fade-in"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-xs">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #7c3aed, #22d3ee)" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Подождите...
                </>
              ) : mode === "login" ? (
                <><Icon name="LogIn" size={16} />Войти</>
              ) : (
                <><Icon name="UserPlus" size={16} />Создать аккаунт</>
              )}
            </button>
          </form>

          {/* E2E notice */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <Icon name="Lock" size={11} className="text-violet-400" />
            <span className="text-violet-400/60 text-[10px]">Все сообщения защищены end-to-end шифрованием</span>
          </div>
        </div>
      </div>
    </div>
  );
}
