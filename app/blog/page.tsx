import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const revalidate = 60

export default async function BlogPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

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
          <Link
            href="/auth?tab=register"
            className="text-sm text-[#2563EB] font-medium hover:underline"
          >
            Try Free →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-14">
        <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2">Blog</h1>
        <p className="text-slate-400 mb-10">Insights and guides for AV professionals</p>

        {posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                <article className="border border-gray-200 rounded-2xl p-6 hover:border-[#2563EB] hover:shadow-sm transition-all">
                  <h2 className="text-base font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors mb-1.5">
                    {post.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No posts published yet.</p>
        )}
      </main>
    </div>
  )
}
