'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

const skillLevelLabel: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

const skillLevelIcon: Record<string, string> = {
  BEGINNER: '🌱',
  INTERMEDIATE: '🌿',
  ADVANCED: '🌳',
}

interface GamificationStats {
  points: number
  level: number
  currentStreak: number
  longestStreak: number
  badges: { id: string; name: string; icon: string; rarity: string }[]
  enrolledCourses: number
  completedCourses: number
  progress: { current: number; needed: number; percentage: number }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skillLevel: 'BEGINNER',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [stats, setStats] = useState<GamificationStats | null>(null)

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        skillLevel: user.skillLevel,
      })
    }
  }, [user])

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/gamification/stats')
        .then(r => r.json())
        .then(d => { if (d.success) setStats(d.data) })
        .catch(() => {})
    }
  }, [isAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          skillLevel: formData.skillLevel,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        await checkAuth()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Identity Header ─────────────────────────────────────── */}
        <div className="mb-10 fade-in-up">
          <div className="flex items-start gap-6 sm:gap-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-stone-900 rounded-3xl flex items-center justify-center shadow-card">
                <span className="text-4xl sm:text-5xl font-display font-bold text-white">
                  {formData.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent-success rounded-full border-[3px] border-bg-primary" title="Active" />
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary tracking-tight truncate">
                {formData.name}
              </h1>
              <p className="text-text-secondary mt-1 text-sm sm:text-base">{formData.email}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-secondary rounded-full text-sm font-medium text-text-primary">
                  {skillLevelIcon[formData.skillLevel]} {skillLevelLabel[formData.skillLevel]}
                </span>
                <span className="text-xs text-text-secondary">
                  CodeEd Member
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 fade-in-up" style={{ animationDelay: '0.1s' }}>
          {[
            { label: 'Points', value: stats?.points ?? user?.points ?? 0, icon: '✦' },
            { label: 'Level', value: stats?.level ?? user?.level ?? 1, icon: '◆' },
            { label: 'Streak', value: stats?.currentStreak ?? 0, suffix: 'd', icon: '🔥' },
            { label: 'Badges', value: stats?.badges?.length ?? 0, icon: '🏅' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-5 text-center group hover:bg-white/80 transition-colors duration-200">
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-text-primary">
                {stat.value}{stat.suffix || ''}
              </div>
              <div className="text-xs text-text-secondary mt-1 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Level Progress ─────────────────────────────────────── */}
        {stats?.progress && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 mb-10 fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-primary">Level {stats.level} Progress</span>
              <span className="text-xs text-text-secondary">{stats.progress.current} / {stats.progress.needed} XP</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill rounded-full" style={{ width: `${stats.progress.percentage}%` }} />
            </div>
          </div>
        )}

        {/* ── Two-Column Layout ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">

          {/* Left column: Settings */}
          <div className="lg:col-span-3 space-y-6 fade-in-up" style={{ animationDelay: '0.2s' }}>

            {/* Account Settings */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8">
              <h2 className="text-lg font-display font-bold text-text-primary mb-6">Account Settings</h2>

              {message && (
                <div
                  className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-100'
                      : 'bg-red-50 text-red-800 border border-red-100'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    className="input bg-bg-secondary cursor-not-allowed opacity-60"
                    disabled
                  />
                  <p className="mt-1.5 text-xs text-text-secondary">Email cannot be changed</p>
                </div>

                {/* Skill Level */}
                <div>
                  <label htmlFor="skillLevel" className="block text-sm font-medium text-text-secondary mb-1.5">
                    Skill Level
                  </label>
                  <select
                    id="skillLevel"
                    value={formData.skillLevel}
                    onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                    className="input"
                  >
                    <option value="BEGINNER">🌱 Beginner</option>
                    <option value="INTERMEDIATE">🌿 Intermediate</option>
                    <option value="ADVANCED">🌳 Advanced</option>
                  </select>
                  <p className="mt-1.5 text-xs text-text-secondary">
                    This helps us recommend courses at your level
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full btn btn-primary py-3 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-stone-200 bg-white/40 p-6 sm:p-8">
              <h3 className="font-display font-bold text-text-primary mb-1">Danger Zone</h3>
              <p className="text-sm text-text-secondary mb-5">
                Irreversible actions that affect your account permanently.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn text-sm bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  Delete Account
                </button>
              ) : (
                <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100 space-y-4">
                  <p className="text-sm font-medium text-red-700">
                    This will permanently delete all your data, enrollments, and progress. Enter your password to confirm.
                  </p>
                  <div>
                    <input
                      id="deletePassword"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value)
                        setDeleteError('')
                      }}
                      placeholder="Enter your password"
                      className="input border-red-200 focus:border-red-400 focus:ring-red-100"
                    />
                    {deleteError && (
                      <p className="mt-1.5 text-sm text-red-600">{deleteError}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeletePassword('')
                        setDeleteError('')
                      }}
                      className="btn btn-secondary flex-1 text-sm py-2.5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!deletePassword) {
                          setDeleteError('Please enter your password')
                          return
                        }
                        setIsDeleting(true)
                        setDeleteError('')
                        try {
                          const response = await fetch('/api/auth/account', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ confirmPassword: deletePassword }),
                          })
                          const data = await response.json()
                          if (data.success) {
                            logout()
                            router.push('/')
                          } else {
                            setDeleteError(data.error || 'Failed to delete account')
                          }
                        } catch {
                          setDeleteError('An error occurred. Please try again.')
                        } finally {
                          setIsDeleting(false)
                        }
                      }}
                      disabled={isDeleting}
                      className="btn bg-red-600 text-white hover:bg-red-700 flex-1 text-sm py-2.5 disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Quick links & badges */}
          <div className="lg:col-span-2 space-y-6 fade-in-up" style={{ animationDelay: '0.3s' }}>

            {/* Quick Links */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6">
              <h3 className="text-sm font-display font-bold text-text-primary uppercase tracking-wider mb-4">Quick Links</h3>
              <div className="space-y-1">
                {[
                  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
                  { href: '/courses', label: 'Browse Courses', icon: '📚' },
                  { href: '/profile/orders', label: 'Order History', icon: '📦' },
                  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors duration-150"
                  >
                    <span className="text-base">{link.icon}</span>
                    {link.label}
                    <span className="ml-auto text-text-secondary">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Badges Showcase */}
            {stats?.badges && stats.badges.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6">
                <h3 className="text-sm font-display font-bold text-text-primary uppercase tracking-wider mb-4">
                  Earned Badges
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {stats.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-bg-secondary rounded-2xl p-3 text-center"
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <div className="text-xs font-medium text-text-primary truncate">{badge.name}</div>
                      <div className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">{badge.rarity}</div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/dashboard"
                  className="block text-center text-xs text-text-secondary hover:text-text-primary mt-4 transition-colors"
                >
                  View all on dashboard →
                </Link>
              </div>
            )}

            {/* Learning Stats */}
            {stats && (
              <div className="bg-stone-900 rounded-3xl p-6 text-white">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">Learning</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300 text-sm">Enrolled</span>
                    <span className="font-display font-bold text-lg">{stats.enrolledCourses}</span>
                  </div>
                  <div className="w-full h-px bg-stone-700" />
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300 text-sm">Completed</span>
                    <span className="font-display font-bold text-lg">{stats.completedCourses}</span>
                  </div>
                  <div className="w-full h-px bg-stone-700" />
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300 text-sm">Best Streak</span>
                    <span className="font-display font-bold text-lg">{stats.longestStreak}d</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
