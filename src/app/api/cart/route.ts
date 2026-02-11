import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { addToCartSchema } from '@/types'

// Get user's cart
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            price: true,
            originalPrice: true,
            instructor: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: cartItems,
    })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = addToCartSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { courseId } = result.data

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    })

    if (existingItem) {
      return NextResponse.json(
        { success: false, error: 'Course already in cart' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    })

    if (enrollment) {
      return NextResponse.json(
        { success: false, error: 'You are already enrolled in this course' },
        { status: 400 }
      )
    }

    // Add to cart
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: user.id,
        courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            price: true,
            originalPrice: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Added to cart',
      data: cartItem,
    })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

// Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      )
    }

    await prisma.cartItem.delete({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Removed from cart',
    })
  } catch (error) {
    console.error('Remove from cart error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove from cart' },
      { status: 500 }
    )
  }
}
