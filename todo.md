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

- [ ] Instalar e configurar Prisma com PostgreSQL
- [ ] Criar schema: `User`
- [ ] Criar schema: `Client`
- [ ] Criar schema: `Board`
- [ ] Criar schema: `Column`
- [ ] Criar schema: `Card` (com todos os campos do briefing)
- [ ] Criar schema: `ActivityLog`
- [ ] Rodar primeira migration
- [ ] Seed com dados de exemplo para desenvolvimento

---

## Etapa 3 — Backend: API REST

- [ ] API CRUD: `/api/clients`
- [ ] API CRUD: `/api/boards`
- [ ] API CRUD: `/api/columns`
- [ ] API CRUD: `/api/cards`
- [ ] API: mover card entre colunas (`PATCH /api/cards/:id/move`)
- [ ] API: reordenar cards dentro da coluna
- [ ] API: listar activity log por board
- [ ] Validação de inputs em todas as rotas
- [ ] Controle de acesso por usuário em todas as rotas

---

## Etapa 4 — Autenticação e Sistema de Login

- [ ] Configurar NextAuth.js com provider de credenciais (e-mail + senha)
- [ ] Hash de senha com bcrypt no cadastro/seed de usuários
- [ ] Tela de login (`/login`) com formulário validado
- [ ] Redirecionamento automático para `/` após login bem-sucedido
- [ ] Redirecionamento para `/login` ao acessar rota protegida sem sessão
- [ ] Middleware global de autenticação (`middleware.ts` no root)
- [ ] Sessão persistente via JWT (token seguro, expiração configurável)
- [ ] Hook `useAuthenticatedUser` para acesso ao usuário logado
- [ ] Logout com limpeza de sessão
- [ ] Proteção de todas as rotas de API (`/api/*`) por sessão válida

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
