"use client";

import { Criterion, OFFICIAL_SCALE } from "@/types";
import { CheckCircle2 } from "lucide-react";

interface CriterionCardProps {
  criterion: Criterion;
  selectedScore: number | undefined;
  onSelectScore: (score: number) => void;
  index: number;
}

export default function CriterionCard({
  criterion,
  selectedScore,
  onSelectScore,
  index,
}: CriterionCardProps) {
  const isAnswered = selectedScore !== undefined && selectedScore !== null;

  return (
    <div
      id={`criterion-${criterion.id}`}
      className={`relative rounded-2xl sm:rounded-3xl border bg-white p-3.5 sm:p-5 shadow-xs transition-all duration-200 ${
        isAnswered
          ? "border-teal-300/80 ring-1 ring-teal-500/20 shadow-teal-900/5"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      {/* Header do Critério */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
              isAnswered
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {index + 1}
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
              {criterion.name}
            </h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              {criterion.description}
            </p>
          </div>
        </div>

        {/* Status / Nota Selecionada */}
        <div className="shrink-0">
          {isAnswered ? (
            <div className="flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-black text-teal-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
              <span>{selectedScore} pts</span>
            </div>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-slate-500">
              Pendente
            </span>
          )}
        </div>
      </div>

      {/* Grade 3x2 de Botões Táteis Grandes */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
        {OFFICIAL_SCALE.map((opt) => {
          const isSelected = selectedScore === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectScore(opt.value)}
              className={`group relative flex flex-col items-start justify-between rounded-xl sm:rounded-2xl border p-2.5 sm:p-3 text-left transition-all duration-150 active:scale-97 cursor-pointer min-h-[66px] sm:min-h-[76px] touch-manipulation ${
                isSelected
                  ? "border-teal-600 bg-teal-50/90 ring-2 ring-teal-500/30 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] sm:text-xs font-black tracking-tight ${
                    isSelected
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                  }`}
                >
                  {opt.value} pts
                </span>

                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                )}
              </div>

              <div className="mt-1.5 w-full">
                <span
                  className={`block text-xs font-extrabold leading-tight ${
                    isSelected ? "text-teal-950" : "text-slate-900"
                  }`}
                >
                  {opt.label}
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-500 line-clamp-1 leading-normal">
                  {opt.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
