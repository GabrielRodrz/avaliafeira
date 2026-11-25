"use client";

import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface StickyBottomBarProps {
  completedCount: number;
  totalCriteria: number;
  partialScore: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

export default function StickyBottomBar({
  completedCount,
  totalCriteria,
  partialScore,
  onSubmit,
  isSubmitting,
  isEditing = false,
}: StickyBottomBarProps) {
  const isComplete = completedCount === totalCriteria;
  const progressPercent = Math.round((completedCount / totalCriteria) * 100);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-2xl transition-all pb-[env(safe-area-inset-bottom,0px)]">
      {/* Barra de Progresso Fina */}
      <div className="h-1.5 w-full bg-slate-100">
        <div
          className={`h-full transition-all duration-300 ${
            isComplete ? "bg-emerald-500" : "bg-teal-600"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2.5 px-3 py-2.5 sm:px-6 sm:py-3">
        {/* Status de Critérios e Pontuação Parcial */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Critérios:</span>
            <span
              className={`text-xs font-extrabold ${
                isComplete ? "text-emerald-700" : "text-slate-800"
              }`}
            >
              {completedCount}/{totalCriteria}
            </span>
          </div>

          <div className="mt-0.5 sm:mt-0 flex items-baseline gap-1 sm:border-l sm:border-slate-200 sm:pl-5">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Nota:</span>
            <span className="text-base sm:text-xl font-black text-teal-700 tracking-tight">
              {partialScore}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold">/100</span>
          </div>
        </div>

        {/* Botão de Finalizar */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isComplete || isSubmitting}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-black transition-all shadow-md active:scale-98 cursor-pointer ${
              isComplete && !isSubmitting
                ? "bg-teal-600 text-white shadow-teal-600/30 hover:bg-teal-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Gravando...</span>
              </>
            ) : isComplete ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>{isEditing ? "Atualizar Nota" : "Finalizar Avaliação"}</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-slate-400" />
                <span>Faltam {totalCriteria - completedCount} notas</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
