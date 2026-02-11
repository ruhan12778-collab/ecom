import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.chatMessage.deleteMany()
  await prisma.userBadge.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.gamification.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.userProgress.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.module.deleteMany()
  await prisma.course.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      skillLevel: 'BEGINNER',
      gamification: {
        create: {
          points: 150,
          level: 2,
          currentStreak: 3,
          longestStreak: 7,
        },
      },
    },
  })

  console.log('✅ Created test user:', testUser.email)

  // Create courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Python for Beginners',
        slug: 'python-for-beginners',
        description: 'Start your coding journey with Python. Learn the fundamentals of programming with one of the most popular and beginner-friendly languages.',
        longDescription: 'This comprehensive course covers everything you need to know to start programming with Python. From basic syntax to functions, data structures, and beyond.',
        price: 29.99,
        originalPrice: 49.99,
        difficulty: 'BEGINNER',
        category: 'python',
        tags: 'python,programming,beginner,coding',
        duration: 600,
        totalLessons: 24,
        rating: 4.8,
        ratingCount: 1250,
        enrollmentCount: 5420,
        instructor: 'Dr. Sarah Chen',
        instructorBio: 'Senior Python Developer with 10+ years of experience',
        isPublished: true,
        isFeatured: true,
        modules: {
          create: [
            { title: 'Introduction to Python', description: 'Getting started with Python', order: 1, duration: 15, isPreview: true },
            { title: 'Variables and Data Types', description: 'Understanding Python data types', order: 2, duration: 25 },
            { title: 'Control Flow', description: 'If statements and loops', order: 3, duration: 30 },
            { title: 'Functions', description: 'Writing reusable code', order: 4, duration: 35 },
            { title: 'Data Structures', description: 'Lists, dictionaries, and more', order: 5, duration: 40 },
          ],
        },
      },
    }),
    prisma.course.create({
      data: {
        title: 'JavaScript Mastery',
        slug: 'javascript-mastery',
        description: 'Master modern JavaScript and ES6+ features. Build dynamic web applications with confidence.',
        longDescription: 'Take your JavaScript skills to the next level. This course covers ES6+, async programming, DOM manipulation, and modern development practices.',
        price: 49.99,
        originalPrice: 79.99,
        difficulty: 'INTERMEDIATE',
        category: 'javascript',
        tags: 'javascript,web,frontend,es6',
        duration: 900,
        totalLessons: 36,
        rating: 4.9,
        ratingCount: 890,
        enrollmentCount: 3200,
        instructor: 'Mike Johnson',
        instructorBio: 'Full-stack developer and JavaScript educator',
        isPublished: true,
        isFeatured: true,
        modules: {
          create: [
            { title: 'Modern JavaScript Overview', description: 'ES6 and beyond', order: 1, duration: 20, isPreview: true },
            { title: 'Arrow Functions & Destructuring', description: 'Modern syntax features', order: 2, duration: 30 },
            { title: 'Promises & Async/Await', description: 'Asynchronous programming', order: 3, duration: 45 },
            { title: 'DOM Manipulation', description: 'Interacting with web pages', order: 4, duration: 40 },
            { title: 'Modules & Build Tools', description: 'Modern development workflow', order: 5, duration: 35 },
          ],
        },
      },
    }),
    prisma.course.create({
      data: {
        title: 'Full Stack Development',
        slug: 'full-stack-development',
        description: 'Build complete web applications from scratch. Frontend, backend, databases, and deployment.',
        longDescription: 'Become a full-stack developer. Learn to build, deploy, and maintain complete web applications using modern technologies and best practices.',
        price: 79.99,
        originalPrice: 129.99,
        difficulty: 'ADVANCED',
        category: 'web',
        tags: 'fullstack,web,react,nodejs,mongodb',
        duration: 1800,
        totalLessons: 60,
        rating: 4.7,
        ratingCount: 650,
        enrollmentCount: 1850,
        instructor: 'Emily Rodriguez',
        instructorBio: 'Senior Full-Stack Engineer at a Fortune 500 company',
        isPublished: true,
        isFeatured: true,
        modules: {
          create: [
            { title: 'Full Stack Overview', description: 'Understanding the stack', order: 1, duration: 25, isPreview: true },
            { title: 'React Fundamentals', description: 'Building UIs with React', order: 2, duration: 60 },
            { title: 'Node.js & Express', description: 'Backend development', order: 3, duration: 55 },
            { title: 'Database Design', description: 'Working with databases', order: 4, duration: 50 },
            { title: 'Deployment', description: 'Going to production', order: 5, duration: 40 },
          ],
        },
      },
    }),
    prisma.course.create({
      data: {
        title: 'Data Science with Python',
        slug: 'data-science-python',
        description: 'Analyze data, create visualizations, and build machine learning models with Python.',
        longDescription: 'Learn data science from scratch. This course covers data analysis, visualization, statistics, and machine learning using Python.',
        price: 59.99,
        difficulty: 'INTERMEDIATE',
        category: 'data',
        tags: 'python,data-science,machine-learning,pandas',
        duration: 1200,
        totalLessons: 45,
        rating: 4.6,
        ratingCount: 420,
        enrollmentCount: 1200,
        instructor: 'Dr. Alex Kim',
        instructorBio: 'Data Scientist with PhD in Machine Learning',
        isPublished: true,
        modules: {
          create: [
            { title: 'Introduction to Data Science', description: 'Overview of the field', order: 1, duration: 20, isPreview: true },
            { title: 'NumPy & Pandas', description: 'Data manipulation', order: 2, duration: 45 },
            { title: 'Data Visualization', description: 'Creating charts and graphs', order: 3, duration: 40 },
            { title: 'Statistics Fundamentals', description: 'Statistical analysis', order: 4, duration: 50 },
            { title: 'Machine Learning Basics', description: 'Your first ML models', order: 5, duration: 55 },
          ],
        },
      },
    }),
    prisma.course.create({
      data: {
        title: 'React & Next.js',
        slug: 'react-nextjs',
        description: 'Build modern React applications with Next.js. Server-side rendering, API routes, and more.',
        longDescription: 'Master React and Next.js. Learn to build fast, SEO-friendly web applications with the most popular React framework.',
        price: 69.99,
        difficulty: 'INTERMEDIATE',
        category: 'javascript',
        tags: 'react,nextjs,javascript,web',
        duration: 1080,
        totalLessons: 42,
        rating: 4.8,
        ratingCount: 380,
        enrollmentCount: 980,
        instructor: 'James Wilson',
        instructorBio: 'React consultant and open-source contributor',
        isPublished: true,
        modules: {
          create: [
            { title: 'React Refresher', description: 'React fundamentals recap', order: 1, duration: 30, isPreview: true },
            { title: 'Next.js Basics', description: 'Getting started with Next.js', order: 2, duration: 40 },
            { title: 'App Router', description: 'Modern routing patterns', order: 3, duration: 45 },
            { title: 'Data Fetching', description: 'Server and client data', order: 4, duration: 50 },
            { title: 'Deployment', description: 'Deploying to Vercel', order: 5, duration: 25 },
          ],
        },
      },
    }),
  ])

  console.log('✅ Created', courses.length, 'courses')

  // Create badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'First Steps',
        description: 'Complete your first course module',
        icon: '/images/badges/first-steps.png',
        criteria: JSON.stringify({ type: 'modules_completed', count: 1 }),
        points: 10,
        rarity: 'COMMON',
        category: 'progress',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Course Conqueror',
        description: 'Complete your first course',
        icon: '/images/badges/course-conqueror.png',
        criteria: JSON.stringify({ type: 'courses_completed', count: 1 }),
        points: 100,
        rarity: 'UNCOMMON',
        category: 'completion',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: '/images/badges/week-warrior.png',
        criteria: JSON.stringify({ type: 'streak', count: 7 }),
        points: 50,
        rarity: 'UNCOMMON',
        category: 'streak',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Month Master',
        description: 'Maintain a 30-day learning streak',
        icon: '/images/badges/month-master.png',
        criteria: JSON.stringify({ type: 'streak', count: 30 }),
        points: 200,
        rarity: 'RARE',
        category: 'streak',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Point Collector',
        description: 'Earn 1000 points',
        icon: '/images/badges/point-collector.png',
        criteria: JSON.stringify({ type: 'points', count: 1000 }),
        points: 50,
        rarity: 'UNCOMMON',
        category: 'points',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Scholar',
        description: 'Complete 5 courses',
        icon: '/images/badges/scholar.png',
        criteria: JSON.stringify({ type: 'courses_completed', count: 5 }),
        points: 500,
        rarity: 'EPIC',
        category: 'completion',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Chat Champion',
        description: 'Have 50 conversations with the AI assistant',
        icon: '/images/badges/chat-champion.png',
        criteria: JSON.stringify({ type: 'chat_messages', count: 50 }),
        points: 30,
        rarity: 'COMMON',
        category: 'engagement',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Early Bird',
        description: 'Be among the first 100 users',
        icon: '/images/badges/early-bird.png',
        criteria: JSON.stringify({ type: 'user_number', count: 100 }),
        points: 100,
        rarity: 'LEGENDARY',
        category: 'special',
      },
    }),
  ])

  console.log('✅ Created', badges.length, 'badges')

  // Award first badge to test user
  await prisma.userBadge.create({
    data: {
      userId: testUser.id,
      badgeId: badges[0].id,
    },
  })

  console.log('✅ Awarded badge to test user')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
