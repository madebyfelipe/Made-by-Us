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

- `User`
- `Client`
- `Board`
- `Column`
- `Card`
- `ActivityLog`

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
  title: string
  description: string
  objective: string
  references: string
  assignedUserId: string
  driveLink: string
  status: CardStatus
  priority: Priority
}
```

Não usar campo único para tudo.

---

## 9. Perfil de Cliente

Cada cliente possui:

- `name`
- `description`
- `customHtml`

### Regras

- Sanitizar HTML (segurança)
- Renderizar de forma isolada
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

## 13. Segurança

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
