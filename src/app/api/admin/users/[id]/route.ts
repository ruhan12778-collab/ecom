import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        skillLevel: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        gamification: true,
        enrollments: {
          include: {
            course: {
              select: { id: true, title: true, slug: true, thumbnail: true, category: true, difficulty: true },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        orders: {
          include: {
            items: {
              include: {
                course: {
                  select: { id: true, title: true, slug: true, thumbnail: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        badges: {
          include: {
            badge: true,
          },
          orderBy: { unlockedAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Admin user detail error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Update user fields
    const userUpdateData: Record<string, unknown> = {}
    if (body.name !== undefined) userUpdateData.name = body.name
    if (body.role !== undefined) {
      if (!['USER', 'ADMIN'].includes(body.role)) {
        return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
      }
      userUpdateData.role = body.role
    }
    if (body.skillLevel !== undefined) {
      if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(body.skillLevel)) {
        return NextResponse.json({ success: false, error: 'Invalid skill level' }, { status: 400 })
      }
      userUpdateData.skillLevel = body.skillLevel
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({ where: { id }, data: userUpdateData })
    }

    // Update gamification if points/level/streak provided
    const gamUpdateData: Record<string, unknown> = {}
    if (body.points !== undefined) gamUpdateData.points = Math.max(0, Number(body.points))
    if (body.level !== undefined) gamUpdateData.level = Math.max(1, Number(body.level))
    if (body.currentStreak !== undefined) gamUpdateData.currentStreak = Math.max(0, Number(body.currentStreak))

    if (Object.keys(gamUpdateData).length > 0) {
      await prisma.gamification.upsert({
        where: { userId: id },
        create: { userId: id, ...gamUpdateData } as any,
        update: gamUpdateData,
      })
    }

    return NextResponse.json({ success: true, message: 'User updated' })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params

    // Don't let an admin delete themselves
    if (id === admin.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'User deleted' })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
