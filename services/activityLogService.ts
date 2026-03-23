import { prismaClient } from './prismaClient'

type CreateLogParams = {
  message: string
  userId: string
  boardId: string
  cardId?: string
}

export async function createActivityLog(params: CreateLogParams): Promise<void> {
  await prismaClient.activityLog.create({ data: params })
}

export async function createActivityLogs(
  params: CreateLogParams[],
): Promise<void> {
  if (params.length === 0) return

  await prismaClient.activityLog.createMany({
    data: params,
  })
}
