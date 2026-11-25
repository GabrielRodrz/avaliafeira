"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Shuffle,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Users,
  BookOpen,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Project, Evaluator, Evaluation } from "@/types";
import { distributeProjectsBalanced, DistributionResult } from "@/lib/distribution";

interface DistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  evaluators: Evaluator[];
  evaluations: Evaluation[];
  onApplyDistribution: (
    allocations: { projectId: string; evaluatorCodes: string[] }[]
  ) => Promise<void>;
  onSeed40Projects?: () => Promise<void>;
}

export default function DistributionModal({
  isOpen,
  onClose,
  projects,
  evaluators,
  evaluations,
  onApplyDistribution,
  onSeed40Projects,
}: DistributionModalProps) {
  const [evaluatorsPerProject, setEvaluatorsPerProject] = useState<number>(2);
  const [preserveExisting, setPreserveExisting] = useState<boolean>(true);
  const [randomSeed, setRandomSeed] = useState<number>(0);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isSeedingProjects, setIsSeedingProjects] = useState<boolean>(false);

  // Simulação instantânea da distribuição calculada
  const simulation: DistributionResult = useMemo(() => {
    // randomSeed força recálculo aleatório quando o usuário clica em sortear novamente
    if (!isOpen) {
      return {
        allocations: [],
        evaluatorLoads: {},
        evaluatorsPerProject,
        totalProjects: 0,
        totalEvaluators: 0,
        minLoad: 0,
        maxLoad: 0,
        avgLoad: 0,
        isEquallyBalanced: true,
        projectsByCategory: {},
      };
    }
    return distributeProjectsBalanced(
      projects,
      evaluators,
      evaluatorsPerProject,
      evaluations,
      preserveExisting
    );
  }, [projects, evaluators, evaluatorsPerProject, evaluations, preserveExisting, randomSeed, isOpen]);

  if (!isOpen) return null;

  // Contagem de projetos por categoria atual
  const categoryCounts: Record<string, number> = {};
  projects.forEach((p) => {
    const cat = p.category?.trim() || "Geral";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const handleApply = async () => {
    if (simulation.allocations.length === 0) return;
    setIsApplying(true);
    try {
      await onApplyDistribution(simulation.allocations);
      onClose();
    } catch (err) {
      console.error("Erro ao aplicar distribuição:", err);
      alert("Ocorreu um erro ao gravar a distribuição de projetos.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSeed40 = async () => {
    if (!onSeed40Projects) return;
    if (
      projects.length > 0 &&
      !confirm("Deseja substituir a lista atual pelos 40 projetos oficiais da feira (13 Júnior, 14 Nemo, 13 Médio)?")
    ) {
      return;
    }
    setIsSeedingProjects(true);
    try {
      await onSeed40Projects();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeedingProjects(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-4 sm:p-8 shadow-2xl transition-all my-auto max-h-[95vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Distribuição Automática e Equilibrada
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Sorteio equilibrado de escala: mesmo quantitativo por projeto e carga dividida por igual
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Card: Diagnóstico da Feira (Projetos e Categorias) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-teal-600" />
                <span>Total de Projetos</span>
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{projects.length}</span>
                <span className="text-xs font-semibold text-slate-500">estandes</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-teal-600" />
                <span>Avaliadores Cadastrados</span>
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-teal-700">{evaluators.length}</span>
                <span className="text-xs font-semibold text-slate-500">jurados</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-teal-600" />
                <span>Divisão em Categorias</span>
              </span>
              <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-bold">
                <span className="rounded bg-teal-100 px-1.5 py-0.5 text-teal-900">
                  Júnior: {categoryCounts["Júnior"] || 0}
                </span>
                <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-indigo-900">
                  Nemo: {categoryCounts["Nemo"] || 0}
                </span>
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-900">
                  Médio: {categoryCounts["Médio"] || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Opcional: Carregar os 40 Projetos Oficiais */}
          {projects.length !== 40 && onSeed40Projects && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs shrink-0">
                  40
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-indigo-950">
                    Deseja carregar a estrutura de 40 Projetos da Feira?
                  </h4>
                  <p className="text-[11px] text-indigo-800">
                    13 Projetos Júnior (J-01 a J-13) • 14 Nemo (N-01 a N-14) • 13 Médio (M-01 a M-13)
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSeedingProjects}
                onClick={handleSeed40}
                className="w-full sm:w-auto shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSeedingProjects ? "Carregando..." : "Carregar os 40 Projetos"}
              </button>
            </div>
          )}

          {/* 1. Parâmetros de Distribuição */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                  1. Quantidade de Jurados por Projeto (Estande)
                </label>
                <p className="text-[11px] text-slate-500">
                  Cada projeto receberá rigorosamente esta mesma quantidade de notas
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {[2, 3, 4].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setEvaluatorsPerProject(k)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition border cursor-pointer ${
                      evaluatorsPerProject === k
                        ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {k} por projeto {k === 2 && "(Padrão)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={preserveExisting}
                  onChange={(e) => setPreserveExisting(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span>Preservar notas e avaliações que já foram iniciadas no sistema</span>
              </label>

              <button
                type="button"
                onClick={() => setRandomSeed((s) => s + 1)}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 underline"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span>Sortear Nova Variação Aleatória</span>
              </button>
            </div>
          </div>

          {/* 2. Diagnóstico de Equilíbrio & Proporcionalidade */}
          {evaluators.length === 0 ? (
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs font-bold text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <span>
                Cadastre ou importe avaliadores antes de executar a distribuição da escala.
              </span>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-teal-500/80 bg-linear-to-r from-teal-50 to-emerald-50 p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-teal-950">
                    Garantia de Equilíbrio & Proporcionalidade
                  </span>
                </div>

                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-[11px] font-black text-emerald-900">
                  {simulation.isEquallyBalanced
                    ? "✓ Cargas Perfeitamente Equilibradas"
                    : "Cargas Balanceadas com Base em Notas Existentes"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-teal-950 font-medium">
                <div className="rounded-xl bg-white/80 p-3 border border-teal-200/60">
                  <span className="text-[10px] uppercase font-bold text-teal-700 block">
                    Por Projeto
                  </span>
                  <span className="text-base font-black text-slate-900">
                    Exatamente {simulation.evaluatorsPerProject} jurados
                  </span>
                  <span className="text-[10px] text-slate-500 block">em cada estande</span>
                </div>

                <div className="rounded-xl bg-white/80 p-3 border border-teal-200/60">
                  <span className="text-[10px] uppercase font-bold text-teal-700 block">
                    Por Avaliador
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {simulation.minLoad === simulation.maxLoad
                      ? `${simulation.minLoad} projetos cada`
                      : `${simulation.minLoad} a ${simulation.maxLoad} projetos`}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    diferença máxima de 1 projeto
                  </span>
                </div>

                <div className="rounded-xl bg-white/80 p-3 border border-teal-200/60">
                  <span className="text-[10px] uppercase font-bold text-teal-700 block">
                    Média Geral
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {simulation.avgLoad} projetos
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    por jurado avaliador
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-teal-900 font-medium leading-relaxed">
                💡 <strong>Dica de Dinâmica:</strong> Se mais jurados chegarem ou forem cadastrados depois, basta reabrir este modal e clicar em redistribuir. O sistema rebalanceia imediatamente as cargas para acolher os novos avaliadores sem sobrecarregar ninguém.
              </p>
            </div>
          )}

          {/* 3. Tabela de Pré-visualização da Carga de Cada Avaliador */}
          {evaluators.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Pré-visualização: Distribuição por Avaliador ({evaluators.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Equilíbrio entre Júnior, Nemo e Médio
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-600 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2.5">Matrícula</th>
                      <th className="px-3.5 py-2.5">Nome do Jurado</th>
                      <th className="px-3.5 py-2.5 text-center">Total de Projetos</th>
                      <th className="px-3.5 py-2.5">Equilíbrio por Categoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 bg-white">
                    {Object.values(simulation.evaluatorLoads).map((load) => (
                      <tr key={load.code} className="hover:bg-slate-50/80">
                        <td className="px-3.5 py-2 font-mono font-black text-teal-900">
                          <span className="rounded-lg bg-teal-100 px-2 py-0.5 text-xs text-teal-900 font-bold">
                            {load.code}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 font-semibold text-slate-900">
                          {load.name || "(Nome digitado na hora)"}
                        </td>
                        <td className="px-3.5 py-2 text-center">
                          <span className="rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-xs font-black text-slate-900">
                            {load.total} projetos
                          </span>
                        </td>
                        <td className="px-3.5 py-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold">
                            {Object.entries(load.byCategory).map(([cat, count]) => (
                              <span
                                key={cat}
                                className={`rounded px-1.5 py-0.5 ${
                                  cat.toLowerCase().includes("júnior") || cat.toLowerCase().includes("junior")
                                    ? "bg-teal-50 text-teal-800 border border-teal-200"
                                    : cat.toLowerCase().includes("nemo")
                                    ? "bg-indigo-50 text-indigo-800 border border-indigo-200"
                                    : "bg-amber-50 text-amber-800 border border-amber-200"
                                }`}
                              >
                                {cat}: {count}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Botões de Ação Responsivos */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto text-center rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={evaluators.length === 0 || projects.length === 0 || isApplying}
            onClick={handleApply}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-7 py-3 text-sm font-black text-white shadow-lg shadow-teal-600/25 hover:bg-teal-700 active:scale-98 transition disabled:opacity-50 cursor-pointer"
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Aplicando Distribuição...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Distribuir {evaluatorsPerProject} Jurados por Projeto Agora</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
