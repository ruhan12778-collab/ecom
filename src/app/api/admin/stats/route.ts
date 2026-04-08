import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const [
      totalUsers,
      totalCourses,
      totalOrders,
      revenueResult,
      totalEnrollments,
      recentOrders,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.enrollment.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          gamification: { select: { points: true, level: true } },
        },
      }),
    ])

    const totalRevenue = revenueResult._sum.total ?? 0

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalOrders,
        totalRevenue,
        totalEnrollments,
        recentOrders,
        recentUsers,
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
