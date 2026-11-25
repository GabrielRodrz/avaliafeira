import { Project, Evaluator, Evaluation } from "@/types";

export interface EvaluatorLoadSummary {
  code: string;
  name?: string | null;
  total: number;
  byCategory: Record<string, number>;
}

export interface DistributionResult {
  allocations: { projectId: string; evaluatorCodes: string[] }[];
  evaluatorLoads: Record<string, EvaluatorLoadSummary>;
  evaluatorsPerProject: number;
  totalProjects: number;
  totalEvaluators: number;
  minLoad: number;
  maxLoad: number;
  avgLoad: number;
  isEquallyBalanced: boolean;
  projectsByCategory: Record<string, number>;
}

/**
 * Algoritmo de Distribuição Equilibrada e Proporcional de Projetos:
 * 1. Cada projeto recebe EXATAMENTE o mesmo quantitativo de avaliadores (ex: 2 ou 3).
 * 2. Cada avaliador recebe praticamente a mesma quantidade de projetos (diferença máxima de 1 projeto entre o avaliador com mais e com menos).
 * 3. Distribuição aleatória e rotativa que equilibra também as categorias (Júnior, Nemo, Médio).
 * 4. Preserva opcionalmente avaliações que já foram iniciadas ou concluídas.
 */
export function distributeProjectsBalanced(
  projects: Project[],
  evaluators: Evaluator[],
  evaluatorsPerProject: number = 2,
  existingEvaluations: Evaluation[] = [],
  preserveExisting: boolean = true
): DistributionResult {
  if (projects.length === 0 || evaluators.length === 0) {
    return {
      allocations: projects.map((p) => ({ projectId: p.id, evaluatorCodes: [] })),
      evaluatorLoads: {},
      evaluatorsPerProject,
      totalProjects: projects.length,
      totalEvaluators: evaluators.length,
      minLoad: 0,
      maxLoad: 0,
      avgLoad: 0,
      isEquallyBalanced: true,
      projectsByCategory: {},
    };
  }

  // Garantir que não exigimos mais jurados por projeto do que o total de jurados existentes
  const targetK = Math.min(evaluatorsPerProject, evaluators.length);

  // Mapeamento de contadores e cargas por avaliador
  const evaluatorCodes = evaluators.map((e) => e.code.trim().toUpperCase());
  const evaluatorInfoMap = new Map<string, Evaluator>();
  evaluators.forEach((e) => evaluatorInfoMap.set(e.code.trim().toUpperCase(), e));

  const totalLoad = new Map<string, number>();
  const categoryLoad = new Map<string, Map<string, number>>();

  evaluatorCodes.forEach((code) => {
    totalLoad.set(code, 0);
    categoryLoad.set(code, new Map<string, number>());
  });

  // Alocações por projeto: Map<projectId, Set<evaluatorCode>>
  const projectAllocations = new Map<string, Set<string>>();
  projects.forEach((p) => {
    projectAllocations.set(p.id, new Set<string>());
  });

  // Contagem de projetos por categoria
  const projectsByCategory: Record<string, number> = {};
  projects.forEach((p) => {
    const cat = p.category?.trim() || "Geral";
    projectsByCategory[cat] = (projectsByCategory[cat] || 0) + 1;
  });

  // 1. Preservar avaliações existentes se solicitado
  if (preserveExisting && existingEvaluations.length > 0) {
    existingEvaluations.forEach((evaluation) => {
      if (!evaluation.evaluator_code) return;
      const code = evaluation.evaluator_code.trim().toUpperCase();
      const projSet = projectAllocations.get(evaluation.project_id);
      const proj = projects.find((p) => p.id === evaluation.project_id);

      if (projSet && proj && evaluatorCodes.includes(code)) {
        if (!projSet.has(code) && projSet.size < targetK) {
          projSet.add(code);
          totalLoad.set(code, (totalLoad.get(code) || 0) + 1);

          const cat = proj.category?.trim() || "Geral";
          const catMap = categoryLoad.get(code);
          if (catMap) {
            catMap.set(cat, (catMap.get(cat) || 0) + 1);
          }
        }
      }
    });
  }

  // 2. Ordenar projetos de forma intercalada por categoria e embaralhada aleatoriamente
  // Agrupar projetos por categoria
  const categoryGroups = new Map<string, Project[]>();
  projects.forEach((p) => {
    const cat = p.category?.trim() || "Geral";
    if (!categoryGroups.has(cat)) {
      categoryGroups.set(cat, []);
    }
    categoryGroups.get(cat)!.push(p);
  });

  // Embaralhar aleatoriamente cada grupo de categoria
  categoryGroups.forEach((group) => {
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [group[i], group[j]] = [group[j], group[i]];
    }
  });

  // Intercalar os projetos entre as categorias (Júnior, Nemo, Médio...)
  const interleavedProjects: Project[] = [];
  const categoryKeys = Array.from(categoryGroups.keys());
  let hasMore = true;
  let round = 0;

  while (hasMore) {
    hasMore = false;
    categoryKeys.forEach((cat) => {
      const group = categoryGroups.get(cat)!;
      if (round < group.length) {
        interleavedProjects.push(group[round]);
        hasMore = true;
      }
    });
    round++;
  }

  // 3. Alocação Gulosa Equilibrada com Desempate Aleatório e por Categoria
  interleavedProjects.forEach((proj) => {
    const currentSet = projectAllocations.get(proj.id)!;
    const needed = targetK - currentSet.size;
    if (needed <= 0) return;

    const cat = proj.category?.trim() || "Geral";

    // Candidatos elegíveis (avaliadores que ainda não estão neste projeto)
    const candidates = evaluatorCodes.filter((code) => !currentSet.has(code));

    // Ordenar candidatos:
    // 1º Carga Total de projetos (menor carga primeiro -> equilíbrio perfeito!)
    // 2º Carga nesta categoria específica (menos projetos nesta categoria -> equilíbrio de categorias!)
    // 3º Jitter aleatório (sorteio para desempate)
    candidates.sort((a, b) => {
      const loadA = totalLoad.get(a) || 0;
      const loadB = totalLoad.get(b) || 0;
      if (loadA !== loadB) {
        return loadA - loadB;
      }

      const catA = categoryLoad.get(a)?.get(cat) || 0;
      const catB = categoryLoad.get(b)?.get(cat) || 0;
      if (catA !== catB) {
        return catA - catB;
      }

      return Math.random() - 0.5;
    });

    // Selecionar os melhores candidatos
    const chosen = candidates.slice(0, needed);
    chosen.forEach((code) => {
      currentSet.add(code);
      totalLoad.set(code, (totalLoad.get(code) || 0) + 1);

      const catMap = categoryLoad.get(code);
      if (catMap) {
        catMap.set(cat, (catMap.get(cat) || 0) + 1);
      }
    });
  });

  // 4. Formatar resultado e estatísticas
  const allocations = projects.map((p) => ({
    projectId: p.id,
    evaluatorCodes: Array.from(projectAllocations.get(p.id) || []),
  }));

  const loadsArray: number[] = [];
  const evaluatorLoads: Record<string, EvaluatorLoadSummary> = {};

  evaluatorCodes.forEach((code) => {
    const total = totalLoad.get(code) || 0;
    loadsArray.push(total);

    const byCatObj: Record<string, number> = {};
    const catMap = categoryLoad.get(code);
    if (catMap) {
      catMap.forEach((val, key) => {
        byCatObj[key] = val;
      });
    }

    evaluatorLoads[code] = {
      code,
      name: evaluatorInfoMap.get(code)?.name || null,
      total,
      byCategory: byCatObj,
    };
  });

  const minLoad = loadsArray.length > 0 ? Math.min(...loadsArray) : 0;
  const maxLoad = loadsArray.length > 0 ? Math.max(...loadsArray) : 0;
  const sumLoad = loadsArray.reduce((acc, v) => acc + v, 0);
  const avgLoad = loadsArray.length > 0 ? Number((sumLoad / loadsArray.length).toFixed(1)) : 0;
  const isEquallyBalanced = maxLoad - minLoad <= 1;

  return {
    allocations,
    evaluatorLoads,
    evaluatorsPerProject: targetK,
    totalProjects: projects.length,
    totalEvaluators: evaluators.length,
    minLoad,
    maxLoad,
    avgLoad,
    isEquallyBalanced,
    projectsByCategory,
  };
}
