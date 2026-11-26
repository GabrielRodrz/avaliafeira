"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Users,
  GraduationCap,
  MapPin,
  Sparkles,
  FileText,
  AlertTriangle,
  Hash,
  BookmarkCheck,
  RefreshCw,
  UserCheck,
  Lock,
  ShieldAlert,
} from "lucide-react";
import EvaluatorHeader from "@/components/evaluator/EvaluatorHeader";
import EvaluatorNameModal from "@/components/evaluator/EvaluatorNameModal";
import CriterionCard from "@/components/evaluator/CriterionCard";
import StickyBottomBar from "@/components/evaluator/StickyBottomBar";
import {
  getProjects,
  getCriteria,
  getEvaluations,
  submitEvaluation,
  getFairSettings,
  createOrUpdateEvaluator,
  getEvaluators,
} from "@/lib/data-service";
import { Project, Criterion, Evaluation, FairSettings, Evaluator, OFFICIAL_CRITERIA } from "@/types";

export default function ProjectEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [evaluatorCode, setEvaluatorCode] = useState<string>("");
  const [evaluatorName, setEvaluatorName] = useState<string>("");
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>(OFFICIAL_CRITERIA);
  const [settings, setSettings] = useState<FairSettings | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 1. Carregar matrícula e nome do avaliador
  useEffect(() => {
    const savedCode = localStorage.getItem("avaliafeira_evaluator_code") || "";
    const savedName = localStorage.getItem("avaliafeira_evaluator_name") || "";
    setEvaluatorCode(savedCode);
    setEvaluatorName(savedName);
    if (!savedCode || !savedName) {
      setIsNameModalOpen(true);
    }
  }, []);

  // 2. Carregar dados do projeto e critérios
  useEffect(() => {
    async function load() {
      try {
        const [projectsData, criteriaData, evalsData, settingsData, evaluatorsData] = await Promise.all([
          getProjects(),
          getCriteria(),
          getEvaluations(),
          getFairSettings(),
          getEvaluators(),
        ]);

        setEvaluators(evaluatorsData);
        setAllProjects(projectsData);

        // Validação estrita de jurado cadastrado
        const savedCode = localStorage.getItem("avaliafeira_evaluator_code") || "";
        if (savedCode && Array.isArray(evaluatorsData)) {
          const found = evaluatorsData.find(
            (e) => e && e.code && String(e.code).replace(/\D/g, "") === String(savedCode).replace(/\D/g, "")
          );
          if (!found) {
            localStorage.removeItem("avaliafeira_evaluator_code");
            localStorage.removeItem("avaliafeira_evaluator_name");
            setEvaluatorCode("");
            setEvaluatorName("");
            setIsNameModalOpen(true);
          } else {
            setEvaluatorCode(found.code);
            if (found.name) {
              setEvaluatorName(found.name);
              localStorage.setItem("avaliafeira_evaluator_name", found.name);
            }
          }
        } else {
          setIsNameModalOpen(true);
        }

        const currentProj = projectsData.find((p) => p.id === projectId);
        if (currentProj) {
          setProject(currentProj);
        }

        if (criteriaData && criteriaData.length > 0) {
          setCriteria(criteriaData);
        }
        setSettings(settingsData);

        // Se o avaliador já tiver avaliado este projeto, pré-preencher
        const activeCode = localStorage.getItem("avaliafeira_evaluator_code") || "";
        const activeName = localStorage.getItem("avaliafeira_evaluator_name") || "";

        if (currentProj && (activeCode || activeName)) {
          const existingEval = evalsData.find(
            (e) =>
              e.project_id === currentProj.id &&
              ((activeCode && e.evaluator_code && e.evaluator_code.toUpperCase() === activeCode.toUpperCase()) ||
                (activeName && e.evaluator_name.trim().toLowerCase() === activeName.trim().toLowerCase()))
          );

          if (existingEval) {
            setScores(existingEval.scores || {});
            setNotes(existingEval.notes || "");
            setIsEditing(true);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados da avaliação:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (projectId) {
      load();
    }
  }, [projectId]);

  const handleScoreChange = (criterionId: number, score: number) => {
    setScores((prev) => ({
      ...prev,
      [String(criterionId)]: score,
    }));
  };

  // Cálculo da pontuação parcial
  const partialScore = useMemo(() => {
    return Object.values(scores).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  }, [scores]);

  // Quantidade de critérios já respondidos
  const completedCount = useMemo(() => {
    return Object.keys(scores).filter((key) => scores[key] !== undefined && scores[key] !== null)
      .length;
  }, [scores]);

  const handleSaveIdentification = async (newCode: string, newName: string) => {
    setEvaluatorCode(newCode);
    setEvaluatorName(newName);
    localStorage.setItem("avaliafeira_evaluator_code", newCode);
    localStorage.setItem("avaliafeira_evaluator_name", newName);
    setIsNameModalOpen(false);
  };

  const handleSubmit = async () => {
    if (!project) return;
    if (!evaluatorCode || !evaluatorName) {
      setIsNameModalOpen(true);
      return;
    }

    if (!isAssigned) {
      alert("Acesso restrito: este projeto não está atribuído para a sua escala de jurado.");
      return;
    }

    if (completedCount < criteria.length) {
      alert("Por favor, atribua nota para todos os 10 critérios antes de finalizar.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitEvaluation({
        project_id: project.id,
        evaluator_code: evaluatorCode.trim().toUpperCase(),
        evaluator_name: evaluatorName.trim(),
        scores,
        total_score: partialScore,
        notes: notes.trim(),
      });

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Erro ao salvar avaliação:", err);
      alert("Erro ao gravar avaliação: " + (err?.message || "Tente novamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mb-3" />
        <p className="text-sm font-semibold">Carregando ficha de avaliação...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Projeto não encontrado</h2>
        <p className="mt-1 text-sm text-slate-500">O projeto solicitado não foi localizado.</p>
        <Link
          href="/avaliar"
          className="mt-4 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition"
        >
          Voltar para lista de projetos
        </Link>
      </div>
    );
  }

  const isAssigned = Boolean(
    evaluatorCode &&
    Array.isArray(project.assigned_evaluators) &&
    project.assigned_evaluators.some(
      (c) => c && String(c).replace(/\D/g, "") === String(evaluatorCode).replace(/\D/g, "")
    )
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
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
        projects={allProjects}
      />

      <main className="mx-auto max-w-4xl px-4 pt-5 sm:px-6">
        {/* Banner do Avaliador Atual */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-teal-500/40 bg-teal-50/90 p-3.5 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-teal-800 text-white px-3 py-1.5 text-xs sm:text-sm font-black font-mono tracking-wider shadow-xs">
              MATRÍCULA: {evaluatorCode || "NÃO DEFINIDA"}
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 block">
                Jurado(a) Ativo(a)
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                {evaluatorName || "Nome não informado"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsNameModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 border border-teal-300 px-3 py-1.5 text-xs font-bold text-teal-900 transition shadow-2xs cursor-pointer active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5 text-teal-700" />
            <span>Não é você? Trocar</span>
          </button>
        </div>

        {/* Link de Retorno */}
        <div className="mb-4">
          <Link
            href="/avaliar"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-teal-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Lista de Projetos</span>
          </Link>
        </div>

        {!isAssigned ? (
          <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/80 p-8 text-center max-w-xl mx-auto my-8 shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-4 shadow-inner">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Votação Não Atribuída à sua Escala
            </h2>
            <p className="mt-3 text-sm sm:text-base text-amber-950 font-medium leading-relaxed">
              O projeto <strong>{project.code} – {project.title}</strong> não faz parte dos projetos designados para a sua <strong>Matrícula {evaluatorCode}</strong>.
            </p>
            <p className="mt-2 text-xs text-amber-800">
              Cada jurado só pode votar nos projetos especificamente atribuídos pela coordenação.
            </p>
            <div className="mt-6">
              <Link
                href="/avaliar"
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-700 px-6 py-3.5 text-sm font-black text-white shadow-md hover:bg-teal-800 transition active:scale-98"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Ver Meus Projetos Designados</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Card do Projeto em Avaliação */}
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-teal-700 px-2.5 py-1 text-xs font-black text-white">
                {project.code}
              </span>
              {project.stand && (
                <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  <span>{project.stand}</span>
                </span>
              )}
              <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 border border-teal-200">
                {project.category}
              </span>

              {isAssigned && (
                <span className="flex items-center gap-1 rounded-full bg-teal-100 border border-teal-300 px-2.5 py-0.5 text-[11px] font-black text-teal-900">
                  <BookmarkCheck className="h-3 w-3 text-teal-700" />
                  <span>Designado para Você</span>
                </span>
              )}
            </div>

            {isEditing && (
              <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800">
                Editando sua avaliação anterior
              </span>
            )}
          </div>

          <h1 className="mt-3 text-lg sm:text-xl font-black text-slate-900 leading-snug">
            {project.title}
          </h1>
        </section>

        {/* Instrução da Escala Oficial */}
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-teal-50 border border-teal-200 p-4 text-xs sm:text-sm text-teal-900">
          <Sparkles className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Escala Oficial de Pontuação Estrita:</span>
            <p className="mt-0.5 text-teal-800">
              Cada critério aceita apenas uma das 6 notas pares: <strong>0</strong> (Não atendeu), <strong>2</strong> (Insuficiente), <strong>4</strong> (Regular), <strong>6</strong> (Satisfatório), <strong>8</strong> (Bom) ou <strong>10</strong> (Excelente).
            </p>
          </div>
        </div>

        {/* Os 10 Critérios Oficiais */}
        <section className="space-y-4">
          {criteria.map((criterion, idx) => (
            <CriterionCard
              key={criterion.id}
              criterion={criterion}
              index={idx}
              selectedScore={scores[String(criterion.id)]}
              onSelectScore={(val) => handleScoreChange(criterion.id, val)}
            />
          ))}
        </section>

        {/* Campo Opcional de Observações */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Observações do Avaliador (Opcional)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Destaque pontos fortes, sugestões de aprimoramento ou justificativas para a comissão organizadora.
          </p>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Excelente desenvoltura dos estudantes, protótipo funcional bem demonstrado..."
            className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </section>
          </>
        )}
      </main>

      {/* Barra Fixa Inferior de Progresso e Envio (somente para projetos atribuídos) */}
      {isAssigned && (
        <StickyBottomBar
          completedCount={completedCount}
          totalCriteria={criteria.length}
          partialScore={partialScore}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
        />
      )}

      {/* Modal de Sucesso / Confirmação */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h3 className="text-xl font-black text-slate-900">
              {isEditing ? "Avaliação Atualizada!" : "Avaliação Concluída com Sucesso!"}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              A nota do projeto <strong>{project.code}</strong> foi registrada para a matrícula <strong>{evaluatorCode}</strong> ({evaluatorName}).
            </p>

            <div className="my-5 rounded-2xl bg-teal-50 border border-teal-200 p-4">
              <span className="text-xs font-semibold text-teal-800">Nota Final Atribuída</span>
              <div className="text-3xl font-black text-teal-900 mt-1">
                {partialScore} <span className="text-sm font-bold text-teal-600">/ 100 pts</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/avaliar")}
              className="w-full rounded-2xl bg-teal-600 py-3 text-sm font-bold text-white shadow-md hover:bg-teal-700 transition active:scale-98 cursor-pointer"
            >
              Retornar à Minha Lista de Projetos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
