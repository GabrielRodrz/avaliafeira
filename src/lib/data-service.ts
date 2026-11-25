import { getSupabaseClient, isSupabaseConfigured } from "./supabase/client";
import { Criterion, Evaluation, FairSettings, Project, OFFICIAL_CRITERIA } from "@/types";
import { INITIAL_EVALUATIONS, INITIAL_PROJECTS, INITIAL_SETTINGS } from "./mock-data";

const LOCAL_STORAGE_KEYS = {
  SETTINGS: "avaliafeira_settings",
  PROJECTS: "avaliafeira_projects",
  EVALUATIONS: "avaliafeira_evaluations",
  CRITERIA: "avaliafeira_criteria",
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
        return data as Project[];
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
    // Salvar mock inicial no localStorage
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
  }
  return INITIAL_PROJECTS;
}

export async function createProject(project: Omit<Project, "id" | "created_at" | "updated_at">): Promise<Project> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert(project)
        .select()
        .single();

      if (!error && data) {
        return data as Project;
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
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const current = await getProjects();
    const updated = [...current, newProj];
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
  }
  return newProj;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return data as Project;
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
      current[index] = { ...current[index], ...updates, updated_at: new Date().toISOString() };
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

    // Remover avaliações associadas também
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
    // Salvar mock inicial no localStorage
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVALUATIONS, JSON.stringify(INITIAL_EVALUATIONS));
  }
  return INITIAL_EVALUATIONS;
}

export async function submitEvaluation(
  evaluation: Omit<Evaluation, "id" | "created_at" | "updated_at">
): Promise<Evaluation> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Upsert baseado em (project_id, evaluator_name)
      const { data, error } = await supabase
        .from("evaluations")
        .upsert(
          {
            project_id: evaluation.project_id,
            evaluator_name: evaluation.evaluator_name.trim(),
            scores: evaluation.scores,
            total_score: evaluation.total_score,
            notes: evaluation.notes || "",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "project_id,evaluator_name" }
        )
        .select()
        .single();

      if (!error && data) {
        return data as Evaluation;
      }
      if (error) {
        console.error("Erro no upsert de avaliação no Supabase:", error);
        throw new Error(error.message);
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
      e.evaluator_name.trim().toLowerCase() === evaluation.evaluator_name.trim().toLowerCase()
  );

  let savedItem: Evaluation;
  if (existingIdx >= 0) {
    savedItem = {
      ...current[existingIdx],
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
      evaluator_name: evaluation.evaluator_name.trim(),
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
    // Disparar evento customizado para realtime local em caso de abas múltiplas
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
