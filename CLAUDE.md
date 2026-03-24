# CLAUDE.md — Made by Felipe Internal System

## 1. Contexto do Projeto

Este projeto consiste em uma ferramenta interna de gestão de produção de conteúdo, baseada em Kanban, utilizada pela Made by Felipe.

O sistema deve permitir:

- Gestão de tarefas por cliente
- Visualização de workflow (Kanban)
- Organização de briefings
- Atribuição de responsáveis
- Controle de status
- Integração via links externos (Google Drive)
- Perfis de cliente com HTML customizado

> Este sistema é interno, não público.
> Prioridade: performance, clareza e usabilidade operacional.

---

## 2. Princípio Absoluto

**Clean Code não é desejável. É obrigatório.**

Qualquer código gerado deve seguir:

- Legibilidade extrema
- Simplicidade
- Baixo acoplamento
- Alta coesão
- Nomes descritivos (sem abreviações vagas)
- Funções pequenas (máx ~20 linhas)
- Sem "gambiarras"

Se houver conflito entre velocidade e qualidade:
**Escolha qualidade estrutural.**

---

## 3. Stack Tecnológica

### Frontend

- React (Next.js - App Router)
- TypeScript
- TailwindCSS
- dnd-kit (drag and drop)
- React Query (data fetching e cache)
- Zod (validação de schemas)
- NextAuth.js (autenticação)
- DOMPurify (sanitização de HTML)

### Backend

- Node.js
- Prisma ORM
- PostgreSQL

### Infra

- Vercel (frontend)
- Supabase ou Railway (backend + DB)

---

## 4. Arquitetura

### Estrutura de pastas (frontend)

```
/app
/components
/modules
  /kanban
  /cards
  /clients
  /auth
  /activity
  /jobs
  /settings
  /users
/services
/hooks
/types
/utils
```

### Regras de arquitetura

- Separar UI de lógica
- Separar domínio por módulo
- Evitar arquivos genéricos gigantes
- Cada módulo deve ser isolado

---

## 5. Modelagem de Dados (Prisma)

### Entidades principais

- `User` — campos: `id`, `name`, `email`, `password`, `role`, `isActive`, `createdAt`
- `Client` — campos: `id`, `name`, `description`, `niche`, `toneOfVoice`, `mainObjective`, `platforms`, `contentFrequency`, `targetAudience`, `restrictions`, `differentials`, `operationalGuidelines`, `customHtml`, `createdAt`, `updatedAt`
- `Board` — campos: `id`, `name`, `clientId`, `createdAt`, `updatedAt`
- `Column` — campos: `id`, `name`, `order`, `boardId`, `createdAt`
- `Card` — ver §8
- `ActivityLog` — campos: `id`, `message`, `userId`, `cardId?`, `boardId`, `createdAt`
- `CardComment` — campos: `id`, `content`, `mentionUserIds[]`, `cardId`, `authorId`, `createdAt`, `updatedAt`

### Enums

```typescript
enum Role           { OWNER, MEMBER }
enum CardStatus     { TODO, IN_PROGRESS, IN_REVIEW, DONE }
enum Priority       { LOW, MEDIUM, HIGH, URGENT }
enum ContentType    { POST, STORY, REELS, CAROUSEL, ADS }
enum Effort         { LOW, MEDIUM, HIGH }
enum ProductionStage { ROTEIRO, DESIGN, EDICAO, REVISAO, APROVACAO }
```

### Regras

- Nomes sempre em inglês
- Campos descritivos
- Relacionamentos explícitos
- Nunca usar campos genéricos como `data`, `info`, `misc`

---

## 6. Padrões de Código

### Naming

```typescript
// Errado
const d = new Date()
const x = userData

// Certo
const currentDate = new Date()
const authenticatedUser = userData
```

### Funções

- Uma única responsabilidade
- Nome descreve exatamente o que faz

```typescript
// Errado
function handleStuff() {}

// Certo
function moveCardToColumn(cardId: string, targetColumnId: string) {}
```

### Componentes React

- Máximo de responsabilidade única
- Separar container de apresentação

### Tipagem (TypeScript)

- Nunca usar `any`
- Criar tipos explícitos
- Centralizar tipos reutilizáveis

---

## 7. Kanban (Regra Crítica)

O Kanban é o núcleo do sistema.

