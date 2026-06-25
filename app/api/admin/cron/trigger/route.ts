import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { requireCsrfForMutation } from '@/lib/api-utils'

export async function POST(req: Request) {
  try {
    await requireCsrfForMutation(req)
    await requireAdmin()
    
    // Trigger the cron endpoint internally using the secret
    const url = new URL('/api/cron/expiry-warnings', req.url)
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    })
    
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Failed to trigger cron from admin', error)
    return NextResponse.json({ error: 'Failed to trigger cron' }, { status: 500 })
  }
}
