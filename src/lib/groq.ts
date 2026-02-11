import Groq from 'groq-sdk'
import prisma from './prisma'

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are CodeEd Assistant, a helpful AI assistant for an e-commerce platform that sells coding courses. Your role is to:

1. **Help users find courses**: Recommend courses based on their skill level, interests, and learning goals.
2. **Answer questions**: Provide information about courses, pricing, and features.
3. **Navigate the platform**: Guide users to different sections of the website.
4. **Learning support**: Offer general programming tips and guidance.

Platform Features:
- Course categories: Python, JavaScript, Web Development, Data Science
- Skill levels: Beginner, Intermediate, Advanced
- Gamification: Points, badges, and streaks for learning progress
- AI-powered recommendations based on user preferences

Guidelines:
- Be friendly, professional, and encouraging
- Keep responses concise (2-3 sentences for simple questions)
- When recommending courses, mention the skill level and price
- If you don't know something specific about the platform, say so
- Never make up course details - recommend based on general categories
- Encourage users to explore the course catalog for detailed information

Current courses available:
- Python for Beginners ($29.99) - Great for newcomers to programming
- JavaScript Mastery ($49.99) - Modern ES6+ features for intermediate developers
- Full Stack Development ($79.99) - Advanced course covering frontend to backend
- Data Science with Python ($59.99) - Data analysis and machine learning
- React & Next.js ($69.99) - Building modern web applications`

// FAQ responses for common questions (fallback when API fails)
const FAQ_RESPONSES: Record<string, string> = {
  'recommend': "Based on your interests, I'd suggest starting with 'Python for Beginners' if you're new to coding, or 'JavaScript Mastery' if you have some experience. Would you like more details about any specific course?",
  'python': "Our 'Python for Beginners' course ($29.99) is perfect for newcomers! It covers fundamentals like variables, functions, and data structures. For more advanced Python, check out 'Data Science with Python' ($59.99).",
  'javascript': "For JavaScript, we have 'JavaScript Mastery' ($49.99) covering ES6+ features, or 'React & Next.js' ($69.99) for building modern web apps. Which interests you more?",
  'price': "Our courses range from $29.99 to $79.99. All courses include lifetime access, a certificate of completion, and our gamified learning experience with points and badges!",
  'beginner': "Great choice starting your coding journey! I recommend 'Python for Beginners' ($29.99) - Python is one of the most beginner-friendly languages with tons of real-world applications.",
  'certificate': "Yes! All our courses include a certificate of completion. You'll also earn points and badges as you progress through the curriculum.",
  'help': "I'm here to help! I can:\n- Recommend courses based on your goals\n- Answer questions about our platform\n- Explain course content and pricing\n- Help you navigate the site\n\nWhat would you like to know?",
  'default': "I'd be happy to help you find the perfect course! Could you tell me a bit about your programming experience and what you'd like to learn? That will help me make better recommendations.",
}

// Get FAQ response for a keyword
function getFAQResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase()

  for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
    if (lowerMessage.includes(keyword)) {
      return response
    }
  }

  return null
}

// Get course recommendations based on user context
async function getCourseRecommendations(userId?: string, skillLevel?: string) {
  try {
    const difficulty = skillLevel === 'advanced' ? 'ADVANCED'
      : skillLevel === 'intermediate' ? 'INTERMEDIATE'
      : 'BEGINNER'

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        difficulty,
      },
      take: 3,
      orderBy: { rating: 'desc' },
      select: {
        title: true,
        price: true,
        difficulty: true,
        rating: true,
      },
    })

    if (courses.length === 0) {
      // Fallback to any courses if none match difficulty
      const fallbackCourses = await prisma.course.findMany({
        where: { isPublished: true },
        take: 3,
        orderBy: { enrollmentCount: 'desc' },
        select: {
          title: true,
          price: true,
          difficulty: true,
          rating: true,
        },
      })
      return fallbackCourses
    }

    return courses
  } catch {
    return []
  }
}

// Main chat function
export async function chat(
  message: string,
  userId?: string,
  skillLevel?: string
): Promise<string> {
  // Check if Groq API key is configured
  if (!process.env.GROQ_API_KEY) {
    // Use FAQ fallback
    const faqResponse = getFAQResponse(message)
    return faqResponse || FAQ_RESPONSES['default']
  }

  try {
    // Get course recommendations for context
    const recommendations = await getCourseRecommendations(userId, skillLevel)

    const courseContext = recommendations.length > 0
      ? `\n\nRecommended courses for this user:\n${recommendations.map(c =>
          `- ${c.title} ($${Number(c.price).toFixed(2)}) - ${c.difficulty} - ⭐ ${Number(c.rating).toFixed(1)}`
        ).join('\n')}`
      : ''

    // Call Groq API
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT + courseContext,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      temperature: 0.7,
    })

    const assistantMessage = response.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from Groq')
    }

    return assistantMessage
  } catch (error) {
    console.error('Groq API error:', error)

    // Fallback to FAQ responses
    const faqResponse = getFAQResponse(message)
    return faqResponse || FAQ_RESPONSES['default']
  }
}

export default groq
