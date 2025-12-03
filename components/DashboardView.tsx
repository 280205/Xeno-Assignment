'use client'

import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { format, subDays } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface DashboardData {
  overview: {
    totalCustomers: number
    totalOrders: number
    totalProducts: number
    totalRevenue: number
    averageOrderValue: number
  }
  ordersByDate: Array<{
    date: string
    count: number
    revenue: number
  }>
  topCustomers: Array<{
    id: string
    firstName: string | null
    lastName: string | null
    email: string | null
    totalSpent: number
    ordersCount: number
  }>
  eventStats: Array<{
    eventType: string
    _count: number
  }>
}

interface DashboardViewProps {
  tenantId: string
}

export default function DashboardView({ tenantId }: DashboardViewProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  })

  useEffect(() => {
    fetchData()
  }, [tenantId, dateRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      const response = await fetch(`/api/dashboard/${tenantId}?${params}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data available</p>
      </div>
    )
  }

  const revenueChartData = {
    labels: data.ordersByDate.map((d) => format(new Date(d.date), 'MMM dd')),
    datasets: [
      {
        label: 'Revenue',
        data: data.ordersByDate.map((d) => d.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  }

  const ordersChartData = {
    labels: data.ordersByDate.map((d) => format(new Date(d.date), 'MMM dd')),
    datasets: [
      {
        label: 'Orders',
        data: data.ordersByDate.map((d) => d.count),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      },
    ],
  }

  const eventChartData = {
    labels: data.eventStats.map((e) => e.eventType),
    datasets: [
      {
        data: data.eventStats.map((e) => e._count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
      },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Date Range</h3>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={() => setDateRange({
              startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
              endDate: format(new Date(), 'yyyy-MM-dd'),
            })}
            className="self-end px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">Total Customers</h3>
          <p className="text-3xl font-bold text-blue-600">{data.overview.totalCustomers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-green-600">{data.overview.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-purple-600">{data.overview.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-yellow-600">
            ₹{data.overview.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">Avg Order Value</h3>
          <p className="text-3xl font-bold text-red-600">
            ₹{data.overview.averageOrderValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <Line data={revenueChartData} options={{ responsive: true }} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Orders by Date</h3>
          <Bar data={ordersChartData} options={{ responsive: true }} />
        </div>

        {data.eventStats.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Custom Events</h3>
            <div className="max-w-xs mx-auto">
              <Doughnut data={eventChartData} options={{ responsive: true }} />
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top 5 Customers by Spend</h3>
          <div className="space-y-3">
            {data.topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="font-semibold">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{customer.totalSpent.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{customer.ordersCount} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
