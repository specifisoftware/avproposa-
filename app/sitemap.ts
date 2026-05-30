import { createClient } from '@supabase/supabase-js'
import type { MetadataRoute } from 'next'

export const revalidate = 0

const BASE_URL = 'https://www.avproposal.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [{ data: posts }, { data: qaItems }] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('slug, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('qa_items')
      .select('slug, updated_at')
      .eq('published', true)
      .order('position', { ascending: true }),
  ])

  const blogUrls: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const faqUrls: MetadataRoute.Sitemap = (qaItems ?? []).map((item) => ({
    url: `${BASE_URL}/faq/${item.slug}`,
    lastModified: new Date(item.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogUrls,
    ...faqUrls,
  ]
}
