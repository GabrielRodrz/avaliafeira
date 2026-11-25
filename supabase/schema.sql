-- ==============================================================================
-- AvaliaFeira – Sistema de Avaliação de Feira de Ciências
-- Script SQL Completo de Criação do Banco de Dados, RLS e Realtime (Supabase)
-- ==============================================================================

-- 1. Habilitar extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Tabela de Administradores
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  username text unique not null,
  name text not null,
  is_master boolean default false,
  created_at timestamptz default now()
);

-- 3. Tabela de Configurações da Feira
create table if not exists public.fair_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'AvaliaFeira – Feira de Ciências e Tecnologia',
  edition text not null default 'Edição 2026',
  date text not null default '25 e 26 de Novembro de 2026',
  location text default 'Ginásio Poliesportivo / Pavilhão de Exposições',
  description text default 'Sistema Oficial de Avaliação e Julgamento de Projetos Científicos',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Tabela de Critérios Oficiais
create table if not exists public.criteria (
  id int primary key,
  order_num int not null,
  name text not null,
  description text not null,
  weight numeric default 1.0,
  tie_breaker_order int null, -- 1º, 2º, 3º ou 4º critério de desempate
  created_at timestamptz default now()
);

-- 5. Tabela de Projetos
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  category text not null,
  members text not null,
  advisor text,
  stand text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Tabela de Avaliadores / Matrículas Cadastradas
create table if not exists public.evaluators (
  id uuid primary key default gen_random_uuid(),
  code text unique not null, -- Matrícula do Jurado (ex: AV-01, 101)
  name text, -- Nome do Jurado (digitado na hora pelo avaliador ou pré-definido)
  created_at timestamptz default now()
);

-- 7. Tabela de Escala: Projetos Designados por Avaliador
create table if not exists public.project_evaluators (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  evaluator_code text not null, -- Matrícula do jurado vinculado
  created_at timestamptz default now(),
  constraint uq_project_evaluator_alloc unique (project_id, evaluator_code)
);

-- 8. Tabela de Avaliações
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  evaluator_code text, -- Matrícula do avaliador
  evaluator_name text not null, -- Nome digitado na hora
  scores jsonb not null, -- Mapeia {"1": 10, "2": 8, ...}
  total_score numeric not null, -- Soma das 10 notas (0 a 100)
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint uq_project_evaluator unique (project_id, evaluator_name)
);

-- Garantir coluna evaluator_code na tabela evaluations caso já exista
alter table public.evaluations add column if not exists evaluator_code text;

-- ==============================================================================
-- INSERÇÃO DOS 10 CRITÉRIOS OFICIAIS (Modelo Oficial AvaliaFeira)
-- ==============================================================================
insert into public.criteria (id, order_num, name, description, weight, tie_breaker_order)
values
  (1, 1, 'Domínio do conteúdo', 'Conhecimento e compreensão do tema apresentado, segurança nas explicações e capacidade de demonstrar o aprendizado adquirido.', 1.0, 1),
  (2, 2, 'Criatividade e originalidade', 'Inovação e criatividade na elaboração do projeto, originalidade das ideias e utilização de recursos diferenciados.', 1.0, 4),
  (3, 3, 'Organização do projeto', 'Organização do espaço, disposição dos materiais, qualidade dos cartazes, maquetes e recursos visuais utilizados.', 1.0, null),
  (4, 4, 'Clareza na comunicação', 'Linguagem adequada, objetividade, postura e desenvoltura dos estudantes durante a apresentação.', 1.0, null),
  (5, 5, 'Fundamentação científica', 'Utilização correta de conceitos, teorias e informações científicas, demonstrando coerência nas explicações.', 1.0, 2),
  (6, 6, 'Metodologia e desenvolvimento', 'Clareza dos procedimentos, organização das etapas e execução dos experimentos ou pesquisas desenvolvidas.', 1.0, 3),
  (7, 7, 'Trabalho em equipe', 'Cooperação, divisão das responsabilidades, envolvimento e participação dos integrantes.', 1.0, null),
  (8, 8, 'Relevância do tema', 'Importância do projeto para a ciência, a sociedade, o meio ambiente ou a resolução de problemas cotidianos.', 1.0, null),
  (9, 9, 'Resultados e conclusões', 'Apresentação dos resultados, interpretação das informações e elaboração de conclusões coerentes.', 1.0, null),
  (10, 10, 'Capacidade de responder às perguntas', 'Segurança, argumentação e conhecimento demonstrados ao responder aos questionamentos dos avaliadores.', 1.0, null)
