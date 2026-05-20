'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Profile = {
  id: string
  email: string | null
  is_admin: boolean
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      setUsers(data ?? [])
      setLoading(false)
    })()
  }, [])

  const toggleAdmin = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('profiles').update({ is_admin: !current }).eq('id', id)
    setUsers((u) => u.map((p) => (p.id === id ? { ...p, is_admin: !current } : p)))
  }

  if (loading) {
    return <div className="p-8 text-slate-400 text-sm">Loading…</div>
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Users</h1>
        <p className="text-slate-400 text-sm mt-1">{users.length} registered</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-[#0F172A]">{u.email ?? '—'}</td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">
                  {new Date(u.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => toggleAdmin(u.id, u.is_admin)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      u.is_admin ? 'bg-[#2563EB]' : 'bg-gray-200'
                    }`}
                    title={u.is_admin ? 'Remove admin' : 'Make admin'}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        u.is_admin ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="px-5 py-12 text-center text-slate-400 text-sm">No users yet</div>
        )}
      </div>
    </div>
  )
}
