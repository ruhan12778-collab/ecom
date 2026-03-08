import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { awardPoints, checkAndAwardBadges } from '@/services/gamificationService'

const progressSchema = z.object({
  moduleId: z.string().min(1, 'Module ID is required'),
  watchTime: z.number().min(0).optional().default(0),
})

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
    const result = progressSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { moduleId, watchTime } = result.data

    // Fetch module to get courseId
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    })

    if (!module) {
      return NextResponse.json(
        { success: false, error: 'Module not found' },
        { status: 404 }
      )
    }

    const courseId = module.courseId

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

    // Idempotency check — no double-awarding
    const existing = await prisma.userProgress.findUnique({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId,
        },
      },
    })

    if (existing?.completed) {
      return NextResponse.json({
        success: true,
        data: {
          alreadyCompleted: true,
          message: 'Module already completed',
        },
      })
    }

    // Upsert UserProgress
    await prisma.userProgress.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId,
        },
      },
      create: {
        userId: user.id,
        moduleId,
        completed: true,
        completedAt: new Date(),
        watchTime: watchTime ?? 0,
      },
      update: {
        completed: true,
        completedAt: new Date(),
        watchTime: { increment: watchTime ?? 0 },
      },
    })

    // Award MODULE_COMPLETION points
    const pointsResult = await awardPoints(user.id, 'MODULE_COMPLETION')

    // Increment modulesCompleted counter
    await prisma.gamification.update({
      where: { userId: user.id },
      data: {
        modulesCompleted: { increment: 1 },
      },
    })

    // Check course completion
    const totalModules = await prisma.module.count({
      where: { courseId },
    })

    const completedModules = await prisma.userProgress.count({
      where: {
        userId: user.id,
        module: { courseId },
        completed: true,
      },
    })

    let courseCompleted = false
    let courseCompletionPoints = null

    if (completedModules >= totalModules) {
      // Course completed!
      courseCompleted = true

      // Award COURSE_COMPLETION points
      courseCompletionPoints = await awardPoints(user.id, 'COURSE_COMPLETION')

      // Update enrollment
      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
        data: {
          completedAt: new Date(),
          progress: 100,
        },
      })

      // Increment coursesCompleted counter
      await prisma.gamification.update({
        where: { userId: user.id },
        data: {
          coursesCompleted: { increment: 1 },
        },
      })
    } else {
      // Update enrollment progress percentage
      const progressPercent = Math.round((completedModules / totalModules) * 100)
      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
        data: {
          progress: progressPercent,
        },
      })
    }

    // Check and award badges (reads updated modulesCompleted/coursesCompleted)
    const newBadges = await checkAndAwardBadges(user.id)

    return NextResponse.json({
      success: true,
      data: {
        pointsAwarded: pointsResult.pointsAwarded,
        newTotal: pointsResult.newTotal,
        leveledUp: pointsResult.leveledUp,
        newLevel: pointsResult.newLevel,
        courseCompleted,
        courseCompletionPoints: courseCompleted ? courseCompletionPoints : null,
        newBadges: newBadges.length > 0 ? newBadges : null,
        progress: {
          completed: completedModules,
          total: totalModules,
        },
      },
    })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
