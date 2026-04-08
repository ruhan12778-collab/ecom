import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'

export interface TokenPayload {
  userId: string
  email: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  skillLevel: string
  role: string
  points: number
  level: number
}

// Generate access token (short-lived)
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

// Generate refresh token (long-lived)
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

// Verify access token
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload
  } catch {
    return null
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Set auth cookies
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  })

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

// Clear auth cookies
export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
}

// Get current user from cookies
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) {
    // Try refresh token
    const refreshToken = cookieStore.get('refresh_token')?.value
    if (!refreshToken) return null

    const payload = verifyRefreshToken(refreshToken)
    if (!payload) return null

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: { gt: new Date() },
      },
    })

    if (!storedToken) return null

    // Get user and return
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { gamification: true },
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      skillLevel: user.skillLevel,
      role: user.role,
      points: user.gamification?.points || 0,
      level: user.gamification?.level || 1,
    }
  }

  const payload = verifyAccessToken(accessToken)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { gamification: true },
  })

  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    skillLevel: user.skillLevel,
    role: user.role,
    points: user.gamification?.points || 0,
    level: user.gamification?.level || 1,
  }
}

// Check if current user is admin, returns user or null
export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return null
  return user
}

// Store refresh token in database
export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })
}

// Invalidate refresh token
export async function invalidateRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { token },
  })
}

// Invalidate all user refresh tokens
export async function invalidateAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  })
}
