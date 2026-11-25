"use client";

import { useState, useEffect } from "react";
import { UserCheck, Plus, Trash2, KeyRound, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { AdminUser } from "@/types";

interface AdminsManagementProps {
  currentUsername: string;
  token?: string;
  onOpenChangePasswordModal: () => void;
}

export default function AdminsManagement({
  currentUsername,
  token,
  onOpenChangePasswordModal,
}: AdminsManagementProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Carregar lista de administradores
  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/users", { headers });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao listar administradores.");
      }

      setAdmins(data.users || []);
    } catch (err: any) {
      setError(err?.message || "Não foi possível carregar administradores.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, [token]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name.trim() || !username.trim() || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    setIsCreating(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao cadastrar administrador.");
      }

      setSuccessMsg(`Administrador "${username}" cadastrado com sucesso!`);
      setName("");
      setUsername("");
      setPassword("");
      loadAdmins();
    } catch (err: any) {
      setError(err?.message || "Erro ao cadastrar administrador.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (admin.is_master || admin.username === "gabriel.rodrigues") {
      alert("O administrador principal (gabriel.rodrigues) é protegido contra exclusão.");
      return;
    }

    if (!confirm(`Deseja realmente remover o administrador "${admin.name}" (${admin.username})?`)) {
      return;
    }

    setError("");
    setSuccessMsg("");
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/admin/users?id=${admin.id}`, {
        method: "DELETE",
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao excluir administrador.");
      }

      setSuccessMsg(`Administrador "${admin.username}" removido.`);
      loadAdmins();
    } catch (err: any) {
      setError(err?.message || "Erro ao excluir administrador.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Mensagens de feedback */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800">
          {successMsg}
        </div>
      )}

      {/* Grid: Cadastro de Novo Admin & Alterar Minha Senha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Cadastro de Novo Administrador */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="h-5 w-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              Cadastrar Novo Administrador
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Cadastre novos membros da comissão organizadora informando apenas Nome, Usuário e Senha.
          </p>

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Profa. Juliana Mendes"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nome de Usuário (Login) *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="Ex: juliana.mendes"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Senha Inicial *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>Adicionar Administrador</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card de Gestão da Própria Conta */}
        <div className="rounded-2xl border border-slate-200 bg-linear-to-b from-teal-50/50 to-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="h-5 w-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">Sua Conta</h3>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Você está conectado como:
            </p>
            <div className="rounded-xl bg-white border border-teal-200 p-3 mb-4">
              <span className="block text-xs text-slate-500 font-semibold">Usuário Logado:</span>
              <span className="block text-sm font-black text-teal-900 mt-0.5">
                {currentUsername}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenChangePasswordModal}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition active:scale-98 cursor-pointer"
          >
            Alterar Minha Senha
          </button>
        </div>
      </div>

      {/* Tabela de Administradores Cadastrados */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 bg-slate-50 p-4">
          <h3 className="text-sm font-black text-slate-900">
            Administradores com Acesso ao Sistema ({admins.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/60 text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Nome Completo</th>
                <th className="px-4 py-3">Usuário de Login</th>
                <th className="px-4 py-3">Tipo de Permissão</th>
                <th className="px-4 py-3">Data de Cadastro</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Carregando administradores...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Nenhum administrador encontrado.
                  </td>
                </tr>
              ) : (
                admins.map((adm) => {
                  const isProtected = adm.is_master || adm.username === "gabriel.rodrigues";
                  return (
                    <tr key={adm.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {adm.name}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-teal-800">
                        {adm.username}
                      </td>
                      <td className="px-4 py-3">
                        {isProtected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black text-amber-900">
                            <ShieldCheck className="h-3 w-3" />
                            Admin Master (Protegido)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                            Admin Secundário
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {adm.created_at ? new Date(adm.created_at).toLocaleDateString("pt-BR") : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isProtected ? (
                          <span
                            title="O administrador padrão não pode ser excluído do sistema."
                            className="inline-block text-[11px] font-semibold text-slate-400 cursor-not-allowed"
                          >
                            Protegido
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeleteAdmin(adm)}
                            className="rounded-lg p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Excluir este administrador"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
