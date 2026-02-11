import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { courseFilterSchema } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse and validate query parameters
    const filters = courseFilterSchema.safeParse({
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      sort: searchParams.get('sort') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 12,
    })

    if (!filters.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid filter parameters' },
        { status: 400 }
      )
    }

    const { search, category, difficulty, minPrice, maxPrice, sort, page, limit } = filters.data

    // Build where clause
    const where: Record<string, unknown> = {
      isPublished: true,
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) {
        (where.price as Record<string, number>).gte = minPrice
      }
      if (maxPrice !== undefined) {
        (where.price as Record<string, number>).lte = maxPrice
      }
    }

    // Build order by clause
    type OrderByType = { price?: 'asc' | 'desc'; rating?: 'desc'; createdAt?: 'desc'; enrollmentCount?: 'desc' }
    let orderBy: OrderByType = { createdAt: 'desc' }

    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'popular':
        orderBy = { enrollmentCount: 'desc' }
        break
    }

    // Get total count
    const total = await prisma.course.count({ where })

    // Get courses with pagination
    const courses = await prisma.course.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        price: true,
        originalPrice: true,
        difficulty: true,
        category: true,
        duration: true,
        totalLessons: true,
        rating: true,
        ratingCount: true,
        enrollmentCount: true,
        instructor: true,
        isFeatured: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        items: courses,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Courses fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
