'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import type { BlogPost } from '@/types/blog'

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
      setPosts(data ?? [])
      setLoading(false)
    })()
  }, [])

  const togglePublished = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('blog_posts').update({ published: !current }).eq('id', id)
    setPosts((p) => p.map((post) => (post.id === id ? { ...post, published: !current } : post)))
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('blog_posts').delete().eq('id', id)
    setPosts((p) => p.filter((post) => post.id !== id))
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading…</div>

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Blog Posts</h1>
          <p className="text-slate-400 text-sm mt-1">{posts.length} posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-[#2563EB] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          + New Post
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Slug</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Published</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-[#0F172A]">
                  {post.title || <span className="text-slate-300 italic">Untitled</span>}
                </td>
                <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">/blog/{post.slug}</td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => togglePublished(post.id, post.published)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      post.published ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        post.published ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-4 justify-end">
                    {post.published && (
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-slate-400 hover:text-slate-600 text-xs transition-colors"
                      >
                        View ↗
                      </Link>
                    )}
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="text-[#2563EB] hover:text-blue-700 text-xs font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deletePost(post.id)}
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
        {posts.length === 0 && (
          <div className="px-5 py-14 text-center">
            <p className="text-slate-400 text-sm mb-3">No blog posts yet</p>
            <Link href="/admin/blog/new" className="text-[#2563EB] text-sm font-medium hover:underline">
              Create your first post →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
