'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { QAItem } from '@/types/qa'

export function FAQHub({ items }: { items: QAItem[] }) {
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean))
  ) as string[]

  const filtered = items.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q)
    const matchCat = !activeCategory || item.category === activeCategory
    return matchSearch && matchCat
  })

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          width="16" height="16" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth="2"
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

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeCategory
                ? 'bg-[#2563EB] text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Count */}
      {search && (
        <p className="text-xs text-slate-400 mb-4">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Q&A list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">No questions match your search.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const isOpen = openId === item.id
            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl overflow-hidden transition-shadow ${
                  isOpen ? 'border-[#2563EB] shadow-md' : 'border-gray-200 hover:border-slate-300'
                }`}
              >
                {/* Question row */}
                <div className="flex items-center gap-2 px-5 py-4 min-h-[56px]">
                  <button
                    className="flex-1 text-left min-w-0"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                  >
                    <span className={`text-sm font-semibold leading-snug transition-colors ${isOpen ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                      {item.question}
                    </span>
                    {item.category && (
                      <span className="ml-2 text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full align-middle">
                        {item.category}
                      </span>
                    )}
                  </button>

                  {/* Permalink */}
                  <Link
                    href={`/faq/${item.slug}`}
                    title="Open permalink"
                    className="shrink-0 p-1.5 text-slate-300 hover:text-[#2563EB] transition-colors rounded-lg hover:bg-blue-50"
                  >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>

                  {/* Expand */}
                  <button
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="shrink-0 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    aria-label={isOpen ? 'Collapse' : 'Expand'}
                  >
                    <svg
                      width="16" height="16" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" strokeWidth="2.5"
                      className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Answer */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-blue-50">
                    <div
                      className="mt-4 text-sm text-slate-600 leading-relaxed [&_a]:text-[#2563EB] [&_a]:underline [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_p]:mb-3 [&_p:last-child]:mb-0"
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                    <div className="mt-5 flex items-center justify-between">
                      <Link
                        href={`/faq/${item.slug}`}
                        className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
                      >
                        Permalink
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
