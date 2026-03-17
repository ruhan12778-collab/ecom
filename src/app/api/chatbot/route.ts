import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/groq'
import { getCurrentUser } from '@/lib/auth'
import { chatMessageSchema } from '@/types'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = chatMessageSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { message } = result.data

    // Get current user if authenticated
    const user = await getCurrentUser()

    // Get AI response (groq.ts now fetches all published courses internally)
    const response = await chat(
      message,
      user?.id,
      user?.skillLevel?.toLowerCase()
    )

    // Save chat history if user is authenticated
    if (user) {
      try {
        // Save user message
        await prisma.chatMessage.create({
          data: {
            userId: user.id,
            role: 'USER',
            content: message,
          },
        })

        // Save assistant response
        await prisma.chatMessage.create({
          data: {
            userId: user.id,
            role: 'ASSISTANT',
            content: response,
          },
        })

        // Award points for first chat
        const chatCount = await prisma.chatMessage.count({
          where: {
            userId: user.id,
            role: 'USER',
          },
        })

        if (chatCount === 1) {
          await prisma.gamification.update({
            where: { userId: user.id },
            data: {
              points: { increment: 10 }, // FIRST_CHAT points
            },
          })
        }
      } catch (err) {
        // Don't fail the request if saving chat history fails
        console.error('Failed to save chat history:', err)
      }
    }

    return NextResponse.json({
      success: true,
      response,
    })
  } catch (error) {
    console.error('Chatbot error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process message',
        response: "I'm having trouble connecting right now. Here are some things I can help with: course recommendations, pricing info, and navigation. Please try again!",
      },
      { status: 500 }
    )
  }
}

// Get chat history
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      take: 50, // Last 50 messages
    })

    return NextResponse.json({
      success: true,
      data: messages,
    })
  } catch (error) {
    console.error('Chat history error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}
