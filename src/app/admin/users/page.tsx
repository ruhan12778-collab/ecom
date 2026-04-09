'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">Users</h2>
        <p className="text-sm text-stone-500 mt-0.5">{total} registered users</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button type="submit" className="btn btn-secondary px-4 py-2 text-sm">Search</button>
      </form>

      {loading ? (
        <div className="py-20 text-center text-stone-400 text-sm">Loading users...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Skill Level</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Points</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Level</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Streak</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="hover:bg-stone-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 text-xs font-medium flex items-center justify-center">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-stone-900">{user.name}</p>
                          <p className="text-xs text-stone-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-stone-50 text-stone-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                        user.skillLevel === 'ADVANCED' ? 'bg-red-50 text-red-700' :
                        user.skillLevel === 'INTERMEDIATE' ? 'bg-amber-50 text-amber-700' :
                        'bg-green-50 text-green-700'
                      }`}>
                        {user.skillLevel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-stone-900 tabular-nums">
                      {(user.gamification?.points ?? 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-stone-600 tabular-nums">
                      {user.gamification?.level ?? 1}
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-stone-600 tabular-nums">
                      {user.gamification?.currentStreak ?? 0}d
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-stone-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-sm text-stone-400">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-stone-400">
                Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-md text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-stone-500">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-md text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
