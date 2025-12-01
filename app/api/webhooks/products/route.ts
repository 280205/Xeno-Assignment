import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { verifyShopifyWebhook } from '@/lib/shopify-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256')
    const shopDomain = request.headers.get('x-shopify-shop-domain')

    // Verify webhook
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

    const product = JSON.parse(body)

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { shopifyDomain: shopDomain || '' },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Get price from variants
    let price = null
    if (product.variants && product.variants.length > 0) {
      price = parseFloat(product.variants[0].price || '0')
    }

    // Get inventory
    let inventory = 0
    if (product.variants && product.variants.length > 0) {
      inventory = product.variants.reduce(
        (sum: number, v: any) => sum + (v.inventory_quantity || 0),
        0
      )
    }

    // Upsert product
    await prisma.product.upsert({
      where: {
        tenantId_shopifyProductId: {
          tenantId: tenant.id,
          shopifyProductId: product.id.toString(),
        },
      },
      update: {
        title: product.title,
        description: product.body_html,
        vendor: product.vendor,
        productType: product.product_type,
        price,
        inventory,
        updatedAt: new Date(),
      },
      create: {
        tenantId: tenant.id,
        shopifyProductId: product.id.toString(),
        title: product.title,
        description: product.body_html,
        vendor: product.vendor,
        productType: product.product_type,
        price,
        inventory,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
