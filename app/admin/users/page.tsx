import { prisma } from '@/lib/prisma'
import { Role, UserStatus } from '@prisma/client'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'

interface PageProps {
  searchParams: Promise<{
    search?: string
    role?: string
    status?: string
    page?: string
  }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = 20
  const search = params.search ?? ''
  const role = params.role as Role | 'ALL' | undefined
  const status = params.status as UserStatus | 'ALL' | undefined

  const where: {
    OR?: { phone?: { contains: string }; name?: { contains: string; mode: 'insensitive' } }[]
    role?: Role
    status?: UserStatus
  } = {}

  if (search) {
    where.OR = [
      { phone: { contains: search } },
      { name: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (role && role !== 'ALL') where.role = role
  if (status && status !== 'ALL') where.status = status

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
        _count: { select: { properties: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return (
    <AdminUsersTable
      initialUsers={users}
      total={total}
      page={page}
      totalPages={Math.ceil(total / limit)}
    />
  )
}
