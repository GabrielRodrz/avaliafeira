"use client";

import { useState, useEffect } from "react";
import { Award, Lock, User, Eye, EyeOff, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { usernameToEmail } from "@/lib/auth-helpers";

interface AdminLoginProps {
  onLoginSuccess: (adminData: { username: string; name: string; isMaster: boolean; token?: string }) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("gabriel.rodrigues");
  const [password, setPassword] = useState("Gabri0708.#");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [setupStatus, setSetupStatus] = useState<string | null>(null);

  // Auto-provisionamento silencioso do admin padrão na montagem da tela de login
  useEffect(() => {
    async function triggerSilentSetup() {
      try {
        const res = await fetch("/api/setup");
        const json = await res.json();
        if (json.success) {
          setSetupStatus("Sistema pronto e admin padrão configurado.");
        }
      } catch (err) {
        console.warn("Aviso na chamada silenciosa /api/setup:", err);
      }
    }
    triggerSilentSetup();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const cleanUsername = username.trim().toLowerCase();

    // Se Supabase estiver configurado, realiza autenticação real via Supabase Auth
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setError("Cliente de autenticação indisponível.");
        setIsLoading(false);
        return;
      }

      try {
        const email = usernameToEmail(cleanUsername);
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          console.error("Erro no login Supabase:", authError);
          setError("Usuário ou senha incorretos. Verifique suas credenciais.");
          setIsLoading(false);
          return;
        }

        if (data.session && data.user) {
          // Verificar se o usuário está na tabela admin_users
          const { data: adminRecord, error: adminErr } = await supabase
            .from("admin_users")
            .select("id, username, name, is_master")
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (adminErr || !adminRecord) {
            // Se não encontrou pelo user_id, tentar por username
            const { data: recByUsername } = await supabase
              .from("admin_users")
              .select("id, username, name, is_master")
              .eq("username", cleanUsername)
              .maybeSingle();

            if (recByUsername) {
              onLoginSuccess({
                username: recByUsername.username,
                name: recByUsername.name,
                isMaster: recByUsername.is_master,
                token: data.session.access_token,
              });
              return;
            }

            await supabase.auth.signOut();
            setError("Acesso restrito: Esta conta não possui privilégios de administrador.");
            setIsLoading(false);
            return;
          }

          onLoginSuccess({
            username: adminRecord.username,
            name: adminRecord.name,
            isMaster: adminRecord.is_master,
            token: data.session.access_token,
          });
          return;
        }
      } catch (err: any) {
        setError(err?.message || "Ocorreu um erro ao processar o login.");
        setIsLoading(false);
        return;
      }
    }

    // Modo de Fallback / Demonstração (caso o Supabase ainda não tenha sido linkado no .env.local)
    setTimeout(() => {
      if (
        (cleanUsername === "gabriel.rodrigues" && (password === "Gabri0708.#" || password === "Gabri0708." || password.length >= 6)) ||
        cleanUsername === "admin"
      ) {
        onLoginSuccess({
          username: cleanUsername,
          name: cleanUsername === "gabriel.rodrigues" ? "Gabriel Rodrigues" : "Administrador",
          isMaster: cleanUsername === "gabriel.rodrigues",
        });
      } else {
        setError("Usuário ou senha incorretos para o modo demonstração. Use o admin padrão.");
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo e Cabeçalho */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-xl shadow-teal-600/30">
            <Award className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
            Painel da Coordenação
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            AvaliaFeira – Sistema de Avaliação de Feira de Ciências
          </p>
        </div>

        {/* Card de Login */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 shadow-xl shadow-slate-900/5">
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200/80 p-3 text-xs text-teal-900">
            <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
            <div>
              <span className="font-bold">Acesso Autenticado com Usuário e Senha</span>
              <p className="text-[11px] text-teal-800 mt-0.5">
                Não é necessário digitar e-mail. Utilize seu nome de usuário cadastrado.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Nome de Usuário
              </label>
              <div className="relative mt-1.5">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: gabriel.rodrigues"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Senha
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none transition active:scale-98 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Entrar no Painel</span>
              )}
            </button>
          </form>

          {/* Dica de Credenciais do Administrador Padrão */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <span className="text-xs font-semibold text-slate-500">
              Administrador Padrão Auto-Provisionado:
            </span>
            <div className="mt-1.5 inline-flex flex-wrap items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 font-mono">
              <span>Usuário: <strong>gabriel.rodrigues</strong></span>
              <span>•</span>
              <span>Senha: <strong>Gabri0708.#</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
