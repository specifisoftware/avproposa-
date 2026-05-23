'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type Tab = 'html' | 'css'

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function BlogEditorPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const router = useRouter()

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('html')

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [html, setHtml] = useState('')
  const [css, setCss] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [published, setPublished] = useState(false)

  useEffect(() => {
    if (isNew) return
    ;(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()
      if (error || !data) { router.replace('/admin/blog'); return }
      setTitle(data.title)
      setSlug(data.slug)
      setHtml(data.html_content)
      setCss(data.css_content)
      setCoverImage(data.cover_image ?? '')
      setPublished(data.published)
      setLoading(false)
    })()
  }, [id, isNew, router])

  const handleTitleChange = (v: string) => {
    setTitle(v)
    if (isNew) setSlug(slugify(v))
  }

  const handleCoverUpload = async (file: File) => {
    setCoverUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) setCoverImage(json.url)
      else setError(json.error ?? 'Upload failed')
    } catch {
      setError('Upload failed')
    } finally {
      setCoverUploading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    if (!slug.trim()) { setError('Slug is required'); return }
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      html_content: html,
      css_content: css,
      cover_image: coverImage.trim() || null,
      published,
      updated_at: new Date().toISOString(),
    }
    try {
      if (isNew) {
        const { error } = await supabase.from('blog_posts').insert({ ...payload, author_id: user?.id ?? null })
        if (error) throw error
        router.replace('/admin/blog')
      } else {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', id)
        if (error) throw error
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const previewSrc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 24px; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
    ${css}
  </style>
</head>
<body>${html}</body>
</html>`

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading…</div>

  return (
    <div className="flex items-start gap-0 min-h-screen">

      {/* ── Left: Editor ── */}
      <div className="flex-1 min-w-0 p-8 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/blog" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
              ← Blog
            </Link>
            <span className="text-slate-200">·</span>
            <h1 className="text-base font-bold text-[#0F172A]">
              {isNew ? 'New Post' : 'Edit Post'}
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
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    published ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#2563EB] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : isNew ? 'Create Post' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Title & Slug */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title…"
            className="w-full text-xl font-bold text-[#0F172A] border-0 outline-none placeholder:text-slate-200 bg-transparent mb-3"
          />
          <div className="flex items-center gap-1.5 border-t border-gray-100 pt-3">
            <span className="text-xs text-slate-400 shrink-0">/blog/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-slug"
              className="text-xs text-slate-500 border-0 outline-none bg-transparent font-mono flex-1 min-w-0"
            />
          </div>
        </div>

        {/* Cover Image */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cover Image</p>
          {coverImage && (
            <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-slate-500 hover:text-red-500 rounded-lg p-1.5 text-xs transition-colors"
                title="Remove cover image"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Paste image URL…"
              className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-[#2563EB] transition-colors placeholder:text-slate-300"
            />
            <label className={`shrink-0 cursor-pointer px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${coverUploading ? 'bg-slate-50 text-slate-300 border-gray-100' : 'bg-slate-50 text-slate-600 border-gray-200 hover:border-[#2563EB] hover:text-[#2563EB]'}`}>
              {coverUploading ? 'Uploading…' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={coverUploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f) }}
              />
            </label>
          </div>
        </div>

        {/* Code editor */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-slate-50">
            {(['html', 'css'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? 'border-[#2563EB] text-[#2563EB] bg-white'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* HTML editor */}
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder={'<h1>Hello World</h1>\n<p>Your blog content here…</p>'}
            spellCheck={false}
            className={`w-full font-mono text-sm p-5 bg-[#0D1117] text-[#79c0ff] outline-none resize-none leading-relaxed ${tab === 'html' ? 'block' : 'hidden'}`}
            style={{ minHeight: '320px' }}
          />

          {/* CSS editor */}
          <textarea
            value={css}
            onChange={(e) => setCss(e.target.value)}
            placeholder={'h1 {\n  color: #0F172A;\n  font-size: 2rem;\n}\n\np {\n  line-height: 1.8;\n  color: #475569;\n}'}
            spellCheck={false}
            className={`w-full font-mono text-sm p-5 bg-[#0D1117] text-[#7ee787] outline-none resize-none leading-relaxed ${tab === 'css' ? 'block' : 'hidden'}`}
            style={{ minHeight: '320px' }}
          />
        </div>

      </div>

      {/* ── Right: Live Preview ── */}
      <div className="w-[45%] shrink-0 sticky top-0 border-l border-gray-200 bg-gray-50 flex flex-col" style={{ height: '100vh' }}>
        <div className="px-5 py-3 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Preview</p>
          <span className="text-xs text-slate-300">Live</span>
        </div>
        <iframe
          srcDoc={previewSrc}
          className="flex-1 w-full border-0"
          title="Blog preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

    </div>
  )
}
