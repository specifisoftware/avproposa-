import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { FAQHub } from './FAQHub'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Help Center — AVProposal',
  description: 'Find answers to common questions about AVProposal.',
}

export default async function FAQPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: items } = await supabase
    .from('qa_items')
    .select('*')
    .eq('published', true)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors tracking-tight">
              AVProposal
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-500 font-medium">
            <Link href="/#features" className="hover:text-[#0F172A] transition-colors">Features</Link>
            <Link href="/blog" className="hover:text-[#0F172A] transition-colors">Blog</Link>
            <Link href="/faq" className="text-[#0F172A] font-semibold">Help</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/auth?tab=login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#0F172A] transition-colors rounded-lg hover:bg-slate-50">
              Sign In
            </Link>
            <Link href="/auth?tab=register" className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-lg transition-colors">
              Try Free
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-5">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-[#0F172A] mb-3 tracking-tight">Help Center</h1>
          <p className="text-slate-400 text-lg">
            Find answers to common questions about AVProposal
          </p>
          {items && items.length > 0 && (
            <p className="text-sm text-slate-300 mt-2">{items.length} question{items.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {items && items.length > 0 ? (
          <FAQHub items={items} />
        ) : (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No questions yet — check back soon.</p>
          </div>
        )}

        {/* Still need help CTA */}
        <div className="mt-16 bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <h2 className="text-base font-bold text-[#0F172A] mb-2">Still have questions?</h2>
          <p className="text-slate-400 text-sm mb-5">Can&apos;t find what you&apos;re looking for? We&apos;re happy to help.</p>
          <Link
            href="/auth?tab=register"
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Get Started Free →
          </Link>
        </div>
      </main>
    </div>
  )
}
