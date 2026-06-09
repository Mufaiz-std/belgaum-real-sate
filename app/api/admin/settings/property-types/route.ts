import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
    const propertyTypes = await prisma.propertyTypeConfig.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ propertyTypes })
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

    const propertyType = await prisma.propertyTypeConfig.create({
      data: { name: name.trim() },
    })
    return NextResponse.json({ propertyType })
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Property Type already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create property type' }, { status: 500 })
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

    await prisma.propertyTypeConfig.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete property type' }, { status: 500 })
  }
}
