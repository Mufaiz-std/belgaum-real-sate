import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { requireCsrfForMutation, handleApiError } from '@/lib/api-utils'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrfForMutation(req)
    const session = await requireAdmin()
    const { id } = await params
    const { reason } = await req.json()

    const property = await prisma.property.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        owner: { select: { id: true, phone: true, name: true, email: true } },
      },
    })

    await createAuditLog({
      userId: session.userId,
      action: 'PROPERTY_REJECTED',
      metadata: { propertyId: id, reason },
    })

    const { sendPropertyRejectedEmail, createInAppNotification } = await import(
      '@/services/notificationService'
    )
    const { sendPropertyRejectedWhatsApp } = await import('@/services/whatsappService')

    if (property.owner.email) {
      await sendPropertyRejectedEmail({
        to: property.owner.email,
        customerName: property.owner.name ?? '',
        propertyTitle: property.title,
        reason: reason ?? 'Does not meet listing guidelines',
      })
    }
    await sendPropertyRejectedWhatsApp(
      property.owner.phone,
      property.title,
      reason ?? 'Does not meet listing guidelines'
    )
    await createInAppNotification({
      userId: property.owner.id,
      title: 'Property Rejected',
      body: `Your listing "${property.title}" was not approved. Reason: ${reason ?? 'See email for details'}`,
      link: '/dashboard/properties',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
