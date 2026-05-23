'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Category = { id: string; name: string; position: number; created_at: string }

export default function AdminFAQCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('qa_categories')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const addCategory = async () => {
    const name = newName.trim()
    if (!name) return
    setAdding(true)
    setError(null)
    const supabase = createClient()
    const { error: e } = await supabase
      .from('qa_categories')
      .insert({ name, position: categories.length })
    if (e) {
      setError(e.message.includes('unique') ? 'That category already exists.' : e.message)
    } else {
      setNewName('')
      await fetchCategories()
    }
    setAdding(false)
  }

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Questions using it will become uncategorised.`)) return
    const supabase = createClient()
    await supabase.from('qa_categories').delete().eq('id', id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading…</div>

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Q&amp;A Categories</h1>
        <p className="text-slate-400 text-sm mt-1">
          Add categories here first, then assign them to questions in the editor.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      {/* Add new */}
      <div className="flex gap-3 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          placeholder="New category name…"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors"
        />
        <button
          onClick={addCategory}
          disabled={adding || !newName.trim()}
          className="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40"
        >
          {adding ? 'Adding…' : 'Add'}
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {categories.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">
            No categories yet — add one above.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] opacity-60" />
                  <span className="text-sm font-medium text-[#0F172A]">{cat.name}</span>
                </div>
                <button
                  onClick={() => deleteCategory(cat.id, cat.name)}
                  className="text-red-400 hover:text-red-600 text-xs transition-colors"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
