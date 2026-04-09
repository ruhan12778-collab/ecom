'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserDetail {
  id: string
  email: string
  name: string
  avatar: string | null
  skillLevel: string
  role: string
  createdAt: string
  gamification: {
    points: number
    level: number
    currentStreak: number
    longestStreak: number
    coursesCompleted: number
    modulesCompleted: number
    totalWatchTime: number
  } | null
  enrollments: Array<{
    id: string
    progress: number
    enrolledAt: string
    completedAt: string | null
    course: { id: string; title: string; slug: string; thumbnail: string | null; category: string; difficulty: string }
  }>
  orders: Array<{
    id: string
    orderNumber: string
    status: string
    total: number
    createdAt: string
    items: Array<{ id: string; price: number; course: { id: string; title: string; slug: string; thumbnail: string | null } }>
  }>
  badges: Array<{
    id: string
    unlockedAt: string
    badge: { id: string; name: string; description: string; icon: string; rarity: string }
  }>
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-green-50 text-green-700',
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-red-50 text-red-700',
  REFUNDED: 'bg-stone-100 text-stone-600',
}

const RARITY_STYLES: Record<string, string> = {
  COMMON: 'bg-stone-100 text-stone-600',
  UNCOMMON: 'bg-green-50 text-green-700',
  RARE: 'bg-blue-50 text-blue-700',
  EPIC: 'bg-purple-50 text-purple-700',
  LEGENDARY: 'bg-amber-50 text-amber-700',
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editedRole, setEditedRole] = useState('')
  const [editedPoints, setEditedPoints] = useState(0)
  const [editedLevel, setEditedLevel] = useState(1)
  const [editedStreak, setEditedStreak] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const init = async () => {
      const { id } = await params
      setUserId(id)
      await fetchUser(id)
    }
    init()
  }, [params])

  const fetchUser = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`)
      const json = await res.json()
      if (json.success) {
        setUser(json.data)
        setEditedRole(json.data.role)
        setEditedPoints(json.data.gamification?.points ?? 0)
        setEditedLevel(json.data.gamification?.level ?? 1)
        setEditedStreak(json.data.gamification?.currentStreak ?? 0)
      }
    } catch {
      console.error('Failed to fetch user')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editedRole,
          points: editedPoints,
          level: editedLevel,
          currentStreak: editedStreak,
        }),
      })
      if (res.ok) {
        setMessage('Changes saved')
        await fetchUser(userId)
        setTimeout(() => setMessage(''), 2500)
      } else {
        const data = await res.json()
        setMessage(data.error || 'Save failed')
      }
    } catch {
      setMessage('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete user "${user?.name}"? This removes all their data (enrollments, orders, progress, etc.)`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/users')
      } else {
        const data = await res.json()
        setMessage(data.error || 'Delete failed')
        setDeleting(false)
      }
    } catch {
      setMessage('Delete failed')
      setDeleting(false)
    }
  }

  if (loading) return <div className="py-20 text-center text-stone-400 text-sm">Loading user...</div>
  if (!user) return <div className="py-20 text-center text-red-500 text-sm">User not found</div>

  const totalSpent = user.orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + Number(o.total), 0)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Users
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="w-16 h-16 rounded-full bg-stone-900 text-white text-xl font-medium flex items-center justify-center">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </span>
            <div>
              <h1 className="text-xl font-semibold text-stone-900">{user.name}</h1>
              <p className="text-sm text-stone-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                  user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-stone-50 text-stone-500'
                }`}>
                  {user.role}
                </span>
                <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-stone-50 text-stone-500">
                  {user.skillLevel}
                </span>
                <span className="text-xs text-stone-400">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Points', value: user.gamification?.points ?? 0 },
          { label: 'Level', value: user.gamification?.level ?? 1 },
          { label: 'Current Streak', value: `${user.gamification?.currentStreak ?? 0}d` },
          { label: 'Longest Streak', value: `${user.gamification?.longestStreak ?? 0}d` },
          { label: 'Courses Done', value: user.gamification?.coursesCompleted ?? 0 },
          { label: 'Modules Done', value: user.gamification?.modulesCompleted ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-xs text-stone-500">{s.label}</p>
            <p className="text-xl font-bold text-stone-900 mt-1 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Admin controls */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">Admin Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Role</label>
            <select
              value={editedRole}
              onChange={(e) => setEditedRole(e.target.value)}
              className="input"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Points</label>
            <input
              type="number"
              value={editedPoints}
              onChange={(e) => setEditedPoints(Number(e.target.value))}
              className="input"
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Level</label>
            <input
              type="number"
              value={editedLevel}
              onChange={(e) => setEditedLevel(Number(e.target.value))}
              className="input"
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Streak (days)</label>
            <input
              type="number"
              value={editedStreak}
              onChange={(e) => setEditedStreak(Number(e.target.value))}
              className="input"
              min={0}
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-stone-500">
            Total spent (completed orders): <span className="font-medium text-stone-900">£{totalSpent.toFixed(2)}</span>
          </span>
          <div className="flex items-center gap-3">
            {message && <span className="text-xs text-stone-500">{message}</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Enrolled courses */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-900">Enrolled Courses ({user.enrollments.length})</h2>
        </div>
        {user.enrollments.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">No enrollments</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Course</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Level</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Progress</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Enrolled</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {user.enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-stone-900 font-medium">{e.course.title}</td>
                  <td className="px-5 py-3.5 text-xs text-stone-500">{e.course.difficulty}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-teal" style={{ width: `${e.progress}%` }} />
                      </div>
                      <span className="text-xs text-stone-500 tabular-nums">{e.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-stone-400">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right text-xs text-stone-400">
                    {e.completedAt ? new Date(e.completedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order history */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-900">Order History ({user.orders.length})</h2>
        </div>
        {user.orders.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">No orders</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Order #</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Items</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {user.orders.map((o) => (
                <tr key={o.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-mono text-stone-900">#{o.orderNumber}</td>
                  <td className="px-5 py-3.5 text-xs text-stone-500">
                    {o.items.map((i) => i.course.title).join(', ')}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-medium text-stone-900 tabular-nums">
                    £{Number(o.total).toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${ORDER_STATUS_STYLES[o.status] || 'bg-stone-100 text-stone-600'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-stone-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Badges */}
      {user.badges.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Badges Earned ({user.badges.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {user.badges.map((ub) => (
              <div key={ub.id} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50">
                <div className="w-10 h-10 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-lg">
                  🏆
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{ub.badge.name}</p>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${RARITY_STYLES[ub.badge.rarity] || 'bg-stone-100 text-stone-600'}`}>
                    {ub.badge.rarity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
