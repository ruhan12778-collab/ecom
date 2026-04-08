import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id, moduleId } = await params
    const body = await request.json()

    const existing = await prisma.module.findFirst({
      where: { id: moduleId, courseId: id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Module not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    const stringFields = ['title', 'description', 'content', 'videoUrl']

    for (const field of stringFields) {
      if (body[field] !== undefined) updateData[field] = body[field]
    }
    if (body.order !== undefined) updateData.order = parseInt(String(body.order))
    if (body.duration !== undefined) updateData.duration = parseInt(String(body.duration))
    if (body.isPreview !== undefined) updateData.isPreview = body.isPreview

    const module = await prisma.module.update({
      where: { id: moduleId },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: module })
  } catch (error) {
    console.error('Admin module update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update module' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id, moduleId } = await params

    const existing = await prisma.module.findFirst({
      where: { id: moduleId, courseId: id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Module not found' },
        { status: 404 }
      )
    }

    await prisma.module.delete({ where: { id: moduleId } })

    return NextResponse.json({ success: true, message: 'Module deleted' })
  } catch (error) {
    console.error('Admin module delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete module' },
      { status: 500 }
    )
  }
}
