'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { QAItem } from '@/types/qa'

function QuestionRow({ item }: { item: QAItem }) {
  return (
    <Link
      href={`/faq/${item.slug}`}
      className="group flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-[#2563EB] hover:shadow-sm transition-all min-h-[60px]"
    >
      <div className="w-7 h-7 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-[#2563EB] transition-colors">
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth="2.5" className="group-hover:stroke-white transition-colors">
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
      </div>
      <span className="flex-1 text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug">
        {item.question}
      </span>
      <svg
        width="16" height="16" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth="2.5"
        className="shrink-0 text-slate-300 group-hover:text-[#2563EB] transition-colors"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

export function FAQHub({ items }: { items: QAItem[] }) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? items.filter(
        (item) =>
          item.question.toLowerCase().includes(search.toLowerCase()) ||
          item.answer.toLowerCase().includes(search.toLowerCase()),
      )
    : items

  const hasCategories = items.some((i) => i.category)

  // Build ordered category groups from the already-sorted items list
  const groups: { category: string | null; items: QAItem[] }[] = []
  if (hasCategories && !search.trim()) {
    for (const item of filtered) {
      const last = groups[groups.length - 1]
      if (last && last.category === item.category) {
        last.items.push(item)
      } else {
        groups.push({ category: item.category ?? null, items: [item] })
      }
    }
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-8">
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

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">No questions match &ldquo;{search}&rdquo;</p>
          <button onClick={() => setSearch('')} className="mt-3 text-xs text-[#2563EB] hover:underline">
            Clear search
          </button>
        </div>
      ) : search.trim() ? (
        /* Flat search results */
        <div>
          <p className="text-xs text-slate-400 mb-4">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
          </p>
          <div className="space-y-2">
            {filtered.map((item) => <QuestionRow key={item.id} item={item} />)}
          </div>
        </div>
      ) : hasCategories ? (
        /* Grouped by category */
        <div className="space-y-10">
          {groups.map((group) => (
            <div key={group.category ?? '__uncategorised__'}>
              {group.category && (
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {group.category}
                  </h2>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-slate-300">{group.items.length}</span>
                </div>
              )}
              <div className="space-y-2">
                {group.items.map((item) => <QuestionRow key={item.id} item={item} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat list — no categories set */
        <div className="space-y-2">
          {filtered.map((item) => <QuestionRow key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}
