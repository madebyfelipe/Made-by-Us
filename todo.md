# TODO.md — Made by Felipe | Roadmap de Desenvolvimento

> Sempre verifique este arquivo antes de iniciar qualquer etapa.
> Marque como `[x]` ao concluir. Só avance se a etapa anterior estiver completa.

---

## Etapa 1 — Setup do Projeto

- [x] Inicializar projeto Next.js com App Router e TypeScript
- [x] Configurar TailwindCSS
- [x] Configurar ESLint e Prettier com regras rígidas
- [x] Criar estrutura de pastas (`/app`, `/components`, `/modules`, `/services`, `/hooks`, `/types`, `/utils`)
- [x] Configurar variáveis de ambiente (`.env.local`)
- [x] Commitar setup inicial limpo

---

## Etapa 2 — Modelagem de Dados (Prisma)

- [x] Instalar e configurar Prisma com PostgreSQL
- [x] Criar schema: `User`
- [x] Criar schema: `Client`
- [x] Criar schema: `Board`
- [x] Criar schema: `Column`
- [x] Criar schema: `Card` (com todos os campos do briefing)
- [x] Criar schema: `ActivityLog`
- [x] Rodar primeira migration
- [x] Seed com dados de exemplo para desenvolvimento

---

## Etapa 3 — Backend: API REST

- [x] API CRUD: `/api/clients`
- [x] API CRUD: `/api/boards`
- [x] API CRUD: `/api/columns`
- [x] API CRUD: `/api/cards`
- [x] API: mover card entre colunas (`PATCH /api/cards/:id/move`)
- [x] API: reordenar cards dentro da coluna
- [x] API: listar activity log por board
- [x] Validação de inputs em todas as rotas
- [x] Controle de acesso por usuário em todas as rotas (desbloqueado com Etapa 4)

---

## Etapa 4 — Autenticação e Sistema de Login

- [x] Configurar NextAuth.js com provider de credenciais (e-mail + senha)
- [x] Hash de senha com bcrypt no cadastro/seed de usuários
- [x] Tela de login (`/login`) com formulário validado
- [x] Redirecionamento automático para `/` após login bem-sucedido
- [x] Redirecionamento para `/login` ao acessar rota protegida sem sessão
- [x] Middleware global de autenticação (`proxy.ts` no root)
- [x] Sessão persistente via JWT (token seguro, expiração configurável)
- [x] Hook `useAuthenticatedUser` para acesso ao usuário logado
- [x] Logout com limpeza de sessão
- [x] Proteção de todas as rotas de API (`/api/*`) por sessão válida
- [x] Campo `role` no model `User` com valores `OWNER` e `MEMBER`
- [x] Seed do usuário dono com `role: OWNER` (único cadastro inicial)
- [x] Tela de cadastro de usuários (`/admin/users/new`) acessível somente para `role: OWNER`
- [x] API `POST /api/admin/users` protegida por verificação de `role: OWNER`
- [x] Middleware de autorização: rota `/admin/*` bloqueada para `role: MEMBER`
- [x] Nenhuma rota pública de cadastro — registro só via painel admin do dono

---

## Etapa 5 — Kanban (Core do sistema)

- [x] Instalar e configurar dnd-kit
- [x] Componente `KanbanBoard` (container das colunas)
- [x] Componente `KanbanColumn` (lista de cards)
- [x] Componente `KanbanCard` (card arrastável)
- [x] Drag and drop entre colunas com reordenação
- [x] Atualização otimista no frontend ao mover card
- [x] Persistência imediata no banco ao soltar card
- [x] Rollback em caso de erro na API

---

## Etapa 6 — Gestão de Cards (Briefing)

- [x] Modal de criação de card com todos os campos
- [x] Modal de edição de card
- [x] Seleção de responsável (`assignedUserId`)
- [x] Campo de link Google Drive (`driveLink`)
- [x] Seleção de prioridade (`Priority`)
- [x] Seleção de status (`CardStatus`)
- [x] Exclusão de card com confirmação

