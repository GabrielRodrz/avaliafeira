"use client";

import { useState, useRef } from "react";
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
  Upload,
  Download,
  FileSpreadsheet,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { Evaluator, Project, Evaluation } from "@/types";
import DistributionModal from "./DistributionModal";

interface EvaluatorsManagementProps {
  evaluators: Evaluator[];
  projects: Project[];
  evaluations: Evaluation[];
  onCreateOrUpdateEvaluator: (
    code: string,
    name?: string | null,
    assignedProjects?: string[]
  ) => Promise<void>;
  onBatchCreateEvaluators?: (
    list: { code: string; name?: string | null; assignedProjects?: string[] }[]
  ) => Promise<void>;
  onDeleteEvaluator: (code: string) => Promise<void>;
  onApplyDistribution?: (
    allocations: { projectId: string; evaluatorCodes: string[] }[]
  ) => Promise<void>;
  onSeed40Projects?: () => Promise<void>;
}

// Gerador de matrícula numérica aleatória única (4 dígitos: 1000 a 9999)
function generateRandomNumericMatricula(existingCodes: string[] = []): string {
  const existingSet = new Set(existingCodes.map((c) => c.trim().replace(/\D/g, "")));
  let attempts = 0;
  while (attempts < 10000) {
    const num = Math.floor(1000 + Math.random() * 9000).toString();
    if (!existingSet.has(num)) {
      return num;
    }
    attempts++;
  }
  return Math.floor(10000 + Math.random() * 90000).toString();
}

interface ParsedEvaluatorRow {
  id: string;
  code: string;
  name: string;
  assignedProjectCodes: string[];
}

