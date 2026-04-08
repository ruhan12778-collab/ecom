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

    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    const modules = await prisma.module.findMany({
      where: { courseId: id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, data: modules })
  } catch (error) {
    console.error('Admin modules list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch modules' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    const { title, order, duration } = body

    if (!title || order === undefined || duration === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, order, duration' },
        { status: 400 }
      )
    }

    const module = await prisma.module.create({
      data: {
        courseId: id,
        title,
        order: parseInt(String(order)),
        duration: parseInt(String(duration)),
        description: body.description || null,
        content: body.content || null,
        videoUrl: body.videoUrl || null,
        isPreview: body.isPreview ?? false,
      },
    })

    return NextResponse.json({ success: true, data: module }, { status: 201 })
  } catch (error) {
    console.error('Admin module create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create module' },
      { status: 500 }
    )
  }
}
