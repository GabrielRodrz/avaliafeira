"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, MapPin, Users, GraduationCap, X, Loader2 } from "lucide-react";
import { Project } from "@/types";

interface ProjectsCrudProps {
  projects: Project[];
  onCreateProject: (project: Omit<Project, "id" | "created_at">) => Promise<void>;
  onUpdateProject: (id: string, project: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

export default function ProjectsCrud({
  projects,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectsCrudProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Sustentabilidade e Meio Ambiente");
  const [members, setMembers] = useState("");
  const [advisor, setAdvisor] = useState("");
  const [stand, setStand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const openCreateModal = () => {
    setEditingProject(null);
    setCode(`PROJ-0${projects.length + 1}`);
    setTitle("");
    setCategory("Sustentabilidade e Meio Ambiente");
    setMembers("");
    setAdvisor("");
    setStand(`Estande ${String.fromCharCode(65 + Math.floor(projects.length / 5))}-0${(projects.length % 5) + 1}`);
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
    setError("");
    setIsModalOpen(true);
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
        });
      } else {
        await onCreateProject({
          code: code.trim(),
          title: title.trim(),
          category: category.trim(),
          members: members.trim(),
          advisor: advisor.trim() || null,
          stand: stand.trim() || null,
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
      (p.stand && p.stand.toLowerCase().includes(search.toLowerCase()))
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
            placeholder="Buscar por código, título, integrante, estande..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 transition active:scale-98 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Novo Projeto</span>
        </button>
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
                <th className="px-4 py-3 min-w-[180px]">Integrantes / Turma</th>
                <th className="px-4 py-3">Orientador</th>
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
                filteredProjects.map((proj) => (
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
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {proj.advisor || "-"}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação / Edição de Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingProject ? "Editar Projeto" : "Cadastrar Novo Projeto"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
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
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingProject ? "Salvar Alterações" : "Criar Projeto"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
