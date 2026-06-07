import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError } from '@/lib/api-utils'

const schema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^\d{10}$/),
  message: z.string().min(10).max(1000),
})

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json())

    // Log for now; wire to email/CRM in production
    console.info('[Contact]', body.name, body.phone, body.message.slice(0, 80))

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }
    return handleApiError(err)
  }
}
