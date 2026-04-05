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
  { href: '/courses', icon: '📚', label: 'Browse Courses' },
  { href: '/cart', icon: '🛒', label: 'View Cart' },
  { href: '/profile', icon: '👤', label: 'Edit Profile' },
  { href: '/profile/orders', icon: '📦', label: 'Order History' },
  { href: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
]

const rarityColors: Record<string, string> = {
  COMMON: 'border-stone-300',
  UNCOMMON: 'border-stone-400',
  RARE: 'border-stone-500',
  EPIC: 'border-stone-700',
  LEGENDARY: 'border-stone-900',
}

// Custom tooltip for the bar chart
function ActivityTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: ActivityDay }[]; label?: string }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-white border border-stone-200 rounded-xl shadow-md px-3 py-2 text-sm">
        <p className="font-semibold text-text-primary">{label}</p>
        <p className="text-text-primary">{d.modules} module{d.modules !== 1 ? 's' : ''}</p>
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
        <div className="mb-8 rounded-3xl bg-stone-900 p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">Welcome back, {user?.name}!</h1>
              <p className="text-stone-400">Track your learning progress and achievements</p>
            </div>
            {stats && (
              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-2xl px-4 py-3 text-center">
                  <div className="text-2xl font-bold">{stats.level}</div>
                  <div className="text-stone-400 text-xs">Level</div>
                </div>
                <div className="bg-white/10 rounded-2xl px-4 py-3 text-center">
                  <div className="text-2xl font-bold">{stats.points.toLocaleString()}</div>
                  <div className="text-stone-400 text-xs">Points</div>
                </div>
                <div className="bg-white/10 rounded-2xl px-4 py-3 text-center">
                  <div className="text-2xl font-bold">{totalModulesThisWeek}</div>
                  <div className="text-stone-400 text-xs">This week</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Continue Learning */}
        {enrollments.length > 0 && (
          <div className="mb-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">Continue Learning</h2>
            <Link
              href={`/courses/${enrollments[0].course.slug}/learn`}
              className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-100/60 hover-lift group"
            >
              <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-stone-200">
                {enrollments[0].course.thumbnail ? (
                  <Image
                    src={enrollments[0].course.thumbnail}
                    alt={enrollments[0].course.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-200">
                    <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-text-primary truncate group-hover:text-accent-teal transition-colors">{enrollments[0].course.title}</h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden max-w-[200px]">
                    <div className="h-full bg-accent-teal rounded-full progress-fill-animate" style={{ width: `${enrollments[0].progress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-text-secondary">{enrollments[0].progress}% complete</span>
                </div>
              </div>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-teal text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
              </div>
            </Link>
          </div>
        )}

        {/* Primary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 stagger-children">
          <StatCard icon={<svg className="w-6 h-6 text-points-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>} value={loadingStats ? '—' : stats?.points.toLocaleString() || 0} label="Total Points" />
          <StatCard icon={<svg className="w-6 h-6 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} value={loadingStats ? '—' : `Level ${stats?.level || 1}`} label="Current Level" />
          <StatCard icon={<svg className="w-6 h-6 text-streak-fire" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>} value={loadingStats ? '—' : `${stats?.currentStreak || 0}d`} label="Current Streak" />
          <StatCard icon={<svg className="w-6 h-6 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} value={loadingStats ? '—' : stats?.badges.length || 0} label="Badges Earned" />
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8 stagger-children">
          <div className="card text-center py-4 hover-lift">
            <div className="flex justify-center mb-1"><svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
            <div className="text-xl font-bold text-text-primary">{loadingStats ? '—' : stats?.enrolledCourses || 0}</div>
            <div className="text-xs text-text-secondary mt-0.5">Courses Enrolled</div>
          </div>
          <div className="card text-center py-4 hover-lift">
            <div className="flex justify-center mb-1"><svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            <div className="text-xl font-bold text-text-primary">{loadingStats ? '—' : stats?.completedCourses || 0}</div>
            <div className="text-xs text-text-secondary mt-0.5">Courses Completed</div>
          </div>
          <div className="card text-center py-4 hover-lift">
            <div className="flex justify-center mb-1"><svg className="w-5 h-5 text-streak-fire" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
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
              <h2 className="text-lg font-display font-semibold text-text-primary">Weekly Learning Activity</h2>
              <p className="text-sm text-text-secondary">Modules completed in the last 7 days</p>
            </div>
            {totalModulesThisWeek > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-text-primary">{totalModulesThisWeek}</div>
                <div className="text-xs text-text-secondary">this week</div>
              </div>
            )}
          </div>

          {loadingActivity ? (
            <div className="h-44 bg-bg-secondary rounded-2xl animate-pulse" />
          ) : activityData.every((d) => d.modules === 0) ? (
            <div className="h-44 flex flex-col items-center justify-center text-text-secondary">
              <svg className="w-10 h-10 text-stone-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <p className="text-sm font-medium">Start a lesson today to build your streak!</p>
              <Link href="/courses" className="mt-2 inline-flex items-center gap-1 text-accent-teal font-medium text-sm hover:underline">
                Find a course to start
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={176}>
              <BarChart data={activityData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ActivityTooltip />} cursor={{ fill: '#F5F5F4' }} />
                <Bar dataKey="modules" fill="#1C1917" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Courses */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-display font-semibold text-text-primary">My Courses</h2>
              <Link href="/courses" className="text-stone-900 font-medium text-sm hover:underline">Browse More</Link>
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
                    className="flex items-center gap-3 p-3 bg-bg-secondary rounded-2xl hover:bg-bg-tertiary transition-colors"
                  >
                    <div className="relative w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-stone-200">
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
                        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-stone-900 rounded-full"
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
            <h2 className="text-xl font-display font-semibold text-text-primary mb-4">
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
                    className={`relative p-3 bg-bg-secondary rounded-2xl border-2 ${rarityColors[badge.rarity]} text-center group cursor-help`}
                  >
                    <div className="text-3xl mb-1">🏅</div>
                    <p className="text-xs text-text-primary font-medium truncate">{badge.name}</p>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white border border-stone-200 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-10">
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
          <h2 className="text-xl font-display font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="p-4 rounded-2xl text-center bg-bg-secondary hover:bg-bg-tertiary transition-colors"
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <span className="text-sm font-medium text-text-primary">{action.label}</span>
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
}: {
  icon: React.ReactNode
  value: string | number
  label: string
}) {
  return (
    <div className="rounded-2xl p-5 bg-bg-secondary hover-lift">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold text-text-primary leading-tight">{value}</div>
      <div className="text-xs text-text-secondary mt-1">{label}</div>
    </div>
  )
}
