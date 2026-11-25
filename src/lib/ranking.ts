import { Evaluation, Project, ProjectRankingItem } from "@/types";

/**
 * Calculates criteria averages and final score for a set of evaluations of a single project.
 */
export function calculateProjectScore(
  project: Project,
  evaluations: Evaluation[]
): {
  evaluationsCount: number;
  criteriaAverages: Record<number, number>;
  finalScore: number;
} {
  const projectEvals = evaluations.filter((e) => e.project_id === project.id);
  const count = projectEvals.length;

  const criteriaAverages: Record<number, number> = {};

  if (count === 0) {
    for (let c = 1; c <= 10; c++) {
      criteriaAverages[c] = 0;
    }
    return {
      evaluationsCount: 0,
      criteriaAverages,
      finalScore: 0,
    };
  }

  let totalSumOfAverages = 0;

  for (let c = 1; c <= 10; c++) {
    const sumForCriterion = projectEvals.reduce((acc, curr) => {
      const score = Number(curr.scores?.[String(c)] ?? curr.scores?.[c] ?? 0);
      return acc + (isNaN(score) ? 0 : score);
    }, 0);

    // Média aritmética de cada critério arredondada para 2 casas decimais
    const avg = Math.round((sumForCriterion / count) * 100) / 100;
    criteriaAverages[c] = avg;
    totalSumOfAverages += avg;
  }

  // Soma das médias dos 10 critérios (0.00 a 100.00)
  const finalScore = Math.round(totalSumOfAverages * 100) / 100;

  return {
    evaluationsCount: count,
    criteriaAverages,
    finalScore,
  };
}

/**
 * Computes ranked list with official tie-breaker rules:
 * 1º. Maior média em Domínio do conteúdo (Critério 1)
 * 2º. Maior média em Fundamentação científica (Critério 5)
 * 3º. Maior média em Metodologia e desenvolvimento (Critério 6)
 * 4º. Maior média em Criatividade e originalidade (Critério 2)
 * Persistindo o empate, exibe o alerta "Empate Técnico – Avaliação Complementar".
 */
export function computeOfficialRanking(
  projects: Project[],
  evaluations: Evaluation[],
  categoryFilter?: string
): ProjectRankingItem[] {
  const filteredProjects = categoryFilter && categoryFilter !== "all"
    ? projects.filter((p) => p.category === categoryFilter)
    : projects;

  const items = filteredProjects.map((project) => {
    const scoreData = calculateProjectScore(project, evaluations);
    return {
      project,
      evaluationsCount: scoreData.evaluationsCount,
      criteriaAverages: scoreData.criteriaAverages,
      finalScore: scoreData.finalScore,
      rank: 0,
      isTechnicalTie: false,
    };
  });

  // Ordenação com critérios de desempate
  items.sort((a, b) => {
    // 1. Pontuação Final (maior primeiro)
    const diffFinal = b.finalScore - a.finalScore;
    if (Math.abs(diffFinal) > 0.0001) {
      return diffFinal;
    }

    // 2. Desempate 1: Critério 1 (Domínio do conteúdo)
    const diffC1 = (b.criteriaAverages[1] || 0) - (a.criteriaAverages[1] || 0);
    if (Math.abs(diffC1) > 0.0001) {
      return diffC1;
    }

    // 3. Desempate 2: Critério 5 (Fundamentação científica)
    const diffC5 = (b.criteriaAverages[5] || 0) - (a.criteriaAverages[5] || 0);
    if (Math.abs(diffC5) > 0.0001) {
      return diffC5;
    }

    // 4. Desempate 3: Critério 6 (Metodologia e desenvolvimento)
    const diffC6 = (b.criteriaAverages[6] || 0) - (a.criteriaAverages[6] || 0);
    if (Math.abs(diffC6) > 0.0001) {
      return diffC6;
    }

    // 5. Desempate 4: Critério 2 (Criatividade e originalidade)
    const diffC2 = (b.criteriaAverages[2] || 0) - (a.criteriaAverages[2] || 0);
    if (Math.abs(diffC2) > 0.0001) {
      return diffC2;
    }

    // Empate idêntico nos 4 critérios de desempate
    return 0;
  });

  // Atribuir ranks e identificar empates técnicos
  for (let i = 0; i < items.length; i++) {
    const curr = items[i];

    if (i === 0) {
      curr.rank = 1;
    } else {
      const prev = items[i - 1];
      const isExactlyEqual =
        Math.abs(curr.finalScore - prev.finalScore) < 0.0001 &&
        Math.abs((curr.criteriaAverages[1] || 0) - (prev.criteriaAverages[1] || 0)) < 0.0001 &&
        Math.abs((curr.criteriaAverages[5] || 0) - (prev.criteriaAverages[5] || 0)) < 0.0001 &&
        Math.abs((curr.criteriaAverages[6] || 0) - (prev.criteriaAverages[6] || 0)) < 0.0001 &&
        Math.abs((curr.criteriaAverages[2] || 0) - (prev.criteriaAverages[2] || 0)) < 0.0001 &&
        curr.evaluationsCount > 0;

      if (isExactlyEqual) {
        curr.rank = prev.rank;
        curr.isTechnicalTie = true;
        prev.isTechnicalTie = true;
      } else {
        curr.rank = i + 1;
      }
    }
  }

  return items;
}
