import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch top 20 users by points, joining with user data
    const topUsers = await prisma.gamification.findMany({
      orderBy: { points: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            skillLevel: true,
          },
        },
      },
    })

    // Count badges for each user and get their badge count
    const leaderboard = await Promise.all(
      topUsers.map(async (entry, index) => {
        const badgeCount = await prisma.userBadge.count({
          where: { userId: entry.userId },
        })

        return {
          rank: index + 1,
          userId: entry.userId,
          name: entry.user.name,
          skillLevel: entry.user.skillLevel,
          points: entry.points,
          level: entry.level,
          currentStreak: entry.currentStreak,
          longestStreak: entry.longestStreak,
          coursesCompleted: entry.coursesCompleted,
          badgeCount,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: leaderboard,
    })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
