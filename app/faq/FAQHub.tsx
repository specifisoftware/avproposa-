'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { QAItem } from '@/types/qa'

const PAGE_SIZE = 6

function QuestionRow({ item, showCategory }: { item: QAItem; showCategory: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all ${open ? 'border-[#2563EB] shadow-sm' : 'border-gray-200 hover:border-slate-300'}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left min-h-[60px] group"
      >
        <div className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center transition-colors ${open ? 'bg-[#2563EB]' : 'bg-blue-50 group-hover:bg-[#2563EB]'}`}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth="2.5"
            stroke={open ? 'white' : '#2563EB'}
            className="group-hover:stroke-white transition-[stroke]"
          >
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
        </div>

        <span className={`flex-1 text-sm font-semibold leading-snug transition-colors ${open ? 'text-[#2563EB]' : 'text-[#0F172A] group-hover:text-[#2563EB]'}`}>
          {item.question}
        </span>

        {showCategory && item.category && (
          <span className="hidden sm:block shrink-0 text-[10px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {item.category}
          </span>
        )}

        <svg
          width="15" height="15" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth="2.5"
          className={`shrink-0 transition-all duration-200 ${open ? 'rotate-180 text-[#2563EB]' : 'text-slate-300 group-hover:text-[#2563EB]'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-blue-50">
          <div
            className="mt-4 text-sm text-slate-600 leading-relaxed [&_a]:text-[#2563EB] [&_a]:underline [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_p]:mb-3 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{
              __html: item.answer.includes('<')
                ? item.answer
                : item.answer.split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join(''),
            }}
          />
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href={`/faq/${item.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
            >
              Open full page
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null

  const pages: (number | 'gap')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'gap') {
      pages.push('gap')
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-slate-500 hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
        aria-label="Previous page"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-300 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors border ${
              p === page
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white text-slate-500 border-gray-200 hover:border-[#2563EB] hover:text-[#2563EB]'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-slate-500 hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
        aria-label="Next page"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

export function FAQHub() {
  const [items, setItems] = useState<QAItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Debounce search input by 350ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, activeCategory])

  // Fetch categories once
  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('qa_categories')
        .select('name')
        .order('position', { ascending: true })
        .order('created_at', { ascending: true })
      setCategories((data ?? []).map((c) => c.name))
    })()
  }, [])

  // Fetch paginated items whenever page / search / category changes
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('qa_items')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (debouncedSearch.trim()) {
        query = query.or(
          `question.ilike.%${debouncedSearch.trim()}%,answer.ilike.%${debouncedSearch.trim()}%`
        )
      }
      if (activeCategory) {
        query = query.eq('category', activeCategory)
      }

      const from = (page - 1) * PAGE_SIZE
      const { data, count } = await query.range(from, from + PAGE_SIZE - 1)

      setItems(data ?? [])
      setTotalCount(count ?? 0)
      setLoading(false)
    })()
  }, [page, debouncedSearch, activeCategory])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const handlePageChange = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-5">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all bg-white shadow-sm"
        />
      </div>

      {/* Category filter buttons */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              !activeCategory
                ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                : 'bg-white text-slate-500 border-gray-200 hover:border-[#2563EB] hover:text-[#2563EB]'
            }`}
          >
            All
          </button>

          {categories.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  isActive
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-white text-slate-500 border-gray-200 hover:border-[#2563EB] hover:text-[#2563EB]'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Result meta */}
      <div className="flex items-center justify-between mb-4 min-h-[20px]">
        {!loading && (
          <p className="text-xs text-slate-400">
            {debouncedSearch.trim()
              ? `${totalCount} result${totalCount !== 1 ? 's' : ''} for "${debouncedSearch.trim()}"`
              : `${totalCount} question${totalCount !== 1 ? 's' : ''}`}
            {totalPages > 1 && ` · page ${page} of ${totalPages}`}
          </p>
        )}
        {debouncedSearch.trim() && (
          <button onClick={() => setSearch('')} className="text-xs text-[#2563EB] hover:underline ml-auto">
            Clear
          </button>
        )}
      </div>

      {/* Question list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl h-[60px] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">No questions found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((item) => (
              <QuestionRow
                key={item.id}
                item={item}
                showCategory={!activeCategory && categories.length > 0}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
        </>
      )}
    </div>
  )
}
