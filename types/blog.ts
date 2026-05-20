export type BlogPost = {
  id: string
  title: string
  slug: string
  html_content: string
  css_content: string
  published: boolean
  created_at: string
  updated_at: string
  author_id: string | null
}
