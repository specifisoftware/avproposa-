'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { QAItem } from '@/types/qa'

export function FAQHub({ items }: { items: QAItem[] }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Unique categories in the order they appear
  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean))
  ) as string[]

  const filtered = items.filter((item) => {
    const matchSearch =
      !search.trim() ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
    const matchCat = !activeCategory || item.category === activeCategory
    return matchSearch && matchCat
  })

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
            <Link
              key={item.id}
              href={`/faq/${item.slug}`}
              className="group flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-[#2563EB] hover:shadow-sm transition-all min-h-[60px]"
            >
              <div className="w-7 h-7 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-[#2563EB] transition-colors">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth="2.5" className="group-hover:stroke-white transition-[stroke]">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                </svg>
              </div>

              <span className="flex-1 text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug">
                {item.question}
              </span>

              {item.category && !activeCategory && (
                <span className="hidden sm:block shrink-0 text-[10px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {item.category}
                </span>
              )}

              <svg
                width="15" height="15" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth="2.5"
                className="shrink-0 text-slate-300 group-hover:text-[#2563EB] transition-colors"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
