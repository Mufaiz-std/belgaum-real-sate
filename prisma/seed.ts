import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { phone: '+919999999999' },
    update: {},
    create: {
      phone: '+919999999999',
      name: 'Admin',
      email: 'admin@belgaumrealestate.in',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