on conflict (id) do update set
  order_num = excluded.order_num,
  name = excluded.name,
  description = excluded.description,
  tie_breaker_order = excluded.tie_breaker_order;

-- Inserir Configuração Padrão se vazia
insert into public.fair_settings (name, edition, date, location, description, is_active)
select 
  'AvaliaFeira – Feira de Ciências e Tecnologia',
  'Edição 2026',
  '25 e 26 de Novembro de 2026',
  'Ginásio Poliesportivo Central',
  'Sistema Oficial de Avaliação e Julgamento de Projetos Científicos',
  true
where not exists (select 1 from public.fair_settings);

-- Inserir Projetos de Exemplo Iniciais (se vazio)
insert into public.projects (code, title, category, members, advisor, stand)
select * from (values
  ('PROJ-01', 'Biofiltro de Baixo Custo Utilizando Fibras de Coco para Purificação de Água', 'Sustentabilidade e Meio Ambiente', 'Lucas Andrade, Beatriz Costa e Marcelo Vieira (3º Ano A)', 'Profa. Dra. Mariana Fernandes', 'Estande A-01'),
  ('PROJ-02', 'Braço Robótico Articulado com Impressão 3D e Controle por Visão Computacional', 'Robótica e Inteligência Artificial', 'Gabriel Santos, Enzo Carvalho e Júlia Moura (2º Ano B)', 'Prof. Carlos Eduardo Silveira', 'Estande B-04'),
  ('PROJ-03', 'Produção de Bioplástico Biodegradável a partir de Cascas de Mandioca', 'Química e Biologia Aplicada', 'Camila Ribeiro, Thiago Mendonça e Larissa Lima (3º Ano C)', 'Profa. Helena Prado', 'Estande A-02'),
  ('PROJ-04', 'Aplicativo Móvel Acessível para Tradução de Libras em Tempo Real', 'Tecnologia da Informação e Inclusão', 'Mateus Pinheiro, Sofia Albuquerque e Pedro Rocha (1º Ano A)', 'Prof. Rafael Albuquerque', 'Estande C-01'),
  ('PROJ-05', 'Geração de Energia Elétrica Limpa através de Células de Combustível Microbianas', 'Energias Renováveis e Física', 'Ana Clara Souza, Felipe Ramos e Natália Torres (2º Ano A)', 'Prof. Dr. Vinicius Gomes', 'Estande B-02')
) as p(code, title, category, members, advisor, stand)
where not exists (select 1 from public.projects);

-- Inserir Avaliadores Iniciais (se vazio)
insert into public.evaluators (code, name)
select * from (values
  ('101', 'Dra. Renata Vasconcelos'),
  ('102', 'Prof. André Valente'),
  ('103', 'Profa. Camila Guimarães'),
  ('104', null),
  ('105', null)
) as e(code, name)
where not exists (select 1 from public.evaluators);

-- Inserir Escala Inicial de Avaliadores para os Projetos (se vazio)
insert into public.project_evaluators (project_id, evaluator_code)
select p.id, e.code
from public.projects p
cross join (values ('101'), ('102')) as e(code)
where p.code = 'PROJ-01'
  and not exists (select 1 from public.project_evaluators where evaluator_code = '101' and project_id = p.id);

insert into public.project_evaluators (project_id, evaluator_code)
select p.id, e.code
from public.projects p
cross join (values ('102'), ('103')) as e(code)
where p.code = 'PROJ-02'
  and not exists (select 1 from public.project_evaluators where evaluator_code = '102' and project_id = p.id);

