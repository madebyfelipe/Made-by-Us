import type { Priority, ContentType, Effort, ProductionStage, CardStatus } from '@/types'

export type ParsedCard = {
  title: string
  objective: string
  description: string
  references: string
  driveLink: string
  cta: string
  priority: Priority
  status: CardStatus
  contentType: ContentType | null
  platforms: string[]
  effort: Effort | null
  stage: ProductionStage | null
  deadline: string
}

type ParsedCardKey = keyof ParsedCard

const PRIORITY_MAP: Record<string, Priority> = {
  baixa: 'LOW',
  low: 'LOW',
  media: 'MEDIUM',
  medio: 'MEDIUM',
  medium: 'MEDIUM',
  normal: 'MEDIUM',
  alta: 'HIGH',
  high: 'HIGH',
  urgente: 'URGENT',
  urgent: 'URGENT',
  critico: 'URGENT',
}

const CONTENT_TYPE_MAP: Record<string, ContentType> = {
  post: 'POST',
  story: 'STORY',
  stories: 'STORY',
  reels: 'REELS',
  reel: 'REELS',
  video: 'REELS',
  carrossel: 'CAROUSEL',
  carousel: 'CAROUSEL',
  ads: 'ADS',
  anuncio: 'ADS',
}

const PLATFORM_MAP: Record<string, string> = {
  instagram: 'instagram',
  ig: 'instagram',
  insta: 'instagram',
  linkedin: 'linkedin',
  li: 'linkedin',
  tiktok: 'tiktok',
  tt: 'tiktok',
  youtube: 'youtube',
  yt: 'youtube',
}

const EFFORT_MAP: Record<string, Effort> = {
  baixo: 'LOW',
  low: 'LOW',
  simples: 'LOW',
  medio: 'MEDIUM',
  media: 'MEDIUM',
  medium: 'MEDIUM',
  alto: 'HIGH',
  high: 'HIGH',
  complexo: 'HIGH',
}

const STAGE_MAP: Record<string, ProductionStage> = {
  roteiro: 'ROTEIRO',
  script: 'ROTEIRO',
  design: 'DESIGN',
  arte: 'DESIGN',
  edicao: 'EDICAO',
  revisao: 'REVISAO',
  review: 'REVISAO',
  aprovacao: 'APROVACAO',
}

const STATUS_MAP: Record<string, CardStatus> = {
  todo: 'TODO',
  afazer: 'TODO',
  pendente: 'TODO',
  emandamento: 'IN_PROGRESS',
  inprogress: 'IN_PROGRESS',
  andamento: 'IN_PROGRESS',
  revisao: 'IN_REVIEW',
  inreview: 'IN_REVIEW',
  revisando: 'IN_REVIEW',
  concluido: 'DONE',
  done: 'DONE',
  finalizado: 'DONE',
  pronto: 'DONE',
}

const KEY_ALIASES: Record<string, ParsedCardKey> = {
  titulo: 'title',
  title: 'title',
  nome: 'title',
  objetivo: 'objective',
  objective: 'objective',
  descricao: 'description',
  description: 'description',
  contexto: 'description',
  direcaocriativa: 'description',
  referencias: 'references',
  references: 'references',
  inspiracoes: 'references',
  link: 'driveLink',
  drive: 'driveLink',
  linkdrive: 'driveLink',
  linkdodrive: 'driveLink',
  drivelink: 'driveLink',
  cta: 'cta',
  prioridade: 'priority',
  priority: 'priority',
  tipo: 'contentType',
  type: 'contentType',
  formato: 'contentType',
  formatodeconteudo: 'contentType',
  tipodeconteudo: 'contentType',
  contenttype: 'contentType',
  plataforma: 'platforms',
  plataformas: 'platforms',
  platform: 'platforms',
  esforco: 'effort',
  effort: 'effort',
  complexidade: 'effort',
  etapa: 'stage',
  fase: 'stage',
  stage: 'stage',
  etapadeproducao: 'stage',
  prazo: 'deadline',
  deadline: 'deadline',
  entrega: 'deadline',
  data: 'deadline',
  status: 'status',
}

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function normalizeKey(rawKey: string): ParsedCardKey | null {
  return KEY_ALIASES[normalizeToken(rawKey)] ?? null
}

function parsePriority(rawValue: string): Priority {
  return PRIORITY_MAP[normalizeToken(rawValue)] ?? 'MEDIUM'
}

function parseContentType(rawValue: string): ContentType | null {
  return CONTENT_TYPE_MAP[normalizeToken(rawValue)] ?? null
}

function parsePlatforms(rawValue: string): string[] {
  return rawValue
    .split(/[,/\n]+/)
    .map((platform) => normalizeToken(platform))
    .map((platform) => PLATFORM_MAP[platform])
    .filter((platform): platform is string => Boolean(platform))
}

function parseEffort(rawValue: string): Effort | null {
  return EFFORT_MAP[normalizeToken(rawValue)] ?? null
}

function parseStage(rawValue: string): ProductionStage | null {
  return STAGE_MAP[normalizeToken(rawValue)] ?? null
}

function parseStatus(rawValue: string): CardStatus {
  return STATUS_MAP[normalizeToken(rawValue)] ?? 'TODO'
}

function parseDeadline(rawValue: string): string {
  const trimmedValue = rawValue.trim()
  if (!trimmedValue) return ''

  const parsedDate = new Date(trimmedValue)
  return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().slice(0, 10)
}

function parseBlock(block: string): ParsedCard | null {
  const parsedCard: ParsedCard = {
    title: '',
    objective: '',
    description: '',
    references: '',
    driveLink: '',
    cta: '',
    priority: 'MEDIUM',
    status: 'TODO',
    contentType: null,
    platforms: [],
    effort: null,
    stage: null,
    deadline: '',
  }

  const lines = block.split('\n')
  let currentKey: ParsedCardKey | null = null
  let currentValue: string[] = []

  function flushCurrentField() {
    if (!currentKey) return

    const value = currentValue.join('\n').trim()
    if (!value) return

    switch (currentKey) {
      case 'priority':
        parsedCard.priority = parsePriority(value)
        break
      case 'contentType':
        parsedCard.contentType = parseContentType(value)
        break
      case 'platforms':
        parsedCard.platforms = parsePlatforms(value)
        break
      case 'effort':
        parsedCard.effort = parseEffort(value)
        break
      case 'stage':
        parsedCard.stage = parseStage(value)
        break
      case 'status':
        parsedCard.status = parseStatus(value)
        break
      case 'deadline':
        parsedCard.deadline = parseDeadline(value)
        break
      default:
        parsedCard[currentKey] = value as never
    }
  }

  for (const line of lines) {
    const colonIndex = line.indexOf(':')

    if (colonIndex > 0) {
      const mappedKey = normalizeKey(line.slice(0, colonIndex))

      if (mappedKey) {
        flushCurrentField()
        currentKey = mappedKey
        currentValue = [line.slice(colonIndex + 1).trim()]
        continue
      }
    }

    if (currentKey) {
      currentValue.push(line)
    }
  }

  flushCurrentField()

  if (!parsedCard.title.trim()) return null
  return parsedCard
}

export function parseCardTemplate(text: string): ParsedCard[] {
  return text
    .split(/\n---+\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(parseBlock)
    .filter((card): card is ParsedCard => card !== null)
}
