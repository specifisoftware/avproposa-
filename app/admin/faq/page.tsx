'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import type { QAItem } from '@/types/qa'

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// ── CSV parser (handles quoted fields with embedded commas / newlines) ──────
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue }
      if (ch === '"') { inQuotes = false; i++; continue }
      field += ch; i++
    } else {
      if (ch === '"') { inQuotes = true; i++; continue }
      if (ch === ',') { row.push(field.trim()); field = ''; i++; continue }
      if (ch === '\r') { i++; continue }
      if (ch === '\n') {
        row.push(field.trim()); field = ''
        if (row.some(Boolean)) rows.push(row)
        row = []; i++; continue
      }
      field += ch; i++
    }
  }
  row.push(field.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

// ── TXT parser (tab or pipe delimited) ───────────────────────────────────────
function parseTXT(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  const delimiter = lines[0]?.includes('\t') ? '\t' : '|'
  return lines.map((l) => l.split(delimiter).map((c) => c.trim()))
}

type ParsedRow = { question: string; answer: string; category: string; include: boolean }

function parseFile(name: string, text: string): ParsedRow[] {
  const ext = name.split('.').pop()?.toLowerCase()
  const raw = ext === 'csv' ? parseCSV(text) : parseTXT(text)
  if (raw.length === 0) return []

  // Detect header row
  const firstLower = raw[0].map((c) => c.toLowerCase())
  const hasHeader =
    firstLower.some((c) => ['question', 'title', 'q'].includes(c)) ||
    firstLower.some((c) => ['answer', 'a'].includes(c))
  const dataRows = hasHeader ? raw.slice(1) : raw

  // Map columns by header name if present, else positional
  let qIdx = 0, aIdx = 1, cIdx = 2
  if (hasHeader) {
    firstLower.forEach((h, i) => {
      if (['question', 'title', 'q'].includes(h)) qIdx = i
      else if (['answer', 'a'].includes(h)) aIdx = i
      else if (['category', 'cat', 'tag'].includes(h)) cIdx = i
    })
  }

  return dataRows
    .filter((r) => r[qIdx])
    .map((r) => ({
      question: r[qIdx] ?? '',
      answer: r[aIdx] ?? '',
      category: r[cIdx] ?? '',
      include: true,
    }))
}

// ── Bulk Upload Modal ─────────────────────────────────────────────────────────
function BulkUploadModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [publishAll, setPublishAll] = useState(true)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ ok: number; skipped: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setResult(null); setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseFile(file.name, text)
      if (parsed.length === 0) { setError('No valid rows found in the file.'); return }
      setRows(parsed)
      setFileName(file.name)
    }
    reader.readAsText(file)
  }

  const toggleRow = (i: number) =>
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, include: !r.include } : r))

  const includedCount = rows.filter((r) => r.include).length

  const handleImport = async () => {
    const toImport = rows.filter((r) => r.include && r.question.trim())
    if (!toImport.length) return
    setImporting(true); setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get existing slugs to avoid duplicates
    const { data: existing } = await supabase.from('qa_items').select('slug')
    const usedSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug))

    const payload = toImport.map((r, i) => {
      const base = slugify(r.question) || `faq-${Date.now()}-${i}`
      let slug = base
      let n = 2
      while (usedSlugs.has(slug)) { slug = `${base}-${n++}` }
      usedSlugs.add(slug)
      return {
        question: r.question.trim(),
        slug,
        answer: r.answer.trim(),
        category: r.category.trim() || null,
        published: publishAll,
        author_id: user?.id ?? null,
      }
    })

    const { error: e } = await supabase.from('qa_items').insert(payload)
    if (e) { setError(e.message); setImporting(false); return }
    setResult({ ok: payload.length, skipped: rows.length - payload.length - (rows.length - toImport.length) })
    setImporting(false)
    onImported()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl mt-10 mb-10">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Bulk Upload Q&amp;A</h2>
            <p className="text-xs text-slate-400 mt-0.5">Import questions from a CSV or TXT file</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-5">

          {/* Format hint */}
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 text-xs text-slate-500 space-y-1.5">
            <p className="font-semibold text-slate-600">Expected format</p>
            <p><span className="font-medium">CSV</span> — columns: <code className="bg-white border border-gray-200 px-1 py-0.5 rounded">question</code>, <code className="bg-white border border-gray-200 px-1 py-0.5 rounded">answer</code>, <code className="bg-white border border-gray-200 px-1 py-0.5 rounded">category</code> (header row optional)</p>
            <p><span className="font-medium">TXT</span> — same columns, tab-separated or pipe-separated (<code className="bg-white border border-gray-200 px-1 py-0.5 rounded">|</code>)</p>
            <p className="text-slate-400">The <em>category</em> column can be left blank. Quoted fields with commas are supported in CSV.</p>
          </div>

          {/* Drop zone */}
          {rows.length === 0 && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-[#2563EB] hover:bg-slate-50'
              }`}
            >
              <div className="text-3xl mb-3">📄</div>
              <p className="text-sm font-medium text-slate-600">Drop a CSV or TXT file here</p>
              <p className="text-xs text-slate-400 mt-1">or click to browse</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
              Imported <strong>{result.ok}</strong> question{result.ok !== 1 ? 's' : ''} successfully.
              {result.skipped > 0 && ` ${result.skipped} row${result.skipped !== 1 ? 's' : ''} skipped (empty question).`}
            </div>
          )}

          {/* Preview table */}
          {rows.length > 0 && !result && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#0F172A]">
                  {fileName} — <span className="text-slate-400 font-normal">{rows.length} row{rows.length !== 1 ? 's' : ''} parsed</span>
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRows((prev) => prev.map((r) => ({ ...r, include: true })))}
                    className="text-xs text-[#2563EB] hover:underline"
                  >
                    Select all
                  </button>
                  <button
                    onClick={() => setRows((prev) => prev.map((r) => ({ ...r, include: false })))}
                    className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
                  >
                    Deselect all
                  </button>
                  <button
                    onClick={() => { setRows([]); setFileName(''); setError(null) }}
                    className="text-xs text-slate-400 hover:text-red-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 w-8" />
                        <th className="text-left px-3 py-2 font-semibold text-slate-400 uppercase tracking-wider">Question</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-400 uppercase tracking-wider w-1/3">Answer</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-400 uppercase tracking-wider w-28">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {rows.map((r, i) => (
                        <tr
                          key={i}
                          onClick={() => toggleRow(i)}
                          className={`cursor-pointer transition-colors ${r.include ? 'hover:bg-slate-50' : 'opacity-40 bg-slate-50 hover:bg-slate-100'}`}
                        >
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={r.include}
                              onChange={() => toggleRow(i)}
                              onClick={(e) => e.stopPropagation()}
                              className="accent-[#2563EB]"
                            />
                          </td>
                          <td className="px-3 py-2.5 font-medium text-[#0F172A] max-w-[180px]">
                            <span className="line-clamp-2">{r.question || <span className="text-red-400 italic">empty — will be skipped</span>}</span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 max-w-[200px]">
                            <span className="line-clamp-2">{r.answer || <span className="text-slate-300 italic">—</span>}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            {r.category
                              ? <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{r.category}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Footer controls */}
          {rows.length > 0 && !result && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setPublishAll((p) => !p)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                    publishAll ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    publishAll ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
                <span className="text-sm text-slate-600">Publish all imported questions</span>
              </label>

              <button
                onClick={handleImport}
                disabled={importing || includedCount === 0}
                className="bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                {importing ? 'Importing…' : `Import ${includedCount} Question${includedCount !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}

          {result && (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminFAQPage() {
  const [items, setItems] = useState<QAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [showBulk, setShowBulk] = useState(false)

  const fetchItems = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('qa_items')
      .select('*')
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const togglePublished = async (id: string, current: boolean) => {
    setToggleError(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('qa_items')
      .update({ published: !current })
      .eq('id', id)
    if (error) { setToggleError(`Failed to update: ${error.message}`); return }
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
    <>
      {showBulk && (
        <BulkUploadModal
          onClose={() => setShowBulk(false)}
          onImported={() => { fetchItems() }}
        />
      )}

      <div className="p-8 max-w-5xl">
        {toggleError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
            {toggleError}
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Q&amp;A Hub</h1>
            <p className="text-slate-400 text-sm mt-1">{items.length} question{items.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <Link
              href="/faq"
              target="_blank"
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              View Hub ↗
            </Link>
            <button
              onClick={() => setShowBulk(true)}
              className="border border-gray-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Bulk Upload
            </button>
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
    </>
  )
}
