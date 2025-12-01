import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const shopDomain = request.headers.get('x-shopify-shop-domain')

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { shopifyDomain: shopDomain || '' },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Find customer if provided
    let customer = null
    if (body.customer_id) {
      customer = await prisma.customer.findUnique({
        where: {
          tenantId_shopifyCustomerId: {
            tenantId: tenant.id,
            shopifyCustomerId: body.customer_id.toString(),
          },
        },
      })
    }

    // Create custom event
    await prisma.customEvent.create({
      data: {
        tenantId: tenant.id,
        customerId: customer?.id,
        eventType: body.event_type || 'cart_abandoned',
        eventData: JSON.stringify(body.data || {}),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Custom event webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
