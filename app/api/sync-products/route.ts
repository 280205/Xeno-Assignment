import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  return handleSyncProducts()
}

export async function POST() {
  return handleSyncProducts()
}

async function handleSyncProducts() {
  try {
    // Find the tenant
    const tenant = await prisma.tenant.findUnique({
      where: { shopifyDomain: 'nitin-xeno-devop.myshopify.com' }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Get all order items with product info
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          tenantId: tenant.id
        }
      },
      include: {
        order: true
      }
    })

    const productsCreated = []

    // Create products from order items
    for (const item of orderItems) {
      if (!item.productId) {
        // Generate a unique shopify product ID from the item title
        const shopifyProductId = `manual-${item.title.toLowerCase().replace(/\s+/g, '-')}`
        
        // Check if product already exists
        const existing = await prisma.product.findUnique({
          where: {
            tenantId_shopifyProductId: {
              tenantId: tenant.id,
              shopifyProductId
            }
          }
        })

        if (!existing) {
          const product = await prisma.product.create({
            data: {
              tenantId: tenant.id,
              shopifyProductId,
              title: item.title,
              price: item.price
            }
          })
          productsCreated.push(product.title)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${productsCreated.length} products from order items`,
      products: productsCreated
    })
  } catch (error) {
    console.error('Sync products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
