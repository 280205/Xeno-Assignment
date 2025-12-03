import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating customer names to Indian origin...')

  // Update John Doe to Raj Sharma
  const updated1 = await prisma.customer.updateMany({
    where: { email: 'john.doe@example.com' },
    data: {
      email: 'raj.sharma@example.com',
      firstName: 'Raj',
      lastName: 'Sharma',
    },
  })

  // Update Jane Smith to Priya Patel
  const updated2 = await prisma.customer.updateMany({
    where: { email: 'jane.smith@example.com' },
    data: {
      email: 'priya.patel@example.com',
      firstName: 'Priya',
      lastName: 'Patel',
    },
  })

  // Update order emails to match
  await prisma.order.updateMany({
    where: { email: 'john.doe@example.com' },
    data: { email: 'raj.sharma@example.com' },
  })

  await prisma.order.updateMany({
    where: { email: 'jane.smith@example.com' },
    data: { email: 'priya.patel@example.com' },
  })

  console.log(`✅ Updated ${updated1.count + updated2.count} customers`)
  console.log('✅ Updated order emails')
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
