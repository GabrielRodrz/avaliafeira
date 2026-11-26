import { getSupabaseClient, isSupabaseConfigured } from "./supabase/client";
import { Criterion, Evaluation, FairSettings, Project, Evaluator, ProjectEvaluator, OFFICIAL_CRITERIA } from "@/types";
import { INITIAL_EVALUATIONS, INITIAL_PROJECTS, INITIAL_SETTINGS, INITIAL_EVALUATORS, SAMPLE_40_PROJECTS } from "./mock-data";

const LOCAL_STORAGE_KEYS = {
  SETTINGS: "avaliafeira_settings",
  PROJECTS: "avaliafeira_projects",
  EVALUATIONS: "avaliafeira_evaluations",
  CRITERIA: "avaliafeira_criteria",
  EVALUATORS: "avaliafeira_evaluators",
  ALLOCATIONS: "avaliafeira_project_evaluators",
};

// ==============================================================================
// CONFIGURAÇÕES DA FEIRA
// ==============================================================================
export async function getFairSettings(): Promise<FairSettings> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("fair_settings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return data as FairSettings;
      }
    } catch (e) {
      console.warn("Erro ao buscar configurações no Supabase, usando local:", e);
    }
  }

  // Fallback Local
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
  }
  return INITIAL_SETTINGS;
}

export async function saveFairSettings(settings: Partial<FairSettings>): Promise<FairSettings> {
  const current = await getFairSettings();
  const updated: FairSettings = { ...current, ...settings, updated_at: new Date().toISOString() };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      if (current.id) {
        const { data, error } = await supabase
          .from("fair_settings")
          .update(settings)
          .eq("id", current.id)
          .select()
          .single();
        if (!error && data) return data as FairSettings;
      } else {
        const { data, error } = await supabase
          .from("fair_settings")
          .insert(updated)
          .select()
          .single();
        if (!error && data) return data as FairSettings;
      }
    } catch (e) {
      console.warn("Erro ao salvar configurações no Supabase, salvando local:", e);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  }
  return updated;
}

// ==============================================================================
// CRITÉRIOS
// ==============================================================================
export async function getCriteria(): Promise<Criterion[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("criteria")
        .select("*")
        .order("order_num", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Criterion[];
      }
    } catch (e) {
      console.warn("Erro ao buscar critérios no Supabase, usando oficiais:", e);
    }
  }

  return OFFICIAL_CRITERIA;
}

// ==============================================================================
// AVALIADORES (MATRÍCULAS E NOMES)
// ==============================================================================
export async function getEvaluators(): Promise<Evaluator[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("evaluators")
        .select("*")
        .order("code", { ascending: true });

      if (!error && data && data.length > 0) {
        // Buscar também alocações
        const allocations = await getProjectEvaluators();
        return data.map((ev: any) => ({
          ...ev,
          assigned_projects: allocations
            .filter((a) => a.evaluator_code.toUpperCase() === ev.code.toUpperCase())
            .map((a) => a.project_id),
        }));
      }
    } catch (e) {
      console.warn("Aviso ao buscar avaliadores no Supabase, usando local:", e);
    }
  }

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.EVALUATORS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVALUATORS, JSON.stringify(INITIAL_EVALUATORS));
  }
  return INITIAL_EVALUATORS;
}

export async function createOrUpdateEvaluator(
  code: string,
  name?: string | null,
  assignedProjects?: string[]
): Promise<Evaluator> {
  const cleanCode = code.trim().toUpperCase();
  const cleanName = name ? name.trim() : null;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("evaluators")
        .upsert(
          {
            code: cleanCode,
            name: cleanName,
          },
          { onConflict: "code" }
        )
        .select()
        .single();

      if (!error && data) {
        if (assignedProjects) {
          // Atualizar alocações na tabela project_evaluators
          await supabase.from("project_evaluators").delete().eq("evaluator_code", cleanCode);
          if (assignedProjects.length > 0) {
            await supabase.from("project_evaluators").insert(
              assignedProjects.map((pId) => ({
                project_id: pId,
                evaluator_code: cleanCode,
              }))
            );
          }
        }
        return {
          ...data,
          assigned_projects: assignedProjects || [],
        };
      }
    } catch (e) {
      console.warn("Erro ao salvar avaliador no Supabase, usando local:", e);
    }
  }

  // Fallback Local
  const current = await getEvaluators();
  const idx = current.findIndex((e) => e.code.toUpperCase() === cleanCode);
  let saved: Evaluator;

  if (idx >= 0) {
    saved = {
      ...current[idx],
      name: cleanName !== undefined ? cleanName : current[idx].name,
      assigned_projects: assignedProjects !== undefined ? assignedProjects : current[idx].assigned_projects,
    };
    current[idx] = saved;
  } else {
    saved = {
      id: `evaluator-${Date.now()}`,
      code: cleanCode,
      name: cleanName,
      assigned_projects: assignedProjects || [],
      created_at: new Date().toISOString(),
    };
    current.push(saved);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVALUATORS, JSON.stringify(current));
  }
  return saved;
}

