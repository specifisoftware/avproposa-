'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import type { QAItem } from '@/types/qa'

export default function AdminFAQPage() {
  const [items, setItems] = useState<QAItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('qa_items')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false })
      setItems(data ?? [])
      setLoading(false)
    })()
  }, [])

  const togglePublished = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('qa_items').update({ published: !current }).eq('id', id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, published: !current } : i)))
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this Q&A? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('qa_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading…</div>

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Q&amp;A Hub</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} question{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/faq"
            target="_blank"
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            View Hub ↗
          </Link>
          <Link
            href="/admin/faq/new"
            className="bg-[#2563EB] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            + New Question
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Question</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Category</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Order</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Published</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-[#0F172A] line-clamp-1">
                    {item.question || <span className="text-slate-300 italic">Untitled</span>}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">/faq/{item.slug}</p>
                </td>
                <td className="px-5 py-3.5 hidden sm:table-cell">
                  {item.category ? (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{item.category}</span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">{item.position}</td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => togglePublished(item.id, item.published)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      item.published ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      item.published ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-4 justify-end">
                    {item.published && (
                      <Link
                        href={`/faq/${item.slug}`}
                        target="_blank"
                        className="text-slate-400 hover:text-slate-600 text-xs transition-colors"
                      >
                        View ↗
                      </Link>
                    )}
                    <Link
                      href={`/admin/faq/${item.id}`}
                      className="text-[#2563EB] hover:text-blue-700 text-xs font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-400 hover:text-red-600 text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="px-5 py-14 text-center">
            <p className="text-slate-400 text-sm mb-3">No questions yet</p>
            <Link href="/admin/faq/new" className="text-[#2563EB] text-sm font-medium hover:underline">
              Add your first question →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
