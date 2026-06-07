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

    const property = await prisma.property.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: {
        owner: { select: { id: true, phone: true, name: true, email: true } },
      },
    })

    await createAuditLog({
      userId: session.userId,
      action: 'PROPERTY_APPROVED',
      metadata: { propertyId: id },
    })

    const { sendPropertyApprovedEmail, createInAppNotification } = await import(
      '@/services/notificationService'
    )
    const { sendPropertyApprovedWhatsApp } = await import('@/services/whatsappService')

    if (property.owner.email) {
      await sendPropertyApprovedEmail({
        to: property.owner.email,
        customerName: property.owner.name ?? '',
        propertyTitle: property.title,
        propertySlug: property.slug,
      })
    }
    await sendPropertyApprovedWhatsApp(property.owner.phone, property.title)
    await createInAppNotification({
      userId: property.owner.id,
      title: 'Property Approved',
      body: `Your listing "${property.title}" is now live.`,
      link: `/properties/${property.slug}`,
    })

    return NextResponse.json({ success: true, property })
  } catch (err) {
    return handleApiError(err)
  }
}
