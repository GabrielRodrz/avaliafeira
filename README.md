# AvaliaFeira – Sistema de Avaliação de Feira de Ciências

> Sistema web completo, responsivo e em tempo real para avaliação e julgamento de feiras de ciências escolares e acadêmicas, desenvolvido com **Next.js (App Router)**, **Tailwind CSS** e **Supabase**.

---

## 🌟 Principais Funcionalidades

### 1. Área do Avaliador (Mobile-First / Sem Senha) — `/avaliar`
- **Acesso Ágil Sem Senha:** O jurado apenas informa seu **Nome Completo** na primeira utilização (armazenado automaticamente no `localStorage` do dispositivo).
- **Lista de Projetos:** Busca dinâmica por código (ex: `PROJ-01`), título, estande, aluno ou professor orientador, com filtros por categoria.
- **Selo Verde *"Avaliado por você"*:** Destaque visual imediato nos projetos em que o jurado já enviou nota.
- **Edição da Própria Avaliação:** O jurado pode reabrir e ajustar as notas que ele mesmo atribuiu, mantendo total privacidade (ele não visualiza nem altera as notas dos outros jurados).
- **Escala de Pontuação Estrita (Apenas Notas Pares):**
  - **Grade tátil 3x2 com 6 botões grandes** por critério:
    - **`0 pts` – Não atendeu:** Não demonstrou os aspectos avaliados.
    - **`2 pts` – Insuficiente:** Apresentou muitas dificuldades e pouco domínio.
    - **`4 pts` – Regular:** Atendeu parcialmente ao critério, com limitações.
    - **`6 pts` – Satisfatório:** Atendeu aos aspectos básicos do critério.
    - **`8 pts` – Bom:** Demonstrou bom desempenho e conhecimento.
    - **`10 pts` – Excelente:** Demonstrou domínio, segurança e excelente desempenho.
- **Barra Fixa Inferior:** Acompanhamento do progresso em tempo real (`X/10 critérios preenchidos`), pontuação parcial acumulada (`0 a 100 pontos`) e botão de envio com validação de preenchimento completo.
- **Observações do Avaliador:** Campo opcional para considerações e justificativas.

---

### 2. Painel Administrativo (Desktop-First) — `/admin`
- **Login por Nome de Usuário e Senha (sem exigir e-mail visível):**
  - Entrada com campos **Usuário** (ex: `gabriel.rodrigues`) e **Senha**, com botão para mostrar/ocultar senha.
  - Normalização automática interna para `${username.trim().toLowerCase()}@avaliafeira.local`.
- **Auto-Provisionamento do Admin Padrão (`gabriel.rodrigues`):**
  - Ao carregar a tela administrativa, a rota `/api/setup` garante que o administrador padrão exista no Supabase Auth e na tabela `admin_users`:
    - **Usuário:** `gabriel.rodrigues`
    - **Senha padrão:** `Gabri0708.#` (configurável via `DEFAULT_ADMIN_PASSWORD`)
    - **Permissão:** `is_master = true` (blindado contra exclusão).
- **Pódio & Classificação Geral em Tempo Real:**
  - Pódio dos 3 primeiros colocados (Ouro, Prata e Bronze) com atualização instantânea via **Supabase Realtime**.
  - Tabela ranqueada completa com filtro por categoria, contagem de jurados por projeto, médias de cada um dos 10 critérios e soma final (0.00 a 100.00).
  - Modal de **Inspeção de Fichas:** Auditoria de todas as avaliações individuais de cada jurado (notas por critério e observações registradas).
- **Fórmula de Desempate Automático Oficial:**
  - Em caso de empate na pontuação final, o sistema desempata na ordem oficial:
    1. Maior média em **Domínio do conteúdo** (Critério 1)
    2. Maior média em **Fundamentação científica** (Critério 5)
    3. Maior média em **Metodologia e desenvolvimento** (Critério 6)
    4. Maior média em **Criatividade e originalidade** (Critério 2)
  - Persistindo o empate, exibe o alerta: `"Empate Técnico – Avaliação Complementar"`.
- **Gestão de Projetos (CRUD Completo):**
  - Cadastro, edição e exclusão de projetos com Código/Estande, Título, Categoria, Integrantes/Turma e Orientador.
- **Gestão de Administradores (`/api/admin/users`):**
  - Cadastro de novos administradores com apenas Nome Completo, Nome de Usuário e Senha.
  - Opção para alterar a própria senha dentro do painel.
  - Exclusão permitida apenas para administradores secundários (`is_master = false`), protegendo o administrador master.
- **Configurações, QR Code & Compartilhamento:**
  - Gerador de **QR Code** integrado apontando para a área do avaliador (`/avaliar`), com download de imagem e cópia de link.
  - **Exportar Relatório CSV:** Planilha completa compatível com Excel contendo classificação, médias e dados dos projetos.
  - **Imprimir Classificação Oficial:** Documento institucional formatado para papel A4 com ata de homologação e campos para assinaturas da coordenação.