---

## Etapa 7 — Perfil de Cliente

- [x] Listagem de clientes
- [x] Tela de criação/edição de cliente
- [x] Campo `customHtml` com editor simples
- [x] Renderização isolada e sanitizada do HTML customizado
- [x] Associação de boards ao cliente

---

## Etapa 8 — Activity Log

- [x] Registrar log ao criar card
- [x] Registrar log ao mover card
- [x] Registrar log ao editar card
- [x] Registrar log ao atribuir responsável
- [x] Componente de visualização do log por board

---

## Etapa 9 — Performance e UX

- [x] Memoização de componentes pesados (`React.memo`, `useMemo`, `useCallback`)
- [x] Lazy loading de módulos secundários
- [x] Skeleton loading nas listagens
- [x] Feedback visual imediato em todas as ações
- [x] Evitar re-renders desnecessários (revisar com React DevTools)

---

## Etapa 10 — Segurança

- [x] Sanitização de HTML do perfil de cliente (DOMPurify)
- [x] Validação de inputs no backend (Zod)
- [x] Controle de acesso verificado em todas as rotas de API
- [x] Revisão de exposição de dados sensíveis na API

---

## Etapa 11 — Deploy

- [ ] Configurar projeto na Vercel
- [ ] Configurar banco PostgreSQL (Supabase ou Railway)
- [ ] Configurar variáveis de ambiente em produção
- [ ] Rodar migrations em produção
- [ ] Smoke test pós-deploy (login, criar card, mover card)

---

## Etapa 12 — PRIORIDADE 1: Densidade Visual e Feedback Global

> Foco: o sistema deve parecer "vivo" e comunicar informação sem clique.

- [x] **Client Cards — densidade de informação**
  - [x] Exibir total de tarefas abertas no card do cliente
  - [x] Exibir tarefas atrasadas com destaque visual (deadline badge vermelho no KanbanCard)
  - [x] Exibir data da última atividade
  - [x] Exibir responsável principal
- [x] **Feedback visual global**
  - [x] Hover states em todos os elementos interativos
  - [x] Animações leves (150ms) em transições de estado
  - [ ] Skeleton loading para evitar tela vazia
  - [x] Feedback imediato ao clicar (hover bg + border)
- [x] **Status visível sem abrir card**
  - [x] Exibir prioridade no card Kanban
  - [x] Exibir status no card Kanban (dot colorido + label)
  - [x] Exibir responsável (iniciais em avatar) no card Kanban
  - [x] Exibir deadline no card Kanban (DeadlineBadge com alerta de atraso)
- [x] **Sistema de cores funcional**
  - [x] Verde → concluído (DONE)
  - [x] Amarelo → em andamento (IN_PROGRESS)
  - [x] Vermelho → urgente / alta prioridade
  - [x] Azul → em revisão (IN_REVIEW)
  - [x] Padronizar uso em badges, bordas e indicadores

---

## Etapa 13 — PRIORIDADE 2: Formulário de Card (Campos Operacionais)

> Foco: o card deve capturar contexto real de produção de conteúdo.

- [x] **Novos campos no model `Card` (Prisma + migration)**
  - [x] `contentType`: `POST | STORY | REELS | CAROUSEL | ADS`
  - [x] `platform`: string comma-separated (instagram, linkedin, tiktok, youtube)
  - [x] `effort`: `LOW | MEDIUM | HIGH`
  - [x] `stage`: `ROTEIRO | DESIGN | EDICAO | REVISAO | APROVACAO`
  - [x] `deadline`: DateTime
  - [x] `cta`: String (call to action)
- [x] **Separar `status` de `stage`**
  - [x] `status` → estado geral (TODO | IN_PROGRESS | IN_REVIEW | DONE)
  - [x] `stage` → etapa de produção (campo separado)
  - [x] Atualizar APIs afetadas
  - [x] Atualizar componentes afetados
