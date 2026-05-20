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
    .select('title, html_content, css_content, created_at')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-[#2563EB] rounded-md flex items-center justify-center">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8" />
              </svg>
            </div>
            <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
              AVProposal
            </span>
          </Link>
          <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            ← Blog
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2">{post.title}</h1>
        <p className="text-sm text-slate-400 mb-8 pb-8 border-b border-gray-100">
          {new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
        <BlogIframe html={post.html_content ?? ''} css={post.css_content ?? ''} />
      </main>
    </div>
  )
}
