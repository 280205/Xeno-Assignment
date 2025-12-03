import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = params.tenantId

    // Verify user has access to this tenant
    const userTenant = await prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: session.user.id,
          tenantId,
        },
      },
    })

    if (!userTenant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter: any = {}
    if (startDate) {
      // Use start of day for the startDate to include the whole day
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      dateFilter.gte = start
    }
    if (endDate) {
      // Use end of day for the endDate to include the whole day
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      dateFilter.lte = end
    }

    // Get metrics
    const [
      totalCustomers,
      totalOrders,
      totalProducts,
      orders,
      topCustomers,
      recentEvents,
    ] = await Promise.all([
      // Total customers
      prisma.customer.count({
        where: { tenantId },
      }),

      // Total orders
      prisma.order.count({
        where: {
          tenantId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),

      // Total products
      prisma.product.count({
        where: { tenantId },
      }),

      // Orders with date filter
      prisma.order.findMany({
        where: {
          tenantId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),

      // Top 5 customers by spend
      prisma.customer.findMany({
        where: { tenantId },
        orderBy: { totalSpent: 'desc' },
        take: 5,
      }),

      // Recent custom events
      prisma.customEvent.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customer: true,
        },
      }),
    ])

    // Calculate revenue
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalPrice, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Group orders by date
    const ordersByDate = orders.reduce((acc: any, order: any) => {
      const date = order.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, count: 0, revenue: 0 }
      }
      acc[date].count += 1
      acc[date].revenue += order.totalPrice
      return acc
    }, {} as Record<string, { date: string; count: number; revenue: number }>)

    const ordersByDateArray = Object.values(ordersByDate).sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Event statistics
    const eventStats = await prisma.customEvent.groupBy({
      by: ['eventType'],
      where: { tenantId },
      _count: true,
    })

    return NextResponse.json({
      overview: {
        totalCustomers,
        totalOrders,
        totalProducts,
        totalRevenue,
        averageOrderValue,
      },
      ordersByDate: ordersByDateArray,
      topCustomers,
      recentEvents,
      eventStats,
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