- [x] **Reestruturar layout do formulário** com ordem e agrupamento
- [x] **Agrupar campos por contexto** (blocos visuais)
  - [x] Identificação (título, tipo, plataforma)
  - [x] Execução (responsável, deadline, prioridade, status, esforço, etapa)
  - [x] Estratégia (objetivo, CTA, direção criativa)
  - [x] Referências (referências, link Drive)
- [x] **Converter inputs livres para selects/chips**
  - [x] `contentType` → chips
  - [x] `platform` → chips multi-select
  - [x] `priority` → select
  - [x] `effort` → select
  - [x] `stage` → chips

---

## Etapa 14 — PRIORIDADE 3: Formulário de Cliente (Campos Estratégicos)

> Foco: cliente deve carregar contexto suficiente para guiar a produção.

- [x] **Novos campos no model `Client` (Prisma + migration)**
  - [x] `niche`: String
  - [x] `toneOfVoice`: String
  - [x] `mainObjective`: String
  - [x] `platforms`: String (comma-separated)
  - [x] `contentFrequency`: String
  - [x] `targetAudience`: String
  - [x] `restrictions`: String
  - [x] `differentials`: String
  - [x] `operationalGuidelines`: String
- [x] Atualizar tela de criação/edição de cliente com novos campos
- [x] Agrupar campos por contexto (Identidade, Estratégia, Operacional)
- [x] **Melhorar HTML customizado**
  - [x] Garantir sanitização com DOMPurify antes de salvar
  - [x] Renderizar em iframe ou sandbox isolado
  - [x] Validar que HTML não quebra layout global (fundo branco forçado no iframe)

---

## Etapa 15 — PRIORIDADE 4: Escaneabilidade e Contexto

> Foco: usuário entende o estado do sistema em 1 segundo.

- [x] **Leitura rápida**
  - [x] Ajustar contraste de textos secundários
  - [x] Animações leves 150ms em transições de estado
  - [x] Ícones e badges visíveis no card Kanban (contentType, platform, deadline, assignee)
- [x] **Breadcrumb contextual**
  - [x] Implementar `Cliente > Board` no header do board
- [x] **Header do board**
  - [x] Exibir nome do cliente
  - [x] Exibir descrição curta do cliente
  - [x] Botão rápido "Ver cliente" no header

---

## Etapa 16 — PRIORIDADE 5: Interação e Fluxo

> Foco: menos cliques, mais velocidade operacional.

- [x] **Kanban UX**
  - [x] Animação suave no drag (rotate-1 scale-105 shadow-2xl no overlay)
  - [x] Highlight da coluna de destino ativa durante drag (bg + ring accent)
  - [x] Sombra elevada no card sendo arrastado
- [x] **Quick actions**
  - [x] Botão rápido: ver perfil do cliente a partir do board
  - [x] Botão rápido: novo card dentro da coluna (empty state + botão abaixo)
  - [x] BoardManager: criar, renomear e excluir boards direto na tela do cliente
- [x] **Criação rápida via texto**
  - [x] Modal "Criar via texto" com textarea de template
  - [x] Parser de template com todos os campos do card
  - [x] Suporte a múltiplos cards separados por `---`
  - [x] Tela de revisão antes de confirmar criação em lote

---

## Etapa 17 — PRIORIDADE 6: Estados Vazios

> Foco: nenhuma tela vazia sem contexto ou ação.

- [x] Empty state na listagem de clientes (sem clientes) — CTA "Criar primeiro cliente"
- [x] Empty state no dashboard (sem boards) — link para clientes
- [x] Empty state na coluna sem cards — botão dashed "+ Novo card"
- [x] Empty state no activity log — mensagem "Nenhuma atividade registrada"
- [x] Cada empty state tem: mensagem clara + CTA direto

---

## Etapa 18 — PRIORIDADE 7: Atalhos de Teclado (Opcional)

> Foco: velocidade para usuários avançados.

- [ ] `N` → novo card (no board ativo)
- [ ] `/` → abrir busca global
- [ ] `G` + `C` → navegar para clientes

---

## Etapa 19 — Navegação Global (Header)