---

## 📐 Os 10 Critérios Oficiais

| Nº | Critério | Descrição | Desempate |
| :---: | :--- | :--- | :---: |
| **1** | **Domínio do conteúdo** | Conhecimento e compreensão do tema apresentado, segurança nas explicações e capacidade de demonstrar o aprendizado adquirido. | **1º** |
| **2** | **Criatividade e originalidade** | Inovação e criatividade na elaboração do projeto, originalidade das ideias e utilização de recursos diferenciados. | **4º** |
| **3** | **Organização do projeto** | Organização do espaço, disposição dos materiais, qualidade dos cartazes, maquetes e recursos visuais utilizados. | - |
| **4** | **Clareza na comunicação** | Linguagem adequada, objetividade, postura e desenvoltura dos estudantes durante a apresentação. | - |
| **5** | **Fundamentação científica** | Utilização correta de conceitos, teorias e informações científicas, demonstrando coerência nas explicações. | **2º** |
| **6** | **Metodologia e desenvolvimento** | Clareza dos procedimentos, organização das etapas e execução dos experimentos ou pesquisas desenvolvidas. | **3º** |
| **7** | **Trabalho em equipe** | Cooperação, divisão das responsabilidades, envolvimento e participação dos integrantes. | - |
| **8** | **Relevância do tema** | Importância do projeto para a ciência, a sociedade, o meio ambiente ou a resolução de problemas cotidianos. | - |
| **9** | **Resultados e conclusões** | Apresentação dos resultados, interpretação das informações e elaboração de conclusões coerentes. | - |
| **10** | **Capacidade de responder às perguntas** | Segurança, argumentação e conhecimento demonstrados ao responder aos questionamentos dos avaliadores. | - |

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

O script SQL completo está disponível em [`supabase/schema.sql`](file:///Users/disco01/Projetos/Formulário%20de%20Avaliação/supabase/schema.sql).

### Tabelas Criadas:
1. `admin_users`: Registros dos administradores com vínculo ao `auth.users`, login por nome de usuário e flag `is_master`.
2. `fair_settings`: Configurações da feira (nome, edição, data, local).
3. `criteria`: Os 10 critérios oficiais pré-cadastrados com a ordem de desempate.
4. `projects`: Projetos da feira (código, título, categoria, integrantes, orientador, estande).
5. `evaluations`: Notas lançadas pelos avaliadores com restrição de unicidade por projeto e jurado (`project_id, evaluator_name`).

### Segurança (Row Level Security - RLS):
- Avaliadores podem submeter e atualizar suas próprias notas.
- Administradores autenticados e cadastrados em `admin_users` possuem acesso total à gestão de projetos e relatórios.
- **Supabase Realtime** habilitado na tabela `evaluations` para transmissão ao vivo das notas para o pódio.

---

## 🚀 Como Executar Localmente

### 1. Clonar o repositório e instalar dependências:
```bash
git clone <url-do-repositorio>
cd avaliafeira
npm install
```

### 2. Configurar o Supabase:
1. Crie um projeto gratuito no [Supabase](https://supabase.com).
2. Acesse o **SQL Editor** no painel do Supabase.
3. Copie todo o conteúdo do arquivo [`supabase/schema.sql`](file:///Users/disco01/Projetos/Formulário%20de%20Avaliação/supabase/schema.sql) e clique em **Run**.
4. Acesse **Project Settings > API** e obtenha as chaves:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

### 3. Configurar as Variáveis de Ambiente:
Crie ou edite o arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui
DEFAULT_ADMIN_PASSWORD=Gabri0708.#
```

> **Nota:** Caso execute sem preencher as chaves do Supabase, o sistema entra automaticamente no **Modo Demonstração / Local**, permitindo avaliar, testar o pódio e experimentar todas as telas imediatamente com dados em memória e `localStorage`.

### 4. Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse:
- **Página Inicial:** [http://localhost:3000](http://localhost:3000)
- **Área do Avaliador:** [http://localhost:3000/avaliar](http://localhost:3000/avaliar)
- **Painel Administrativo:** [http://localhost:3000/admin](http://localhost:3000/admin)
  - **Usuário:** `gabriel.rodrigues`
  - **Senha:** `Gabri0708.`

---

## ☁️ Deploy Gratuito na Vercel

1. Suba o código para o seu repositório GitHub ou GitLab.
2. Acesse [vercel.com](https://vercel.com) e importe o projeto.
3. Na seção **Environment Variables**, adicione as 3 variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - *(Opcional)* `DEFAULT_ADMIN_PASSWORD=Gabri0708.#`
4. Clique em **Deploy**.
5. Ao abrir `/admin` pela primeira vez, o sistema executa o provisionamento silencioso e o usuário `gabriel.rodrigues` estará pronto para logar!

---

## 📄 Licença
Distribuído sob a licença MIT. Pronto para produção e uso escolar/acadêmico.