export async function deleteEvaluator(code: string): Promise<boolean> {
  const cleanCode = code.trim().toUpperCase();
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("project_evaluators").delete().eq("evaluator_code", cleanCode);
      const { error } = await supabase.from("evaluators").delete().eq("code", cleanCode);
      if (!error) return true;
    } catch (e) {
      console.warn("Erro ao deletar avaliador no Supabase:", e);
    }
  }

  if (typeof window !== "undefined") {
    const current = await getEvaluators();
    const filtered = current.filter((e) => e.code.toUpperCase() !== cleanCode);
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVALUATORS, JSON.stringify(filtered));
  }
  return true;
}

export async function createOrUpdateEvaluatorsBatch(
  list: { code: string; name?: string | null; assignedProjects?: string[] }[]
): Promise<void> {
  for (const item of list) {
    await createOrUpdateEvaluator(item.code, item.name, item.assignedProjects);
  }
}

// ==============================================================================
// ALOCAÇÃO DE AVALIADORES A PROJETOS (ESCALA)
// ==============================================================================
export async function getProjectEvaluators(): Promise<ProjectEvaluator[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("project_evaluators").select("*");
      if (!error && data) {
        return data as ProjectEvaluator[];
      }
    } catch (e) {
      // ignore
    }
  }

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.ALLOCATIONS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
  }

  // Fallback baseado nos projetos iniciais
  const initialAllocations: ProjectEvaluator[] = [];
  INITIAL_PROJECTS.forEach((p) => {
    (p.assigned_evaluators || []).forEach((code) => {
      initialAllocations.push({
        id: `alloc-${p.id}-${code}`,
        project_id: p.id,
        evaluator_code: code,
      });
    });
  });
  return initialAllocations;
}

export async function assignEvaluatorsToProject(
  projectId: string,
  evaluatorCodes: string[]
): Promise<void> {
  const cleanCodes = evaluatorCodes.map((c) => c.trim().toUpperCase());

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("project_evaluators").delete().eq("project_id", projectId);
      if (cleanCodes.length > 0) {
        await supabase.from("project_evaluators").insert(
          cleanCodes.map((code) => ({
            project_id: projectId,
            evaluator_code: code,
          }))
        );
      }
    } catch (e) {
      console.warn("Erro ao salvar alocações no Supabase, usando local:", e);
    }
  }

  // Atualizar projetos locais
  if (typeof window !== "undefined") {
    const projects = await getProjects();
    const projIdx = projects.findIndex((p) => p.id === projectId);
    if (projIdx >= 0) {
      projects[projIdx].assigned_evaluators = cleanCodes;
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    }

    const currentAlloc = await getProjectEvaluators();
    const filteredAlloc = currentAlloc.filter((a) => a.project_id !== projectId);
    const newAllocs = cleanCodes.map((code) => ({
      id: `alloc-${projectId}-${code}`,
      project_id: projectId,
      evaluator_code: code,
    }));
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.ALLOCATIONS,
      JSON.stringify([...filteredAlloc, ...newAllocs])
    );
  }
}

/**
 * Salva em lote todas as alocações da escala equilibrada
 */
export async function saveAllProjectAllocations(
  allocations: { projectId: string; evaluatorCodes: string[] }[]
): Promise<void> {
  const supabase = getSupabaseClient();
  const allRows: { project_id: string; evaluator_code: string }[] = [];

  allocations.forEach((item) => {
    item.evaluatorCodes.forEach((code) => {
      const clean = code.trim().toUpperCase();
      if (clean) {
        allRows.push({ project_id: item.projectId, evaluator_code: clean });
      }
    });
  });

  if (supabase) {
    try {
      await supabase.from("project_evaluators").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (allRows.length > 0) {
        await supabase.from("project_evaluators").insert(allRows);
      }
    } catch (e) {
      console.warn("Erro ao salvar todas as alocações no Supabase, usando local:", e);
    }
  }

  // Atualizar cache local e localStorage
  if (typeof window !== "undefined") {
    const projects = await getProjects();
    const allocMap = new Map<string, string[]>();
    allocations.forEach((item) => {
      allocMap.set(item.projectId, item.evaluatorCodes.map((c) => c.trim().toUpperCase()));
    });

    const updatedProjects = projects.map((p) => ({
      ...p,
      assigned_evaluators: allocMap.get(p.id) || [],
    }));
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));

    // Atualizar avaliadores com seus assigned_projects
    const evaluators = await getEvaluators();
    const evProjectMap = new Map<string, string[]>();
    allocations.forEach((item) => {
      item.evaluatorCodes.forEach((code) => {
        const clean = code.trim().toUpperCase();
        if (!evProjectMap.has(clean)) {
          evProjectMap.set(clean, []);
        }
        evProjectMap.get(clean)!.push(item.projectId);
      });
    });

    const updatedEvaluators = evaluators.map((ev) => ({
      ...ev,
      assigned_projects: evProjectMap.get(ev.code.toUpperCase()) || [],
    }));
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVALUATORS, JSON.stringify(updatedEvaluators));

    // Atualizar tabela de allocations
    const newAllocs = allRows.map((r, idx) => ({
      id: `alloc-${r.project_id}-${r.evaluator_code}-${idx}`,
      project_id: r.project_id,
      evaluator_code: r.evaluator_code,
    }));
    localStorage.setItem(LOCAL_STORAGE_KEYS.ALLOCATIONS, JSON.stringify(newAllocs));
  }
}