> Foco: interface unificada com acesso rápido a todos os módulos.

- [ ] Componente `AppHeader` (fixed top, z-50)
  - [ ] Logo com link para `/`
  - [ ] Links de navegação: Jobs (`/jobs`), Clientes (`/clients`)
  - [ ] `NotificationBell` no canto direito
  - [ ] `UserAvatarMenu` no canto direito
- [ ] Integrar em `app/layout.tsx` (visível em todas as rotas exceto `/login`)
- [ ] Adicionar `pt-12` ao wrapper de conteúdo para compensar header fixo
- [ ] Remover headers isolados das páginas existentes (dashboard, clientes, perfil)

---

## Etapa 20 — Tela de Jobs (Lista de Cards)

> Foco: visão operacional de todos os cards como lista plana.

- [ ] Página `/jobs` (server component)
- [ ] Componente `JobsTable` (client — com filtro toggle)
  - [ ] Filtro: "Minha Pauta" (atribuídos ao usuário) / "Todos" (OWNER)
  - [ ] Colunas: título + coluna, prazo (colorido por urgência), cliente + board, tipo de conteúdo, status
  - [ ] Deadline colorido: vermelho (atrasado), âmbar (≤3 dias), muted (futuro)
  - [ ] Link no título para abrir o card no Kanban

---

## Etapa 21 — Notificações

> Foco: alertas de cards atribuídos ao usuário logado.

- [ ] API `GET /api/notifications`
  - [ ] Retorna cards onde `assignedUserId === session.user.id`
  - [ ] Include: título, coluna, cliente, deadline, status
  - [ ] Ordenado por `updatedAt desc`, limite 20
- [ ] Componente `NotificationBell`
  - [ ] Ícone de sino com badge de contagem (cards não-DONE)
  - [ ] Dropdown ao clicar com lista de cards
  - [ ] Fetch client-side ao abrir

---

## Etapa 22 — Avatar e Menu do Usuário

> Foco: acesso rápido ao perfil e ações do usuário.

- [ ] Componente `UserAvatarMenu`
  - [ ] Círculo com inicial do nome (`bg-[#BC0319]`)
  - [ ] Dropdown: Configurações → `/settings`, Sair → `signOut()`
  - [ ] Fechar ao clicar fora (click-outside)

---

## Etapa 23 — Tela de Configurações

> Foco: gestão de conta e preferências do usuário.

- [ ] Página `/settings`
  - [ ] Seção **Conta**: nome, e-mail, role (read-only)
  - [ ] Seção **Senha**: troca de senha com validação da senha atual
  - [ ] Seção **Aparência**: toggle tema claro/escuro
- [ ] API `POST /api/user/password`
  - [ ] Validar sessão
  - [ ] Verificar senha atual com bcrypt
  - [ ] Hash da nova senha e salvar

---

## Etapa 24 — Sistema de Temas (Claro/Escuro)

> Foco: conforto visual e preferência do usuário.

- [ ] Adicionar CSS custom properties em `globals.css` (tokens de CLAUDE.md §20)
  - [ ] `[data-theme="dark"]` (padrão atual)
  - [ ] `[data-theme="light"]` (novo)
- [ ] Persistência via `localStorage` + `document.documentElement.dataset.theme`
- [ ] Aplicar na inicialização via `app/providers.tsx`

---

## Etapa 25 — Perfil Estratégico do Cliente

> Foco: contexto do cliente visível sem entrar no modo de edição.

- [ ] Adicionar seção "Perfil Estratégico" em `/clients/[id]`
  - [ ] Campos: nicho, tom de voz, frequência, objetivo, público-alvo, restrições, diferenciais, diretrizes
  - [ ] Renderizar apenas se ao menos um campo estiver preenchido
  - [ ] Layout em grid com leitura clara

---

## Legenda

| Símbolo | Significado       |
|---------|-------------------|
| `[ ]`   | Pendente          |
| `[x]`   | Concluído         |
| `[~]`   | Em progresso      |
| `[!]`   | Bloqueado         |
