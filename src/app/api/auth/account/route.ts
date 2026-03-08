import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getCurrentUser, comparePassword, clearAuthCookies } from '@/lib/auth'

const deleteAccountSchema = z.object({
  confirmPassword: z.string().min(1, 'Password is required'),
})

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = deleteAccountSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { confirmPassword } = result.data

    // Fetch user with password for verification
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    })

    if (!fullUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify password before deletion
    const isValidPassword = await comparePassword(confirmPassword, fullUser.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Delete user — Prisma cascade deletes all related records:
    // RefreshToken, Enrollment, UserProgress, CartItem, Order, UserBadge, Gamification, ChatMessage
    await prisma.user.delete({
      where: { id: user.id },
    })

    // Clear auth cookies
    await clearAuthCookies()

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
