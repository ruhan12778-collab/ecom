import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateLevel, getPointsToNextLevel } from '@/services/gamificationService'
import { LEVEL_THRESHOLDS } from '@/types'

// Mock prisma for async function tests
vi.mock('@/lib/prisma', () => ({
  default: {
    gamification: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    userBadge: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    badge: {
      findMany: vi.fn(),
    },
    chatMessage: {
      count: vi.fn(),
    },
  },
}))

import prisma from '@/lib/prisma'
import { updateStreak, checkAndAwardBadges } from '@/services/gamificationService'

// ============================================
// calculateLevel (pure function - no mocking)
// ============================================

describe('calculateLevel', () => {
  it('returns level 1 for 0 points', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('returns level 1 for 99 points (below level 2 threshold)', () => {
    expect(calculateLevel(99)).toBe(1)
  })

  it('returns level 2 for exactly 100 points', () => {
    expect(calculateLevel(100)).toBe(2)
  })

  it('returns level 2 for 299 points', () => {
    expect(calculateLevel(299)).toBe(2)
  })

  it('returns level 3 for exactly 300 points', () => {
    expect(calculateLevel(300)).toBe(3)
  })

  it('returns level 5 for exactly 1000 points', () => {
    expect(calculateLevel(1000)).toBe(5)
  })

  it('returns level 10 for exactly 5500 points', () => {
    expect(calculateLevel(5500)).toBe(10)
  })

  it('returns level 10 (max) for 9999 points', () => {
    expect(calculateLevel(9999)).toBe(10)
  })

  it('handles all LEVEL_THRESHOLDS correctly', () => {
    LEVEL_THRESHOLDS.forEach((threshold, index) => {
      expect(calculateLevel(threshold)).toBe(index + 1)
    })
  })
})

// ============================================
// getPointsToNextLevel (pure function)
// ============================================

describe('getPointsToNextLevel', () => {
  it('returns correct values at 0 points (level 1 start)', () => {
    const result = getPointsToNextLevel(0)
    expect(result.current).toBe(0)
    expect(result.needed).toBe(100)
    expect(result.percentage).toBe(0)
  })

  it('returns 50% progress at 50 points (halfway to level 2)', () => {
    const result = getPointsToNextLevel(50)
    expect(result.percentage).toBe(50)
  })

  it('returns correct values at level 2 threshold (100 points)', () => {
    const result = getPointsToNextLevel(100)
    expect(result.current).toBe(0)
    expect(result.needed).toBe(200) // level 2→3 requires 200 points (300 - 100)
    expect(result.percentage).toBe(0)
  })

  it('returns 100% and needed=0 at max level (5500 points)', () => {
    const result = getPointsToNextLevel(5500)
    expect(result.percentage).toBe(100)
    expect(result.needed).toBe(0)
  })

  it('returns 100% for points beyond max level', () => {
    const result = getPointsToNextLevel(99999)
    expect(result.percentage).toBe(100)
    expect(result.needed).toBe(0)
  })
})

// ============================================
// updateStreak (requires prisma mock)
// ============================================

describe('updateStreak', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns streak 1 when no gamification record exists', async () => {
    vi.mocked(prisma.gamification.findUnique).mockResolvedValue(null)

    const result = await updateStreak('user-1')

    expect(result.currentStreak).toBe(1)
    expect(result.isNewStreak).toBe(true)
    expect(result.streakBonus).toBe(0)
  })

  it('does not increment streak when called on the same day', async () => {
    const today = new Date()
    vi.mocked(prisma.gamification.findUnique).mockResolvedValue({
      id: 'gam-1',
      userId: 'user-1',
      points: 100,
      level: 2,
      currentStreak: 3,
      longestStreak: 5,
      lastActivityAt: today, // same day
      coursesCompleted: 0,
      modulesCompleted: 0,
      totalWatchTime: 0,
      createdAt: today,
      updatedAt: today,
    })

    const result = await updateStreak('user-1')

    expect(result.currentStreak).toBe(3) // unchanged
    expect(result.isNewStreak).toBe(false)
    expect(prisma.gamification.update).not.toHaveBeenCalled()
  })

  it('increments streak by 1 for consecutive day activity', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    vi.mocked(prisma.gamification.findUnique).mockResolvedValue({
      id: 'gam-1',
      userId: 'user-1',
      points: 100,
      level: 2,
      currentStreak: 3,
      longestStreak: 5,
      lastActivityAt: yesterday,
      coursesCompleted: 0,
      modulesCompleted: 0,
      totalWatchTime: 0,
      createdAt: yesterday,
      updatedAt: yesterday,
    })
    vi.mocked(prisma.gamification.update).mockResolvedValue({} as never)

    const result = await updateStreak('user-1')

    expect(result.currentStreak).toBe(4)
    expect(result.isNewStreak).toBe(true)
    expect(result.streakBonus).toBe(0)
  })

  it('resets streak to 1 when more than 1 day has passed', async () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    vi.mocked(prisma.gamification.findUnique).mockResolvedValue({
      id: 'gam-1',
      userId: 'user-1',
      points: 100,
      level: 2,
      currentStreak: 5,
      longestStreak: 10,
      lastActivityAt: threeDaysAgo,
      coursesCompleted: 0,
      modulesCompleted: 0,
      totalWatchTime: 0,
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo,
    })
    vi.mocked(prisma.gamification.update).mockResolvedValue({} as never)

    const result = await updateStreak('user-1')

    expect(result.currentStreak).toBe(1) // reset
    expect(result.isNewStreak).toBe(true)
  })

  it('awards 50 point bonus at 7-day streak milestone', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    vi.mocked(prisma.gamification.findUnique).mockResolvedValue({
      id: 'gam-1',
      userId: 'user-1',
      points: 200,
      level: 3,
      currentStreak: 6, // next call hits 7
      longestStreak: 6,
      lastActivityAt: yesterday,
      coursesCompleted: 0,
      modulesCompleted: 0,
      totalWatchTime: 0,
      createdAt: yesterday,
      updatedAt: yesterday,
    })
    vi.mocked(prisma.gamification.update).mockResolvedValue({} as never)

    const result = await updateStreak('user-1')

    expect(result.currentStreak).toBe(7)
    expect(result.streakBonus).toBe(50)
  })
})

