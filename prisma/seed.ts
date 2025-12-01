import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  })

  console.log('✅ Created demo user:', user.email)

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { shopifyDomain: 'demo-store.myshopify.com' },
    update: {},
    create: {
      name: 'Demo Store',
      shopifyDomain: 'demo-store.myshopify.com',
    },
  })

  console.log('✅ Created demo tenant:', tenant.name)

  // Associate user with tenant
  await prisma.userTenant.upsert({
    where: {
      userId_tenantId: {
        userId: user.id,
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      tenantId: tenant.id,
      role: 'admin',
    },
  })

  console.log('✅ Associated user with tenant')

  // Create demo customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: {
        tenantId_shopifyCustomerId: {
          tenantId: tenant.id,
          shopifyCustomerId: '1001',
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        shopifyCustomerId: '1001',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        totalSpent: 450.00,
        ordersCount: 5,
      },
    }),
    prisma.customer.upsert({
      where: {
        tenantId_shopifyCustomerId: {
          tenantId: tenant.id,
          shopifyCustomerId: '1002',
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        shopifyCustomerId: '1002',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        totalSpent: 890.50,
        ordersCount: 8,
      },
    }),
  ])

  console.log('✅ Created demo customers:', customers.length)

  // Create demo products
  const products = await Promise.all([
    prisma.product.upsert({
      where: {
        tenantId_shopifyProductId: {
          tenantId: tenant.id,
          shopifyProductId: '2001',
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        shopifyProductId: '2001',
        title: 'Premium Headphones',
        description: 'High-quality wireless headphones',
        vendor: 'TechCo',
        productType: 'Electronics',
        price: 99.99,
        inventory: 50,
      },
    }),
    prisma.product.upsert({
      where: {
        tenantId_shopifyProductId: {
          tenantId: tenant.id,
          shopifyProductId: '2002',
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        shopifyProductId: '2002',
        title: 'Smart Watch',
        description: 'Feature-rich smartwatch',
        vendor: 'TechCo',
        productType: 'Electronics',
        price: 199.99,
        inventory: 30,
      },
    }),
  ])

  console.log('✅ Created demo products:', products.length)

  // Create demo orders
  for (let i = 0; i < 10; i++) {
    const customer = customers[i % customers.length]
    const product = products[i % products.length]
    
    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        shopifyOrderId: `${3000 + i}`,
        customerId: customer.id,
        email: customer.email,
        totalPrice: product.price!,
        subtotalPrice: product.price!,
        totalTax: product.price! * 0.1,
        currency: 'USD',
        financialStatus: 'paid',
        fulfillmentStatus: 'fulfilled',
        orderNumber: 1000 + i,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        title: product.title,
        quantity: 1,
        price: product.price!,
      },
    })
  }

  console.log('✅ Created demo orders: 10')

  // Create demo custom events
  await prisma.customEvent.createMany({
    data: [
      {
        tenantId: tenant.id,
        customerId: customers[0].id,
        eventType: 'cart_abandoned',
        eventData: JSON.stringify({ cart_value: 150.00 }),
      },
      {
        tenantId: tenant.id,
        customerId: customers[1].id,
        eventType: 'checkout_started',
        eventData: JSON.stringify({ items_count: 3 }),
      },
      {
        tenantId: tenant.id,
        eventType: 'product_viewed',
        eventData: JSON.stringify({ product_id: '2001' }),
      },
    ],
  })

  console.log('✅ Created demo custom events')
  console.log('\n🎉 Seeding complete!')
  console.log('\n📧 Demo credentials:')
  console.log('   Email: demo@example.com')
  console.log('   Password: demo123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
