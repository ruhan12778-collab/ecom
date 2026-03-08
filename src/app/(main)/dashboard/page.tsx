'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAuthStore } from '@/store/authStore'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: string
  unlockedAt: string
}

interface Stats {
  points: number
  level: number
  currentStreak: number
  longestStreak: number
  badges: Badge[]
  enrolledCourses: number
  completedCourses: number
  modulesCompleted?: number
  progress: {
    current: number
    needed: number
    percentage: number
  }
}

interface Enrollment {
  id: string
  courseId: string
  progress: number
  enrolledAt: string
  course: {
    title: string
    slug: string
    thumbnail: string | null
    totalLessons: number
  }
}

interface ActivityDay {
  day: string
  modules: number
  points: number
}

const QUICK_ACTIONS = [
  { href: '/courses', icon: '📚', label: 'Browse Courses', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700' },
  { href: '/cart', icon: '🛒', label: 'View Cart', color: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700' },
  { href: '/profile', icon: '👤', label: 'Edit Profile', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700' },
  { href: '/profile/orders', icon: '📦', label: 'Order History', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700' },
  { href: '/leaderboard', icon: '🏆', label: 'Leaderboard', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700' },
]

const rarityColors: Record<string, string> = {
  COMMON: 'border-gray-400',
  UNCOMMON: 'border-green-500',
  RARE: 'border-blue-500',
  EPIC: 'border-purple-500',
  LEGENDARY: 'border-yellow-500',
}

// Custom tooltip for the bar chart
function ActivityTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: ActivityDay }[]; label?: string }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
        <p className="font-semibold text-text-primary">{label}</p>
        <p className="text-accent-primary">{d.modules} module{d.modules !== 1 ? 's' : ''}</p>
        <p className="text-text-secondary">+{d.points} pts</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [activityData, setActivityData] = useState<ActivityDay[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingActivity, setLoadingActivity] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
      fetchEnrollments()
      fetchActivity()
    }
  }, [isAuthenticated])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/gamification/stats')
      const data = await response.json()
      if (data.success) setStats(data.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments')
      const data = await response.json()
      if (data.success) setEnrollments(data.data || [])
    } catch (error) {
      console.error('Failed to fetch enrollments:', error)
    }
  }

  const fetchActivity = async () => {
    try {
      const response = await fetch('/api/analytics/activity')
      const data = await response.json()
      if (data.success) setActivityData(data.data)
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    } finally {
      setLoadingActivity(false)
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    )
  }

  const totalModulesThisWeek = activityData.reduce((s, d) => s + d.modules, 0)

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Welcome Banner */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Welcome back, {user?.name}! 👋</h1>
              <p className="text-blue-200">Track your learning progress and achievements</p>
            </div>
            {stats && (
              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                  <div className="text-2xl font-bold">{stats.level}</div>
                  <div className="text-blue-200 text-xs">Level</div>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                  <div className="text-2xl font-bold">{stats.points.toLocaleString()}</div>
                  <div className="text-blue-200 text-xs">Points</div>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                  <div className="text-2xl font-bold">{totalModulesThisWeek}</div>
                  <div className="text-blue-200 text-xs">This week</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Primary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard icon="⭐" value={loadingStats ? '—' : stats?.points.toLocaleString() || 0} label="Total Points" gradient="bg-gradient-to-br from-amber-400 to-orange-500" />
          <StatCard icon="📈" value={loadingStats ? '—' : `Level ${stats?.level || 1}`} label="Current Level" gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
          <StatCard icon="🔥" value={loadingStats ? '—' : `${stats?.currentStreak || 0}d`} label="Current Streak" gradient="bg-gradient-to-br from-orange-400 to-red-500" />
          <StatCard icon="🏆" value={loadingStats ? '—' : stats?.badges.length || 0} label="Badges Earned" gradient="bg-gradient-to-br from-purple-500 to-pink-500" />
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center py-4">
            <div className="text-2xl mb-1">📖</div>
            <div className="text-xl font-bold text-text-primary">{loadingStats ? '—' : stats?.enrolledCourses || 0}</div>
            <div className="text-xs text-text-secondary mt-0.5">Courses Enrolled</div>
          </div>
          <div className="card text-center py-4">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-xl font-bold text-text-primary">{loadingStats ? '—' : stats?.completedCourses || 0}</div>
            <div className="text-xs text-text-secondary mt-0.5">Courses Completed</div>
          </div>
          <div className="card text-center py-4">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xl font-bold text-text-primary">{loadingStats ? '—' : `${stats?.longestStreak || 0}d`}</div>
            <div className="text-xs text-text-secondary mt-0.5">Longest Streak</div>
          </div>
        </div>

        {/* Level Progress */}
        {stats && (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-text-primary">Level {stats.level} Progress</span>
              <span className="text-text-secondary text-sm">{stats.progress.current} / {stats.progress.needed} XP</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats.progress.percentage}%` }} />
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {stats.progress.needed - stats.progress.current} XP to Level {stats.level + 1}
            </p>
          </div>
        )}

        {/* Weekly Activity Chart */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Weekly Learning Activity</h2>
              <p className="text-sm text-text-secondary">Modules completed in the last 7 days</p>
            </div>
            {totalModulesThisWeek > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-accent-primary">{totalModulesThisWeek}</div>
                <div className="text-xs text-text-secondary">this week</div>
              </div>
            )}
          </div>

          {loadingActivity ? (
            <div className="h-44 bg-bg-secondary rounded-lg animate-pulse" />
          ) : activityData.every((d) => d.modules === 0) ? (
            <div className="h-44 flex flex-col items-center justify-center text-text-secondary">
              <span className="text-4xl mb-2">📊</span>
              <p className="text-sm">No activity yet this week.</p>
              <Link href="/courses" className="text-accent-primary text-sm hover:underline mt-1">
                Start a course to track progress →
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={176}>
              <BarChart data={activityData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ActivityTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="modules" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Courses */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-text-primary">My Courses</h2>
              <Link href="/courses" className="text-accent-primary text-sm hover:underline">Browse More</Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-text-secondary mb-4">You haven&apos;t enrolled in any courses yet</p>
                <Link href="/courses" className="btn btn-primary">Explore Courses</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments.slice(0, 4).map((enrollment) => (
                  <Link
                    key={enrollment.id}
                    href={`/courses/${enrollment.course.slug}/learn`}
                    className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl hover:bg-bg-tertiary transition-colors border border-gray-200"
                  >
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600">
                      {enrollment.course.thumbnail ? (
                        <Image
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xl">💻</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate text-sm">{enrollment.course.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-primary rounded-full"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-secondary flex-shrink-0">{enrollment.progress}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Badges ({stats?.badges.length || 0})
            </h2>

            {!stats?.badges.length ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🏅</div>
                <p className="text-text-secondary">Complete activities to earn badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {stats.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`relative p-3 bg-bg-secondary rounded-xl border-2 ${rarityColors[badge.rarity]} text-center group cursor-help`}
                  >
                    <div className="text-3xl mb-1">🏅</div>
                    <p className="text-xs text-text-primary font-medium truncate">{badge.name}</p>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-10">
                      <p className="text-xs text-text-primary font-medium">{badge.name}</p>
                      <p className="text-xs text-text-secondary">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`p-4 rounded-xl text-center border transition-colors ${action.color}`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  gradient,
}: {
  icon: string
  value: string | number
  label: string
  gradient: string
}) {
  return (
    <div className={`rounded-xl p-5 ${gradient} text-white shadow-sm`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold leading-tight">{value}</div>
      <div className="text-xs opacity-80 mt-1">{label}</div>
    </div>
  )
}
