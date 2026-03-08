import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  storeRefreshToken,
} from '@/lib/auth'
import { registerSchema } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, skillLevel } = result.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with gamification profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        skillLevel: skillLevel as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        gamification: {
          create: {
            points: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
          },
        },
      },
      include: {
        gamification: true,
      },
    })

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email }
    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken)

    // Set cookies
    await setAuthCookies(accessToken, refreshToken)

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    )
  }
}
