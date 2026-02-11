import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Sync local cart with server
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      // Not authenticated - just acknowledge
      return NextResponse.json({ success: true })
    }

    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Invalid cart data' },
        { status: 400 }
      )
    }

    // Clear existing cart
    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    })

    // Add new items (skip items user is already enrolled in)
    for (const item of items) {
      if (!item.courseId) continue

      // Check if already enrolled
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: item.courseId,
          },
        },
      })

      if (!enrollment) {
        await prisma.cartItem.create({
          data: {
            userId: user.id,
            courseId: item.courseId,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cart synced',
    })
  } catch (error) {
    console.error('Cart sync error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync cart' },
      { status: 500 }
    )
  }
}
