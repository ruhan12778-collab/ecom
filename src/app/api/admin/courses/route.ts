import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')))
    const search = searchParams.get('search') || ''

    const where = search
      ? { title: { contains: search } }
      : {}

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { modules: true } },
        },
      }),
      prisma.course.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Admin courses list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const { title, description, price, difficulty, category, instructor, duration } = body

    if (!title || !description || price === undefined || !difficulty || !category || !instructor || duration === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, price, difficulty, category, instructor, duration' },
        { status: 400 }
      )
    }

    const slug = body.slug || title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    const existingCourse = await prisma.course.findUnique({ where: { slug } })
    if (existingCourse) {
      return NextResponse.json(
        { success: false, error: 'A course with this slug already exists' },
        { status: 409 }
      )
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        longDescription: body.longDescription || null,
        thumbnail: body.thumbnail || null,
        price: parseFloat(String(price)),
        originalPrice: body.originalPrice ? parseFloat(String(body.originalPrice)) : null,
        difficulty,
        category,
        tags: body.tags || null,
        duration: parseInt(String(duration)),
        totalLessons: body.totalLessons ? parseInt(String(body.totalLessons)) : 0,
        instructor,
        isPublished: body.isPublished ?? false,
        isFeatured: body.isFeatured ?? false,
      },
    })

    return NextResponse.json({ success: true, data: course }, { status: 201 })
  } catch (error) {
    console.error('Admin course create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
