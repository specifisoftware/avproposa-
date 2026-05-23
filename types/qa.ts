export type QAItem = {
  id: string
  question: string
  slug: string
  answer: string
  category: string | null
  published: boolean
  position: number
  created_at: string
  updated_at: string
  author_id: string | null
}
