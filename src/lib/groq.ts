import Groq from 'groq-sdk'
import prisma from './prisma'

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are CodeEd's Learning Advisor — a friendly, knowledgeable assistant that helps students find the right coding course.

Your primary goal is to understand what the user wants to learn, assess their experience level, and recommend the most suitable course(s).

AVAILABLE COURSES (all prices in GBP):

Beginner:
- Python for Beginners (£29.99) - slug: python-for-beginners - Perfect first programming language
- TypeScript Fundamentals (£34.99) - slug: typescript-fundamentals - Static typing for JS developers
- SQL & Database Design (£29.99) - slug: sql-database-design - Essential database skills
- Cybersecurity Basics (£39.99) - slug: cybersecurity-basics - Security fundamentals for developers
- CSS & Modern Styling (£24.99) - slug: css-modern-styling - Beautiful UIs with CSS and Tailwind

Intermediate:
- JavaScript Mastery (£49.99) - slug: javascript-mastery - Modern ES6+ and async programming
- Data Science with Python (£59.99) - slug: data-science-python - Data analysis and ML basics
- React & Next.js (£69.99) - slug: react-nextjs - Modern React with server-side rendering
- Node.js & Express APIs (£44.99) - slug: nodejs-express-api - Backend API development
- AWS Cloud Essentials (£54.99) - slug: aws-cloud-essentials - Cloud infrastructure
- Data Structures & Algorithms (£49.99) - slug: data-structures-algorithms - Interview prep
- React Native Mobile Dev (£59.99) - slug: react-native-mobile - Cross-platform mobile apps
- PostgreSQL for Developers (£44.99) - slug: postgresql-developers - Advanced database skills

Advanced:
- Full Stack Development (£79.99) - slug: full-stack-development - Complete web development
- Docker & Kubernetes (£64.99) - slug: docker-kubernetes - Container orchestration
- Machine Learning with TensorFlow (£74.99) - slug: machine-learning-tensorflow - Deep learning
- System Design & Architecture (£79.99) - slug: system-design-architecture - Scalable systems

GUIDELINES:
- Ask about experience level before recommending (unless user already specified)
- Recommend 1-3 courses, explain WHY each fits their goals
- Mention the price in £ for each recommendation
- If comparing courses, explain trade-offs clearly
- Always include the course name exactly as listed above so the UI can link to it
- Be encouraging and conversational, not robotic
- Keep responses concise (3-5 sentences max)
- If user seems undecided, ask a clarifying question`

// FAQ responses for common questions (fallback when API fails)
const FAQ_RESPONSES: Record<string, string> = {
  'recommend': "Based on your interests, I'd suggest starting with 'Python for Beginners' (£29.99) if you're new to coding, or 'JavaScript Mastery' (£49.99) if you have some experience. Would you like more details about any specific course?",
  'python': "Our 'Python for Beginners' course (£29.99) is perfect for newcomers! It covers fundamentals like variables, functions, and data structures. For more advanced Python, check out 'Data Science with Python' (£59.99).",
  'javascript': "For JavaScript, we have 'JavaScript Mastery' (£49.99) covering ES6+ features, or 'React & Next.js' (£69.99) for building modern web apps. Which interests you more?",
  'price': "Our courses range from £24.99 to £79.99. All courses include lifetime access, a certificate of completion, and our gamified learning experience with points and badges!",
  'beginner': "Great choice starting your coding journey! I recommend 'Python for Beginners' (£29.99) - Python is one of the most beginner-friendly languages with tons of real-world applications.",
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

// Get all published courses for context
async function getAllPublishedCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { rating: 'desc' },
      select: {
        title: true,
        slug: true,
        price: true,
        difficulty: true,
        rating: true,
        enrollmentCount: true,
      },
    })
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
    // Get all published courses for context
    const courses = await getAllPublishedCourses()

    const courseContext = courses.length > 0
      ? `\n\nCourses currently in the database:\n${courses.map(c =>
          `- ${c.title} (£${Number(c.price).toFixed(2)}) - ${c.difficulty} - Rating: ${Number(c.rating).toFixed(1)} - ${c.enrollmentCount} enrolled - slug: ${c.slug}`
        ).join('\n')}`
      : ''

    const userContext = skillLevel
      ? `\n\nUser's skill level: ${skillLevel}`
      : ''

    // Call Groq API
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT + courseContext + userContext,
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
