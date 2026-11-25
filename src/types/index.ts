export interface Criterion {
  id: number;
  order_num: number;
  name: string;
  description: string;
  weight?: number;
  tie_breaker_order?: number | null; // 1, 2, 3, or 4
}

export interface Project {
  id: string;
  code: string;
  title: string;
  category: string;
  members: string;
  advisor?: string | null;
  stand?: string | null;
  assigned_evaluators?: string[]; // Matrículas dos avaliadores designados (ex: ["AV-01", "AV-02"])
  created_at?: string;
  updated_at?: string;
}

export interface Evaluator {
  id: string;
  code: string; // Matrícula do avaliador (ex: "AV-01", "101")
  name?: string | null; // Nome preenchido pelo jurado na hora ou pré-definido
  assigned_projects?: string[]; // IDs dos projetos que ele deve avaliar
  created_at?: string;
}

export interface ProjectEvaluator {
  id: string;
  project_id: string;
  evaluator_code: string;
  created_at?: string;
}

export interface Evaluation {
  id: string;
  project_id: string;
  evaluator_code?: string | null; // Matrícula do avaliador
  evaluator_name: string; // Nome digitado na hora
  scores: Record<string, number>; // { "1": 10, "2": 8, ... }
  total_score: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  username: string;
  name: string;
  is_master: boolean;
  created_at: string;
}

export interface FairSettings {
  id?: string;
  name: string;
  edition: string;
  date: string;
  location?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ScoreScaleOption {
  value: number;
  label: string;
  description: string;
  colorClass: string;
  badgeBg: string;
  borderClass: string;
}

export const OFFICIAL_SCALE: ScoreScaleOption[] = [
  {
    value: 0,
    label: "Não atendeu",
    description: "Não demonstrou os aspectos avaliados.",
    colorClass: "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100",
    badgeBg: "bg-rose-600 text-white",
    borderClass: "border-rose-500 ring-2 ring-rose-400",
  },
  {
    value: 2,
    label: "Insuficiente",
    description: "Apresentou muitas dificuldades e pouco domínio.",
    colorClass: "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100",
    badgeBg: "bg-amber-600 text-white",
    borderClass: "border-amber-500 ring-2 ring-amber-400",
  },
  {
    value: 4,
    label: "Regular",
    description: "Atendeu parcialmente ao critério, com limitações.",
    colorClass: "bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100",
    badgeBg: "bg-orange-500 text-white",
    borderClass: "border-orange-500 ring-2 ring-orange-400",
  },
  {
    value: 6,
    label: "Satisfatório",
    description: "Atendeu aos aspectos básicos do critério.",
    colorClass: "bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100",
    badgeBg: "bg-sky-600 text-white",
    borderClass: "border-sky-500 ring-2 ring-sky-400",
  },
  {
    value: 8,
    label: "Bom",
    description: "Demonstrou bom desempenho e conhecimento.",
    colorClass: "bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100",
    badgeBg: "bg-teal-600 text-white",
    borderClass: "border-teal-500 ring-2 ring-teal-400",
  },
  {
    value: 10,
    label: "Excelente",
    description: "Demonstrou domínio, segurança e excelente desempenho.",
    colorClass: "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100",
    badgeBg: "bg-emerald-600 text-white",
    borderClass: "border-emerald-500 ring-2 ring-emerald-400",
  },
];

export const OFFICIAL_CRITERIA: Criterion[] = [
  {
    id: 1,
    order_num: 1,
    name: "Domínio do conteúdo",
    description: "Conhecimento e compreensão do tema apresentado, segurança nas explicações e capacidade de demonstrar o aprendizado adquirido.",
    weight: 1.0,
    tie_breaker_order: 1,
  },
  {
    id: 2,
    order_num: 2,
    name: "Criatividade e originalidade",
    description: "Inovação e criatividade na elaboração do projeto, originalidade das ideias e utilização de recursos diferenciados.",
    weight: 1.0,
    tie_breaker_order: 4,
  },
  {
    id: 3,
    order_num: 3,
    name: "Organização do projeto",
    description: "Organização do espaço, disposição dos materiais, qualidade dos cartazes, maquetes e recursos visuais utilizados.",
    weight: 1.0,
    tie_breaker_order: null,
  },
  {
    id: 4,
    order_num: 4,
    name: "Clareza na comunicação",
    description: "Linguagem adequada, objetividade, postura e desenvoltura dos estudantes durante a apresentação.",
    weight: 1.0,
    tie_breaker_order: null,
  },
  {
    id: 5,
    order_num: 5,
    name: "Fundamentação científica",
    description: "Utilização correta de conceitos, teorias e informações científicas, demonstrando coerência nas explicações.",
    weight: 1.0,
    tie_breaker_order: 2,
  },
  {
    id: 6,
    order_num: 6,
    name: "Metodologia e desenvolvimento",
    description: "Clareza dos procedimentos, organização das etapas e execução dos experimentos ou pesquisas desenvolvidas.",
    weight: 1.0,
    tie_breaker_order: 3,
  },
  {
    id: 7,
    order_num: 7,
    name: "Trabalho em equipe",
    description: "Cooperação, divisão das responsabilidades, envolvimento e participação dos integrantes.",
    weight: 1.0,
    tie_breaker_order: null,
  },
  {
    id: 8,
    order_num: 8,
    name: "Relevância do tema",
    description: "Importância do projeto para a ciência, a sociedade, o meio ambiente ou a resolução de problemas cotidianos.",
    weight: 1.0,
    tie_breaker_order: null,
  },
  {
    id: 9,
    order_num: 9,
    name: "Resultados e conclusões",
    description: "Apresentação dos resultados, interpretação das informações e elaboração de conclusões coerentes.",
    weight: 1.0,
    tie_breaker_order: null,
  },
  {
    id: 10,
    order_num: 10,
    name: "Capacidade de responder às perguntas",
    description: "Segurança, argumentação e conhecimento demonstrados ao responder aos questionamentos dos avaliadores.",
    weight: 1.0,
    tie_breaker_order: null,
  },
];

export interface ProjectRankingItem {
  project: Project;
  evaluationsCount: number;
  assignedEvaluatorsCount: number;
  criteriaAverages: Record<number, number>; // criterionId -> average (0 to 10)
  finalScore: number; // 0 to 100 (sum of criteria averages)
  rank: number;
  isTechnicalTie: boolean;
}
