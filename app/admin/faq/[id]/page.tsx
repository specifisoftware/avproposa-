'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function FAQEditorPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [question, setQuestion] = useState('')
  const [slug, setSlug] = useState('')
  const [answer, setAnswer] = useState('')
  const [category, setCategory] = useState('')
  const [published, setPublished] = useState(true)
  const [categoryOptions, setCategoryOptions] = useState<string[]>([])

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()

      // Always load categories
      const { data: cats } = await supabase
        .from('qa_categories')
        .select('name')
        .order('position', { ascending: true })
        .order('created_at', { ascending: true })
      setCategoryOptions((cats ?? []).map((c) => c.name))

      if (isNew) { setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('qa_items')
        .select('*')
        .eq('id', id)
        .single()
      if (fetchError || !data) { router.replace('/admin/faq'); return }
      setQuestion(data.question)
      setSlug(data.slug)
      setAnswer(data.answer)
      setCategory(data.category ?? '')
      setPublished(data.published)
      setLoading(false)
    })()
  }, [id, isNew, router])

  const handleQuestionChange = (v: string) => {
    setQuestion(v)
    if (isNew) setSlug(slugify(v))
  }

  const handleSave = async () => {
    if (!question.trim()) { setError('Question is required'); return }
    if (!slug.trim()) { setError('Slug is required'); return }
    if (!answer.trim()) { setError('Answer is required'); return }
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      question: question.trim(),
      slug: slug.trim(),
      answer: answer.trim(),
      category: category.trim() || null,
      published,
      updated_at: new Date().toISOString(),
    }
    try {
      if (isNew) {
        const { error: e } = await supabase
          .from('qa_items')
          .insert({ ...payload, author_id: user?.id ?? null })
        if (e) throw e
        router.replace('/admin/faq')
      } else {
        const { error: e } = await supabase
          .from('qa_items')
          .update(payload)
          .eq('id', id)
        if (e) throw e
      }
    } catch (e) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : 'Save failed'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading…</div>

  return (
    <div className="p-6 sm:p-8 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/faq" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
            ← Q&amp;A Hub
          </Link>
          <span className="text-slate-200">·</span>
          <h1 className="text-base font-bold text-[#0F172A]">
            {isNew ? 'New Question' : 'Edit Question'}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm text-slate-500">Published</span>
            <button
              type="button"
              onClick={() => setPublished((p) => !p)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                published ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                published ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </button>
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2563EB] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Question */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Question</label>
          <textarea
            value={question}
            onChange={(e) => handleQuestionChange(e.target.value)}
            placeholder="What is AVProposal?"
            rows={2}
            className="w-full text-base font-semibold text-[#0F172A] border-0 outline-none placeholder:text-slate-200 bg-transparent resize-none leading-snug"
          />
          <div className="flex items-center gap-1.5 border-t border-gray-100 pt-3 mt-2">
            <span className="text-xs text-slate-400 shrink-0">/faq/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="question-slug"
              className="text-xs text-slate-500 border-0 outline-none bg-transparent font-mono flex-1 min-w-0"
            />
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
            <Link href="/admin/faq/categories" className="text-[10px] text-[#2563EB] hover:underline">
              Manage categories →
            </Link>
          </div>
          {categoryOptions.length > 0 ? (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm text-[#0F172A] border-0 outline-none bg-transparent cursor-pointer"
            >
              <option value="">— No category —</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-slate-300">
              No categories yet.{' '}
              <Link href="/admin/faq/categories" className="text-[#2563EB] hover:underline">Add one first →</Link>
            </p>
          )}
        </div>

        {/* Answer */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Answer</label>
            <span className="text-[10px] text-slate-300">Plain text or HTML</span>
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={"AVProposal is an AI-powered proposal generator for AV professionals.\n\nYou can create, preview, and download polished PDF proposals in minutes."}
            spellCheck
            rows={14}
            className="w-full text-sm text-slate-700 p-5 border-0 outline-none resize-y leading-relaxed bg-white"
          />
        </div>

        {/* Preview */}
        {answer && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Preview</p>
            <div
              className="text-sm text-slate-600 leading-relaxed [&_a]:text-[#2563EB] [&_a]:underline [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_p]:mb-3 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{
                __html: answer.includes('<')
                  ? answer
                  : answer.split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
