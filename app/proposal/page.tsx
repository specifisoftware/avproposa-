'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  ProposalData,
  Room,
  makeDefaultProposal,
  calcSubtotal,
  formatCurrency,
} from '@/types/proposal'
import Navbar from '@/components/Navbar'
import ProposalPreview from '@/components/ProposalPreview'
import RoomCard from '@/components/RoomCard'

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
  const [downloading, setDownloading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
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

      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('proposals')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', today + 'T00:00:00.000Z')

      setProposalsToday(data?.length ?? 0)
      setPageLoading(false)
    }
    init()
  }, [router])

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

    // Upload to R2 in background and replace with CDN URL
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      setProposal((p) => ({ ...p, logoUrl: json.url }))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // ----- download PDF -----
  const handleDownload = async () => {
    if (proposalsToday >= 1 || downloading) return
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
          setProposalsToday(1)
          return
        }
        throw new Error(json.error ?? 'Could not save proposal record')
      }
      setProposalsToday(1)

      // Generate PDF from preview element
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const element = document.getElementById('proposal-preview')
      if (!element) throw new Error('Preview element not found')

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: 0,
        scrollX: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        width: element.scrollWidth,
        height: element.scrollHeight,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const canvasRatio = canvas.height / canvas.width
      const imgH = pdfWidth * canvasRatio
      let remaining = imgH
      let yOffset = 0

      pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, imgH)
      remaining -= pdfHeight

      while (remaining > 0) {
        yOffset -= pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, imgH)
        remaining -= pdfHeight
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
  const limitReached = proposalsToday >= 1

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── Left: Form ── */}
          <div className="space-y-5">

            {/* Project Info */}
            <Card>
              <SectionHeader title="Project Info" />
              <div className="grid grid-cols-2 gap-4">
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

          {/* ── Right: Preview ── */}
          <div className="lg:sticky lg:top-[73px] h-auto lg:h-[calc(100vh-5.5rem)] flex flex-col">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Live Preview
                </p>
                <span className="text-xs text-slate-300">Updates as you type</span>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
                <div className="shadow-xl rounded-lg overflow-hidden">
                  <ProposalPreview data={proposal} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
