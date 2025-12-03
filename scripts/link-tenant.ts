import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function linkTenantToDemo() {
  try {
    // Find demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })

    if (!demoUser) {
      console.error('Demo user not found!')
      return
    }

    // Find the tenant
    const tenant = await prisma.tenant.findUnique({
      where: { shopifyDomain: 'nitin-xeno-devop.myshopify.com' }
    })

    if (!tenant) {
      console.error('Tenant not found!')
      return
    }

    // Check if association exists
    const existingLink = await prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: demoUser.id,
          tenantId: tenant.id
        }
      }
    })

    if (existingLink) {
      console.log('✅ Demo user already linked to tenant!')
      return
    }

    // Create the association
    await prisma.userTenant.create({
      data: {
        userId: demoUser.id,
        tenantId: tenant.id,
        role: 'admin'
      }
    })

    console.log('✅ Successfully linked demo user to tenant!')
    console.log(`User: ${demoUser.email}`)
    console.log(`Tenant: ${tenant.name} (${tenant.shopifyDomain})`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

linkTenantToDemo()
