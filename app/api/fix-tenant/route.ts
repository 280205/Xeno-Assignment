import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Find demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })

    if (!demoUser) {
      return NextResponse.json({ error: 'Demo user not found' }, { status: 404 })
    }

    // Find the tenant
    const tenant = await prisma.tenant.findUnique({
      where: { shopifyDomain: 'nitin-xeno-devop.myshopify.com' }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
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
      return NextResponse.json({ 
        message: 'Demo user already linked to tenant',
        tenant: { name: tenant.name, domain: tenant.shopifyDomain }
      })
    }

    // Create the association
    await prisma.userTenant.create({
      data: {
        userId: demoUser.id,
        tenantId: tenant.id,
        role: 'admin'
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Successfully linked demo user to tenant!',
      user: demoUser.email,
      tenant: { name: tenant.name, domain: tenant.shopifyDomain }
    })
  } catch (error) {
    console.error('Link tenant error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
