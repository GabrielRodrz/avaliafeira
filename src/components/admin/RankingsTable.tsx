"use client";

import { useState, useMemo } from "react";
import {
  Trophy,
  AlertTriangle,
  FileSearch,
  Filter,
  Radio,
  Users,
  CheckCircle2,
} from "lucide-react";
import { ProjectRankingItem, Project, Evaluation, Criterion, OFFICIAL_CRITERIA } from "@/types";
import PodiumView from "./PodiumView";
import EvaluationsInspectionModal from "./EvaluationsInspectionModal";

interface RankingsTableProps {
  rankings: ProjectRankingItem[];
  evaluations: Evaluation[];
  criteria?: Criterion[];
  onDeleteEvaluation?: (evalId: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export default function RankingsTable({
  rankings,
  evaluations,
  criteria = OFFICIAL_CRITERIA,
  onDeleteEvaluation,
  categories,
  selectedCategory,
  onSelectCategory,
}: RankingsTableProps) {
  const [inspectProject, setInspectProject] = useState<Project | null>(null);

  return (
    <div>
      {/* Pódio Oficial no Topo */}
      <PodiumView rankings={rankings} />

      {/* Controles de Filtro e Indicador de Realtime */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Filtrar Categoria:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white py-1.5 px-3 text-xs font-bold text-slate-800 focus:border-teal-600 focus:outline-none"
          >
            <option value="all">Todas as Categorias ({rankings.length} projetos)</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Indicador de Realtime */}
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 self-start sm:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Sincronização em Tempo Real Ativa</span>
        </div>
      </div>

      {/* Tabela Ranqueada Geral */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-3.5 py-3 text-center">Pos.</th>
                <th scope="col" className="px-3.5 py-3">Código</th>
                <th scope="col" className="px-4 py-3 min-w-[220px]">Projeto / Categoria</th>
                <th scope="col" className="px-3 py-3 text-center">Jurados</th>
                {criteria.map((c) => (
                  <th
                    key={c.id}
                    scope="col"
                    className="px-2 py-3 text-center font-bold"
                    title={`Critério ${c.id}: ${c.name}${
                      c.tie_breaker_order ? ` (${c.tie_breaker_order}º Desempate)` : ""
                    }`}
                  >
                    C{c.id}
                    {c.tie_breaker_order && (
                      <span className="ml-0.5 text-[9px] text-teal-700">
                        *
                      </span>
                    )}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right">Nota Final</th>
                <th scope="col" className="px-3.5 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankings.map((item, index) => {
                const isFirst = item.rank === 1 && item.evaluationsCount > 0;
                const isSecond = item.rank === 2 && item.evaluationsCount > 0;
                const isThird = item.rank === 3 && item.evaluationsCount > 0;

                return (
                  <tr
                    key={item.project.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isFirst
                        ? "bg-amber-50/40 font-medium"
                        : isSecond
                        ? "bg-slate-50/60"
                        : isThird
                        ? "bg-amber-50/20"
                        : ""
                    }`}
                  >
                    {/* Posição / Rank */}
                    <td className="px-3.5 py-3.5 text-center">
                      <div className="flex flex-col items-center justify-center">
                        {isFirst ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 font-black text-amber-950 text-xs shadow-xs">
                            1º
                          </span>
                        ) : isSecond ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-300 font-black text-slate-800 text-xs shadow-xs">
                            2º
                          </span>
                        ) : isThird ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-700/20 font-black text-amber-900 text-xs shadow-xs">
                            3º
                          </span>
                        ) : (
                          <span className="font-bold text-slate-500">
                            {item.evaluationsCount > 0 ? `${item.rank}º` : "-"}
                          </span>
                        )}

                        {item.isTechnicalTie && (
                          <span
                            title="Empate Técnico – Avaliação Complementar"
                            className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-1.5 py-0.2 text-[9px] font-extrabold text-rose-800"
                          >
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Empate
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Código e Estande */}
                    <td className="px-3.5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-black text-teal-800 border border-teal-200">
                        {item.project.code}
                      </span>
                      {item.project.stand && (
                        <span className="block mt-1 text-[11px] font-semibold text-slate-500">
                          {item.project.stand}
                        </span>
                      )}
                    </td>

                    {/* Título e Categoria */}
                    <td className="px-4 py-3.5">
                      <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                        {item.project.title}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-teal-700 font-semibold">
                        {item.project.category}
                      </p>
                    </td>

                    {/* Quantidade de Avaliadores */}
                    <td className="px-3 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          item.evaluationsCount > 0
                            ? "bg-slate-100 text-slate-800"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <Users className="h-3 w-3" />
                        <span>{item.evaluationsCount}</span>
                      </span>
                    </td>

                    {/* Médias dos 10 Critérios (C1..C10) */}
                    {criteria.map((c) => {
                      const avg = item.criteriaAverages[c.id] || 0;
                      return (
                        <td
                          key={c.id}
                          className="px-2 py-3.5 text-center font-mono text-[11px] font-semibold text-slate-700"
                        >
                          {item.evaluationsCount > 0 ? avg.toFixed(1) : "-"}
                        </td>
                      );
                    })}

                    {/* Pontuação Final (0.00 a 100.00) */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="text-base font-black text-teal-800 tracking-tight">
                          {item.evaluationsCount > 0 ? item.finalScore.toFixed(2) : "0.00"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">/ 100 pts</span>
                      </div>
                    </td>

                    {/* Ações: Inspecionar Fichas */}
                    <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => setInspectProject(item.project)}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition active:scale-95 cursor-pointer"
                        title="Ver fichas individuais e notas de cada jurado"
                      >
                        <FileSearch className="h-3.5 w-3.5" />
                        <span>Fichas ({item.evaluationsCount})</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legenda de Desempate */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 px-1">
        <div>
          <span>Critérios com asterisco (<strong>*</strong>) são prioritários para desempate: </span>
          <span className="text-teal-800 font-semibold">
            1º C1 (Domínio), 2º C5 (Fundamentação), 3º C6 (Metodologia), 4º C2 (Criatividade).
          </span>
        </div>
        <div>
          <span>Pontuação Final = Soma exata das médias dos 10 critérios (0.00 a 100.00).</span>
        </div>
      </div>

      {/* Modal de Inspeção de Fichas */}
      <EvaluationsInspectionModal
        isOpen={Boolean(inspectProject)}
        onClose={() => setInspectProject(null)}
        project={inspectProject}
        evaluations={evaluations}
        criteria={criteria}
        onDeleteEvaluation={onDeleteEvaluation}
      />
    </div>
  );
}
