import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function createAuditLog({
  userId,
  action,
  metadata,
  ipAddress,
}: {
  userId: string
  action: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}) {
  const ip = ipAddress ?? (await headers()).get('x-forwarded-for') ?? 'unknown'

  return prisma.auditLog.create({
    data: {
      userId,
      action,
      metadata: metadata ?? undefined,
      ipAddress: ip,
    },
  })
}
