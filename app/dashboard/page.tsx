
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import DashboardView from '@/components/DashboardView'
import TenantSelector from '@/components/TenantSelector'
import AddTenantModal from '@/components/AddTenantModal'
import Image from 'next/image'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)
  const [showAddTenant, setShowAddTenant] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 relative">
                  <Image
                    src="/xeno-logo.png"
                    alt="Xeno logo"
                    sizes="40px"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Xeno Insights</h1>
              </div>
              <div className="hidden md:block">
                <TenantSelector
                  selectedTenantId={selectedTenantId}
                  onSelectTenant={setSelectedTenantId}
                  onAddTenant={() => setShowAddTenant(true)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-xl">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-slate-700 font-medium">{session.user.email}</span>
              </div>
              <button
                onClick={async () => {
                  await signOut({ redirect: false })
                  router.push('/')
                }}
                className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-all hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold">Sign Out</span>
              </button>
            </div>
          </div>
          <div className="md:hidden pb-4">
            <TenantSelector
              selectedTenantId={selectedTenantId}
              onSelectTenant={setSelectedTenantId}
              onAddTenant={() => setShowAddTenant(true)}
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTenantId ? (
          <div className="animate-fade-in">
            <DashboardView tenantId={selectedTenantId} />
          </div>
        ) : (
          <div className="text-center py-20 animate-scale-in">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Welcome to Xeno Insights
              </h2>
              <p className="text-slate-600 mb-8 text-lg">
                Select or add a Shopify store to start viewing your analytics and insights
              </p>
              <button
                onClick={() => setShowAddTenant(true)}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all hover:scale-105 hover:shadow-xl font-semibold text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Your First Store</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {showAddTenant && (
        <AddTenantModal
          onClose={() => setShowAddTenant(false)}
          onSuccess={() => {
            setShowAddTenant(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
