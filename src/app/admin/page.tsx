"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminHeader, { AdminTab } from "@/components/admin/AdminHeader";
import RankingsTable from "@/components/admin/RankingsTable";
import ProjectsCrud from "@/components/admin/ProjectsCrud";
import CriteriaView from "@/components/admin/CriteriaView";
import AdminsManagement from "@/components/admin/AdminsManagement";
import SettingsAndSharing from "@/components/admin/SettingsAndSharing";
import ChangePasswordModal from "@/components/admin/ChangePasswordModal";
import PrintClassification from "@/components/admin/PrintClassification";
import EvaluatorsManagement from "@/components/admin/EvaluatorsManagement";

import {
  getProjects,
  createProject,
  createProjectsBatch,
  updateProject,
  deleteProject,
  getEvaluations,
  deleteEvaluation,
  getCriteria,
  getFairSettings,
  saveFairSettings,
  getEvaluators,
  createOrUpdateEvaluator,
  createOrUpdateEvaluatorsBatch,
  deleteEvaluator,
  subscribeToRealtimeEvaluations,
  saveAllProjectAllocations,
  seedOfficial40Projects,
} from "@/lib/data-service";
import { computeOfficialRanking } from "@/lib/ranking";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Project, Evaluation, Criterion, FairSettings, Evaluator, OFFICIAL_CRITERIA } from "@/types";

