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
- [!] Controle de acesso por usuário em todas as rotas (bloqueado — depende da Etapa 4)

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

- [ ] Instalar e configurar dnd-kit
- [ ] Componente `KanbanBoard` (container das colunas)
- [ ] Componente `KanbanColumn` (lista de cards)
- [ ] Componente `KanbanCard` (card arrastável)
- [ ] Drag and drop entre colunas com reordenação
- [ ] Atualização otimista no frontend ao mover card
- [ ] Persistência imediata no banco ao soltar card
- [ ] Rollback em caso de erro na API

---

## Etapa 6 — Gestão de Cards (Briefing)

- [ ] Modal de criação de card com todos os campos
- [ ] Modal de edição de card
- [ ] Seleção de responsável (`assignedUserId`)
- [ ] Campo de link Google Drive (`driveLink`)
- [ ] Seleção de prioridade (`Priority`)
- [ ] Seleção de status (`CardStatus`)
- [ ] Exclusão de card com confirmação

---

## Etapa 7 — Perfil de Cliente

- [ ] Listagem de clientes
- [ ] Tela de criação/edição de cliente
- [ ] Campo `customHtml` com editor simples
- [ ] Renderização isolada e sanitizada do HTML customizado
- [ ] Associação de boards ao cliente

---

## Etapa 8 — Activity Log

- [ ] Registrar log ao criar card
- [ ] Registrar log ao mover card
- [ ] Registrar log ao editar card
- [ ] Registrar log ao atribuir responsável
- [ ] Componente de visualização do log por board

---

## Etapa 9 — Performance e UX

- [ ] Memoização de componentes pesados (`React.memo`, `useMemo`, `useCallback`)
- [ ] Lazy loading de módulos secundários
- [ ] Skeleton loading nas listagens
- [ ] Feedback visual imediato em todas as ações
- [ ] Evitar re-renders desnecessários (revisar com React DevTools)

---

## Etapa 10 — Segurança

- [ ] Sanitização de HTML do perfil de cliente (ex: DOMPurify)
- [ ] Validação de inputs no backend (ex: Zod)
- [ ] Controle de acesso verificado em todas as rotas de API
- [ ] Revisão de exposição de dados sensíveis na API

---

## Etapa 11 — Deploy

- [ ] Configurar projeto na Vercel
- [ ] Configurar banco PostgreSQL (Supabase ou Railway)
- [ ] Configurar variáveis de ambiente em produção
- [ ] Rodar migrations em produção
- [ ] Smoke test pós-deploy (login, criar card, mover card)

---

## Legenda

| Símbolo | Significado       |
|---------|-------------------|
| `[ ]`   | Pendente          |
| `[x]`   | Concluído         |
| `[~]`   | Em progresso      |
| `[!]`   | Bloqueado         |
