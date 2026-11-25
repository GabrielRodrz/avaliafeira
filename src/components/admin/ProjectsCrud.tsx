"use client";

import { useState, useRef } from "react";
import { Plus, Edit2, Trash2, Search, MapPin, Users, GraduationCap, X, Loader2, BookmarkCheck, Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Project, Evaluator } from "@/types";

interface ProjectsCrudProps {
  projects: Project[];
  evaluators?: Evaluator[];
  onCreateProject: (project: Omit<Project, "id" | "created_at">) => Promise<void>;
  onBatchCreateProjects?: (list: Omit<Project, "id" | "created_at">[]) => Promise<void>;
  onUpdateProject: (id: string, project: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

export default function ProjectsCrud({
  projects,
  evaluators = [],
  onCreateProject,
  onBatchCreateProjects,
  onUpdateProject,
  onDeleteProject,
}: ProjectsCrudProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Estados do Modal de Importação CSV
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [parsedProjects, setParsedProjects] = useState<Omit<Project, "id" | "created_at">[]>([]);
  const [csvError, setCsvError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Sustentabilidade e Meio Ambiente");
  const [members, setMembers] = useState("");
  const [advisor, setAdvisor] = useState("");
  const [stand, setStand] = useState("");
  const [assignedEvaluators, setAssignedEvaluators] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const parseProjectsCSV = (content: string) => {
    setCsvError("");
    const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) {
      setParsedProjects([]);
      return;
    }

    const list: Omit<Project, "id" | "created_at">[] = [];

    lines.forEach((line, index) => {
      if (index === 0 && (line.toLowerCase().includes("titulo") || line.toLowerCase().includes("title") || line.toLowerCase().includes("codigo"))) {
        return;
      }

      const parts = line.split(/[;,\t]/).map((p) => p.replace(/^["']|["']$/g, "").trim());
      if (parts.length >= 2) {
        const codeVal = parts[0] || `PROJ-0${projects.length + list.length + 1}`;
        const titleVal = parts[1] || "";
        const categoryVal = parts[2] || "Geral";
        const membersVal = parts[3] || "Alunos da Turma";
        const advisorVal = parts[4] || "";
        const standVal = parts[5] || `Estande ${list.length + 1}`;

        if (titleVal) {
          list.push({
            code: codeVal,
            title: titleVal,
            category: categoryVal,
            members: membersVal,
            advisor: advisorVal || null,
            stand: standVal || null,
            assigned_evaluators: [],
          });
        }
      }
    });

    if (list.length === 0) {
      setCsvError("Nenhum projeto válido encontrado. Certifique-se de informar pelo menos Código e Título.");
    }
    setParsedProjects(list);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseProjectsCSV(text);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDownloadProjectsTemplate = () => {
    const csvContent =
      "Codigo,Titulo,Categoria,Integrantes,Orientador,Estande\n" +
      "PROJ-01,\"Biofiltro de Baixo Custo para Comunidades\",\"Sustentabilidade e Meio Ambiente\",\"Lucas Andrade, Beatriz Costa\",\"Profa. Mariana\",\"Estande A-01\"\n" +
      "PROJ-02,\"Braço Robótico Articulado 3D com IA\",\"Robótica e Inteligência Artificial\",\"Gabriel Santos, Enzo Carvalho\",\"Prof. Carlos\",\"Estande B-04\"\n" +
      "PROJ-03,\"Produção de Bioplástico de Mandioca\",\"Química e Biologia Aplicada\",\"Camila Ribeiro, Larissa Lima\",\"Profa. Helena\",\"Estande A-02\"\n";

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "modelo_importacao_projetos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmProjectsImport = async () => {
    if (parsedProjects.length === 0) return;
    setIsImporting(true);
    setCsvError("");
    try {
      if (onBatchCreateProjects) {
        await onBatchCreateProjects(parsedProjects);
      } else {
        for (const proj of parsedProjects) {
          await onCreateProject(proj);
        }
      }
      setIsCSVModalOpen(false);
      setParsedProjects([]);
      setCsvText("");
    } catch (err: any) {
      setCsvError(err?.message || "Erro ao salvar lote de projetos.");
    } finally {
      setIsImporting(false);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setCode(`PROJ-0${projects.length + 1}`);
    setTitle("");
    setCategory("Sustentabilidade e Meio Ambiente");
    setMembers("");
    setAdvisor("");
    setStand(`Estande ${String.fromCharCode(65 + Math.floor(projects.length / 5))}-0${(projects.length % 5) + 1}`);
    setAssignedEvaluators([]);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setCode(p.code);
    setTitle(p.title);
    setCategory(p.category);
    setMembers(p.members);
    setAdvisor(p.advisor || "");
    setStand(p.stand || "");
    setAssignedEvaluators(p.assigned_evaluators || []);
    setError("");
    setIsModalOpen(true);
  };

  const handleToggleEvaluator = (evCode: string) => {
    const upper = evCode.toUpperCase();
    setAssignedEvaluators((prev) =>
      prev.includes(upper) ? prev.filter((c) => c !== upper) : [...prev, upper]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!code.trim() || !title.trim() || !members.trim()) {
      setError("Código, Título e Integrantes/Turma são obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProject) {
        await onUpdateProject(editingProject.id, {
          code: code.trim(),
          title: title.trim(),
          category: category.trim(),
          members: members.trim(),
          advisor: advisor.trim() || null,
          stand: stand.trim() || null,
          assigned_evaluators: assignedEvaluators,
        });
      } else {
        await onCreateProject({
          code: code.trim(),
          title: title.trim(),
          category: category.trim(),
          members: members.trim(),
          advisor: advisor.trim() || null,
          stand: stand.trim() || null,
          assigned_evaluators: assignedEvaluators,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.message || "Erro ao salvar projeto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.members.toLowerCase().includes(search.toLowerCase()) ||
      (p.advisor && p.advisor.toLowerCase().includes(search.toLowerCase())) ||
      (p.stand && p.stand.toLowerCase().includes(search.toLowerCase())) ||
      (p.assigned_evaluators &&
        p.assigned_evaluators.some((c) => c.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div>
      {/* Barra de Ações: Busca e Botão Novo Projeto */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, título, integrante, estande ou matrícula..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCsvText("");
              setParsedProjects([]);
              setCsvError("");
              setIsCSVModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-teal-300 bg-teal-50 hover:bg-teal-100/80 px-4 py-2.5 text-xs font-bold text-teal-900 transition active:scale-98 cursor-pointer shadow-2xs"
          >
            <Upload className="h-4 w-4 text-teal-700" />
            <span>Subir CSV de Projetos</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 transition active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Lista / Tabela de Projetos */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Estande</th>
                <th className="px-4 py-3 min-w-[200px]">Título do Projeto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 min-w-[170px]">Integrantes / Turma</th>
                <th className="px-4 py-3 min-w-[150px]">Avaliadores Designados</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Nenhum projeto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => {
                  const assigned = proj.assigned_evaluators || [];
                  return (
                    <tr key={proj.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                        <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-black text-teal-800 border border-teal-200">
                          {proj.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                        {proj.stand || "-"}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 leading-snug">
                        {proj.title}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                          {proj.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {proj.members}
                      </td>

                      {/* Avaliadores Designados para este projeto */}
                      <td className="px-4 py-3">
                        {assigned.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Nenhum vinculado
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {assigned.map((evCode) => (
                              <span
                                key={evCode}
                                className="rounded bg-teal-50 border border-teal-200 px-1.5 py-0.5 text-[10px] font-bold text-teal-800"
                              >
                                {evCode}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => openEditModal(proj)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-teal-700 transition"
                          title="Editar Projeto"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Deseja realmente excluir o projeto ${proj.code} ("${proj.title}")? Todas as avaliações deste projeto também serão removidas.`
                              )
                            ) {
                              onDeleteProject(proj.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Excluir Projeto"
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

      {/* Modal de Criação / Edição de Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50">
              <h3 className="text-base font-black text-slate-900">
                {editingProject ? "Editar Projeto" : "Cadastrar Novo Projeto"}
              </h3>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Código do Projeto *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: PROJ-01"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Estande / Local
                  </label>
                  <input
                    type="text"
                    value={stand}
                    onChange={(e) => setStand(e.target.value)}
                    placeholder="Ex: Estande A-01"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Título Completo do Projeto *
                </label>
                <textarea
                  rows={2}
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Desenvolvimento de Biofiltro de Baixo Custo..."
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Categoria Científica *
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Sustentabilidade e Meio Ambiente"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Integrantes e Turma / Série *
                </label>
                <input
                  type="text"
                  required
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  placeholder="Ex: Lucas Andrade, Beatriz Costa (3º Ano A)"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Professor(a) Orientador(a)
                </label>
                <input
                  type="text"
                  value={advisor}
                  onChange={(e) => setAdvisor(e.target.value)}
                  placeholder="Ex: Profa. Dra. Mariana Fernandes"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              {/* Vincular Avaliadores Designados */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Avaliadores Designados para este Projeto (Escala):
                </label>
                {evaluators.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Nenhum avaliador cadastrado ainda. Você pode cadastrar matrículas na aba "Avaliadores & Escala".
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {evaluators.map((ev) => {
                      const isSelected = assignedEvaluators.includes(ev.code.toUpperCase());
                      return (
                        <button
                          key={ev.code}
                          type="button"
                          onClick={() => handleToggleEvaluator(ev.code)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
                            isSelected
                              ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {ev.code} {ev.name ? `(${ev.name.split(" ")[0]})` : ""}
                        </button>
                      );
                    })}
                  </div>
                )}
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
                  <span>{editingProject ? "Salvar Alterações" : "Criar Projeto"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORTAR PROJETOS VIA CSV */}
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
                    Importar Projetos via CSV
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cadastre estandes e projetos da feira em lote a partir de uma planilha
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
                    onClick={handleDownloadProjectsTemplate}
                    className="inline-flex items-center gap-1.5 rounded-xl text-teal-700 hover:text-teal-900 px-3 py-2 text-xs font-bold underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Baixar Modelo de Exemplo</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400">
                  Colunas: Codigo, Titulo, Categoria, Integrantes, Orientador, Estande
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Ou Cole as Linhas do CSV Diretamente:
                </label>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    parseProjectsCSV(e.target.value);
                  }}
                  placeholder={"PROJ-01,Biofiltro de Baixo Custo,Sustentabilidade,Lucas e Beatriz,Profa. Mariana,Estande A-01"}
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {parsedProjects.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Pré-visualização: {parsedProjects.length} Projetos Detectados
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-600 sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Código</th>
                          <th className="px-3 py-2">Título</th>
                          <th className="px-3 py-2">Categoria</th>
                          <th className="px-3 py-2">Estande</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 bg-white">
                        {parsedProjects.map((p, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 font-bold text-teal-800">{p.code}</td>
                            <td className="px-3 py-2 font-medium text-slate-900">{p.title}</td>
                            <td className="px-3 py-2 text-slate-500 text-[11px]">{p.category}</td>
                            <td className="px-3 py-2 text-slate-500 text-[11px]">{p.stand || "-"}</td>
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
                disabled={parsedProjects.length === 0 || isImporting}
                onClick={handleConfirmProjectsImport}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cadastrando...</span>
                  </>
                ) : (
                  <span>Cadastrar {parsedProjects.length} Projetos no Sistema</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
