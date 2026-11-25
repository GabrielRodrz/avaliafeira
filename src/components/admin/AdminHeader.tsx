"use client";

import Link from "next/link";
import {
  Award,
  Trophy,
  FolderKanban,
  Scale,
  Users,
  UserCheck,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

export type AdminTab = "rankings" | "projects" | "evaluators" | "criteria" | "admins" | "settings";

interface AdminHeaderProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminName: string;
  adminUsername: string;
  isMaster: boolean;
  onOpenChangePassword: () => void;
  onLogout: () => void;
}

export default function AdminHeader({
  currentTab,
  onSelectTab,
  adminName,
  adminUsername,
  isMaster,
  onOpenChangePassword,
  onLogout,
}: AdminHeaderProps) {
  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: "rankings", label: "Classificação & Pódio", icon: Trophy },
    { id: "projects", label: "Projetos", icon: FolderKanban },
    { id: "evaluators", label: "Avaliadores & Escala", icon: UserCheck },
    { id: "criteria", label: "Critérios & Escala", icon: Scale },
    { id: "admins", label: "Administradores", icon: Users },
    { id: "settings", label: "Configurações & Relatórios", icon: Settings },
  ];

  return (
    <header className="border-b border-slate-200 bg-white no-print">
      {/* Barra Superior */}
      <div className="border-b border-slate-100 bg-slate-900 px-4 py-2.5 sm:px-6 text-white text-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-white">
              AvaliaFeira
            </span>
            <span className="rounded-md bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30">
              Painel Administrativo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/avaliar"
              target="_blank"
              className="flex items-center gap-1 text-slate-300 hover:text-teal-300 transition"
              title="Abrir área do avaliador em nova aba"
            >
              <span>Área do Avaliador</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <span className="text-slate-600">|</span>

            {/* Perfil do Admin */}
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span className="font-semibold text-white">{adminName}</span>
              {isMaster && (
                <span className="rounded bg-amber-400/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                  Master
                </span>
              )}
            </div>

            <button
              onClick={onOpenChangePassword}
              title="Alterar minha senha"
              className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200 transition"
            >
              <KeyRound className="h-3 w-3" />
              <span className="hidden sm:inline">Senha</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-rose-300 hover:text-rose-100 transition font-semibold"
              title="Encerrar sessão"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-teal-50 text-teal-800 shadow-xs ring-1 ring-teal-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-teal-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
