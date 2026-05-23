import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: postsData, error: postsError } = await supabase
    .from('blog_posts')
    .select('id, title, slug, cover_image, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  // Fallback if cover_image column doesn't exist yet (migration pending)
  let posts = postsData
  if (postsError) {
    const { data: fallback } = await supabase
      .from('blog_posts')
      .select('id, title, slug, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
    posts = (fallback ?? []).map((p) => ({ ...p, cover_image: null }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors tracking-tight">
              AVProposal
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-500 font-medium">
            <Link href="/#features" className="hover:text-[#0F172A] transition-colors">Features</Link>
            <Link href="/#how-it-works" className="hover:text-[#0F172A] transition-colors">How it works</Link>
            <Link href="/blog" className="text-[#0F172A] font-semibold">Blog</Link>
            <Link href="/faq" className="hover:text-[#0F172A] transition-colors">Help</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/auth?tab=login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#0F172A] transition-colors rounded-lg hover:bg-slate-50">
              Sign In
            </Link>
            <Link href="/auth?tab=register" className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-lg transition-colors">
              Try Free
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-[#0F172A] mb-3">Blog</h1>
          <p className="text-slate-400 text-lg">Insights and guides for AV professionals</p>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                <article className="h-full border border-gray-200 rounded-2xl overflow-hidden hover:border-[#2563EB] hover:shadow-md transition-all flex flex-col">
                  {/* Cover image or colour accent bar */}
                  {post.cover_image ? (
                    <div className="w-full h-44 overflow-hidden bg-slate-100 shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
                        <p className="text-white/80 text-[10px] font-mono truncate">
                          {post.cover_image.split('/').pop()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-full h-1.5 shrink-0"
                      style={{ background: ['#2563EB', '#7C3AED', '#059669', '#DC2626', '#D97706', '#0891B2'][i % 6] }}
                    />
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-base font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors mb-3 leading-snug flex-1">
                      {post.title}
                    </h2>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-slate-400">
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </p>
                      <span className="text-xs font-medium text-[#2563EB] group-hover:underline">
                        Read →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No posts published yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}
