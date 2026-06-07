import { getSession } from '@/lib/auth'
import { getUserProperties } from '@/lib/dashboard'
import { redirect } from 'next/navigation'
import { PropertiesPageClient } from '@/components/dashboard/PropertiesPageClient'

interface PageProps {
  searchParams: Promise<{
    status?: string
    search?: string
    page?: string
  }>
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session) redirect('/login')

  const params = await searchParams
  const page = Number(params.page) || 1
  const status = params.status || 'ALL'
  const search = params.search || ''

  const { properties, total, totalPages } = await getUserProperties(session.userId, {
    status,
    search,
    page,
    limit: 10,
  })

  const tableRows = properties.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    area: p.area,
    status: p.status,
    coverImage: p.images[0]?.imageUrl,
  }))

  return (
    <PropertiesPageClient
      properties={tableRows}
      total={total}
      page={page}
      totalPages={totalPages}
      currentStatus={status}
      currentSearch={search}
    />
  )
}
