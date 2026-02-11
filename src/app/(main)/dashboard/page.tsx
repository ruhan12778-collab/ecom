'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
      fetchEnrollments()
    }
  }, [isAuthenticated])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/gamification/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
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
      if (data.success) {
        setEnrollments(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error)
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    )
  }

  const rarityColors: Record<string, string> = {
    COMMON: 'border-gray-500',
    UNCOMMON: 'border-green-500',
    RARE: 'border-blue-500',
    EPIC: 'border-purple-500',
    LEGENDARY: 'border-yellow-500',
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-text-secondary">
            Track your learning progress and achievements
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="⭐"
            value={stats?.points || 0}
            label="Total Points"
            color="text-amber-600"
          />
          <StatCard
            icon="📈"
            value={`Level ${stats?.level || 1}`}
            label="Current Level"
            color="text-accent-primary"
          />
          <StatCard
            icon="🔥"
            value={`${stats?.currentStreak || 0} days`}
            label="Current Streak"
            color="text-orange-500"
          />
          <StatCard
            icon="🏆"
            value={stats?.badges.length || 0}
            label="Badges Earned"
            color="text-accent-warning"
          />
        </div>

        {/* Level Progress */}
        {stats && (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-text-secondary">Level {stats.level} Progress</span>
              <span className="text-text-secondary">
                {stats.progress.current} / {stats.progress.needed} XP
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${stats.progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Courses */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-text-primary">My Courses</h2>
              <Link href="/courses" className="text-accent-primary text-sm hover:underline">
                Browse More
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">
                  You haven&apos;t enrolled in any courses yet
                </p>
                <Link href="/courses" className="btn btn-primary">
                  Explore Courses
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.slice(0, 3).map((enrollment) => (
                  <Link
                    key={enrollment.id}
                    href={`/courses/${enrollment.course.slug}`}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="w-16 h-12 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">💻</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">
                        {enrollment.course.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-accent-success rounded-full"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-secondary">
                          {enrollment.progress}%
                        </span>
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
                <p className="text-text-secondary">
                  Complete activities to earn badges!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {stats.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`relative p-3 bg-gray-50 rounded-lg border-2 ${rarityColors[badge.rarity]} text-center group`}
                  >
                    <div className="text-3xl mb-1">🏅</div>
                    <p className="text-xs text-text-primary font-medium truncate">
                      {badge.name}
                    </p>
                    {/* Tooltip */}
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

        {/* Recent Activity */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/courses"
              className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="text-2xl mb-2">📚</div>
              <span className="text-sm text-text-primary">Browse Courses</span>
            </Link>
            <Link
              href="/cart"
              className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="text-2xl mb-2">🛒</div>
              <span className="text-sm text-text-primary">View Cart</span>
            </Link>
            <Link
              href="/profile"
              className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="text-2xl mb-2">👤</div>
              <span className="text-sm text-text-primary">Edit Profile</span>
            </Link>
            <Link
              href="/profile/orders"
              className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="text-2xl mb-2">📦</div>
              <span className="text-sm text-text-primary">Order History</span>
            </Link>
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
  color,
}: {
  icon: string
  value: string | number
  label: string
  color: string
}) {
  return (
    <div className="card text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  )
}
