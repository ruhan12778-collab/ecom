import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { clearAuthCookies, invalidateRefreshToken } from '@/lib/auth'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    // Invalidate refresh token in database
    if (refreshToken) {
      await invalidateRefreshToken(refreshToken)
    }

    // Clear cookies
    await clearAuthCookies()

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear cookies even if there's an error
    await clearAuthCookies()
    return NextResponse.json({
      success: true,
      message: 'Logged out',
    })
  }
}
