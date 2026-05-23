'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { QAItem } from '@/types/qa'

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

export function FAQHub() {
  const [items, setItems] = useState<QAItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const [{ data: itemsData }, { data: catsData }] = await Promise.all([
        supabase
          .from('qa_items')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('qa_categories')
          .select('name')
          .order('position', { ascending: true })
          .order('created_at', { ascending: true }),
      ])
      setItems(itemsData ?? [])
      setCategories((catsData ?? []).map((c) => c.name))
      setLoading(false)
    })()
  }, [])

  const filtered = items.filter((item) => {
    const matchSearch =
      !search.trim() ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
    const matchCat = !activeCategory || item.category === activeCategory
    return matchSearch && matchCat
  })

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl h-[60px] animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">No questions yet — check back soon.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Item count */}
      <p className="text-sm text-slate-300 text-center mb-8">
        {items.length} question{items.length !== 1 ? 's' : ''}
      </p>

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
            <span className={`ml-1.5 text-xs font-medium ${!activeCategory ? 'text-blue-200' : 'text-slate-300'}`}>
              {items.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat).length
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
                <span className={`ml-1.5 text-xs font-medium ${isActive ? 'text-blue-200' : 'text-slate-300'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Result count when searching */}
      {search.trim() && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
          </p>
          <button onClick={() => setSearch('')} className="text-xs text-[#2563EB] hover:underline">
            Clear
          </button>
        </div>
      )}

      {/* Question list */}
      {filtered.length === 0 ? (
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
        <div className="space-y-2">
          {filtered.map((item) => (
            <QuestionRow
              key={item.id}
              item={item}
              showCategory={!activeCategory && categories.length > 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
