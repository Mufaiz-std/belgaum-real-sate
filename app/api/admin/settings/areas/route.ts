import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
    const areas = await prisma.area.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ areas })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { name } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const area = await prisma.area.create({
      data: { name: name.trim() },
    })
    return NextResponse.json({ area })
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Area already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create area' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.area.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete area' }, { status: 500 })
  }
}
