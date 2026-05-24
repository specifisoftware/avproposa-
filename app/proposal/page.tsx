'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  ProposalData,
  ProposalTemplate,
  Room,
  makeDefaultProposal,
  calcSubtotal,
  formatCurrency,
} from '@/types/proposal'
import Navbar from '@/components/Navbar'
import ProposalPreview from '@/components/ProposalPreview'
import RoomCard from '@/components/RoomCard'
import { SideBanner } from '@/components/SideBanner'

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
      {title}
    </h2>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  )
}

export default function ProposalPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [proposal, setProposal] = useState<ProposalData>(makeDefaultProposal())
  const [proposalsToday, setProposalsToday] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form')
  const [banners, setBanners] = useState<{ left: { image_url: string; link_url: string | null } | null; right: { image_url: string; link_url: string | null } | null }>({ left: null, right: null })
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth')
        return
      }

      setUser({ id: user.id, email: user.email })

      const res = await fetch('/api/proposals')
      if (res.ok) {
        const json = await res.json()
        setProposalsToday(json.count ?? 0)
        setIsAdmin(json.isAdmin === true)
      }
      setPageLoading(false)
    }
    init()
  }, [router])

  // Fetch active banners
  useEffect(() => {
    createClient()
      .from('banners')
      .select('position, image_url, link_url')
      .eq('active', true)
      .then(({ data }) => {
        if (!data) return
        setBanners({
          left: data.find((b) => b.position === 'left') ?? null,
          right: data.find((b) => b.position === 'right') ?? null,
        })
      })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  // ----- rooms -----
  const addRoom = () =>
    setProposal((p) => ({
      ...p,
      rooms: [...p.rooms, { id: Date.now().toString(), name: '', type: '', equipment: [] }],
    }))

  const updateRoom = (room: Room) =>
    setProposal((p) => ({ ...p, rooms: p.rooms.map((r) => (r.id === room.id ? room : r)) }))

  const deleteRoom = (id: string) =>
    setProposal((p) => ({ ...p, rooms: p.rooms.filter((r) => r.id !== id) }))

  // ----- logo upload -----
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)

    // Show local preview immediately using base64
    const reader = new FileReader()
    reader.onload = (ev) => {
      setProposal((p) => ({ ...p, logoUrl: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)

    // Upload to R2 in background for storage — keep base64 in state to avoid CORS issues
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      // base64 stays in logoUrl — R2 URL stored for reference only
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // ----- download PDF -----
  const handleDownload = async () => {
    if ((!isAdmin && proposalsToday >= 1) || downloading) return
    setDownloading(true)
    setDownloadError(null)

    try {
      // Record the download first — enforces daily limit server-side
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: proposal.date }),
      })
      if (!res.ok) {
        const json = await res.json()
        if (res.status === 429) {
          if (!isAdmin) setProposalsToday(1)
          return
        }
        throw new Error(json.error ?? 'Could not save proposal record')
      }
      if (!isAdmin) setProposalsToday(1)

      // Generate PDF — render at A4 width in an off-screen container
      // so display:none / panel width / scroll position never affect the output
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const source = document.getElementById('proposal-preview')
      if (!source) throw new Error('Preview element not found')

      const A4_PX = 794 // A4 at 96 dpi

      const wrap = document.createElement('div')
      wrap.style.cssText = `position:fixed;top:0;left:-9999px;width:${A4_PX}px;background:#fff;z-index:-1`
      const clone = source.cloneNode(true) as HTMLElement
      clone.style.width = `${A4_PX}px`
      clone.style.boxSizing = 'border-box'
      wrap.appendChild(clone)
      document.body.appendChild(wrap)

      let canvas: HTMLCanvasElement
      try {
        canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          logging: false,
          width: A4_PX,
          windowWidth: A4_PX,
          backgroundColor: '#ffffff',
        })
      } finally {
        document.body.removeChild(wrap)
      }

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const imgH = pdfW * (canvas.height / canvas.width)
      let yOffset = 0
      let remaining = imgH

      pdf.addImage(imgData, 'PNG', 0, yOffset, pdfW, imgH)
      remaining -= pdfH

      while (remaining > 0) {
        yOffset -= pdfH
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, yOffset, pdfW, imgH)
        remaining -= pdfH
      }

      pdf.save(`proposal-${proposal.proposalNumber || 'draft'}.pdf`)
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

  // ----- financials -----
  const subtotal = calcSubtotal(proposal.rooms)
  const taxAmount = subtotal * (proposal.taxRate / 100)
  const grandTotal = subtotal + taxAmount
  const limitReached = !isAdmin && proposalsToday >= 1

  // ----- field helper -----
  const set = <K extends keyof ProposalData>(key: K, value: ProposalData[K]) =>
    setProposal((p) => ({ ...p, [key]: value }))

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        userEmail={user?.email ?? ''}
        onLogout={handleLogout}
        proposalsToday={proposalsToday}
      />

      {limitReached && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-amber-800">
              You&apos;ve used your free proposal today — unlock unlimited with{' '}
              <a href="#" className="font-semibold underline underline-offset-2">
                Specifi
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Mobile tab switcher — hidden on desktop */}
      <div className="lg:hidden sticky top-[57px] z-20 bg-white border-b border-gray-200 flex shrink-0">
        {(['form', 'preview'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              mobileTab === t
                ? 'text-[#2563EB] border-[#2563EB]'
                : 'text-slate-400 border-transparent'
            }`}
          >
            {t === 'form' ? 'Form' : 'Preview'}
          </button>
        ))}
      </div>

      <div className="flex gap-3 py-6 px-2 sm:px-4">

        {/* Left banner — 2xl+ only */}
        <div className="hidden 2xl:flex w-[200px] shrink-0 flex-col gap-3 self-start sticky top-[73px]">
          {banners.left && (
            <SideBanner imageUrl={banners.left.image_url} linkUrl={banners.left.link_url} />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start gap-6">

          {/* ── Left: Form ── */}
          <div className={`w-full lg:w-1/2 space-y-5 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>

            {/* Project Info */}
            <Card>
              <SectionHeader title="Project Info" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Client Name</label>
                  <input
                    type="text"
                    value={proposal.clientName}
                    onChange={(e) => set('clientName', e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Integrator Name</label>
                  <input
                    type="text"
                    value={proposal.integratorName}
                    onChange={(e) => set('integratorName', e.target.value)}
                    placeholder="AV Systems Inc"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Address</label>
                  <textarea
                    value={proposal.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="123 Main St&#10;City, State 12345"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={proposal.date}
                    onChange={(e) => set('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Proposal Number</label>
                  <input
                    type="text"
                    value={proposal.proposalNumber}
                    onChange={(e) => set('proposalNumber', e.target.value)}
                    placeholder="PROP-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>
              </div>
            </Card>

            {/* Template Picker */}
            <Card>
              <SectionHeader title="Proposal Template" />
              <div className="grid grid-cols-2 gap-3">
                {([
                  {
                    id: 'classic' as ProposalTemplate,
                    label: 'Classic',
                    desc: 'Clean & minimal',
                    preview: (
                      <div className="w-full h-full bg-white p-2 flex flex-col gap-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="h-2.5 w-14 bg-slate-800 rounded font-black" />
                            <div className="h-1.5 w-8 bg-blue-500 rounded mt-1" />
                          </div>
                          <div className="h-5 w-10 bg-slate-100 rounded" />
                        </div>
                        <div className="h-0.5 w-full rounded" style={{ background: 'linear-gradient(90deg,#2563eb,#7c3aed)' }} />
                        <div className="grid grid-cols-2 gap-1 mt-0.5">
                          <div className="h-6 bg-slate-50 rounded border-l-2 border-blue-500 pl-1 flex flex-col justify-center gap-0.5">
                            <div className="h-1 w-8 bg-blue-400 rounded" />
                            <div className="h-1.5 w-12 bg-slate-300 rounded" />
                          </div>
                          <div className="h-6 bg-slate-50 rounded border-l-2 border-slate-200 pl-1 flex flex-col justify-center gap-0.5">
                            <div className="h-1 w-8 bg-slate-300 rounded" />
                            <div className="h-1.5 w-10 bg-slate-200 rounded" />
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded p-1 flex flex-col gap-0.5">
                          <div className="h-1 w-6 bg-blue-400 rounded" />
                          <div className="h-1.5 w-full bg-slate-200 rounded" />
                          <div className="h-1.5 w-full bg-slate-100 rounded" />
                        </div>
                        <div className="flex justify-end mt-auto">
                          <div className="w-16 rounded overflow-hidden">
                            <div className="bg-slate-100 px-1 py-0.5 flex justify-between">
                              <div className="h-1 w-5 bg-slate-300 rounded" />
                              <div className="h-1 w-5 bg-slate-300 rounded" />
                            </div>
                            <div className="bg-slate-800 px-1 py-0.5 flex justify-between">
                              <div className="h-1 w-5 bg-white/60 rounded" />
                              <div className="h-1.5 w-6 bg-white rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: 'modern' as ProposalTemplate,
                    label: 'Modern',
                    desc: 'Bold & professional',
                    preview: (
                      <div className="w-full h-full flex flex-col">
                        <div className="bg-slate-800 p-2 flex justify-between items-center shrink-0">
                          <div className="h-3 w-10 bg-white/30 rounded" />
                          <div>
                            <div className="h-2.5 w-12 bg-white rounded font-black" />
                            <div className="h-1 w-8 bg-white/30 rounded mt-0.5 ml-auto" />
                          </div>
                        </div>
                        <div className="h-0.5 shrink-0" style={{ background: 'linear-gradient(90deg,#2563eb,#7c3aed,#2563eb)' }} />
                        <div className="flex-1 bg-white p-1.5 flex flex-col gap-1.5">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="bg-blue-50 rounded border border-blue-100 p-1 flex flex-col gap-0.5">
                              <div className="h-1 w-8 bg-blue-400 rounded" />
                              <div className="h-1.5 w-12 bg-slate-300 rounded" />
                            </div>
                            <div className="bg-slate-50 rounded border border-slate-100 p-1 flex flex-col gap-0.5">
                              <div className="h-1 w-8 bg-slate-300 rounded" />
                              <div className="h-1.5 w-10 bg-slate-200 rounded" />
                            </div>
                          </div>
                          <div className="rounded overflow-hidden border border-slate-200">
                            <div className="bg-slate-700 px-1.5 py-1 flex justify-between items-center">
                              <div className="h-1.5 w-10 bg-white/80 rounded" />
                              <div className="h-1.5 w-8 bg-sky-300 rounded" />
                            </div>
                            <div className="bg-slate-100 px-1.5 py-0.5 flex gap-2">
                              {[10, 6, 8, 8].map((w, i) => <div key={i} className="h-1 bg-slate-400 rounded" style={{ width: `${w * 2}px` }} />)}
                            </div>
                            <div className="px-1.5 py-0.5 flex gap-2">
                              {[10, 6, 8, 8].map((w, i) => <div key={i} className="h-1 bg-slate-200 rounded" style={{ width: `${w * 2}px` }} />)}
                            </div>
                          </div>
                          <div className="flex justify-end mt-auto">
                            <div className="w-16 rounded-lg overflow-hidden shadow-sm">
                              <div className="bg-slate-100 px-1 py-0.5 flex justify-between">
                                <div className="h-1 w-5 bg-slate-300 rounded" />
                                <div className="h-1 w-5 bg-slate-300 rounded" />
                              </div>
                              <div className="px-1 py-1 flex justify-between" style={{ background: 'linear-gradient(135deg,#1e40af,#2563eb)' }}>
                                <div className="h-1 w-5 bg-white/50 rounded" />
                                <div className="h-2 w-7 bg-white rounded" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-800 px-2 py-1 flex justify-between shrink-0">
                          <div className="h-1 w-12 bg-white/20 rounded" />
                          <div className="h-1 w-10 bg-white/20 rounded" />
                        </div>
                      </div>
                    ),
                  },
                ] as const).map(({ id, label, desc, preview }) => (
                  <button
                    key={id}
                    onClick={() => set('template', id)}
                    className={`relative rounded-xl border-2 overflow-hidden text-left transition-all ${
                      proposal.template === id
                        ? 'border-[#2563EB] shadow-md shadow-blue-500/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="h-32 bg-gray-50">
                      {preview}
                    </div>
                    <div className={`px-3 py-2 border-t ${proposal.template === id ? 'border-blue-100 bg-blue-50' : 'border-gray-100 bg-white'}`}>
                      <div className={`text-xs font-semibold ${proposal.template === id ? 'text-[#2563EB]' : 'text-slate-700'}`}>{label}</div>
                      <div className="text-xs text-slate-400">{desc}</div>
                    </div>
                    {proposal.template === id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#2563EB] rounded-full flex items-center justify-center">
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Company Logo */}
            <Card>
              <SectionHeader title="Company Logo" />
              {uploadError && (
                <p className="text-xs text-red-500 mb-3">{uploadError}</p>
              )}
              {proposal.logoUrl ? (
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proposal.logoUrl}
                    alt="Logo preview"
                    className="h-12 object-contain border border-gray-200 rounded-lg p-1 bg-gray-50"
                    onError={(e) => {
                      console.error('Logo failed to load:', proposal.logoUrl)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <button
                    onClick={() => set('logoUrl', '')}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className={`border-2 border-dashed rounded-xl px-6 py-5 text-center transition-colors ${
                    uploading ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-[#2563EB]'
                  }`}>
                    {uploading ? (
                      <p className="text-sm text-[#2563EB]">Uploading…</p>
                    ) : (
                      <>
                        <p className="text-sm text-slate-400">Click to upload logo</p>
                        <p className="text-xs text-slate-300 mt-1">PNG, JPG, SVG · max 5 MB</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </Card>

            {/* Rooms */}
            <Card>
              <SectionHeader title="Rooms &amp; Equipment" />
              <div className="space-y-4">
                {proposal.rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onUpdate={updateRoom}
                    onDelete={deleteRoom}
                  />
                ))}
                <button
                  onClick={addRoom}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3.5 text-sm text-slate-400 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors font-medium"
                >
                  + Add Room
                </button>
              </div>
            </Card>

            {/* Notes */}
            <Card>
              <SectionHeader title="Notes &amp; Terms" />
              <textarea
                value={proposal.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Add any notes, terms, or conditions for this proposal…"
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
              />
            </Card>

            {/* Pricing Summary */}
            <Card>
              <SectionHeader title="Pricing Summary" />
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-700 tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Tax Rate</span>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <input
                        type="number"
                        value={proposal.taxRate}
                        onChange={(e) => set('taxRate', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-16 px-2 py-1 text-sm text-right focus:outline-none"
                      />
                      <span className="px-2 py-1 bg-gray-50 text-slate-400 border-l border-gray-300 text-xs">%</span>
                    </div>
                  </div>
                  <span className="font-medium text-slate-700 tabular-nums">{formatCurrency(taxAmount)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-[#0F172A]">Grand Total</span>
                  <span className="font-bold text-[#0F172A] text-xl tabular-nums">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </Card>

            {/* Download CTA — sticky */}
            <div className="sticky bottom-4 z-20">
              {downloadError && (
                <p className="text-xs text-red-500 text-center mb-2">{downloadError}</p>
              )}
              {limitReached ? (
                <div className="bg-white rounded-2xl border border-amber-200 shadow-lg p-4">
                  <p className="text-sm text-amber-700 text-center mb-3 font-medium">
                    You&apos;ve used your free proposal today
                  </p>
                  <a
                    href="#"
                    className="block w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl font-semibold text-sm text-center transition-colors"
                  >
                    Unlock unlimited with Specifi →
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full bg-[#2563EB] hover:bg-blue-700 active:scale-[0.99] text-white py-3.5 px-4 rounded-2xl font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating PDF…
                    </span>
                  ) : (
                    'Download PDF'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── Mobile Preview (tab = preview) ── */}
          {mobileTab === 'preview' && (
            <div className="w-full lg:hidden">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Live Preview</p>
                  <span className="text-xs text-slate-300">Updates as you type</span>
                </div>
                <div className="overflow-x-auto bg-gray-100 p-4">
                  <ProposalPreview data={proposal} />
                </div>
              </div>
            </div>
          )}

          {/* ── Right: Preview (desktop) ── */}
          <div className="hidden lg:flex w-1/2 flex-col sticky top-[73px] h-[calc(100vh-73px)]">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-between rounded-t-2xl">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Live Preview
                </p>
                <span className="text-xs text-slate-300">Updates as you type</span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto bg-gray-100 p-4 rounded-b-2xl">
                <div className="shadow-xl rounded-lg overflow-hidden w-full">
                  <ProposalPreview data={proposal} />
                </div>
              </div>
            </div>
          </div>

        </div>
        </div>{/* end main content */}

        {/* Right banner — 2xl+ only */}
        <div className="hidden 2xl:flex w-[200px] shrink-0 flex-col gap-3 self-start sticky top-[73px]">
          {banners.right && (
            <SideBanner imageUrl={banners.right.image_url} linkUrl={banners.right.link_url} />
          )}
        </div>

      </div>{/* end three-col flex */}
    </div>
  )
}
