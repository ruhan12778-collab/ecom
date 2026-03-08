import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { slug } = await params

    // Fetch course with ALL module fields (including videoUrl + content)
    const course = await prisma.course.findUnique({
      where: { slug, isPublished: true },
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

    // Fetch user progress for all modules in this course
    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId: user.id,
        module: { courseId: course.id },
      },
      select: {
        moduleId: true,
        completed: true,
        completedAt: true,
      },
    })

    const completedModuleIds = new Set(
      userProgress.filter((p) => p.completed).map((p) => p.moduleId)
    )

    // Annotate modules with completion status
    const modulesWithProgress = course.modules.map((module) => ({
      ...module,
      completed: completedModuleIds.has(module.id),
    }))

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          instructor: course.instructor,
        },
        modules: modulesWithProgress,
        enrollment: {
          progress: enrollment.progress,
          completedAt: enrollment.completedAt,
          enrolledAt: enrollment.enrolledAt,
        },
      },
    })
  } catch (error) {
    console.error('Learn course fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course content' },
      { status: 500 }
    )
  }
}