// ============================================
// checkAndAwardBadges (requires prisma mock)
// ============================================

describe('checkAndAwardBadges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array when no gamification record exists', async () => {
    vi.mocked(prisma.gamification.findUnique).mockResolvedValue(null)

    const result = await checkAndAwardBadges('user-1')

    expect(result).toEqual([])
  })

  it('does not re-award a badge the user already owns', async () => {
    const now = new Date()
    vi.mocked(prisma.gamification.findUnique).mockResolvedValue({
      id: 'gam-1',
      userId: 'user-1',
      points: 500,
      level: 5,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityAt: now,
      coursesCompleted: 2,
      modulesCompleted: 10,
      totalWatchTime: 0,
      createdAt: now,
      updatedAt: now,
    })
    vi.mocked(prisma.userBadge.findMany).mockResolvedValue([
      { badgeId: 'badge-course-conqueror' } as never,
    ])
    vi.mocked(prisma.badge.findMany).mockResolvedValue([
      {
        id: 'badge-course-conqueror',
        name: 'Course Conqueror',
        description: 'Complete a course',
        icon: '🏆',
        criteria: JSON.stringify({ type: 'courses_completed', count: 1 }),
        points: 100,
        rarity: 'UNCOMMON',
        category: 'achievement',
        createdAt: now,
      } as never,
    ])

    const result = await checkAndAwardBadges('user-1')

    expect(result).toEqual([]) // already owned, not re-awarded
    expect(prisma.userBadge.create).not.toHaveBeenCalled()
  })

  it('awards a modules_completed badge when criteria is met', async () => {
    const now = new Date()
    vi.mocked(prisma.gamification.findUnique).mockResolvedValue({
      id: 'gam-1',
      userId: 'user-1',
      points: 50,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityAt: now,
      coursesCompleted: 0,
      modulesCompleted: 1, // first module completed
      totalWatchTime: 0,
      createdAt: now,
      updatedAt: now,
    })
    vi.mocked(prisma.userBadge.findMany).mockResolvedValue([])
    vi.mocked(prisma.badge.findMany).mockResolvedValue([
      {
        id: 'badge-first-steps',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '👣',
        criteria: JSON.stringify({ type: 'modules_completed', count: 1 }),
        points: 10,
        rarity: 'COMMON',
        category: 'learning',
        createdAt: now,
      } as never,
    ])
    vi.mocked(prisma.userBadge.create).mockResolvedValue({} as never)
    vi.mocked(prisma.gamification.update).mockResolvedValue({} as never)

    const result = await checkAndAwardBadges('user-1')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('First Steps')
    expect(prisma.userBadge.create).toHaveBeenCalledOnce()
  })

  it('awards a courses_completed badge at correct threshold', async () => {
    const now = new Date()
    vi.mocked(prisma.gamification.findUnique).mockResolvedValue({
      id: 'gam-1',
      userId: 'user-1',
      points: 500,
      level: 5,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityAt: now,
      coursesCompleted: 1,
      modulesCompleted: 15,
      totalWatchTime: 0,
      createdAt: now,
      updatedAt: now,
    })
    vi.mocked(prisma.userBadge.findMany).mockResolvedValue([])
    vi.mocked(prisma.badge.findMany).mockResolvedValue([
      {
        id: 'badge-course-conqueror',
        name: 'Course Conqueror',
        description: 'Complete your first course',
        icon: '🏆',
        criteria: JSON.stringify({ type: 'courses_completed', count: 1 }),
        points: 100,
        rarity: 'UNCOMMON',
        category: 'achievement',
        createdAt: now,
      } as never,
    ])
    vi.mocked(prisma.userBadge.create).mockResolvedValue({} as never)
    vi.mocked(prisma.gamification.update).mockResolvedValue({} as never)

    const result = await checkAndAwardBadges('user-1')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Course Conqueror')
  })
})
