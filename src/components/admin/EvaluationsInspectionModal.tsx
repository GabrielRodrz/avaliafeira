"use client";

import { X, User, Calendar, FileText, Trash2, CheckCircle2 } from "lucide-react";
import { Project, Evaluation, Criterion, OFFICIAL_CRITERIA } from "@/types";

interface EvaluationsInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  evaluations: Evaluation[];
  criteria?: Criterion[];
  onDeleteEvaluation?: (evalId: string) => void;
}

export default function EvaluationsInspectionModal({
  isOpen,
  onClose,
  project,
  evaluations,
  criteria = OFFICIAL_CRITERIA,
  onDeleteEvaluation,
}: EvaluationsInspectionModalProps) {
  if (!isOpen || !project) return null;

  const projectEvals = evaluations.filter((e) => e.project_id === project.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header do Modal */}
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-teal-600 px-2.5 py-0.5 text-xs font-black text-white">
                {project.code}
              </span>
              <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                {project.category}
              </span>
            </div>
            <h2 className="mt-2 text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {project.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {projectEvals.length} {projectEvals.length === 1 ? "ficha individual registrada" : "fichas individuais registradas"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista de Fichas dos Jurados */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {projectEvals.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileText className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Nenhuma avaliação enviada para este projeto ainda.</p>
            </div>
          ) : (
            projectEvals.map((evalItem, index) => (
              <div
                key={evalItem.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                {/* Cabeçalho da Ficha */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold text-xs">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                        <User className="h-4 w-4 text-teal-600" />
                        <span>{evalItem.evaluator_name}</span>
                      </div>
                      {evalItem.created_at && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(evalItem.created_at).toLocaleString("pt-BR")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Nota Total
                      </span>
                      <span className="text-xl font-black text-teal-700">
                        {evalItem.total_score} pts
                      </span>
                    </div>

                    {onDeleteEvaluation && (
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Deseja realmente excluir a ficha do avaliador "${evalItem.evaluator_name}"? Esta ação removerá a pontuação do cálculo.`
                            )
                          ) {
                            onDeleteEvaluation(evalItem.id);
                          }
                        }}
                        title="Excluir ficha"
                        className="rounded-xl p-2 text-rose-500 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grade das 10 Notas */}
                <div className="mt-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Notas por Critério Oficial (0 a 10 pts):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {criteria.map((c) => {
                      const scoreVal = evalItem.scores?.[String(c.id)] ?? evalItem.scores?.[c.id] ?? 0;
                      return (
                        <div
                          key={c.id}
                          className="rounded-xl border border-slate-100 bg-slate-50/70 p-2 text-center"
                        >
                          <span className="block text-[10px] font-semibold text-slate-500 line-clamp-1" title={c.name}>
                            {c.order_num}. {c.name}
                          </span>
                          <span className="mt-0.5 inline-block text-sm font-black text-slate-900">
                            {scoreVal} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Observações do Avaliador */}
                {evalItem.notes && (
                  <div className="mt-4 rounded-xl bg-teal-50/60 border border-teal-100 p-3 text-xs">
                    <span className="font-bold text-teal-900 block mb-1">
                      Observações do Jurado:
                    </span>
                    <p className="text-teal-950 italic">"{evalItem.notes}"</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="border-t border-slate-200 bg-slate-50 p-4 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
