import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  storeRefreshToken,
  invalidateRefreshToken,
} from '@/lib/auth'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token' },
        { status: 401 }
      )
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: { gt: new Date() },
      },
    })

    if (!storedToken) {
      return NextResponse.json(
        { success: false, error: 'Token not found or expired' },
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { gamification: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      )
    }

    // Invalidate old refresh token
    await invalidateRefreshToken(refreshToken)

    // Generate new tokens
    const tokenPayload = { userId: user.id, email: user.email }
    const newAccessToken = generateAccessToken(tokenPayload)
    const newRefreshToken = generateRefreshToken(tokenPayload)

    // Store new refresh token
    await storeRefreshToken(user.id, newRefreshToken)

    // Set cookies
    await setAuthCookies(newAccessToken, newRefreshToken)

    return NextResponse.json({
      success: true,
      message: 'Token refreshed',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        skillLevel: user.skillLevel,
        points: user.gamification?.points || 0,
        level: user.gamification?.level || 1,
      },
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { success: false, error: 'Token refresh failed' },
      { status: 500 }
    )
  }
}
