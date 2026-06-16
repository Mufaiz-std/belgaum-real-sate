import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: propertyId } = await params

    // Check if the property is already saved
    const existingSave = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: session.userId,
          propertyId,
        },
      },
    })

    if (existingSave) {
      // Unsave
      await prisma.savedProperty.delete({
        where: { id: existingSave.id },
      })
      return NextResponse.json({ saved: false })
    } else {
      // Save
      await prisma.savedProperty.create({
        data: {
          userId: session.userId,
          propertyId,
        },
      })
      return NextResponse.json({ saved: true })
    }
  } catch (error) {
    console.error('Save Property Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.userId) {
      return NextResponse.json({ saved: false })
    }

    const { id: propertyId } = await params

    const existingSave = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: session.userId,
          propertyId,
        },
      },
    })

    return NextResponse.json({ saved: !!existingSave })
  } catch (error) {
    console.error('Get Saved Property Error:', error)
    return NextResponse.json({ saved: false })
  }
}