insert into public.project_evaluators (project_id, evaluator_code)
select p.id, e.code
from public.projects p
cross join (values ('101'), ('103')) as e(code)
where p.code = 'PROJ-03'
  and not exists (select 1 from public.project_evaluators where evaluator_code = '101' and project_id = p.id);

-- ==============================================================================
-- SEGURANÇA: ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.admin_users enable row level security;
alter table public.fair_settings enable row level security;
alter table public.criteria enable row level security;
alter table public.projects enable row level security;
alter table public.evaluators enable row level security;
alter table public.project_evaluators enable row level security;
alter table public.evaluations enable row level security;

-- Funções Auxiliares de Autenticação Admin
create or replace function public.is_admin()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
end;
$$ language plpgsql;

-- Políticas para admin_users:
drop policy if exists "Admins can view admin_users" on public.admin_users;
create policy "Admins can view admin_users" on public.admin_users
  for select using (auth.uid() = user_id or public.is_admin());

-- Políticas para fair_settings:
drop policy if exists "Public can view settings" on public.fair_settings;
create policy "Public can view settings" on public.fair_settings
  for select using (true);

drop policy if exists "Admins can update settings" on public.fair_settings;
create policy "Admins can update settings" on public.fair_settings
  for all using (public.is_admin());

-- Políticas para criteria:
drop policy if exists "Public can view criteria" on public.criteria;
create policy "Public can view criteria" on public.criteria
  for select using (true);

drop policy if exists "Admins can manage criteria" on public.criteria;
create policy "Admins can manage criteria" on public.criteria
  for all using (public.is_admin());

-- Políticas para projects:
drop policy if exists "Public can view projects" on public.projects;
create policy "Public can view projects" on public.projects
  for select using (true);

drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects" on public.projects
  for all using (public.is_admin());

-- Políticas para evaluators:
drop policy if exists "Public can view evaluators" on public.evaluators;
create policy "Public can view evaluators" on public.evaluators
  for select using (true);

drop policy if exists "Public and admins can manage evaluators" on public.evaluators;
create policy "Public and admins can manage evaluators" on public.evaluators
  for all using (true);

-- Políticas para project_evaluators:
drop policy if exists "Public can view project_evaluators" on public.project_evaluators;
create policy "Public can view project_evaluators" on public.project_evaluators
  for select using (true);

drop policy if exists "Public and admins can manage project_evaluators" on public.project_evaluators;
create policy "Public and admins can manage project_evaluators" on public.project_evaluators
  for all using (true);

-- Políticas para evaluations:
-- 1. Qualquer pessoa (avaliador) pode inserir sua própria avaliação
drop policy if exists "Evaluators can submit evaluations" on public.evaluations;
create policy "Evaluators can submit evaluations" on public.evaluations
  for insert with check (evaluator_name is not null and length(trim(evaluator_name)) > 0);

-- 2. Qualquer avaliador pode atualizar sua própria avaliação para aquele projeto
drop policy if exists "Evaluators can update own evaluation" on public.evaluations;
create policy "Evaluators can update own evaluation" on public.evaluations
  for update using (evaluator_name is not null and length(trim(evaluator_name)) > 0);

-- 3. Leitura pública de avaliações (necessário para calcular ranking e marcar avaliado por você)
drop policy if exists "Evaluations select policy" on public.evaluations;
create policy "Evaluations select policy" on public.evaluations
  for select using (true);

-- 4. Exclusão restrita apenas para administradores
drop policy if exists "Admins can delete evaluations" on public.evaluations;
create policy "Admins can delete evaluations" on public.evaluations
  for delete using (public.is_admin());

-- ==============================================================================
-- HABILITAR SUPABASE REALTIME
-- ==============================================================================
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table 
    public.evaluations, 
    public.projects, 
    public.fair_settings,
    public.evaluators,
    public.project_evaluators;
commit;
