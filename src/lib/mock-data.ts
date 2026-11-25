import { Criterion, FairSettings, Project, Evaluation, Evaluator, OFFICIAL_CRITERIA } from "@/types";

export const INITIAL_SETTINGS: FairSettings = {
  name: "AvaliaFeira – Feira de Ciências e Tecnologia",
  edition: "Edição 2026",
  date: "25 e 26 de Novembro de 2026",
  location: "Ginásio Poliesportivo Central / Pavilhão de Exposições",
  description: "Sistema Oficial de Avaliação e Julgamento de Projetos Científicos",
  is_active: true,
};

// Sem avaliadores genéricos/de teste pré-carregados (banco inicia limpo)
export const INITIAL_EVALUATORS: Evaluator[] = [];

// Sem projetos genéricos pré-carregados (banco inicia limpo)
export const INITIAL_PROJECTS: Project[] = [];

// Sem avaliações de teste pré-carregadas
export const INITIAL_EVALUATIONS: Evaluation[] = [];

// ==============================================================================
// 40 PROJETOS OFICIAIS DIVIDIDOS EM 3 CATEGORIAS (Júnior, Nemo, Médio)
// SEM integrantes e SEM orientador (apenas Código, Título, Estande e Categoria)
// ==============================================================================
export const SAMPLE_40_PROJECTS: Omit<Project, "id" | "created_at">[] = [
  // JÚNIOR (13 Projetos: PROJ-01 a PROJ-13)
  {
    code: "PROJ-01",
    title: "Horta Inteligente com Irrigação Automatizada e Sensor de Umidade de Solo",
    category: "Júnior",
    stand: "Estande J-01",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-02",
    title: "Filtro Ecológico com Areia e Carvão Ativado para Reúso de Água da Chuva",
    category: "Júnior",
    stand: "Estande J-02",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-03",
    title: "Desidratador Solar Sustentável para Conservação de Frutas Locais",
    category: "Júnior",
    stand: "Estande J-03",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-04",
    title: "Lixeira Seletiva com Sensor Ultrassônico para Separação de Recicláveis",
    category: "Júnior",
    stand: "Estande J-04",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-05",
    title: "Produção de Tintas Naturais a partir de Vegetais e Especiarias Regionais",
    category: "Júnior",
    stand: "Estande J-05",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-06",
    title: "Estudo da Eficiência de Isolantes Térmicos com Embalagens Tetra Pak",
    category: "Júnior",
    stand: "Estande J-06",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-07",
    title: "Minigerador Eólico Caseiro com Materiais Reciclados para Iluminação LED",
    category: "Júnior",
    stand: "Estande J-07",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-08",
    title: "Sabão Ecológico Líquido a partir de Óleo Residual de Frituras Domésticas",
    category: "Júnior",
    stand: "Estande J-08",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-09",
    title: "Dispositivo de Alerta para Desperdício de Água em Torneiras Escolares",
    category: "Júnior",
    stand: "Estande J-09",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-10",
    title: "Compostagem Doméstica Acelerada com Minhocas Vermelhas da Califórnia",
    category: "Júnior",
    stand: "Estande J-10",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-11",
    title: "Jogo Educativo Digital de Conscientização sobre Dengue e Zoonoses",
    category: "Júnior",
    stand: "Estande J-11",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-12",
    title: "Purificador de Água Portátil por Radiação Solar Térmica (SODIS)",
    category: "Júnior",
    stand: "Estande J-12",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-13",
    title: "Bioplástico Caseiro com Fécula de Batata e Amido de Milho",
    category: "Júnior",
    stand: "Estande J-13",
    assigned_evaluators: [],
  },

  // NEMO (14 Projetos: PROJ-14 a PROJ-27)
  {
    code: "PROJ-14",
    title: "Braço Robótico com Servomotores e Controle por Bluetooth via Smartphone",
    category: "Nemo",
    stand: "Estande N-01",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-15",
    title: "Monitoramento da Qualidade do Ar com Sensores de Baixo Custo e ESP32",
    category: "Nemo",
    stand: "Estande N-02",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-16",
    title: "Sistema Hidropônico Vertical com Reaproveitamento de Nutrientes",
    category: "Nemo",
    stand: "Estande N-03",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-17",
    title: "Carregador Portátil por Painel Solar Dobrável de Alta Eficiência",
    category: "Nemo",
    stand: "Estande N-04",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-18",
    title: "Aplicativo Gamificado para Estudo e Resolução de Equações Matemáticas",
    category: "Nemo",
    stand: "Estande N-05",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-19",
    title: "Biopesticida Orgânico à Base de Folhas de Nim para Pragas Agrícolas",
    category: "Nemo",
    stand: "Estande N-06",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-20",
    title: "Telhado Verde Modular com Espécies Nativas para Redução Térmica Urbana",
    category: "Nemo",
    stand: "Estande N-07",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-21",
    title: "Bengala Ultrassônica Inteligente com Feedback Háptico para Deficientes Visuais",
    category: "Nemo",
    stand: "Estande N-08",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-22",
    title: "Síntese de Papel Reciclado Resistente a partir de Folhas Secas e Poda",
    category: "Nemo",
    stand: "Estande N-09",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-23",
    title: "Sistema de Captura e Condensação de Umidade do Ar para Obtenção de Água",
    category: "Nemo",
    stand: "Estande N-10",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-24",
    title: "Estufa Automatizada com Climatização Controlada por Microcontrolador",
    category: "Nemo",
    stand: "Estande N-11",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-25",
    title: "Dispositivo Aquecedor Solar de Baixo Custo com Garrafas PET Recicladas",
    category: "Nemo",
    stand: "Estande N-12",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-26",
    title: "Sistema de Refrigeração Evaporativa Sustentável sem Consumo Elétrico",
    category: "Nemo",
    stand: "Estande N-13",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-27",
    title: "Mapeamento de Poluição Sonora no Entorno Escolar e Barreiras Antirruído",
    category: "Nemo",
    stand: "Estande N-14",
    assigned_evaluators: [],
  },

  // MÉDIO (13 Projetos: PROJ-28 a PROJ-40)
  {
    code: "PROJ-28",
    title: "Biofiltro de Fibras de Coco para Purificação de Água em Comunidades Rurais",
    category: "Médio",
    stand: "Estande M-01",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-29",
    title: "Braço Robótico Articulado com Impressão 3D e Visão Computacional",
    category: "Médio",
    stand: "Estande M-02",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-30",
    title: "Produção de Bioplástico Biodegradável do Amido de Mandioca Residual",
    category: "Médio",
    stand: "Estande M-03",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-31",
    title: "Aplicativo Móvel Acessível para Tradução de Libras em Tempo Real",
    category: "Médio",
    stand: "Estande M-04",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-32",
    title: "Geração de Energia Elétrica Limpa através de Células de Combustível Microbianas",
    category: "Médio",
    stand: "Estande M-05",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-33",
    title: "Dispositivo Autônomo IoT para Monitoramento e Dispersão de Sementes",
    category: "Médio",
    stand: "Estande M-06",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-34",
    title: "Extrato Aquoso de Moringa Oleifera para Coagulação de Água Turva",
    category: "Médio",
    stand: "Estande M-07",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-35",
    title: "Microgerador Piezoelétrico para Aproveitamento de Energia de Pisadas em Pisos",
    category: "Médio",
    stand: "Estande M-08",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-36",
    title: "Filme Biopolimérico com Própolis para Conservação de Morangos",
    category: "Médio",
    stand: "Estande M-09",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-37",
    title: "Drenagem Urbana Sustentável com Pavimento Permeável de Concreto Poroso",
    category: "Médio",
    stand: "Estande M-10",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-38",
    title: "Modelo de Inteligência Artificial para Previsão de Focos de Incêndio Florestal",
    category: "Médio",
    stand: "Estande M-11",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-39",
    title: "Remoção de Metais Pesados em Efluentes Líquidos Utilizando Cascas de Laranja",
    category: "Médio",
    stand: "Estande M-12",
    assigned_evaluators: [],
  },
  {
    code: "PROJ-40",
    title: "Sintetizador de Voz para Indivíduos Não-Verbalizantes com Teclado Adaptado",
    category: "Médio",
    stand: "Estande M-13",
    assigned_evaluators: [],
  },
];
