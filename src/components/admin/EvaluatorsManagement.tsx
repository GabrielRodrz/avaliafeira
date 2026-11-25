"use client";

import { useState } from "react";
import {
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  Search,
  Hash,
  BookmarkCheck,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Evaluator, Project, Evaluation } from "@/types";

interface EvaluatorsManagementProps {
  evaluators: Evaluator[];
  projects: Project[];
  evaluations: Evaluation[];
  onCreateOrUpdateEvaluator: (
    code: string,
    name?: string | null,
    assignedProjects?: string[]
  ) => Promise<void>;
  onDeleteEvaluator: (code: string) => Promise<void>;
}

export default function EvaluatorsManagement({
  evaluators,
  projects,
  evaluations,
  onCreateOrUpdateEvaluator,
  onDeleteEvaluator,
}: EvaluatorsManagementProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvaluator, setEditingEvaluator] = useState<Evaluator | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const openCreateModal = () => {
    setEditingEvaluator(null);
    setCode(`AV-0${evaluators.length + 1}`);
    setName("");
    setSelectedProjects([]);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (ev: Evaluator) => {
    setEditingEvaluator(ev);
    setCode(ev.code);
    setName(ev.name || "");
    setSelectedProjects(ev.assigned_projects || []);
    setError("");
    setIsModalOpen(true);
  };

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSelectAllProjects = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map((p) => p.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError("A matrícula é obrigatória.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateOrUpdateEvaluator(
        cleanCode,
        name.trim() || null,
        selectedProjects
      );
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.message || "Erro ao salvar avaliador.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtragem de avaliadores
  const filteredEvaluators = evaluators.filter(
    (ev) =>
      ev.code.toLowerCase().includes(search.toLowerCase()) ||
      (ev.name && ev.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Barra de Ações: Busca e Botão Novo Avaliador */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por matrícula (ex: AV-01) ou nome do jurado..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 transition active:scale-98 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Matrícula de Avaliador</span>
        </button>
      </div>

      {/* Dica de Funcionamento */}
      <div className="mb-6 rounded-2xl bg-teal-50 border border-teal-200 p-4 text-xs text-teal-900">
        <div className="flex items-center gap-2 font-bold mb-1">
          <BookmarkCheck className="h-4 w-4 text-teal-700" />
          <span>Como funciona a Matrícula e Escala de Avaliação:</span>
        </div>
        <p className="text-teal-800 leading-relaxed">
          Você cria as matrículas dos jurados (ex: <strong>AV-01</strong>, <strong>AV-02</strong>) e define quais projetos cada um deve avaliar. Ao abrir o aplicativo no celular, o jurado digita sua matrícula e seu próprio nome na hora, e o sistema exibe imediatamente a lista com os estandes e projetos designados para ele.
        </p>
      </div>

      {/* Tabela de Avaliadores Cadastrados */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Matrícula</th>
                <th className="px-4 py-3 min-w-[160px]">Nome do Jurado</th>
                <th className="px-4 py-3 min-w-[220px]">Projetos Designados (Escala)</th>
                <th className="px-4 py-3 text-center">Progresso</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvaluators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Nenhum avaliador encontrado. Cadastre a primeira matrícula acima.
                  </td>
                </tr>
              ) : (
                filteredEvaluators.map((ev) => {
                  const assignedIds = ev.assigned_projects || [];
                  // Contar quantos projetos designados já foram avaliados por este jurado
                  const evaluatedCount = evaluations.filter((evaluation) => {
                    const matchCode =
                      evaluation.evaluator_code &&
                      evaluation.evaluator_code.toUpperCase() === ev.code.toUpperCase();
                    const matchName =
                      ev.name &&
                      evaluation.evaluator_name.trim().toLowerCase() === ev.name.trim().toLowerCase();
                    return (matchCode || matchName) && assignedIds.includes(evaluation.project_id);
                  }).length;

                  const isComplete = assignedIds.length > 0 && evaluatedCount >= assignedIds.length;

                  return (
                    <tr key={ev.code} className="hover:bg-slate-50 transition">
                      {/* Matrícula */}
                      <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                        <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-800 border border-teal-200">
                          {ev.code}
                        </span>
                      </td>

                      {/* Nome do Jurado */}
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {ev.name ? (
                          <span>{ev.name}</span>
                        ) : (
                          <span className="italic text-slate-400 text-[11px]">
                            (Jurado digita o nome na hora)
                          </span>
                        )}
                      </td>

                      {/* Projetos Designados */}
                      <td className="px-4 py-3">
                        {assignedIds.length === 0 ? (
                          <span className="text-[11px] text-amber-600 font-medium">
                            Nenhum projeto atribuído
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {assignedIds.map((pId) => {
                              const proj = projects.find((p) => p.id === pId);
                              return (
                                <span
                                  key={pId}
                                  className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700"
                                  title={proj ? proj.title : pId}
                                >
                                  {proj ? proj.code : pId}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Progresso de Avaliação */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isComplete
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : assignedIds.length > 0
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isComplete && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                          <span>
                            {evaluatedCount} de {assignedIds.length} avaliados
                          </span>
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => openEditModal(ev)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-teal-700 transition"
                          title="Editar escala de projetos"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Deseja realmente excluir o avaliador com matrícula "${ev.code}"?`
                              )
                            ) {
                              onDeleteEvaluator(ev.code);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Excluir avaliador"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação / Edição de Avaliador */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">
                  {editingEvaluator ? "Editar Escala do Avaliador" : "Cadastrar Nova Matrícula de Avaliador"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Matrícula / Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex: AV-01 ou 101"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold uppercase text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Código único informado pelo jurado.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Nome do Jurado (Opcional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Prof. Roberto (ou digita na hora)"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Se deixar em branco, ele digita na hora.</span>
                </div>
              </div>

              {/* Seleção de Projetos que ele vai avaliar */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Projetos que ele vai avaliar ({selectedProjects.length} selecionados):
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllProjects}
                    className="text-[11px] font-bold text-teal-700 hover:underline"
                  >
                    {selectedProjects.length === projects.length ? "Desmarcar Todos" : "Selecionar Todos"}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                  {projects.map((proj) => {
                    const isSelected = selectedProjects.includes(proj.id);
                    return (
                      <label
                        key={proj.id}
                        className={`flex items-start gap-3 rounded-xl border p-2.5 transition cursor-pointer ${
                          isSelected
                            ? "border-teal-600 bg-teal-50/80"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleProject(proj.id)}
                          className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <div className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900">{proj.code}</span>
                            {proj.stand && (
                              <span className="text-[10px] text-slate-500 font-semibold">
                                ({proj.stand})
                              </span>
                            )}
                            <span className="text-[10px] text-teal-800 font-medium">
                              • {proj.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-1">{proj.title}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingEvaluator ? "Salvar Alterações" : "Cadastrar Matrícula"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
