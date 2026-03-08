'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  skillLevel: string
  points: number
  level: number
  currentStreak: number
  coursesCompleted: number
  badgeCount: number
}

const skillLevelColors: Record<string, string> = {
  BEGINNER: 'badge-success',
  INTERMEDIATE: 'badge-warning',
  ADVANCED: 'badge-error',
}

const rankMedals: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      if (data.success) {
        setEntries(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Find current user's rank
  const currentUserEntry = isAuthenticated
    ? entries.find((e) => e.userId === user?.id)
    : null

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-bg-tertiary rounded w-1/3" />
            <div className="h-6 bg-bg-tertiary rounded w-1/2" />
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 bg-bg-tertiary rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">🏆 Leaderboard</h1>
          <p className="text-text-secondary">
            Top learners ranked by total points earned. Keep learning to climb the ranks!
          </p>
        </div>

        {/* Current user highlight */}
        {currentUserEntry && (
          <div className="card mb-6 border-2 border-accent-primary bg-accent-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-accent-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {currentUserEntry.rank <= 3
                    ? rankMedals[currentUserEntry.rank]
                    : `#${currentUserEntry.rank}`}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">
                    {currentUserEntry.name}{' '}
                    <span className="text-accent-primary text-sm font-normal">(You)</span>
                  </p>
                  <p className="text-sm text-text-secondary">
                    Level {currentUserEntry.level} · {currentUserEntry.coursesCompleted} courses · {currentUserEntry.badgeCount} badges
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-accent-primary">
                  {currentUserEntry.points.toLocaleString()}
                </p>
                <p className="text-xs text-text-secondary">points</p>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 podium */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* 2nd place */}
            <div className="card text-center pt-8 order-1">
              <div className="text-3xl mb-2">🥈</div>
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2">
                {entries[1]?.name.charAt(0).toUpperCase()}
              </div>
              <p className="font-medium text-text-primary text-sm truncate">{entries[1]?.name}</p>
              <p className="text-accent-primary font-bold">{entries[1]?.points.toLocaleString()}</p>
              <p className="text-xs text-text-secondary">Level {entries[1]?.level}</p>
            </div>

            {/* 1st place */}
            <div className="card text-center border-2 border-yellow-400 bg-gradient-to-b from-yellow-50 to-white order-2">
              <div className="text-4xl mb-2">🥇</div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2 text-white shadow-sm">
                {entries[0]?.name.charAt(0).toUpperCase()}
              </div>
              <p className="font-semibold text-text-primary truncate">{entries[0]?.name}</p>
              <p className="text-yellow-600 font-bold text-lg">{entries[0]?.points.toLocaleString()}</p>
              <p className="text-xs text-text-secondary">Level {entries[0]?.level}</p>
            </div>

            {/* 3rd place */}
            <div className="card text-center pt-8 order-3">
              <div className="text-3xl mb-2">🥉</div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2">
                {entries[2]?.name.charAt(0).toUpperCase()}
              </div>
              <p className="font-medium text-text-primary text-sm truncate">{entries[2]?.name}</p>
              <p className="text-accent-primary font-bold">{entries[2]?.points.toLocaleString()}</p>
              <p className="text-xs text-text-secondary">Level {entries[2]?.level}</p>
            </div>
          </div>
        )}

        {/* Full rankings table */}
        {entries.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-text-secondary mb-4">No rankings yet. Be the first to earn points!</p>
            <Link href="/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bg-tertiary bg-bg-secondary">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Learner</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text-secondary hidden sm:table-cell">Level</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text-secondary hidden md:table-cell">Courses</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text-secondary hidden md:table-cell">Streak</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Points</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isCurrentUser = entry.userId === user?.id
                  return (
                    <tr
                      key={entry.userId}
                      className={`border-b border-bg-tertiary last:border-0 transition-colors ${
                        isCurrentUser
                          ? 'bg-accent-primary/5'
                          : 'hover:bg-bg-secondary'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {entry.rank <= 3 ? (
                            <span className="text-xl">{rankMedals[entry.rank]}</span>
                          ) : (
                            <span className="text-text-secondary font-medium w-8 text-center">
                              #{entry.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Name + skill */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            isCurrentUser
                              ? 'bg-accent-primary text-white'
                              : 'bg-bg-tertiary text-text-secondary'
                          }`}>
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-medium ${isCurrentUser ? 'text-accent-primary' : 'text-text-primary'}`}>
                              {entry.name}
                              {isCurrentUser && (
                                <span className="ml-1 text-xs font-normal text-text-secondary">(you)</span>
                              )}
                            </p>
                            <span className={`badge text-xs ${skillLevelColors[entry.skillLevel]}`}>
                              {entry.skillLevel.charAt(0) + entry.skillLevel.slice(1).toLowerCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="py-3 px-4 text-center hidden sm:table-cell">
                        <span className="font-medium text-text-primary">Lv {entry.level}</span>
                      </td>

                      {/* Courses completed */}
                      <td className="py-3 px-4 text-center hidden md:table-cell">
                        <span className="text-text-secondary">{entry.coursesCompleted}</span>
                      </td>

                      {/* Streak */}
                      <td className="py-3 px-4 text-center hidden md:table-cell">
                        <span className="text-text-secondary">
                          {entry.currentStreak > 0 ? `🔥 ${entry.currentStreak}d` : '—'}
                        </span>
                      </td>

                      {/* Points */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-text-primary">
                          {entry.points.toLocaleString()}
                        </span>
                        <span className="text-xs text-text-secondary ml-1">pts</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && (
          <div className="card mt-6 text-center">
            <p className="text-text-secondary mb-4">
              Sign up and start earning points to appear on the leaderboard!
            </p>
            <div className="flex justify-center space-x-3">
              <Link href="/register" className="btn btn-primary">Get Started</Link>
              <Link href="/login" className="btn btn-secondary">Login</Link>
            </div>
          </div>
        )}

        {/* Refresh note */}
        <p className="text-center text-xs text-text-secondary mt-4">
          Rankings update in real-time as learners complete modules and courses.
        </p>
      </div>
    </div>
  )
}
