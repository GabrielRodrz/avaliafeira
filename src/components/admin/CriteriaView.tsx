"use client";

import { Criterion, OFFICIAL_CRITERIA, OFFICIAL_SCALE } from "@/types";
import { CheckCircle2, Scale, Sparkles, Award } from "lucide-react";

interface CriteriaViewProps {
  criteria?: Criterion[];
}

export default function CriteriaView({ criteria = OFFICIAL_CRITERIA }: CriteriaViewProps) {
  return (
    <div className="space-y-8">
      {/* Seção 1: Escala Fixa Oficial */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Scale className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-black text-slate-900">
            Escala Oficial de Pontuação Estrita (Apenas Notas Pares)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          Cada critério aceita exclusivamente uma das 6 notas pré-definidas. Notas ímpares ou decimais são bloqueadas no formulário de avaliação.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {OFFICIAL_SCALE.map((item) => (
            <div
              key={item.value}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
            >
              <div>
                <span className="inline-block rounded-lg bg-teal-600 px-2.5 py-1 text-sm font-black text-white">
                  {item.value} pts
                </span>
                <h4 className="mt-2 text-xs sm:text-sm font-black text-slate-900">
                  {item.label}
                </h4>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 leading-tight">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Seção 2: Os 10 Critérios Oficiais */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-black text-slate-900">
              Os 10 Critérios Oficiais (Total Máximo: 100 Pontos)
            </h2>
          </div>
          <span className="rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-800">
            10 x 10 pts = 100 pts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criteria.map((c) => (
            <div
              key={c.id}
              className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-xs font-black text-white">
                      {c.order_num}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {c.name}
                    </h3>
                  </div>

                  {c.tie_breaker_order && (
                    <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 shrink-0">
                      {c.tie_breaker_order}º Desempate
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>Peso: 1.0 (0 a 10 pts)</span>
                <span className="text-teal-700">Oficial AvaliaFeira</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
