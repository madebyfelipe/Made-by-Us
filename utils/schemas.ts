import { z } from 'zod'

export const createCardSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().default(''),
  objective: z.string().default(''),
  references: z.string().default(''),
  driveLink: z.string().default(''),
  cta: z.string().default(''),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  contentType: z.enum(['POST', 'STORY', 'REELS', 'CAROUSEL', 'ADS']).nullable().optional(),
  platform: z.string().default(''),
  effort: z.enum(['LOW', 'MEDIUM', 'HIGH']).nullable().optional(),
  stage: z.enum(['ROTEIRO', 'DESIGN', 'EDICAO', 'REVISAO', 'APROVACAO']).nullable().optional(),
  deadline: z.string().nullable().optional(),
  order: z.number().int().min(0).default(0),
  columnId: z.string().min(1, 'columnId é obrigatório'),
  assignedUserId: z.string().nullable().optional(),
})

export const updateCardSchema = createCardSchema.omit({ columnId: true, order: true }).partial()

export const moveCardSchema = z.object({
  targetColumnId: z.string().min(1, 'targetColumnId é obrigatório'),
  order: z.number().int().min(0),
})

export const createClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  description: z.string().default(''),
  niche: z.string().default(''),
  toneOfVoice: z.string().default(''),
  mainObjective: z.string().default(''),
  platforms: z.string().default(''),
  contentFrequency: z.string().default(''),
  targetAudience: z.string().default(''),
  restrictions: z.string().default(''),
  differentials: z.string().default(''),
  operationalGuidelines: z.string().default(''),
  customHtml: z.string().default(''),
})

export const updateClientSchema = createClientSchema.partial()

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  role: z.enum(['OWNER', 'MEMBER']).default('MEMBER'),
})

export const updateManagedUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  email: z.string().email('E-mail inválido'),
  role: z.enum(['OWNER', 'MEMBER']),
})

export const resetManagedUserPasswordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export const updateManagedUserStatusSchema = z.object({
  isActive: z.boolean(),
})

export const createCardCommentSchema = z.object({
  content: z.string().min(1, 'Comentário é obrigatório').max(3000),
  mentionUserIds: z.array(z.string()).default([]),
})