export default function EvaluatorsManagement({
  evaluators,
  projects,
  evaluations,
  onCreateOrUpdateEvaluator,
  onBatchCreateEvaluators,
  onDeleteEvaluator,
  onApplyDistribution,
  onSeed40Projects,
}: EvaluatorsManagementProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [editingEvaluator, setEditingEvaluator] = useState<Evaluator | null>(null);

  // Form states (Cadastro individual)
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Estados do Modal de Importação CSV
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedEvaluatorRow[]>([]);
  const [autoDistributeProjects, setAutoDistributeProjects] = useState(false);
  const [projectsPerEvaluator, setProjectsPerEvaluator] = useState(2);
  const [csvError, setCsvError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreateModal = () => {
    setEditingEvaluator(null);
    setCode(generateRandomNumericMatricula(evaluators.map((e) => e.code)));
    setName("");
    setSelectedProjects([]);
    setError("");
    setIsModalOpen(true);
  };

  const handleRollNewCode = () => {
    setCode(generateRandomNumericMatricula(evaluators.map((e) => e.code)));
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

    const cleanCode = code.trim().replace(/\D/g, "");
    if (!cleanCode) {
      setError("A matrícula é obrigatória e deve conter apenas números.");
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

  // ==============================================================================
  // PROCESSAMENTO DO CSV DE AVALIADORES
  // ==============================================================================
  const parseCSVContent = (content: string) => {
    setCsvError("");
    const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    const existingCodes = evaluators.map((e) => e.code);
    const usedCodes = [...existingCodes];
    const rows: ParsedEvaluatorRow[] = [];

    lines.forEach((line, index) => {
      // Ignorar cabeçalho se houver "nome" ou "name"
      if (index === 0 && (line.toLowerCase().includes("nome") || line.toLowerCase().includes("name") || line.toLowerCase().includes("avaliador"))) {
        return;
      }

      // Separar por vírgula, ponto-e-vírgula ou tab
      let parts = line.split(/[;,\t]/);
      let evaluatorName = parts[0]?.trim() || "";
      let assignedProjs: string[] = [];

      // Remover aspas caso existam
      evaluatorName = evaluatorName.replace(/^["']|["']$/g, "").trim();

      if (parts.length > 1) {
        const projsPart = parts.slice(1).join(",").replace(/^["']|["']$/g, "").trim();
        if (projsPart) {
          assignedProjs = projsPart.split(/[,;\s]+/).map((p) => p.trim()).filter((p) => p.length > 0);
        }
      }

      if (evaluatorName) {
        const randomCode = generateRandomNumericMatricula(usedCodes);
        usedCodes.push(randomCode);

        rows.push({
          id: `csv-${index}-${Date.now()}`,
          code: randomCode,
          name: evaluatorName,
          assignedProjectCodes: assignedProjs,
        });
      }
    });

    if (rows.length === 0) {
      setCsvError("Nenhum nome válido de avaliador foi encontrado no texto/arquivo.");
    }

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCSVContent(text);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleRerollSingleRowCode = (id: string) => {
    setParsedRows((prev) => {
      const usedCodes = [
        ...evaluators.map((e) => e.code),
        ...prev.filter((r) => r.id !== id).map((r) => r.code),
      ];
      return prev.map((r) =>
        r.id === id ? { ...r, code: generateRandomNumericMatricula(usedCodes) } : r
      );
    });
  };

  const handleRemoveSingleRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "Nome,Projetos\n" +
      "Dra. Mariana Silveira,\"PROJ-01, PROJ-02\"\n" +
      "Prof. Carlos Eduardo Silveira,\"PROJ-03\"\n" +
      "Profa. Helena Prado,\"PROJ-04, PROJ-05\"\n" +
      "Prof. Rafael Albuquerque,\n" +
      "Profa. Renata Vasconcelos,\n";

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "modelo_importacao_avaliadores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar todas as credenciais / matrículas dos avaliadores
  const handleExportCredentialsCSV = () => {
    const headers = "Matricula,Nome,QuantidadeProjetosDesignados,CodigosDosProjetos\n";
    const rows = evaluators
      .map((ev) => {
        const assignedCodes = (ev.assigned_projects || [])
          .map((id) => projects.find((p) => p.id === id)?.code || id)
          .join("; ");
        return `"${ev.code}","${ev.name || "Aguardando jurado"}","${(ev.assigned_projects || []).length}","${assignedCodes}"`;
      })
      .join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "avaliadores_matriculas_credenciais.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Salvar a importação em lote
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    setCsvError("");

    try {
      // Mapear projetos atribuídos
      const batchList = parsedRows.map((row, idx) => {
        let assignedIds: string[] = [];

        if (row.assignedProjectCodes.length > 0) {
          // Localizar IDs correspondentes
          assignedIds = row.assignedProjectCodes
            .map((pCode) => {
              const clean = pCode.toUpperCase();
              return projects.find((p) => p.code.toUpperCase() === clean || p.id === pCode)?.id;
            })
            .filter(Boolean) as string[];
        }

        // Se marcou para distribuir automaticamente e não tinha projetos explícitos
        if (autoDistributeProjects && assignedIds.length === 0 && projects.length > 0) {
          const startIndex = (idx * projectsPerEvaluator) % projects.length;
          for (let i = 0; i < projectsPerEvaluator; i++) {
            const proj = projects[(startIndex + i) % projects.length];
            if (proj && !assignedIds.includes(proj.id)) {
              assignedIds.push(proj.id);
            }
          }
        }

        return {
          code: row.code,
          name: row.name,
          assignedProjects: assignedIds,
        };
      });

      if (onBatchCreateEvaluators) {
        await onBatchCreateEvaluators(batchList);
      } else {
        for (const item of batchList) {
          await onCreateOrUpdateEvaluator(item.code, item.name, item.assignedProjects);
        }
      }

      setIsCSVModalOpen(false);
      setCsvText("");
      setParsedRows([]);
    } catch (err: any) {
      setCsvError(err?.message || "Erro ao salvar lote de avaliadores.");
    } finally {
      setIsImporting(false);
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
      {/* Barra de Ações: Busca, Importar CSV, Exportar e Botão Novo Avaliador */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por matrícula (ex: 101) ou nome do jurado..."
            className="w-full rounded-2xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botão Distribuição Equilibrada Automática (1 Clique) */}
          <button
            type="button"
            onClick={() => setIsDistributionModalOpen(true)}
            title="Distribuir 40 projetos equilibradamente entre todos os avaliadores com 1 clique"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 px-4 py-2.5 text-xs font-black text-indigo-950 transition active:scale-98 cursor-pointer shadow-xs"
          >
            <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
            <span>Distribuir Projetos (1 Clique)</span>
          </button>

          {/* Botão Exportar Credenciais */}
          {evaluators.length > 0 && (
            <button
              onClick={handleExportCredentialsCSV}
              title="Baixar lista com matrículas e projetos de cada jurado"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition active:scale-98 cursor-pointer shadow-2xs"
            >
              <Download className="h-4 w-4 text-slate-500" />
              <span>Exportar Matrículas (CSV)</span>
            </button>
          )}

          {/* Botão Importar CSV */}
          <button
            onClick={() => {
              setCsvText("");
              setParsedRows([]);
              setCsvError("");
              setIsCSVModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-teal-300 bg-teal-50 hover:bg-teal-100/80 px-4 py-2.5 text-xs font-bold text-teal-900 transition active:scale-98 cursor-pointer shadow-2xs"
          >
            <Upload className="h-4 w-4 text-teal-700" />
            <span>Subir CSV de Avaliadores</span>
          </button>

          {/* Botão Novo Avaliador Individual */}
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-teal-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 transition active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Avaliador</span>
          </button>
        </div>
      </div>

      {/* Dica de Funcionamento */}
      <div className="mb-6 rounded-3xl bg-teal-50 border border-teal-200 p-5 text-xs text-teal-900 shadow-2xs">
        <div className="flex items-center gap-2 font-bold mb-1.5 text-sm text-teal-950">
          <BookmarkCheck className="h-4 w-4 text-teal-700 shrink-0" />
          <span>Controle Estrito de Escala por Matrícula Numérica:</span>
        </div>
        <p className="text-teal-800 leading-relaxed">
          Cada jurado possui uma <strong>matrícula numérica exclusiva (gerada aleatoriamente ou definida pela coordenação)</strong>.
          No momento da avaliação, o sistema <strong>bloqueia estandes não autorizados</strong>, permitindo que cada professor vote exclusivamente nos projetos designados para ele.
        </p>
      </div>

      {/* Tabela de Avaliadores Cadastrados */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Matrícula Numérica</th>
                <th className="px-5 py-3.5 min-w-[160px]">Nome do Jurado</th>
                <th className="px-5 py-3.5 min-w-[220px]">Projetos Designados (Escala Exclusiva)</th>
                <th className="px-5 py-3.5 text-center">Progresso</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvaluators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    Nenhum avaliador encontrado. Cadastre ou importe uma lista via CSV acima.
                  </td>
                </tr>
              ) : (
                filteredEvaluators.map((ev) => {
                  const assignedIds = ev.assigned_projects || [];
                  const evaluatedCount = evaluations.filter((evaluation) => {
                    const matchCode =
                      evaluation.evaluator_code &&
                      evaluation.evaluator_code.replace(/\D/g, "") === ev.code.replace(/\D/g, "");
                    const matchName =
                      ev.name &&
                      evaluation.evaluator_name.trim().toLowerCase() === ev.name.trim().toLowerCase();
                    return (matchCode || matchName) && assignedIds.includes(evaluation.project_id);
                  }).length;

                  const isComplete = assignedIds.length > 0 && evaluatedCount >= assignedIds.length;

                  return (
                    <tr key={ev.code} className="hover:bg-slate-50 transition">
                      {/* Matrícula Numérica */}
                      <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                        <span className="rounded-xl bg-teal-800 text-white px-3 py-1 text-sm font-black font-mono tracking-wider shadow-xs">
                          {ev.code}
                        </span>
                      </td>

                      {/* Nome do Jurado */}
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {ev.name ? (
                          <span className="text-sm font-bold text-slate-900">{ev.name}</span>
                        ) : (
                          <span className="italic text-slate-400 text-xs">
                            (Jurado digita o nome na hora)
                          </span>
                        )}
                      </td>

                      {/* Projetos Designados */}
                      <td className="px-5 py-3.5">
                        {assignedIds.length === 0 ? (
                          <span className="text-xs text-amber-600 font-medium">
                            Nenhum projeto atribuído (Não poderá votar)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {assignedIds.map((pId) => {
                              const proj = projects.find((p) => p.id === pId);
                              return (
                                <span
                                  key={pId}
                                  className="rounded-lg bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700"
                                  title={proj ? proj.title : pId}
                                >
                                  {proj ? proj.code : pId}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Progresso de Votação */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isComplete
                              ? "bg-emerald-100 text-emerald-800"
                              : evaluatedCount > 0
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isComplete && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                          <span>
                            {evaluatedCount} / {assignedIds.length}
                          </span>
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(ev)}
                            title="Editar Escala do Avaliador"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-teal-700 transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja remover a matrícula ${ev.code} (${ev.name || "Sem nome"})?`)) {
                                onDeleteEvaluator(ev.code);
                              }
                            }}
                            title="Excluir Avaliador"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* MODAL 1: IMPORTAR CSV DE AVALIADORES COM MATRÍCULAS ALEATÓRIAS                 */}
      {/* ============================================================================== */}
      {isCSVModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl transition-all my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Importar Avaliadores via CSV
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gera matrículas numéricas aleatórias automaticamente para cada jurado
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCSVModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {csvError && (
                <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{csvError}</span>
                </div>
              )}

              {/* Opções de Upload ou Colar Texto */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition"
                  >
                    <Upload className="h-3.5 w-3.5 text-teal-600" />
                    <span>Selecionar Arquivo CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-1.5 rounded-xl text-teal-700 hover:text-teal-900 px-3 py-2 text-xs font-bold underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Baixar Modelo de Exemplo</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400">
                  Formato: 1 nome por linha (ou Nome, Projetos)
                </span>
              </div>

              {/* Área de Texto para Colar */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Ou Cole a Lista de Nomes Diretamente:
                </label>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    parseCSVContent(e.target.value);
                  }}
                  placeholder={"Exemplo:\nMariana Silveira\nCarlos Eduardo Silveira\nRoberto Almeida"}
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Opção de Distribuição Automática de Projetos */}
              <div className="rounded-2xl bg-teal-50/70 border border-teal-200 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-teal-950">
                  <input
                    type="checkbox"
                    checked={autoDistributeProjects}
                    onChange={(e) => setAutoDistributeProjects(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <span>Distribuir projetos da feira automaticamente entre eles</span>
                </label>

                {autoDistributeProjects && (
                  <div className="flex items-center gap-2 text-xs text-teal-900 font-semibold">
                    <span>Qtd por jurado:</span>
                    <select
                      value={projectsPerEvaluator}
                      onChange={(e) => setProjectsPerEvaluator(Number(e.target.value))}
                      className="rounded-lg border border-teal-300 bg-white px-2 py-1 text-xs font-bold text-teal-950"
                    >
                      <option value={1}>1 projeto</option>
                      <option value={2}>2 projetos</option>
                      <option value={3}>3 projetos</option>
                      <option value={4}>4 projetos</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Tabela de Pré-visualização com Matrículas Aleatórias */}
              {parsedRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Pré-visualização: {parsedRows.length} Avaliadores Detectados
                    </span>
                    <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Matrículas numéricas únicas geradas</span>
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-600 sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Matrícula Gerada</th>
                          <th className="px-3 py-2">Nome do Jurado</th>
                          <th className="px-3 py-2">Projetos</th>
                          <th className="px-3 py-2 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 bg-white">
                        {parsedRows.map((row) => (
                          <tr key={row.id}>
                            <td className="px-3 py-2 font-mono font-black text-teal-900">
                              <div className="flex items-center gap-1.5">
                                <span className="rounded bg-teal-100 px-2 py-0.5 text-xs text-teal-900">
                                  {row.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRerollSingleRowCode(row.id)}
                                  title="Sortear outro número"
                                  className="text-slate-400 hover:text-teal-600 p-0.5"
                                >
                                  <Shuffle className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2 font-bold text-slate-900">{row.name}</td>
                            <td className="px-3 py-2 text-slate-500 text-[11px]">
                              {row.assignedProjectCodes.length > 0
                                ? row.assignedProjectCodes.join(", ")
                                : autoDistributeProjects
                                ? `(${projectsPerEvaluator} automáticos)`
                                : "Nenhum (atribuir depois)"}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveSingleRow(row.id)}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsCSVModalOpen(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={parsedRows.length === 0 || isImporting}
                onClick={handleConfirmImport}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cadastrando...</span>
                  </>
                ) : (
                  <span>Cadastrar {parsedRows.length} Avaliadores no Sistema</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 2: CADASTRO / EDIÇÃO INDIVIDUAL                                         */}
      {/* ============================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl transition-all my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-teal-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {editingEvaluator ? "Editar Avaliador e Escala" : "Cadastrar Avaliador"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Matrícula Numérica */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Matrícula Numérica *
                    </label>
                    {!editingEvaluator && (
                      <button
                        type="button"
                        onClick={handleRollNewCode}
                        className="text-[10px] text-teal-700 hover:text-teal-900 underline flex items-center gap-1 font-bold"
                      >
                        <Shuffle className="h-3 w-3" />
                        <span>Sortear</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ex: 101"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold font-mono text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Somente números (ex: 101, 4821).</span>
                </div>

                {/* Nome do Jurado */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Nome do Jurado
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Profa. Mariana Silveira"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Se deixar em branco, ele digita na hora.</span>
                </div>
              </div>

              {/* Escala: Seleção dos Projetos que este Jurado Pode Avaliar */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Projetos Atribuídos (Votação Exclusiva):
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllProjects}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline"
                  >
                    {selectedProjects.length === projects.length ? "Desmarcar Todos" : "Selecionar Todos"}
                  </button>
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 p-2 bg-slate-50">
                  {projects.length === 0 ? (
                    <p className="p-3 text-center text-xs text-slate-400">
                      Nenhum projeto cadastrado na feira ainda.
                    </p>
                  ) : (
                    projects.map((proj) => {
                      const isChecked = selectedProjects.includes(proj.id);
                      return (
                        <label
                          key={proj.id}
                          className={`flex items-start gap-2.5 rounded-lg p-2 text-xs transition cursor-pointer border ${
                            isChecked
                              ? "bg-teal-50 border-teal-300 text-teal-950"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProject(proj.id)}
                            className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className="rounded bg-teal-100 px-1.5 py-0.2 text-[10px] text-teal-800">
                                {proj.code}
                              </span>
                              {proj.stand && (
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  {proj.stand}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 line-clamp-1 font-medium text-slate-800">
                              {proj.title}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                <span className="mt-1 block text-[11px] text-slate-500">
                  Total selecionado: <strong>{selectedProjects.length} projetos</strong> designados para este avaliador.
                </span>
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Avaliador</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Distribuição Equilibrada de Projetos */}
      <DistributionModal
        isOpen={isDistributionModalOpen}
        onClose={() => setIsDistributionModalOpen(false)}
        projects={projects}
        evaluators={evaluators}
        evaluations={evaluations}
        onApplyDistribution={async (allocs) => {
          if (onApplyDistribution) {
            await onApplyDistribution(allocs);
          }
        }}
        onSeed40Projects={onSeed40Projects}
      />
    </div>
  );
}
