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
  Hash,
  BookmarkCheck,
  AlertCircle,
  RefreshCw,
  Lock,
} from "lucide-react";
import EvaluatorHeader from "@/components/evaluator/EvaluatorHeader";
import EvaluatorNameModal from "@/components/evaluator/EvaluatorNameModal";
import {
  getProjects,
  getEvaluations,
  getFairSettings,
  getEvaluators,
  createOrUpdateEvaluator,
  subscribeToRealtimeEvaluations,
} from "@/lib/data-service";
import { Project, Evaluation, FairSettings, Evaluator } from "@/types";

export default function EvaluatorProjectsPage() {
  const [evaluatorCode, setEvaluatorCode] = useState<string>("");
  const [evaluatorName, setEvaluatorName] = useState<string>("");
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [settings, setSettings] = useState<FairSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterMode, setFilterMode] = useState<"assigned" | "pending" | "evaluated" | "all">("assigned");
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados de identificação do localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem("avaliafeira_evaluator_code") || "";
    const savedName = localStorage.getItem("avaliafeira_evaluator_name") || "";
    setEvaluatorCode(savedCode);
    setEvaluatorName(savedName);

    if (!savedCode || !savedName) {
      setIsNameModalOpen(true);
    }
  }, []);

  // Carregar dados da Feira
  const loadData = async () => {
    try {
      const [pData, eData, sData, evList] = await Promise.all([
        getProjects(),
        getEvaluations(),
        getFairSettings(),
        getEvaluators(),
      ]);
      setProjects(pData);
      setEvaluations(eData);
      setSettings(sData);
      setEvaluators(evList);
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

  const handleSaveIdentification = async (newCode: string, newName: string) => {
    setEvaluatorCode(newCode);
    setEvaluatorName(newName);
    localStorage.setItem("avaliafeira_evaluator_code", newCode);
    localStorage.setItem("avaliafeira_evaluator_name", newName);
    setIsNameModalOpen(false);

    // Salvar/atualizar no backend
    try {
      await createOrUpdateEvaluator(newCode, newName);
      await loadData();
    } catch (e) {
      console.warn(e);
    }
  };

  // Mapear avaliações deste avaliador (por matrícula ou por nome)
  const myEvaluationsMap = useMemo(() => {
    const map = new Map<string, Evaluation>();
    if (!evaluatorCode && !evaluatorName) return map;

    evaluations.forEach((e) => {
      const matchCode =
        evaluatorCode && e.evaluator_code && e.evaluator_code.toUpperCase() === evaluatorCode.toUpperCase();
      const matchName =
        evaluatorName && e.evaluator_name && e.evaluator_name.trim().toLowerCase() === evaluatorName.trim().toLowerCase();

      if (matchCode || matchName) {
        map.set(e.project_id, e);
      }
    });
    return map;
  }, [evaluations, evaluatorCode, evaluatorName]);

  // Verificar quais projetos estão designados para esta matrícula
  const isProjectAssignedToMe = (p: Project): boolean => {
    if (!evaluatorCode) return false;
    const assigned = p.assigned_evaluators || [];
    return assigned.some((code) => code.toUpperCase() === evaluatorCode.toUpperCase());
  };

  // Contadores
  const assignedProjects = useMemo(() => {
    return projects.filter(isProjectAssignedToMe);
  }, [projects, evaluatorCode]);

  const totalAssigned = assignedProjects.length;
  const totalEvaluatedByMe = myEvaluationsMap.size;
  const totalProjects = projects.length;

  // Categorias
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  // Filtragem final
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

      const isAssigned = isProjectAssignedToMe(p);
      const isEvaluated = myEvaluationsMap.has(p.id);

      let matchFilter = true;
      if (filterMode === "assigned") {
        matchFilter = isAssigned;
      } else if (filterMode === "pending") {
        matchFilter = isAssigned ? !isEvaluated : !isEvaluated;
      } else if (filterMode === "evaluated") {
        matchFilter = isEvaluated;
      } else if (filterMode === "all") {
        matchFilter = true;
      }

      return matchSearch && matchCategory && matchFilter;
    });
  }, [projects, searchQuery, selectedCategory, filterMode, evaluatorCode, myEvaluationsMap]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Cabeçalho */}
      <EvaluatorHeader
        evaluatorName={evaluatorName}
        evaluatorCode={evaluatorCode}
        onOpenNameModal={() => setIsNameModalOpen(true)}
        fairName={settings?.name}
        edition={settings?.edition}
      />

      {/* Modal de Matrícula e Nome */}
      <EvaluatorNameModal
        isOpen={isNameModalOpen}
        currentCode={evaluatorCode}
        currentName={evaluatorName}
        onSave={handleSaveIdentification}
        onCancel={() => setIsNameModalOpen(false)}
        canCancel={Boolean(evaluatorCode && evaluatorName)}
        availableEvaluators={evaluators}
      />

      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        {/* Banner do Avaliador com Matrícula e Escala */}
        <section className="mb-6 rounded-3xl bg-linear-to-r from-teal-800 via-teal-900 to-slate-900 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-teal-400 text-teal-950 px-3.5 py-1.5 text-xs sm:text-sm font-black shadow-md">
                  <Hash className="h-4 w-4" />
                  <span>MATRÍCULA: <strong>{evaluatorCode || "NÃO INFORMADA"}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNameModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-bold text-white transition border border-white/20 active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Não é você? Trocar de Matrícula</span>
                </button>
              </div>

              <h1 className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-white">
                Olá, {evaluatorName || "Avaliador(a)"}!
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-xl">
                {totalAssigned > 0 ? (
                  <>
                    Você possui <strong>{totalAssigned} projetos designados</strong> para avaliar nesta feira. Veja abaixo a sua escala de estandes.
                  </>
                ) : (
                  <>
                    Nenhum projeto específico está alocado para sua matrícula no momento. Você pode navegar por todos os projetos da feira.
                  </>
                )}
              </p>
            </div>

            {/* Contador de Escala / Desempenho */}
            <div className="shrink-0 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-200">
                Sua Escala de Avaliação
              </span>
              <div className="mt-1 flex items-baseline gap-1.5 sm:justify-end">
                <span className="text-3xl font-black text-white">
                  {totalEvaluatedByMe}
                </span>
                <span className="text-sm font-semibold text-teal-200">
                  / {totalAssigned > 0 ? totalAssigned : totalProjects} concluídos
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                  style={{
                    width: `${
                      totalAssigned > 0
                        ? Math.min(100, (totalEvaluatedByMe / totalAssigned) * 100)
                        : (totalEvaluatedByMe / Math.max(1, totalProjects)) * 100
                    }%`,
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
              placeholder="Buscar por código (PROJ-01), título, estande, aluno ou orientador..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
            />
          </div>

          {/* Filtros: Abas de Escala */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap rounded-xl bg-slate-200/80 p-1 text-xs font-bold text-slate-700">
              <button
                onClick={() => setFilterMode("assigned")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  filterMode === "assigned"
                    ? "bg-teal-700 text-white shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                <BookmarkCheck className="h-3.5 w-3.5" />
                <span>Meus Designados ({totalAssigned})</span>
              </button>

              <button
                onClick={() => setFilterMode("pending")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  filterMode === "pending"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                Pendentes
              </button>

              <button
                onClick={() => setFilterMode("evaluated")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  filterMode === "evaluated"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                Avaliados ({totalEvaluatedByMe})
              </button>

              <button
                onClick={() => setFilterMode("all")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  filterMode === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                Todos da Feira ({totalProjects})
              </button>
            </div>

            {/* Categorias */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`rounded-xl px-3 py-1.5 font-bold transition shrink-0 ${
                    selectedCategory === "all"
                      ? "bg-slate-900 text-white"
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
                        ? "bg-slate-900 text-white font-bold"
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
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-800">
              {filterMode === "assigned" && totalAssigned === 0
                ? "Nenhum projeto designado para esta matrícula ainda"
                : "Nenhum projeto encontrado nesta visualização"}
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              {filterMode === "assigned" && totalAssigned === 0 ? (
                <>
                  A comissão organizadora ainda não vinculou estandes para a matrícula <strong>{evaluatorCode}</strong>.
                  Você pode alternar para a aba <strong>"Todos da Feira"</strong> acima para visualizar todos os projetos.
                </>
              ) : (
                "Tente mudar os filtros de busca ou selecione outra categoria."
              )}
            </p>
            {filterMode === "assigned" && totalAssigned === 0 && (
              <button
                onClick={() => setFilterMode("all")}
                className="mt-4 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
              >
                Ver Todos os Projetos da Feira
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.map((project) => {
              const myEvaluation = myEvaluationsMap.get(project.id);
              const isEvaluated = Boolean(myEvaluation);
              const isAssigned = isProjectAssignedToMe(project);

              return (
                <div
                  key={project.id}
                  className={`group relative rounded-3xl border bg-white p-5 sm:p-6 transition-all shadow-xs hover:shadow-md ${
                    isEvaluated
                      ? "border-emerald-300/80 bg-emerald-50/20"
                      : isAssigned
                      ? "border-teal-300 bg-teal-50/15"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    {/* Badges e Identificação */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-teal-700 px-2.5 py-1 text-xs font-black text-white tracking-wide">
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

                      {/* Selo: Designado para Você */}
                      {isAssigned && (
                        <span className="flex items-center gap-1 rounded-full bg-teal-100 border border-teal-300 px-3 py-1 text-xs font-black text-teal-900 shadow-2xs">
                          <BookmarkCheck className="h-3.5 w-3.5 text-teal-700" />
                          <span>Designado para sua Matrícula ({evaluatorCode})</span>
                        </span>
                      )}
                    </div>

                    {/* Status da Avaliação */}
                    {isEvaluated && myEvaluation ? (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Avaliado por você ({myEvaluation.total_score} pts)</span>
                      </div>
                    ) : isAssigned ? (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
                        <span>Aguardando sua nota</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Título do Projeto */}
                  <h2 className="mt-3 text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-900 transition leading-snug">
                    {project.title}
                  </h2>

                  {/* Integrantes e Orientador */}
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
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      10 critérios oficiais (0 a 10 pts)
                    </span>

                    {isAssigned ? (
                      <Link
                        href={`/avaliar/${project.id}`}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition shadow-xs active:scale-98 ${
                          isEvaluated
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-teal-700 text-white shadow-teal-700/20 hover:bg-teal-800"
                        }`}
                      >
                        <span>{isEvaluated ? "Editar Minha Avaliação" : "Avaliar Projeto"}</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-400 select-none cursor-not-allowed">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Não atribuído para sua escala</span>
                      </div>
                    )}
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