/**
 * Semear os 40 Projetos Oficiais divididos em Júnior (13), Nemo (14) e Médio (13)
 */
export async function seedOfficial40Projects(): Promise<Project[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("project_evaluators").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("evaluations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      const { data, error } = await supabase.from("projects").insert(
        SAMPLE_40_PROJECTS.map((p) => ({
          code: p.code,
          title: p.title,
          category: p.category,
          members: p.members || "",
          advisor: p.advisor || null,
          stand: p.stand || null,
        }))
      ).select();

      if (!error && data) {
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(data));
          localStorage.setItem(LOCAL_STORAGE_KEYS.ALLOCATIONS, JSON.stringify([]));
          localStorage.setItem(LOCAL_STORAGE_KEYS.EVALUATIONS, JSON.stringify([]));
        }
        return data as Project[];
      }
    } catch (e) {
      console.warn("Erro ao semear 40 projetos no Supabase:", e);
    }
  }

  // Fallback Local
  const localList: Project[] = SAMPLE_40_PROJECTS.map((p, idx) => ({
    ...p,
    id: `proj-official-${idx + 1}`,
    assigned_evaluators: [],
    created_at: new Date().toISOString(),
  }));

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(localList));
    localStorage.setItem(LOCAL_STORAGE_KEYS.ALLOCATIONS, JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVALUATIONS, JSON.stringify([]));
  }
  return localList;
}

/**
 * Limpa todos os projetos, avaliadores e notas de teste do sistema
 */
export async function clearAllData(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("evaluations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("project_evaluators").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("evaluators").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch (e) {
      console.warn("Erro ao limpar dados no Supabase:", e);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.EVALUATORS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.EVALUATIONS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ALLOCATIONS);
  }
}

// ==============================================================================
// PROJETOS (CRUD)
// ==============================================================================
export async function getProjects(): Promise<Project[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("code", { ascending: true });

      if (!error && data) {
        // Enriquecer com avaliadores designados de project_evaluators
        const allocations = await getProjectEvaluators();
        return data.map((p: any) => ({
          ...p,
          assigned_evaluators: allocations
            .filter((a) => a.project_id === p.id)
            .map((a) => a.evaluator_code),
        }));
      }
    } catch (e) {
      console.warn("Erro ao buscar projetos no Supabase, usando local:", e);
    }
  }

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
  }
  return INITIAL_PROJECTS;
}

export async function createProject(
  project: Omit<Project, "id" | "created_at" | "updated_at">
): Promise<Project> {
  const { assigned_evaluators, ...projectData } = project;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

      if (!error && data) {
        if (assigned_evaluators && assigned_evaluators.length > 0) {
          await assignEvaluatorsToProject(data.id, assigned_evaluators);
        }
        return {
          ...data,
          assigned_evaluators: assigned_evaluators || [],
        } as Project;
      }
      if (error) throw new Error(error.message);
    } catch (e: any) {
      if (isSupabaseConfigured()) throw e;
      console.warn("Criando projeto no armazenamento local:", e);
    }
  }

  const newProj: Project = {
    ...project,
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    assigned_evaluators: assigned_evaluators || [],
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const current = await getProjects();
    const updated = [...current, newProj];
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
  }
  return newProj;
}