export default function AdminPage() {
  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<{
    username: string;
    name: string;
    isMaster: boolean;
    token?: string;
  } | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Aba ativa
  const [currentTab, setCurrentTab] = useState<AdminTab>("rankings");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Dados do Sistema
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>(OFFICIAL_CRITERIA);
  const [settings, setSettings] = useState<FairSettings | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Modal de Senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);

  // 1. Verificar sessão ativa ao carregar
  useEffect(() => {
    async function checkSession() {
      // Checar se há dados salvos de sessão local
      const savedSession = localStorage.getItem("avaliafeira_admin_session");
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          setAdminUser(parsed);
          setIsAuthenticated(true);
        } catch {
          // ignore
        }
      }

      // Se Supabase estiver configurado, verificar sessão do Supabase Auth
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            const user = data.session.user;
            const metaName = user.user_metadata?.name || user.email?.split("@")[0] || "Administrador";
            const metaUsername = user.user_metadata?.username || user.email?.split("@")[0] || "admin";
            const isMaster = metaUsername === "gabriel.rodrigues";

            const adminObj = {
              username: metaUsername,
              name: metaName,
              isMaster,
              token: data.session.access_token,
            };
            setAdminUser(adminObj);
            setIsAuthenticated(true);
            localStorage.setItem("avaliafeira_admin_session", JSON.stringify(adminObj));
          }
        }
      }

      setIsAuthChecking(false);
    }

    checkSession();
  }, []);

  // 2. Carregar Dados Administrativos
  const loadAllData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [pData, eData, cData, sData, evList] = await Promise.all([
        getProjects(),
        getEvaluations(),
        getCriteria(),
        getFairSettings(),
        getEvaluators(),
      ]);
      setProjects(pData);
      setEvaluations(eData);
      if (cData && cData.length > 0) setCriteria(cData);
      setSettings(sData);
      setEvaluators(evList);
    } catch (err) {
      console.error("Erro ao carregar dados administrativos:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();

      // Inscrição em tempo real para sincronização instantânea de notas
      const unsubscribe = subscribeToRealtimeEvaluations(() => {
        loadAllData();
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated, loadAllData]);

  // Handler de Login
  const handleLoginSuccess = (adminData: {
    username: string;
    name: string;
    isMaster: boolean;
    token?: string;
  }) => {
    setAdminUser(adminData);
    setIsAuthenticated(true);
    localStorage.setItem("avaliafeira_admin_session", JSON.stringify(adminData));
  };

  // Handler de Logout
  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    localStorage.removeItem("avaliafeira_admin_session");
    setAdminUser(null);
    setIsAuthenticated(false);
  };

  // Operações de Projetos (CRUD)
  const handleCreateProject = async (p: Omit<Project, "id" | "created_at">) => {
    await createProject(p);
    await loadAllData();
  };

  const handleBatchCreateProjects = async (list: Omit<Project, "id" | "created_at">[]) => {
    await createProjectsBatch(list);
    await loadAllData();
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    await updateProject(id, updates);
    await loadAllData();
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    await loadAllData();
  };

  const handleDeleteEvaluation = async (evalId: string) => {
    await deleteEvaluation(evalId);
    await loadAllData();
  };

  const handleCreateOrUpdateEvaluator = async (
    code: string,
    name?: string | null,
    assignedProjects?: string[]
  ) => {
    await createOrUpdateEvaluator(code, name, assignedProjects);
    await loadAllData();
  };

  const handleBatchCreateEvaluators = async (
    list: { code: string; name?: string | null; assignedProjects?: string[] }[]
  ) => {
    await createOrUpdateEvaluatorsBatch(list);
    await loadAllData();
  };

  const handleDeleteEvaluator = async (code: string) => {
    await deleteEvaluator(code);
    await loadAllData();
  };

  const handleApplyDistribution = async (
    allocations: { projectId: string; evaluatorCodes: string[] }[]
  ) => {
    await saveAllProjectAllocations(allocations);
    await loadAllData();
  };

  const handleSeed40Projects = async () => {
    await seedOfficial40Projects();
    await loadAllData();
  };

  const handleSaveSettings = async (newSettings: Partial<FairSettings>) => {
    const updated = await saveFairSettings(newSettings);
    setSettings(updated);
  };

  // Cálculo da Classificação Oficial
  const rankings = useMemo(() => {
    return computeOfficialRanking(projects, evaluations, selectedCategory);
  }, [projects, evaluations, selectedCategory]);

  // Lista de Categorias Únicas
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  const triggerPrint = () => {
    window.print();
  };

  // Tela de verificação de autenticação inicial
  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  // Não autenticado: Exibe Tela de Login Limpa
  if (!isAuthenticated || !adminUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cabeçalho do Painel Admin */}
      <AdminHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        adminName={adminUser.name}
        adminUsername={adminUser.username}
        isMaster={adminUser.isMaster}
        onOpenChangePassword={() => setIsPasswordModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Conteúdo Principal por Aba */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 no-print">
        {currentTab === "rankings" && (
          <RankingsTable
            rankings={rankings}
            evaluations={evaluations}
            criteria={criteria}
            onDeleteEvaluation={handleDeleteEvaluation}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {currentTab === "projects" && (
          <ProjectsCrud
            projects={projects}
            evaluators={evaluators}
            evaluations={evaluations}
            onCreateProject={handleCreateProject}
            onBatchCreateProjects={handleBatchCreateProjects}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onApplyDistribution={handleApplyDistribution}
            onSeed40Projects={handleSeed40Projects}
          />
        )}

        {currentTab === "evaluators" && (
          <EvaluatorsManagement
            evaluators={evaluators}
            projects={projects}
            evaluations={evaluations}
            onCreateOrUpdateEvaluator={handleCreateOrUpdateEvaluator}
            onBatchCreateEvaluators={handleBatchCreateEvaluators}
            onDeleteEvaluator={handleDeleteEvaluator}
            onApplyDistribution={handleApplyDistribution}
            onSeed40Projects={handleSeed40Projects}
          />
        )}

        {currentTab === "criteria" && <CriteriaView criteria={criteria} />}

        {currentTab === "admins" && (
          <AdminsManagement
            currentUsername={adminUser.username}
            token={adminUser.token}
            onOpenChangePasswordModal={() => setIsPasswordModalOpen(true)}
          />
        )}

        {currentTab === "settings" && (
          <SettingsAndSharing
            settings={settings}
            onSaveSettings={handleSaveSettings}
            rankings={rankings}
            criteria={criteria}
            onTriggerPrint={triggerPrint}
          />
        )}
      </main>

      {/* Folha Oficial de Impressão (visível apenas em @media print) */}
      <PrintClassification
        rankings={rankings}
        settings={settings}
        criteria={criteria}
      />

      {/* Modal de Alteração de Senha */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        token={adminUser.token}
        adminUsername={adminUser.username}
      />
    </div>
  );
}