### Requisitos

- Drag and drop fluido
- Atualização otimista
- Persistência imediata no banco
- Ordem consistente das colunas e cards

### Regra de ouro

> UI deve refletir o estado real do banco SEM inconsistência.

---

## 8. Briefing (Cards)

Cada card deve conter estrutura clara:

```typescript
type Card = {
  // Identificação
  id: string
  title: string
  contentType: ContentType | null   // POST | STORY | REELS | CAROUSEL | ADS
  platform: string                  // comma-separated: instagram, linkedin, tiktok, youtube

  // Execução
  assignedUserId: string | null
  deadline: DateTime | null
  priority: Priority                // LOW | MEDIUM | HIGH | URGENT
  status: CardStatus                // TODO | IN_PROGRESS | IN_REVIEW | DONE
  effort: Effort | null             // LOW | MEDIUM | HIGH
  stage: ProductionStage | null     // ROTEIRO | DESIGN | EDICAO | REVISAO | APROVACAO

  // Estratégia
  objective: string
  cta: string
  description: string

  // Referências
  references: string
  driveLink: string

  // Posição
  order: number
  columnId: string

  // Metadata
  createdAt: DateTime
  updatedAt: DateTime
}
```

Não usar campo único para tudo.

---

## 9. Perfil de Cliente

Cada cliente possui:

**Identidade**
- `name`, `description`, `customHtml`

**Estratégia**
- `niche`, `toneOfVoice`, `mainObjective`, `platforms`, `contentFrequency`, `targetAudience`

**Operacional**
- `restrictions`, `differentials`, `operationalGuidelines`

### Regras

- Sanitizar HTML com DOMPurify antes de salvar
- Renderizar `customHtml` em iframe isolado (fundo branco forçado)
- Exibir perfil estratégico somente se ao menos um campo estiver preenchido
- Não misturar lógica com renderização

---

## 10. Activity Log

Registrar:

- criação de card
- movimentação
- edição
- atribuição

Formato:

```
User X moved card Y to column Z
```

---

## 11. Performance

- Evitar re-render desnecessário
- Usar memoização quando necessário
- Evitar queries duplicadas
- Carregamento lazy quando possível

---

## 12. UX (Obrigatório)

- Interface limpa
- Zero poluição visual
- Ação rápida (no máximo 2 cliques para qualquer ação comum)
- Feedback visual imediato

---

## 13. Sistema de Login (Autenticação)

O sistema é interno e **todo acesso exige autenticação**.

### Solução

- **NextAuth.js** com provider de credenciais (e-mail + senha)
- Senhas armazenadas com hash via **bcrypt** — nunca em texto puro
- Sessão baseada em **JWT** com expiração configurável

### Fluxo obrigatório

1. Usuário acessa qualquer rota → middleware verifica sessão
2. Sem sessão válida → redireciona para `/login`
3. Login bem-sucedido → redireciona para `/` (dashboard)
4. Logout → invalida sessão e redireciona para `/login`

### Estrutura de arquivos esperada

```
/app
  /login
    page.tsx           ← tela de login
/modules
  /auth
    useAuthenticatedUser.ts   ← hook de acesso ao usuário logado
    authOptions.ts            ← configuração do NextAuth
middleware.ts          ← proteção global de rotas (root do projeto)
```

### Papéis de usuário (roles)

| Role     | Descrição                                      |
|----------|------------------------------------------------|
| `OWNER`  | Dono do sistema — único com acesso admin       |
| `MEMBER` | Membro da equipe — acesso apenas ao conteúdo   |

### Cadastro de usuários

- **Não existe registro público.** Nenhuma rota de cadastro é acessível sem autenticação.
- O único usuário `OWNER` é criado via **seed inicial** do banco de dados.
- Novos usuários (`MEMBER`) só podem ser criados pelo `OWNER` via tela `/admin/users/new`.
- A rota `/admin/*` é bloqueada no middleware para qualquer usuário com `role !== OWNER`.
- A API `POST /api/admin/users` valida `role === OWNER` na sessão antes de criar qualquer usuário.

### Regras

- Nenhuma rota (página ou API) deve ser acessível sem sessão válida
- Rotas `/admin/*` exigem `role: OWNER` — bloqueio no middleware, não apenas na UI
- O hook `useAuthenticatedUser` é o único ponto de acesso ao usuário logado nos componentes
- Nunca expor dados sensíveis do usuário no token JWT
- Middleware deve ser o único ponto de verificação de sessão e autorização para páginas

