import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlogIframe } from '@/components/BlogIframe'
import type { Metadata } from 'next'

export const revalidate = 60

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data } = await supabase
    .from('blog_posts')
    .select('title')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  return { title: data?.title ? `${data.title} — AVProposal Blog` : 'AVProposal Blog' }
}

export default async function BlogPostPage({ params }: Props) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, html_content, css_content, cover_image, created_at')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
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
            <Link href="/blog" className="text-sm text-slate-500 hover:text-[#0F172A] transition-colors font-medium">
              ← Blog
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

      {/* Cover image hero */}
      {post.cover_image && (
        <div className="w-full h-56 sm:h-72 md:h-96 overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Post header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/blog"
              className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider hover:underline"
            >
              Blog
            </Link>
            <span className="text-slate-200">·</span>
            <span className="text-xs text-slate-400">{formattedDate}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Full-width blog content */}
      <div className="bg-white mt-0">
        <BlogIframe html={post.html_content ?? ''} css={post.css_content ?? ''} />
      </div>

      {/* Footer CTA */}
      <div className="bg-slate-50 border-t border-gray-100 py-14">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-400 text-sm mb-6">← Back to all articles</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#2563EB] font-semibold hover:underline text-base mr-6"
          >
            More posts
          </Link>
          <Link
            href="/auth?tab=register"
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Try AVProposal Free →
          </Link>
        </div>
      </div>
    </div>
  )
}
