import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block mb-4">
              <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full">
                Multi-Tenant Analytics Platform
              </span>
            </div>
            <h1 className="text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Xeno Shopify
              <span className="block text-blue-600">Insights</span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Real-time data ingestion and analytics platform for Shopify stores.
              Built for scale, designed for insights.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Link
                href="/auth/signin"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl overflow-hidden transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50"
              >
                <span className="relative z-10">Get Started</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-xl transition-all duration-300 hover:border-blue-600 hover:text-blue-600 hover:scale-105 hover:shadow-lg"
              >
                Sign Up Free
              </Link>
            </div>
          </div>


        </div>
      </div>
    </main>
  )
}
