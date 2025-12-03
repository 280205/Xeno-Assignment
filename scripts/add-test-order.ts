import { prisma } from '@/lib/prisma'

async function addTestOrder() {
  // Find or create the tenant
  const tenant = await prisma.tenant.upsert({
    where: { shopifyDomain: 'nitin-xeno-devop.myshopify.com' },
    update: {},
    create: {
      name: 'nitin-xeno-devop',
      shopifyDomain: 'nitin-xeno-devop.myshopify.com',
    },
  })

  console.log('Tenant:', tenant)

  // Create a test customer
  const customer = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      shopifyCustomerId: 'test-customer-1',
      email: 'suman12@gmail.com',
      firstName: 'Suman',
      lastName: 'Pandey',
      phone: '+91 93310 78322',
      totalSpent: 54.49,
      ordersCount: 1,
    },
  })

  console.log('Customer:', customer)

  // Create a test product
  const product = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      shopifyProductId: 'test-product-1',
      title: 'Portable Bluetooth Speaker',
      price: 49.99,
      inventory: 10,
    },
  })

  console.log('Product:', product)

  // Create a test order
  const order = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      shopifyOrderId: '1001',
      customerId: customer.id,
      email: 'suman12@gmail.com',
      totalPrice: 54.49,
      subtotalPrice: 49.99,
      totalTax: 4.50,
      currency: 'INR',
      financialStatus: 'paid',
      fulfillmentStatus: 'unfulfilled',
      orderNumber: 1001,
    },
  })

  console.log('Order:', order)

  // Create order item
  const orderItem = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      productId: product.id,
      title: 'Portable Bluetooth Speaker',
      quantity: 1,
      price: 49.99,
    },
  })

  console.log('Order Item:', orderItem)
  console.log('\n✅ Test data added successfully!')
}

addTestOrder()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
