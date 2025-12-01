import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { verifyShopifyWebhook } from '@/lib/shopify-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256')
    const shopDomain = request.headers.get('x-shopify-shop-domain')

    // Verify webhook authenticity
    if (process.env.SHOPIFY_WEBHOOK_SECRET && hmacHeader) {
      const isValid = verifyShopifyWebhook(
        body,
        hmacHeader,
        process.env.SHOPIFY_WEBHOOK_SECRET
      )
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
      }
    }

    const customer = JSON.parse(body)

    // Find tenant by shop domain
    const tenant = await prisma.tenant.findUnique({
      where: { shopifyDomain: shopDomain || '' },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Upsert customer
    await prisma.customer.upsert({
      where: {
        tenantId_shopifyCustomerId: {
          tenantId: tenant.id,
          shopifyCustomerId: customer.id.toString(),
        },
      },
      update: {
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        totalSpent: parseFloat(customer.total_spent || '0'),
        ordersCount: customer.orders_count || 0,
        updatedAt: new Date(),
      },
      create: {
        tenantId: tenant.id,
        shopifyCustomerId: customer.id.toString(),
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        totalSpent: parseFloat(customer.total_spent || '0'),
        ordersCount: customer.orders_count || 0,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Customer webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
