import 'dotenv/config'
import { PrismaClient, Role, CardStatus, Priority } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const BCRYPT_SALT_ROUNDS = 12

async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, BCRYPT_SALT_ROUNDS)
}

async function createOwnerUser(): Promise<string> {
  const hashedPassword = await hashPassword('admin123')

  const owner = await prisma.user.upsert({
    where: { email: 'alo@madebyfelipe.com.br' },
    update: {},
    create: {
      name: 'Felipe',
      email: 'alo@madebyfelipe.com.br',
      password: hashedPassword,
      role: Role.OWNER,
      isActive: true,
    },
  })

  return owner.id
}

async function createMemberUser(): Promise<string> {
  const hashedPassword = await hashPassword('member123')

  const member = await prisma.user.upsert({
    where: { email: 'team@madebyfelipe.com' },
    update: {},
    create: {
      name: 'Team Member',
      email: 'team@madebyfelipe.com',
      password: hashedPassword,
      role: Role.MEMBER,
      isActive: true,
    },
  })

  return member.id
}

async function createClientWithBoard(
  clientName: string,
  boardName: string,
  ownerId: string,
  memberId: string,
): Promise<void> {
  const client = await prisma.client.create({
    data: {
      name: clientName,
      description: `Perfil de conteúdo de ${clientName}`,
      customHtml: '',
    },
  })

  const board = await prisma.board.create({
    data: {
      name: boardName,
      clientId: client.id,
    },
  })

  const columnNames = ['Backlog', 'Em andamento', 'Revisão', 'Concluído']
  const columns = await Promise.all(
    columnNames.map((name, index) =>
      prisma.column.create({
        data: { name, order: index, boardId: board.id },
      }),
    ),
  )

  const backlogColumn = columns[0]
  const inProgressColumn = columns[1]

  await prisma.card.create({
    data: {
      title: `Post de lançamento — ${clientName}`,
      description: 'Post para anunciar o novo produto nas redes sociais.',
      objective: 'Gerar awareness e engajamento no lançamento.',
      references: 'https://drive.google.com/example',
      driveLink: '',
      status: CardStatus.TODO,
      priority: Priority.HIGH,
      order: 0,
      columnId: backlogColumn.id,
      assignedUserId: memberId,
    },
  })

  await prisma.card.create({
    data: {
      title: `Reels educativo — ${clientName}`,
      description: 'Vídeo curto explicando o diferencial do produto.',
      objective: 'Educar e converter seguidores em leads.',
      references: '',
      driveLink: '',
      status: CardStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      order: 0,
      columnId: inProgressColumn.id,
      assignedUserId: ownerId,
    },
  })

  await prisma.activityLog.create({
    data: {
      message: `Felipe created board "${boardName}" for client "${clientName}"`,
      userId: ownerId,
      boardId: board.id,
    },
  })
}

async function runSeed(): Promise<void> {
  process.stdout.write('Seeding database...\n')

  const ownerId = await createOwnerUser()
  const memberId = await createMemberUser()

  await createClientWithBoard('Acme Corp', 'Conteúdo Q2 2026', ownerId, memberId)
  await createClientWithBoard('Studio Nova', 'Calendário Editorial Abril', ownerId, memberId)

  process.stdout.write('Seed complete.\n')
}

runSeed()
  .catch((error) => {
    process.stderr.write(`Seed failed: ${String(error)}\n`)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
