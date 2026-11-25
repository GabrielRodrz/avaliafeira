"use client";

import Link from "next/link";
import { User, RefreshCw, Shield, Award, Hash } from "lucide-react";

interface EvaluatorHeaderProps {
  evaluatorName: string;
  evaluatorCode?: string;
  onOpenNameModal: () => void;
  fairName?: string;
  edition?: string;
}

export default function EvaluatorHeader({
  evaluatorName,
  evaluatorCode,
  onOpenNameModal,
  fairName = "AvaliaFeira",
  edition = "2026",
}: EvaluatorHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/avaliar" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/25 group-hover:bg-teal-700 transition">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 text-lg">
                  AvaliaFeira
                </span>
                <span className="rounded-md bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">
                  {edition}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {fairName}
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {evaluatorCode || evaluatorName ? (
            <button
              onClick={onOpenNameModal}
              title="Clique para alterar sua matrícula ou nome"
              className="flex items-center gap-2 rounded-2xl bg-teal-50 hover:bg-teal-100/80 border-2 border-teal-400/80 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 transition active:scale-95 shadow-xs cursor-pointer"
            >
              {evaluatorCode && (
                <span className="rounded-xl bg-teal-800 px-2.5 py-1 text-xs sm:text-sm font-black text-white font-mono tracking-wider shadow-xs">
                  {evaluatorCode}
                </span>
              )}
              <span className="max-w-[110px] sm:max-w-[170px] truncate text-slate-900 font-extrabold">
                {evaluatorName || "Identificado"}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-200/60 rounded-lg px-2 py-0.5">
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Trocar</span>
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenNameModal}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-1.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-teal-700 transition"
            >
              <User className="h-4 w-4" />
              <span>Identificar-se</span>
            </button>
          )}

          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            title="Acesso Administrativo"
          >
            <Shield className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden md:inline">Painel Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
