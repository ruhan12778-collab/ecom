import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const completions = await prisma.userProgress.findMany({
      where: {
        userId: user.id,
        completed: true,
        completedAt: { gte: sevenDaysAgo },
      },
      select: { completedAt: true },
    })

    // Build last 7 days array (today is index 6, 6 days ago is index 0)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const days: { day: string; modules: number; points: number }[] = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dayStr = dayNames[d.getDay()]

      const count = completions.filter((c) => {
        if (!c.completedAt) return false
        const cd = new Date(c.completedAt)
        return (
          cd.getFullYear() === d.getFullYear() &&
          cd.getMonth() === d.getMonth() &&
          cd.getDate() === d.getDate()
        )
      }).length

      days.push({ day: dayStr, modules: count, points: count * 25 })
    }

    return NextResponse.json({ success: true, data: days })
  } catch (error) {
    console.error('Activity fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
