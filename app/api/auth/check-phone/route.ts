import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { handleApiError } from '@/lib/api-utils'

const schema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit number'),
})

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json())
    const fullPhone = `+91${body.phone}`

    const user = await prisma.user.findUnique({
      where: { phone: fullPhone },
      select: { id: true, status: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ exists: false, registered: false })
    }

    if (user.status === 'BANNED') {
      return NextResponse.json({
        exists: true,
        registered: true,
        banned: true,
        error: 'This account has been suspended. Contact support.',
      })
    }

    return NextResponse.json({
      exists: true,
      registered: true,
      banned: false,
      hasName: !!user.name,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 })
    }
    return handleApiError(err)
  }
}
