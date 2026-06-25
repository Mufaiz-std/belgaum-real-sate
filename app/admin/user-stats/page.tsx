import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { UserStatsClient } from './UserStatsClient'

interface PageProps {
  searchParams: Promise<{
    search?: string
    role?: string
    page?: string
  }>
}

export default async function AdminUserStatsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = 20
  const search = params.search ?? ''
  const role = params.role as Role | 'ALL' | undefined

  const where: {
    OR?: { phone?: { contains: string }; name?: { contains: string; mode: 'insensitive' } }[]
    role?: Role
  } = {}

  if (search) {
    where.OR = [
      { phone: { contains: search } },
      { name: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (role && role !== 'ALL') where.role = role

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        subscriptions: {
          where: { status: 'ACTIVE', expiryDate: { gt: new Date() } },
          take: 1,
        },
        properties: {
          select: { id: true, title: true, slug: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' }
        },
        savedProperties: {
          include: { property: { select: { id: true, title: true, slug: true } } },
          orderBy: { createdAt: 'desc' }
        },
        unlocks: {
          include: { property: { select: { id: true, title: true, slug: true } } },
          orderBy: { createdAt: 'desc' }
        },
        leadsAsBuyer: {
          include: { property: { select: { id: true, title: true, slug: true } } },
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          where: { status: 'SUCCESS' },
          orderBy: { createdAt: 'desc' }
        },
        dailyUsage: {
          where: { date: today },
          take: 1
        }
      },
    }),
    prisma.user.count({ where }),
  ])

  return (
    <UserStatsClient
      initialUsers={users}
      total={total}
      page={page}
      totalPages={Math.ceil(total / limit)}
    />
  )
}
