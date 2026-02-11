import prisma from '@/lib/prisma'
import { POINT_VALUES, LEVEL_THRESHOLDS, PointAction } from '@/types'

// Calculate level from points
export function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

// Get points needed for next level
export function getPointsToNextLevel(points: number): { current: number; needed: number; percentage: number } {
  const currentLevel = calculateLevel(points)

  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return { current: points, needed: 0, percentage: 100 }
  }

  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1]
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel]
  const pointsInLevel = points - currentThreshold
  const pointsNeeded = nextThreshold - currentThreshold
  const percentage = Math.round((pointsInLevel / pointsNeeded) * 100)

  return {
    current: pointsInLevel,
    needed: pointsNeeded,
    percentage,
  }
}

// Award points to user
export async function awardPoints(userId: string, action: PointAction): Promise<{
  pointsAwarded: number
  newTotal: number
  leveledUp: boolean
  newLevel: number
}> {
  const pointsAwarded = POINT_VALUES[action]

  const gamification = await prisma.gamification.findUnique({
    where: { userId },
  })

  if (!gamification) {
    // Create gamification record if it doesn't exist
    const newGamification = await prisma.gamification.create({
      data: {
        userId,
        points: pointsAwarded,
        level: calculateLevel(pointsAwarded),
      },
    })

    return {
      pointsAwarded,
      newTotal: pointsAwarded,
      leveledUp: pointsAwarded >= LEVEL_THRESHOLDS[1],
      newLevel: newGamification.level,
    }
  }

  const newTotal = gamification.points + pointsAwarded
  const newLevel = calculateLevel(newTotal)
  const leveledUp = newLevel > gamification.level

  await prisma.gamification.update({
    where: { userId },
    data: {
      points: newTotal,
      level: newLevel,
      lastActivityAt: new Date(),
    },
  })

  return {
    pointsAwarded,
    newTotal,
    leveledUp,
    newLevel,
  }
}

// Update streak
export async function updateStreak(userId: string): Promise<{
  currentStreak: number
  isNewStreak: boolean
  streakBonus: number
}> {
  const gamification = await prisma.gamification.findUnique({
    where: { userId },
  })

  if (!gamification) {
    return { currentStreak: 1, isNewStreak: true, streakBonus: 0 }
  }

  const lastActivity = gamification.lastActivityAt
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  let newStreak = gamification.currentStreak
  let streakBonus = 0
  let isNewStreak = false

  // Check if this is a new day
  const isNewDay = lastActivity.toDateString() !== now.toDateString()

  if (isNewDay) {
    // Check if it's consecutive (yesterday or earlier today)
    const isConsecutive = lastActivity >= yesterday

    if (isConsecutive) {
      newStreak = gamification.currentStreak + 1
      isNewStreak = true

      // Check for streak milestones
      if (newStreak === 7) {
        streakBonus = POINT_VALUES.STREAK_7_DAYS
      } else if (newStreak === 30) {
        streakBonus = POINT_VALUES.STREAK_30_DAYS
      }
    } else {
      // Streak broken
      newStreak = 1
      isNewStreak = true
    }

    const longestStreak = Math.max(gamification.longestStreak, newStreak)

    await prisma.gamification.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak,
        lastActivityAt: now,
        points: streakBonus > 0 ? { increment: streakBonus } : undefined,
      },
    })
  }

  return {
    currentStreak: newStreak,
    isNewStreak,
    streakBonus,
  }
}

// Check and award badges
export async function checkAndAwardBadges(userId: string): Promise<Array<{
  id: string
  name: string
  description: string
  points: number
}>> {
  const awardedBadges: Array<{
    id: string
    name: string
    description: string
    points: number
  }> = []

  // Get user stats
  const gamification = await prisma.gamification.findUnique({
    where: { userId },
  })

  if (!gamification) return awardedBadges

  // Get user's existing badges
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  })
  const ownedBadgeIds = new Set(userBadges.map((b) => b.badgeId))

  // Get all badges
  const allBadges = await prisma.badge.findMany()

  // Check each badge
  for (const badge of allBadges) {
    if (ownedBadgeIds.has(badge.id)) continue

    const criteria = JSON.parse(badge.criteria)
    let earned = false

    switch (criteria.type) {
      case 'modules_completed':
        earned = gamification.modulesCompleted >= criteria.count
        break
      case 'courses_completed':
        earned = gamification.coursesCompleted >= criteria.count
        break
      case 'streak':
        earned = gamification.currentStreak >= criteria.count || gamification.longestStreak >= criteria.count
        break
      case 'points':
        earned = gamification.points >= criteria.count
        break
      case 'chat_messages':
        const chatCount = await prisma.chatMessage.count({
          where: { userId, role: 'USER' },
        })
        earned = chatCount >= criteria.count
        break
    }

    if (earned) {
      // Award badge
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
        },
      })

      // Award bonus points
      if (badge.points > 0) {
        await prisma.gamification.update({
          where: { userId },
          data: { points: { increment: badge.points } },
        })
      }

      awardedBadges.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        points: badge.points,
      })
    }
  }

  return awardedBadges
}

// Get user's gamification stats
export async function getUserStats(userId: string) {
  const gamification = await prisma.gamification.findUnique({
    where: { userId },
  })

  const badges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { unlockedAt: 'desc' },
  })

  const enrollments = await prisma.enrollment.count({
    where: { userId },
  })

  const completedCourses = await prisma.enrollment.count({
    where: { userId, completedAt: { not: null } },
  })

  if (!gamification) {
    return {
      points: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      badges: [],
      enrolledCourses: enrollments,
      completedCourses,
      progress: getPointsToNextLevel(0),
    }
  }

  return {
    points: gamification.points,
    level: gamification.level,
    currentStreak: gamification.currentStreak,
    longestStreak: gamification.longestStreak,
    badges: badges.map((ub) => ({
      ...ub.badge,
      unlockedAt: ub.unlockedAt,
    })),
    enrolledCourses: enrollments,
    completedCourses,
    progress: getPointsToNextLevel(gamification.points),
  }
}