export async function createProjectsBatch(
  list: Omit<Project, "id" | "created_at">[]
): Promise<void> {
  for (const item of list) {
    await createProject(item);
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const { assigned_evaluators, ...projectData } = updates;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({ ...projectData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (assigned_evaluators !== undefined) {
        await assignEvaluatorsToProject(id, assigned_evaluators);
      }

      if (!error && data) {
        return {
          ...data,
          assigned_evaluators: assigned_evaluators || [],
        } as Project;
      }
      if (error) throw new Error(error.message);
    } catch (e: any) {
      if (isSupabaseConfigured()) throw e;
    }
  }

  if (typeof window !== "undefined") {
    const current = await getProjects();
    const index = current.findIndex((p) => p.id === id);
    if (index >= 0) {
      current[index] = {
        ...current[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      if (assigned_evaluators !== undefined) {
        await assignEvaluatorsToProject(id, assigned_evaluators);
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(current));
      return current[index];
    }
  }
  throw new Error("Projeto não encontrado");
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("project_evaluators").delete().eq("project_id", id);
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (!error) return true;
      if (error) throw new Error(error.message);
    } catch (e: any) {
      if (isSupabaseConfigured()) throw e;
    }
  }

  if (typeof window !== "undefined") {
    const current = await getProjects();
    const filtered = current.filter((p) => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));

    const evals = await getEvaluations();
    const filteredEvals = evals.filter((e) => e.project_id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVALUATIONS, JSON.stringify(filteredEvals));
  }
  return true;
}

// ==============================================================================
// AVALIAÇÕES
// ==============================================================================
export async function getEvaluations(): Promise<Evaluation[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("evaluations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as Evaluation[];
      }
    } catch (e) {
      console.warn("Erro ao buscar avaliações no Supabase, usando local:", e);
    }
  }

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.EVALUATIONS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVALUATIONS, JSON.stringify(INITIAL_EVALUATIONS));
  }
  return INITIAL_EVALUATIONS;
}

export async function submitEvaluation(
  evaluation: Omit<Evaluation, "id" | "created_at" | "updated_at">
): Promise<Evaluation> {
  const cleanCode = evaluation.evaluator_code ? evaluation.evaluator_code.trim().toUpperCase() : null;
  const cleanName = evaluation.evaluator_name.trim();

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const payload: any = {
        project_id: evaluation.project_id,
        evaluator_name: cleanName,
        scores: evaluation.scores,
        total_score: evaluation.total_score,
        notes: evaluation.notes || "",
        updated_at: new Date().toISOString(),
      };
      if (cleanCode) {
        payload.evaluator_code = cleanCode;
      }

      // Tentar upsert
      const { data, error } = await supabase
        .from("evaluations")
        .upsert(payload, { onConflict: "project_id,evaluator_name" })
        .select()
        .single();

      if (!error && data) {
        return data as Evaluation;
      }
      if (error) {
        console.warn("Aviso ao salvar no Supabase, tentando inserção simples:", error.message);
      }
    } catch (e: any) {
      if (isSupabaseConfigured()) throw e;
      console.warn("Salvando avaliação no armazenamento local:", e);
    }
  }

  // Fallback Local
  const current = await getEvaluations();
  const existingIdx = current.findIndex(
    (e) =>
      e.project_id === evaluation.project_id &&
      ((cleanCode && e.evaluator_code && e.evaluator_code.toUpperCase() === cleanCode) ||
        e.evaluator_name.trim().toLowerCase() === cleanName.toLowerCase())
  );

  let savedItem: Evaluation;
  if (existingIdx >= 0) {
    savedItem = {
      ...current[existingIdx],
      evaluator_code: cleanCode || current[existingIdx].evaluator_code,
      evaluator_name: cleanName,
      scores: evaluation.scores,
      total_score: evaluation.total_score,
      notes: evaluation.notes,
      updated_at: new Date().toISOString(),
    };
    current[existingIdx] = savedItem;
  } else {
    savedItem = {
      id: `eval-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      project_id: evaluation.project_id,
      evaluator_code: cleanCode,
      evaluator_name: cleanName,
      scores: evaluation.scores,
      total_score: evaluation.total_score,
      notes: evaluation.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    current.push(savedItem);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVALUATIONS, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent("avaliafeira_eval_update", { detail: savedItem }));
  }

  return savedItem;
}

export async function deleteEvaluation(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("evaluations").delete().eq("id", id);
      if (!error) return true;
      if (error) throw new Error(error.message);
    } catch (e: any) {
      if (isSupabaseConfigured()) throw e;
    }
  }

  if (typeof window !== "undefined") {
    const current = await getEvaluations();
    const filtered = current.filter((e) => e.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVALUATIONS, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("avaliafeira_eval_update"));
  }
  return true;
}

// ==============================================================================
// INSCRIÇÃO EM TEMPO REAL (SUPABASE REALTIME)
// ==============================================================================
export function subscribeToRealtimeEvaluations(onUpdate: () => void) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const channel = supabase
        .channel("realtime:evaluations")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "evaluations" },
          () => {
            onUpdate();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Falha ao registrar canal de Realtime do Supabase:", err);
    }
  }

  // Fallback para escutar eventos locais
  if (typeof window !== "undefined") {
    const handler = () => onUpdate();
    window.addEventListener("avaliafeira_eval_update", handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("avaliafeira_eval_update", handler);
      window.removeEventListener("storage", handler);
    };
  }

  return () => {};
}
