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

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: { orderBy: { order: 'asc' } },
      },
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: course })
  } catch (error) {
    console.error('Admin course get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course' },
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

    const existing = await prisma.course.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    // Build update data, only including provided fields
    const updateData: Record<string, unknown> = {}
    const stringFields = ['title', 'slug', 'description', 'longDescription', 'thumbnail', 'difficulty', 'category', 'tags', 'instructor', 'instructorBio']
    const booleanFields = ['isPublished', 'isFeatured']

    for (const field of stringFields) {
      if (body[field] !== undefined) {
        updateData[field] = field === 'tags' && Array.isArray(body[field])
          ? body[field].join(', ')
          : body[field]
      }
    }
    for (const field of booleanFields) {
      if (body[field] !== undefined) updateData[field] = body[field]
    }
    if (body.price !== undefined) updateData.price = parseFloat(String(body.price))
    if (body.originalPrice !== undefined) updateData.originalPrice = parseFloat(String(body.originalPrice))
    if (body.duration !== undefined) updateData.duration = parseInt(String(body.duration))
    if (body.totalLessons !== undefined) updateData.totalLessons = parseInt(String(body.totalLessons))

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: course })
  } catch (error) {
    console.error('Admin course update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update course' },
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

    const existing = await prisma.course.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    await prisma.course.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Course deleted' })
  } catch (error) {
    console.error('Admin course delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
