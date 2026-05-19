import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

function makeSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    },
  )
}

export async function GET() {
  const supabase = makeSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('proposals')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', today + 'T00:00:00.000Z')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ count: data?.length ?? 0 })
}

export async function POST(request: Request) {
  const supabase = makeSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('proposals')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', today + 'T00:00:00.000Z')

  if (existing && existing.length >= 1) {
    return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 })
  }

  const body = await request.json().catch(() => ({}))

  const { data, error } = await supabase
    .from('proposals')
    .insert({ user_id: user.id, date: body.date ?? today })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ proposal: data })
}
