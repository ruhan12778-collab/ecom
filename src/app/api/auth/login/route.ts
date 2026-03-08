import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  storeRefreshToken,
} from '@/lib/auth'
import { loginSchema } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { gamification: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email }
    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken)

    // Set cookies
    await setAuthCookies(accessToken, refreshToken)

    // Update last activity for streak
    if (user.gamification) {
      await prisma.gamification.update({
        where: { userId: user.id },
        data: { lastActivityAt: new Date() },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
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
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
