import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, shopifyDomain, shopifyAccessToken } = body

    if (!name || !shopifyDomain) {
      return NextResponse.json(
        { error: 'Name and Shopify domain are required' },
        { status: 400 }
      )
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        shopifyDomain,
        shopifyAccessToken,
      },
    })

    // Associate user with tenant as admin
    await prisma.userTenant.create({
      data: {
        userId: session.user.id,
        tenantId: tenant.id,
        role: 'admin',
      },
    })

    return NextResponse.json({ tenant })
  } catch (error) {
    console.error('Tenant creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userTenants = await prisma.userTenant.findMany({
      where: { userId: session.user.id },
      include: {
        tenant: true,
      },
    })

    return NextResponse.json({
      tenants: userTenants.map((ut: any) => ({
        id: ut.tenant.id,
        name: ut.tenant.name,
        shopifyDomain: ut.tenant.shopifyDomain,
        role: ut.role,
        createdAt: ut.tenant.createdAt,
      })),
    })
  } catch (error) {
    console.error('Tenant fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
