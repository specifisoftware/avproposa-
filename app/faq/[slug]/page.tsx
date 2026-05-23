import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CopyLinkButton } from './CopyLinkButton'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data } = await supabase
    .from('qa_items')
    .select('question, answer')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  const description = data?.answer
    ? data.answer.replace(/<[^>]+>/g, '').slice(0, 160)
    : 'AVProposal Help Center'

  return {
    title: data?.question ? `${data.question} — AVProposal Help` : 'AVProposal Help',
    description,
  }
}

export default async function FAQItemPage({ params }: Props) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: item } = await supabase
    .from('qa_items')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!item) notFound()

  // Adjacent items for prev/next navigation
  const { data: siblings } = await supabase
    .from('qa_items')
    .select('question, slug')
    .eq('published', true)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  const idx = siblings?.findIndex((s) => s.slug === params.slug) ?? -1
  const prev = idx > 0 ? siblings![idx - 1] : null
  const next = siblings && idx < siblings.length - 1 ? siblings[idx + 1] : null

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/faq/${params.slug}`

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center shrink-0">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors tracking-tight">
              AVProposal
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/faq" className="text-sm text-slate-500 hover:text-[#0F172A] transition-colors font-medium">
              ← Help Center
            </Link>
            <Link
              href="/auth?tab=register"
              className="hidden sm:block px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-lg transition-colors"
            >
              Try Free
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <Link href="/faq" className="hover:text-[#2563EB] transition-colors font-medium">Help Center</Link>
          {item.category && (
            <>
              <span>·</span>
              <span>{item.category}</span>
            </>
          )}
        </div>

        {/* Question */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 mb-6">
          <div className="flex items-start gap-4 mb-8">
            <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] leading-tight tracking-tight flex-1">
              {item.question}
            </h1>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <div
              className="text-slate-600 leading-relaxed text-base [&_a]:text-[#2563EB] [&_a]:underline [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-2 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#0F172A] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#0F172A] [&_h3]:mt-4 [&_h3]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:pl-4 [&_blockquote]:text-slate-500 [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono"
              dangerouslySetInnerHTML={{ __html: item.answer }}
            />
          </div>

          {/* Share row */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CopyLinkButton url={pageUrl} />
            </div>
            {item.category && (
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {item.category}
              </span>
            )}
          </div>
        </div>

        {/* Prev / Next */}
        {(prev || next) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {prev ? (
              <Link
                href={`/faq/${prev.slug}`}
                className="group flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-[#2563EB] hover:shadow-sm transition-all"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="shrink-0 text-slate-400 group-hover:text-[#2563EB] transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Previous</p>
                  <p className="text-sm font-medium text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate">{prev.question}</p>
                </div>
              </Link>
            ) : <div />}
            {next && (
              <Link
                href={`/faq/${next.slug}`}
                className="group flex items-center justify-end gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-[#2563EB] hover:shadow-sm transition-all text-right"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Next</p>
                  <p className="text-sm font-medium text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate">{next.question}</p>
                </div>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="shrink-0 text-slate-400 group-hover:text-[#2563EB] transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        )}

        {/* Back link */}
        <div className="text-center">
          <Link href="/faq" className="text-sm text-slate-400 hover:text-[#2563EB] transition-colors font-medium">
            ← Back to all questions
          </Link>
        </div>
      </main>
    </div>
  )
}