---

## 13.1. Segurança

- Sanitização de HTML
- Validação no backend
- Controle de acesso por usuário

---

## 14. Uso de IA (Claude Code / Codex)

### Regras de uso

- Sempre gerar código modular
- Nunca pedir "sistema completo"
- Trabalhar por blocos pequenos

### Exemplos de prompts corretos

```
"Crie schema Prisma para entidades X"
"Crie componente Kanban com dnd-kit"
"Crie API REST para cards com CRUD completo"
"Refatore esse código seguindo Clean Code"
```

---

## 15. Anti-padrões proibidos

- Código duplicado
- Funções gigantes
- Comentários explicando código ruim
- Nomes genéricos
- Misturar lógica de negócio com UI
- Uso de `any`
- Hacks temporários permanentes

---

## 16. Definição de Pronto (Definition of Done)

Uma feature só está pronta se:

- Código limpo
- Tipado corretamente
- Sem warnings
- Testável
- Comportamento previsível
- UI consistente

---

## 17. Filosofia do Projeto

Este não é apenas um sistema.
**É o sistema operacional da Made by Felipe.**

Cada decisão deve considerar:

- Escalabilidade operacional
- Clareza de uso
- Velocidade da equipe
- Redução de caos

---

## 18. Regra Final

> Se algo parecer confuso: **está errado. Simplifique.**

---

## 19. TODO.md — Regra de Verificação

O arquivo `todo.md` é o **controle de progresso oficial** do projeto.

### Regra obrigatória

Sempre que `todo.md` for mencionado — direta ou indiretamente — o conteúdo do arquivo deve ser lido e verificado antes de qualquer ação.

### Quando verificar

- Ao iniciar qualquer nova etapa de desenvolvimento
- Ao receber uma tarefa nova para implementar
- Ao perguntar "o que falta fazer?" ou "qual o próximo passo?"
- Ao qualquer menção de "etapa", "fase", "pendente" ou "roadmap"

### Regra de atualização

- Marcar `[x]` imediatamente ao concluir um item
- Marcar `[~]` ao iniciar um item
- Marcar `[!]` se houver bloqueio
- Nunca avançar para a próxima etapa com itens `[ ]` pendentes na etapa atual

---

## 20. Design System — Cores e Temas

### Cor de Ênfase

| Token         | Valor       |
|---------------|-------------|
| `--color-accent` | `#BC0319`  |

A cor de ênfase `#BC0319` é usada para: highlights, badges de status ativo, bordas de foco, botões primários e indicadores de ação.

### Modo Claro (Light)

| Token                      | Valor       |
|----------------------------|-------------|
| `--color-bg`               | `#FFFFFF`   |
| `--color-bg-secondary`     | `#F5F5F5`   |
| `--color-surface`          | `#FAFAFA`   |
| `--color-border`           | `#E5E5E5`   |
| `--color-text-primary`     | `#0A0A0A`   |
| `--color-text-secondary`   | `#525252`   |
| `--color-text-muted`       | `#A3A3A3`   |
| `--color-accent`           | `#BC0319`   |
| `--color-accent-hover`     | `#A30215`   |

### Modo Escuro (Dark)

| Token                      | Valor       |
|----------------------------|-------------|
| `--color-bg`               | `#0A0A0A`   |
| `--color-bg-secondary`     | `#141414`   |
| `--color-surface`          | `#1A1A1A`   |
| `--color-border`           | `#2A2A2A`   |
| `--color-text-primary`     | `#FAFAFA`   |
| `--color-text-secondary`   | `#A3A3A3`   |
| `--color-text-muted`       | `#525252`   |
| `--color-accent`           | `#BC0319`   |
| `--color-accent-hover`     | `#D4031E`   |

### Regras de uso

- A cor de ênfase `#BC0319` é **idêntica em ambos os temas** — não alterar por modo
- Implementar via CSS custom properties no `:root` e `[data-theme="dark"]`
- Usar `prefers-color-scheme` para detectar preferência do sistema, com opção de toggle manual
- Nunca usar valores de cor hardcoded nos componentes — sempre referenciar os tokens
