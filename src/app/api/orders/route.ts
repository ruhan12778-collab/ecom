import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { createOrderSchema, POINT_VALUES } from '@/types'

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CE-${timestamp}-${random}`
}

// Create order
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
    const result = createOrderSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { paymentMethod, notes } = result.data

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        course: true,
      },
    })

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.course.price),
      0
    )
    const discount = 0 // Could implement discount codes here
    const total = subtotal - discount

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: generateOrderNumber(),
        status: 'COMPLETED', // Demo mode - auto complete
        subtotal,
        discount,
        total,
        paymentMethod,
        paymentId: `demo-${Date.now()}`, // Simulated payment ID
        notes,
        items: {
          create: cartItems.map((item) => ({
            courseId: item.courseId,
            price: item.course.price,
            quantity: 1,
          })),
        },
      },
      include: {
        items: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    // Create enrollments for purchased courses
    for (const item of cartItems) {
      await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: item.courseId,
        },
      })

      // Update course enrollment count
      await prisma.course.update({
        where: { id: item.courseId },
        data: { enrollmentCount: { increment: 1 } },
      })
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    })

    // Award points
    const isFirstPurchase = await prisma.order.count({
      where: { userId: user.id },
    }) === 1

    let pointsToAward = cartItems.length * POINT_VALUES.COURSE_ENROLLMENT
    if (isFirstPurchase) {
      pointsToAward += POINT_VALUES.FIRST_PURCHASE
    }

    await prisma.gamification.update({
      where: { userId: user.id },
      data: {
        points: { increment: pointsToAward },
        lastActivityAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        pointsEarned: pointsToAward,
      },
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// Get user's orders
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
