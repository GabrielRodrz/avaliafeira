"use client";

import { Trophy, Medal, Award, Sparkles } from "lucide-react";
import { ProjectRankingItem } from "@/types";

interface PodiumViewProps {
  rankings: ProjectRankingItem[];
}

export default function PodiumView({ rankings }: PodiumViewProps) {
  // Pegar os três primeiros colocados que possuem pelo menos 1 avaliação
  const evaluatedRankings = rankings.filter((r) => r.evaluationsCount > 0);
  const first = evaluatedRankings[0];
  const second = evaluatedRankings[1];
  const third = evaluatedRankings[2];

  if (evaluatedRankings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <Trophy className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-2 text-base font-bold text-slate-700">Pódio aguardando avaliações</h3>
        <p className="mt-1 text-xs text-slate-500">
          Assim que os jurados começarem a lançar notas pelo celular, os 3 primeiros colocados aparecerão aqui em tempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-black tracking-tight text-slate-900">
          Pódio Oficial – Melhores Colocações
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* 2º LUGAR (Prata) - Exibido à esquerda em telas médias */}
        <div className="order-2 md:order-1 rounded-2xl border border-slate-200 bg-linear-to-b from-slate-50 to-white p-5 shadow-sm text-center relative hover:shadow-md transition">
          <div className="mx-auto -mt-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-300 text-slate-700 shadow-md border-2 border-white">
            <Medal className="h-8 w-8 text-slate-700" />
          </div>
          <span className="mt-2 inline-block rounded-full bg-slate-200 px-3 py-0.5 text-xs font-black text-slate-800">
            2º Lugar (Prata)
          </span>

          {second ? (
            <div className="mt-3">
              <span className="rounded-md bg-teal-100 px-2 py-0.5 text-xs font-black text-teal-800">
                {second.project.code}
              </span>
              <h3 className="mt-2 text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                {second.project.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                {second.project.category}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-2xl font-black text-slate-800">
                  {second.finalScore.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-bold ml-1">/ 100</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {second.evaluationsCount} {second.evaluationsCount === 1 ? "jurado" : "jurados"}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-400">Aguardando notas...</p>
          )}
        </div>

        {/* 1º LUGAR (Ouro) - Mais alto no centro */}
        <div className="order-1 md:order-2 rounded-2xl border-2 border-amber-400 bg-linear-to-b from-amber-50/50 via-white to-white p-6 shadow-lg text-center relative hover:shadow-xl transition transform md:-translate-y-2">
          <div className="mx-auto -mt-12 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/40 border-2 border-white">
            <Trophy className="h-9 w-9 text-amber-950" />
          </div>
          <span className="mt-2 inline-block rounded-full bg-amber-100 px-3.5 py-1 text-xs font-black text-amber-900 border border-amber-300">
            ★ 1º Lugar (Ouro / Campeão) ★
          </span>

          {first ? (
            <div className="mt-3">
              <span className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-black text-white">
                {first.project.code}
              </span>
              <h3 className="mt-2 text-base font-extrabold text-slate-900 line-clamp-2 leading-snug">
                {first.project.title}
              </h3>
              <p className="mt-1 text-xs text-amber-800/80 font-medium line-clamp-1">
                {first.project.category}
              </p>
              <div className="mt-4 pt-3 border-t border-amber-100">
                <span className="text-3xl font-black text-amber-900 tracking-tight">
                  {first.finalScore.toFixed(2)}
                </span>
                <span className="text-xs text-amber-700/60 font-bold ml-1">/ 100</span>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  {first.evaluationsCount} {first.evaluationsCount === 1 ? "avaliação" : "avaliações computadas"}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-400">Aguardando notas...</p>
          )}
        </div>

        {/* 3º LUGAR (Bronze) - Exibido à direita em telas médias */}
        <div className="order-3 md:order-3 rounded-2xl border border-slate-200 bg-linear-to-b from-amber-50/30 to-white p-5 shadow-sm text-center relative hover:shadow-md transition">
          <div className="mx-auto -mt-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-700/20 text-amber-900 shadow-md border-2 border-white">
            <Award className="h-8 w-8 text-amber-800" />
          </div>
          <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-black text-amber-900">
            3º Lugar (Bronze)
          </span>

          {third ? (
            <div className="mt-3">
              <span className="rounded-md bg-teal-100 px-2 py-0.5 text-xs font-black text-teal-800">
                {third.project.code}
              </span>
              <h3 className="mt-2 text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                {third.project.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                {third.project.category}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-2xl font-black text-slate-800">
                  {third.finalScore.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-bold ml-1">/ 100</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {third.evaluationsCount} {third.evaluationsCount === 1 ? "jurado" : "jurados"}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-400">Aguardando notas...</p>
          )}
        </div>
      </div>
    </div>
  );
}
