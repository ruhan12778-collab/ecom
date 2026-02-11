import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserStats, updateStreak, checkAndAwardBadges } from '@/services/gamificationService'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Update streak on activity
    const streakResult = await updateStreak(user.id)

    // Check for new badges
    const newBadges = await checkAndAwardBadges(user.id)

    // Get updated stats
    const stats = await getUserStats(user.id)

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        streakUpdate: streakResult.isNewStreak ? {
          currentStreak: streakResult.currentStreak,
          bonus: streakResult.streakBonus,
        } : null,
        newBadges: newBadges.length > 0 ? newBadges : null,
      },
    })
  } catch (error) {
    console.error('Gamification stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
