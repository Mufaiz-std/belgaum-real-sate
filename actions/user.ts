'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const profileSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
})

export async function updateProfile(data: z.infer<typeof profileSchema>) {
  const session = await requireAuth()
  const validated = profileSchema.parse(data)

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: validated.name || null,
      email: validated.email || null,
    },
  })

  revalidatePath('/dashboard/settings')

  return { success: true }
}
