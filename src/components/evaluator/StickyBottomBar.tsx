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
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-2xl transition-all">
      {/* Barra de Progresso Fina */}
      <div className="h-1.5 w-full bg-slate-100">
        <div
          className={`h-full transition-all duration-300 ${
            isComplete ? "bg-emerald-500" : "bg-teal-600"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Status de Critérios e Pontuação Parcial */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Progresso:</span>
              <span
                className={`text-xs font-bold ${
                  isComplete ? "text-emerald-700" : "text-slate-800"
                }`}
              >
                {completedCount} de {totalCriteria} critérios
              </span>
            </div>
            {!isComplete && (
              <span className="text-[11px] text-amber-600 font-medium hidden sm:inline">
                Faltam {totalCriteria - completedCount} para enviar
              </span>
            )}
          </div>

          <div className="mt-0.5 sm:mt-0 flex items-baseline gap-1.5 border-t sm:border-t-0 sm:border-l border-slate-200 pt-0.5 sm:pt-0 sm:pl-6">
            <span className="text-xs font-semibold text-slate-500">Nota Total:</span>
            <span className="text-lg sm:text-xl font-extrabold text-teal-700 tracking-tight">
              {partialScore}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 100</span>
          </div>
        </div>

        {/* Botão de Finalizar */}
        <div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isComplete || isSubmitting}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all shadow-md active:scale-98 cursor-pointer ${
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
                <span>{isEditing ? "Atualizar Avaliação" : "Finalizar Avaliação"}</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-slate-400" />
                <span className="hidden sm:inline">Preencha os 10 critérios</span>
                <span className="sm:hidden">Pendente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
