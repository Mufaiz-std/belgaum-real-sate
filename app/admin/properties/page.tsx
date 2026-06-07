import { prisma } from '@/lib/prisma'
import { PropertyStatus } from '@prisma/client'
import { AdminPropertiesTable } from '@/components/admin/AdminPropertiesTable'

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>
}

export default async function AdminPropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentTab = params.status ?? 'ALL'
  const search = params.search ?? ''

  const where: {
    status?: PropertyStatus
    OR?: { title?: { contains: string; mode: 'insensitive' }; area?: { contains: string; mode: 'insensitive' } }[]
  } = {}

  if (currentTab !== 'ALL') where.status = currentTab as PropertyStatus
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { area: { contains: search, mode: 'insensitive' } },
    ]
  }

  const properties = await prisma.property.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      owner: { select: { phone: true } },
      images: { take: 1, orderBy: { sortOrder: 'asc' } },
    },
  })

  return (
    <AdminPropertiesTable
      properties={properties}
      currentTab={currentTab}
      search={search}
    />
  )
}
