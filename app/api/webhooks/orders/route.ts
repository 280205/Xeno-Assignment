import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { verifyShopifyWebhook } from '@/lib/shopify-utils'

export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook endpoint is ready',
    message: 'This endpoint accepts POST requests from Shopify webhooks'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256')
    const shopDomain = request.headers.get('x-shopify-shop-domain')

    console.log('=== ORDER WEBHOOK RECEIVED ===')
    console.log('Shop Domain:', shopDomain)
    console.log('HMAC Header:', hmacHeader ? 'Present' : 'Missing')
    console.log('Body preview:', body.substring(0, 200))

    // Temporarily disable HMAC verification for debugging
    // if (process.env.SHOPIFY_WEBHOOK_SECRET && hmacHeader) {
    //   const isValid = verifyShopifyWebhook(
    //     body,
    //     hmacHeader,
    //     process.env.SHOPIFY_WEBHOOK_SECRET
    //   )
    //   if (!isValid) {
    //     return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    //   }
    // }

    const order = JSON.parse(body)
    console.log('Order ID:', order.id, 'Order Number:', order.order_number)

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { shopifyDomain: shopDomain || '' },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Find or create customer
    let customer = null
    if (order.customer?.id) {
      customer = await prisma.customer.upsert({
        where: {
          tenantId_shopifyCustomerId: {
            tenantId: tenant.id,
            shopifyCustomerId: order.customer.id.toString(),
          },
        },
        update: {
          email: order.customer.email,
          firstName: order.customer.first_name,
          lastName: order.customer.last_name,
          phone: order.customer.phone,
        },
        create: {
          tenantId: tenant.id,
          shopifyCustomerId: order.customer.id.toString(),
          email: order.customer.email,
          firstName: order.customer.first_name,
          lastName: order.customer.last_name,
          phone: order.customer.phone,
        },
      })
    }

    // Upsert order
    const createdOrder = await prisma.order.upsert({
      where: {
        tenantId_shopifyOrderId: {
          tenantId: tenant.id,
          shopifyOrderId: order.id.toString(),
        },
      },
      update: {
        customerId: customer?.id,
        email: order.email,
        totalPrice: parseFloat(order.total_price || '0'),
        subtotalPrice: parseFloat(order.subtotal_price || '0'),
        totalTax: parseFloat(order.total_tax || '0'),
        currency: order.currency || 'USD',
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        orderNumber: order.order_number,
        updatedAt: new Date(),
      },
      create: {
        tenantId: tenant.id,
        shopifyOrderId: order.id.toString(),
        customerId: customer?.id,
        email: order.email,
        totalPrice: parseFloat(order.total_price || '0'),
        subtotalPrice: parseFloat(order.subtotal_price || '0'),
        totalTax: parseFloat(order.total_tax || '0'),
        currency: order.currency || 'USD',
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        orderNumber: order.order_number,
      },
    })

    // Delete existing order items and recreate
    await prisma.orderItem.deleteMany({
      where: { orderId: createdOrder.id },
    })

    // Create order items
    if (order.line_items && order.line_items.length > 0) {
      for (const item of order.line_items) {
        let product = null
        if (item.product_id) {
          product = await prisma.product.findUnique({
            where: {
              tenantId_shopifyProductId: {
                tenantId: tenant.id,
                shopifyProductId: item.product_id.toString(),
              },
            },
          })
        }

        await prisma.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: product?.id,
            title: item.title || item.name,
            quantity: item.quantity,
            price: parseFloat(item.price || '0'),
          },
        })
      }
    }

    // Update customer stats if customer exists
    if (customer) {
      const customerOrders = await prisma.order.findMany({
        where: {
          tenantId: tenant.id,
          customerId: customer.id,
        },
      })

      const totalSpent = customerOrders.reduce((sum: number, o: any) => sum + o.totalPrice, 0)

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          totalSpent,
          ordersCount: customerOrders.length,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Order webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
