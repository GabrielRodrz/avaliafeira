"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Users,
  GraduationCap,
  Sparkles,
  MapPin,
  Clock,
  Award,
} from "lucide-react";
import EvaluatorHeader from "@/components/evaluator/EvaluatorHeader";
import EvaluatorNameModal from "@/components/evaluator/EvaluatorNameModal";
import { getProjects, getEvaluations, getFairSettings, subscribeToRealtimeEvaluations } from "@/lib/data-service";
import { Project, Evaluation, FairSettings } from "@/types";

export default function EvaluatorProjectsPage() {
  const [evaluatorName, setEvaluatorName] = useState<string>("");
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [settings, setSettings] = useState<FairSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterEvaluated, setFilterEvaluated] = useState<"all" | "evaluated" | "pending">("all");
  const [isLoading, setIsLoading] = useState(true);

  // Carregar nome do avaliador do localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("avaliafeira_evaluator_name") || "";
    setEvaluatorName(savedName);
    if (!savedName) {
      setIsNameModalOpen(true);
    }
  }, []);

  // Carregar dados
  const loadData = async () => {
    try {
      const [pData, eData, sData] = await Promise.all([
        getProjects(),
        getEvaluations(),
        getFairSettings(),
      ]);
      setProjects(pData);
      setEvaluations(eData);
      setSettings(sData);
    } catch (err) {
      console.error("Erro ao carregar dados dos projetos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToRealtimeEvaluations(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const handleSaveName = (newName: string) => {
    setEvaluatorName(newName);
    localStorage.setItem("avaliafeira_evaluator_name", newName);
    setIsNameModalOpen(false);
  };

  // Mapear avaliações deste avaliador por project_id
  const myEvaluationsMap = useMemo(() => {
    const map = new Map<string, Evaluation>();
    if (!evaluatorName) return map;
    evaluations.forEach((e) => {
      if (e.evaluator_name.trim().toLowerCase() === evaluatorName.trim().toLowerCase()) {
        map.set(e.project_id, e);
      }
    });
    return map;
  }, [evaluations, evaluatorName]);

  // Lista única de categorias
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  // Filtragem
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.members.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.advisor && p.advisor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.stand && p.stand.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;

      const hasEvaluated = myEvaluationsMap.has(p.id);
      const matchEvalFilter =
        filterEvaluated === "all" ||
        (filterEvaluated === "evaluated" && hasEvaluated) ||
        (filterEvaluated === "pending" && !hasEvaluated);

      return matchSearch && matchCategory && matchEvalFilter;
    });
  }, [projects, searchQuery, selectedCategory, filterEvaluated, myEvaluationsMap]);

  const totalEvaluatedByMe = myEvaluationsMap.size;
  const totalProjects = projects.length;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Cabeçalho */}
      <EvaluatorHeader
        evaluatorName={evaluatorName}
        onOpenNameModal={() => setIsNameModalOpen(true)}
        fairName={settings?.name}
        edition={settings?.edition}
      />

      {/* Modal de Nome do Avaliador */}
      <EvaluatorNameModal
        isOpen={isNameModalOpen}
        currentName={evaluatorName}
        onSave={handleSaveName}
        onCancel={() => setIsNameModalOpen(false)}
        canCancel={Boolean(evaluatorName)}
      />

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        {/* Banner do Avaliador e Progresso */}
        <section className="mb-6 rounded-2xl bg-linear-to-r from-teal-700 via-teal-800 to-slate-900 p-5 sm:p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-200 backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Portal Oficial do Jurado</span>
              </div>
              <h1 className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-white">
                Bem-vindo(a), {evaluatorName || "Avaliador(a)"}!
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-xl">
                Selecione um projeto para lançar as notas nos 10 critérios oficiais. Suas notas são salvas com segurança em tempo real.
              </p>
            </div>

            {/* Contador de Progresso */}
            <div className="shrink-0 rounded-xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 sm:text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-200">
                Seu Desempenho
              </span>
              <div className="mt-1 flex items-baseline gap-1.5 sm:justify-end">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {totalEvaluatedByMe}
                </span>
                <span className="text-sm font-semibold text-teal-200">
                  / {totalProjects} avaliados
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-300 transition-all duration-300 rounded-full"
                  style={{
                    width: `${totalProjects > 0 ? (totalEvaluatedByMe / totalProjects) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Barra de Busca e Filtros */}
        <section className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código (ex: PROJ-01), título, estande, aluno ou orientador..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
            />
          </div>

          {/* Filtros de Categoria e Status */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro de Status de Avaliação */}
            <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-bold text-slate-600">
              <button
                onClick={() => setFilterEvaluated("all")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  filterEvaluated === "all" ? "bg-white text-teal-800 shadow-xs" : "hover:text-slate-900"
                }`}
              >
                Todos ({totalProjects})
              </button>
              <button
                onClick={() => setFilterEvaluated("evaluated")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  filterEvaluated === "evaluated" ? "bg-white text-emerald-800 shadow-xs" : "hover:text-slate-900"
                }`}
              >
                Avaliados ({totalEvaluatedByMe})
              </button>
              <button
                onClick={() => setFilterEvaluated("pending")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  filterEvaluated === "pending" ? "bg-white text-amber-800 shadow-xs" : "hover:text-slate-900"
                }`}
              >
                Pendentes ({totalProjects - totalEvaluatedByMe})
              </button>
            </div>

            {/* Categorias */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`rounded-xl px-3 py-1.5 font-bold transition shrink-0 ${
                    selectedCategory === "all"
                      ? "bg-teal-600 text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Todas Categorias
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-3 py-1.5 font-semibold transition shrink-0 ${
                      selectedCategory === cat
                        ? "bg-teal-600 text-white font-bold"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Lista de Projetos */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mb-3" />
            <p className="text-sm font-semibold">Carregando projetos da feira...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-800">Nenhum projeto encontrado</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tente ajustar sua busca ou selecione outra categoria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.map((project) => {
              const myEvaluation = myEvaluationsMap.get(project.id);
              const isEvaluated = Boolean(myEvaluation);

              return (
                <div
                  key={project.id}
                  className={`group relative rounded-2xl border bg-white p-5 transition-all shadow-xs hover:shadow-md ${
                    isEvaluated
                      ? "border-emerald-300/80 bg-emerald-50/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    {/* Badges e Identificação */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-black text-white tracking-wide">
                        {project.code}
                      </span>
                      {project.stand && (
                        <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{project.stand}</span>
                        </span>
                      )}
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {project.category}
                      </span>
                    </div>

                    {/* Selo Verde: Avaliado por você */}
                    {isEvaluated && myEvaluation && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Avaliado por você ({myEvaluation.total_score} pts)</span>
                      </div>
                    )}
                  </div>

                  {/* Título do Projeto */}
                  <h2 className="mt-3 text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-900 transition leading-snug">
                    {project.title}
                  </h2>

                  {/* Informações dos Alunos e Orientador */}
                  <div className="mt-3 space-y-1 text-xs sm:text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                      <span>{project.members}</span>
                    </div>
                    {project.advisor && (
                      <div className="flex items-start gap-2">
                        <GraduationCap className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                        <span>Orientador: {project.advisor}</span>
                      </div>
                    )}
                  </div>

                  {/* Botão de Ação */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <Link
                      href={`/avaliar/${project.id}`}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition shadow-xs active:scale-98 ${
                        isEvaluated
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-teal-600 text-white shadow-teal-600/20 hover:bg-teal-700"
                      }`}
                    >
                      <span>{isEvaluated ? "Editar Minha Avaliação" : "Avaliar Projeto"}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
