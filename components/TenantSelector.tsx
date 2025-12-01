'use client'

import { useEffect, useState } from 'react'

interface Tenant {
  id: string
  name: string
  shopifyDomain: string
  role: string
}

interface TenantSelectorProps {
  selectedTenantId: string | null
  onSelectTenant: (tenantId: string) => void
  onAddTenant: () => void
}

export default function TenantSelector({
  selectedTenantId,
  onSelectTenant,
  onAddTenant,
}: TenantSelectorProps) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants')
      const data = await response.json()
      setTenants(data.tenants || [])
      
      // Auto-select first tenant if available
      if (data.tenants?.length > 0 && !selectedTenantId) {
        onSelectTenant(data.tenants[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading stores...</div>
  }

  return (
    <div className="flex items-center space-x-2">
      <select
        value={selectedTenantId || ''}
        onChange={(e) => onSelectTenant(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select a store</option>
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name} ({tenant.shopifyDomain})
          </option>
        ))}
      </select>
      <button
        onClick={onAddTenant}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
      >
        + Add Store
      </button>
    </div>
  )
}
