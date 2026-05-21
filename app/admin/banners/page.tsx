'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Banner = {
  id: string
  position: 'left' | 'right'
  image_url: string
  link_url: string | null
  active: boolean
}

type Slot = {
  data: Banner | null
  imageUrl: string
  previewUrl: string
  linkUrl: string
  active: boolean
  uploading: boolean
  saving: boolean
  error: string | null
}

const init = (b: Banner | null): Slot => ({
  data: b,
  imageUrl: b?.image_url ?? '',
  previewUrl: b?.image_url ?? '',
  linkUrl: b?.link_url ?? '',
  active: b?.active ?? true,
  uploading: false,
  saving: false,
  error: null,
})

export default function BannersPage() {
  const [left, setLeft] = useState<Slot>(init(null))
  const [right, setRight] = useState<Slot>(init(null))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      // Admin bypass: use RLS-bypassing select (admins see all rows via policy)
      const { data } = await supabase.from('banners').select('*')
      setLeft(init(data?.find((b) => b.position === 'left') ?? null))
      setRight(init(data?.find((b) => b.position === 'right') ?? null))
      setLoading(false)
    })()
  }, [])

  const upload = async (pos: 'left' | 'right', file: File) => {
    const set = pos === 'left' ? setLeft : setRight
    set((s) => ({ ...s, uploading: true, error: null }))

    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      set((s) => ({ ...s, previewUrl: base64, imageUrl: base64, uploading: false }))
    }
    reader.onerror = () => {
      set((s) => ({ ...s, uploading: false, error: 'Failed to read file' }))
    }
    reader.readAsDataURL(file)
  }

  const save = async (pos: 'left' | 'right') => {
    const state = pos === 'left' ? left : right
    const set = pos === 'left' ? setLeft : setRight
    if (!state.imageUrl) { set((s) => ({ ...s, error: 'Upload an image first' })); return }
    set((s) => ({ ...s, saving: true, error: null }))
    const supabase = createClient()
    const payload = {
      position: pos,
      image_url: state.imageUrl,
      link_url: state.linkUrl || null,
      active: state.active,
    }
    try {
      if (state.data) {
        const { error } = await supabase.from('banners').update(payload).eq('id', state.data.id)
        if (error) throw error
        set((s) => ({ ...s, data: { ...s.data!, ...payload }, saving: false }))
      } else {
        const { data, error } = await supabase.from('banners').insert(payload).select().single()
        if (error) throw error
        set((s) => ({ ...s, data, saving: false }))
      }
    } catch (e) {
      set((s) => ({ ...s, saving: false, error: e instanceof Error ? e.message : 'Save failed' }))
    }
  }

  const remove = async (pos: 'left' | 'right') => {
    const state = pos === 'left' ? left : right
    const set = pos === 'left' ? setLeft : setRight
    if (!state.data || !confirm('Remove this banner?')) return
    const supabase = createClient()
    await supabase.from('banners').delete().eq('id', state.data.id)
    set(init(null))
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading…</div>

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Side Banners</h1>
        <p className="text-slate-400 text-sm mt-1">
          Shown on the left and right of the proposal builder on wide screens (≥ 1536 px).
        </p>
        <div className="mt-3 inline-flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-blue-700 space-y-0.5">
            <p><span className="font-semibold">Tövsiyə olunan ölçü:</span> 200 × 400 px</p>
            <p><span className="font-semibold">Format:</span> PNG, JPG, WebP</p>
            <p><span className="font-semibold">Nisbət:</span> Şaquli (portrait) — en 200 px sabit, hündürlük sərbəst</p>
            <p><span className="font-semibold">Maks. fayl ölçüsü:</span> 5 MB</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['left', 'right'] as const).map((pos) => {
          const s = pos === 'left' ? left : right
          const set = pos === 'left' ? setLeft : setRight

          return (
            <div key={pos} className="bg-white rounded-2xl border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-[#0F172A] capitalize">{pos} Banner</h2>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs text-slate-500">Active</span>
                  <button
                    type="button"
                    onClick={() => set((p) => ({ ...p, active: !p.active }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      s.active ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                      s.active ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                </label>
              </div>

              {s.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg mb-4">
                  {s.error}
                </div>
              )}

              {/* Image */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Banner Image
                </label>
                {s.previewUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.previewUrl}
                      alt="Banner preview"
                      className="w-full object-cover"
                      style={{ maxHeight: '220px', objectFit: 'cover' }}
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-lg">
                        {s.uploading ? 'Uploading…' : 'Change image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={s.uploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) upload(pos, f)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
                    s.uploading ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-[#2563EB]'
                  }`}>
                    {s.uploading ? (
                      <p className="text-sm text-[#2563EB]">Uploading…</p>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-slate-400">Click to upload</p>
                        <p className="text-xs text-slate-300 mt-1">PNG, JPG, WebP · max 5 MB</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={s.uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) upload(pos, f)
                        e.target.value = ''
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Link URL */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Link URL <span className="text-slate-300">(optional)</span>
                </label>
                <input
                  type="url"
                  value={s.linkUrl}
                  onChange={(e) => set((p) => ({ ...p, linkUrl: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => save(pos)}
                  disabled={s.saving || s.uploading}
                  className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {s.saving ? 'Saving…' : s.data ? 'Update' : 'Save Banner'}
                </button>
                {s.data && (
                  <button
                    onClick={() => remove(pos)}
                    className="px-4 py-2.5 text-red-400 hover:text-red-600 border border-red-100 hover:border-red-200 rounded-xl text-sm transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
