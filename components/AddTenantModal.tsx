'use client'

import { useState } from 'react'

interface AddTenantModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddTenantModal({ onClose, onSuccess }: AddTenantModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    shopifyDomain: '',
    shopifyAccessToken: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to add store')
      } else {
        onSuccess()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add Shopify Store</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Store Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Awesome Store"
              required
            />
          </div>

          <div>
            <label htmlFor="shopifyDomain" className="block text-sm font-medium text-gray-700 mb-1">
              Shopify Domain
            </label>
            <input
              type="text"
              id="shopifyDomain"
              value={formData.shopifyDomain}
              onChange={(e) => setFormData({ ...formData, shopifyDomain: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="mystore.myshopify.com"
              required
            />
          </div>

          <div>
            <label htmlFor="shopifyAccessToken" className="block text-sm font-medium text-gray-700 mb-1">
              Shopify Access Token (Optional)
            </label>
            <input
              type="text"
              id="shopifyAccessToken"
              value={formData.shopifyAccessToken}
              onChange={(e) => setFormData({ ...formData, shopifyAccessToken: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="shpat_..."
            />
            <p className="text-xs text-gray-500 mt-1">
              For pulling existing data. Leave empty if only using webhooks.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Store'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
