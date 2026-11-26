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
      <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="flex items-center gap-2">
          <Link href="/avaliar" className="flex items-center gap-2 group shrink-0">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/25 group-hover:bg-teal-700 transition">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 text-base sm:text-lg">
                  AvaliaFeira
                </span>
                <span className="hidden sm:inline-block rounded-md bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">
                  {edition}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                {fairName}
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {evaluatorCode || evaluatorName ? (
            <button
              onClick={onOpenNameModal}
              title="Clique para alterar sua matrícula ou nome"
              className="flex items-center gap-1.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-300 px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-slate-800 transition active:scale-95 shadow-xs cursor-pointer"
            >
              {evaluatorCode && (
                <span className="rounded-md bg-teal-800 px-1.5 py-0.5 text-[10px] sm:text-xs font-black text-white font-mono tracking-wider shadow-xs">
                  {evaluatorCode}
                </span>
              )}
              <span className="max-w-[75px] sm:max-w-[150px] truncate text-slate-900 font-extrabold text-[11px] sm:text-xs">
                {evaluatorName || "Identificado"}
              </span>
              <RefreshCw className="h-3 w-3 text-teal-700 shrink-0" />
            </button>
          ) : (
            <button
              onClick={onOpenNameModal}
              className="flex items-center gap-1 rounded-xl bg-teal-600 px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
            >
              <User className="h-3.5 w-3.5" />
              <span>Entrar</span>
            </button>
          )}

          <Link
            href="/admin"
            className="flex items-center justify-center rounded-xl border border-slate-200 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shrink-0"
            title="Acesso Administrativo"
          >
            <Shield className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden md:inline ml-1">Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
