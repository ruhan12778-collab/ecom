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

  const hashedPassword = await bcrypt.hash('password123', 10)

  // ─── Test user ───────────────────────────────────────────────────────────────
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      skillLevel: 'BEGINNER',
      gamification: {
        create: { points: 150, level: 2, currentStreak: 3, longestStreak: 7 },
      },
    },
  })
  console.log('✅ Created test user:', testUser.email)

  // ─── Competition users ────────────────────────────────────────────────────────
  const competitionUsers = [
    { name: 'James Mitchell', email: 'james.mitchell@example.com', skillLevel: 'INTERMEDIATE', points: 2400, level: 7, currentStreak: 12, longestStreak: 12, coursesCompleted: 4, modulesCompleted: 20 },
    { name: 'Sophie Clarke',  email: 'sophie.clarke@example.com',  skillLevel: 'ADVANCED',     points: 1850, level: 6, currentStreak: 5,  longestStreak: 14, coursesCompleted: 3, modulesCompleted: 15 },
    { name: 'Oliver Bennett', email: 'oliver.bennett@example.com', skillLevel: 'INTERMEDIATE', points: 1200, level: 5, currentStreak: 0,  longestStreak: 8,  coursesCompleted: 2, modulesCompleted: 10 },
    { name: 'Emma Thompson',  email: 'emma.thompson@example.com',  skillLevel: 'BEGINNER',     points: 650,  level: 4, currentStreak: 3,  longestStreak: 3,  coursesCompleted: 1, modulesCompleted: 5  },
    { name: 'Liam Harrison',  email: 'liam.harrison@example.com',  skillLevel: 'BEGINNER',     points: 280,  level: 2, currentStreak: 1,  longestStreak: 1,  coursesCompleted: 0, modulesCompleted: 2  },
  ]
  for (const u of competitionUsers) {
    await prisma.user.create({
      data: {
        email: u.email, password: hashedPassword, name: u.name,
        skillLevel: u.skillLevel as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        gamification: { create: { points: u.points, level: u.level, currentStreak: u.currentStreak, longestStreak: u.longestStreak, coursesCompleted: u.coursesCompleted, modulesCompleted: u.modulesCompleted } },
      },
    })
  }
  console.log('✅ Created 5 competition users')

  // ─── Courses ─────────────────────────────────────────────────────────────────
  const UNS = (id: string) => `https://images.unsplash.com/${id}?w=800&auto=format&fit=crop`

  const courses = await Promise.all([
    // ── Original 5 ──────────────────────────────────────────────────────────────
    prisma.course.create({ data: {
      title: 'Python for Beginners', slug: 'python-for-beginners',
      description: 'Start your coding journey with Python. Learn the fundamentals of programming with one of the most popular and beginner-friendly languages.',
      longDescription: 'This comprehensive course covers everything you need to know to start programming with Python. From basic syntax to functions, data structures, and beyond.',
      thumbnail: UNS('photo-1526379879527-8559ecfcaec0'),
      price: 29.99, originalPrice: 49.99, difficulty: 'BEGINNER', category: 'python',
      tags: 'python,programming,beginner,coding', duration: 600, totalLessons: 24,
      rating: 4.8, ratingCount: 1250, enrollmentCount: 5420,
      instructor: 'Dr. Sarah Chen', instructorBio: 'Senior Python Developer with 10+ years of experience',
      isPublished: true, isFeatured: true,
      modules: { create: [
        { title: 'Introduction to Python', description: 'Getting started with Python', order: 1, duration: 15, isPreview: true },
        { title: 'Variables and Data Types', description: 'Understanding Python data types', order: 2, duration: 25 },
        { title: 'Control Flow', description: 'If statements and loops', order: 3, duration: 30 },
        { title: 'Functions', description: 'Writing reusable code', order: 4, duration: 35 },
        { title: 'Data Structures', description: 'Lists, dictionaries, and more', order: 5, duration: 40 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'JavaScript Mastery', slug: 'javascript-mastery',
      description: 'Master modern JavaScript and ES6+ features. Build dynamic web applications with confidence.',
      longDescription: 'Take your JavaScript skills to the next level. This course covers ES6+, async programming, DOM manipulation, and modern development practices.',
      thumbnail: UNS('photo-1555066931-4365d14bab8c'),
      price: 49.99, originalPrice: 79.99, difficulty: 'INTERMEDIATE', category: 'javascript',
      tags: 'javascript,web,frontend,es6', duration: 900, totalLessons: 36,
      rating: 4.9, ratingCount: 890, enrollmentCount: 3200,
      instructor: 'Mike Johnson', instructorBio: 'Full-stack developer and JavaScript educator',
      isPublished: true, isFeatured: true,
      modules: { create: [
        { title: 'Modern JavaScript Overview', description: 'ES6 and beyond', order: 1, duration: 20, isPreview: true },
        { title: 'Arrow Functions & Destructuring', description: 'Modern syntax features', order: 2, duration: 30 },
        { title: 'Promises & Async/Await', description: 'Asynchronous programming', order: 3, duration: 45 },
        { title: 'DOM Manipulation', description: 'Interacting with web pages', order: 4, duration: 40 },
        { title: 'Modules & Build Tools', description: 'Modern development workflow', order: 5, duration: 35 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'Full Stack Development', slug: 'full-stack-development',
      description: 'Build complete web applications from scratch. Frontend, backend, databases, and deployment.',
      longDescription: 'Become a full-stack developer. Learn to build, deploy, and maintain complete web applications using modern technologies and best practices.',
      thumbnail: UNS('photo-1432821596592-e2c18b78144f'),
      price: 79.99, originalPrice: 129.99, difficulty: 'ADVANCED', category: 'web',
      tags: 'fullstack,web,react,nodejs,mongodb', duration: 1800, totalLessons: 60,
      rating: 4.7, ratingCount: 650, enrollmentCount: 1850,
      instructor: 'Emily Rodriguez', instructorBio: 'Senior Full-Stack Engineer at a Fortune 500 company',
      isPublished: true, isFeatured: true,
      modules: { create: [
        { title: 'Full Stack Overview', description: 'Understanding the stack', order: 1, duration: 25, isPreview: true },
        { title: 'React Fundamentals', description: 'Building UIs with React', order: 2, duration: 60 },
        { title: 'Node.js & Express', description: 'Backend development', order: 3, duration: 55 },
        { title: 'Database Design', description: 'Working with databases', order: 4, duration: 50 },
        { title: 'Deployment', description: 'Going to production', order: 5, duration: 40 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'Data Science with Python', slug: 'data-science-python',
      description: 'Analyze data, create visualizations, and build machine learning models with Python.',
      longDescription: 'Learn data science from scratch. This course covers data analysis, visualization, statistics, and machine learning using Python.',
      thumbnail: UNS('photo-1551288049-bebda4e38f71'),
      price: 59.99, difficulty: 'INTERMEDIATE', category: 'data',
      tags: 'python,data-science,machine-learning,pandas', duration: 1200, totalLessons: 45,
      rating: 4.6, ratingCount: 420, enrollmentCount: 1200,
      instructor: 'Dr. Alex Kim', instructorBio: 'Data Scientist with PhD in Machine Learning',
      isPublished: true,
      modules: { create: [
        { title: 'Introduction to Data Science', description: 'Overview of the field', order: 1, duration: 20, isPreview: true },
        { title: 'NumPy & Pandas', description: 'Data manipulation', order: 2, duration: 45 },
        { title: 'Data Visualization', description: 'Creating charts and graphs', order: 3, duration: 40 },
        { title: 'Statistics Fundamentals', description: 'Statistical analysis', order: 4, duration: 50 },
        { title: 'Machine Learning Basics', description: 'Your first ML models', order: 5, duration: 55 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'React & Next.js', slug: 'react-nextjs',
      description: 'Build modern React applications with Next.js. Server-side rendering, API routes, and more.',
      longDescription: 'Master React and Next.js. Learn to build fast, SEO-friendly web applications with the most popular React framework.',
      thumbnail: UNS('photo-1633356122102-3fe601e05bd2'),
      price: 69.99, difficulty: 'INTERMEDIATE', category: 'javascript',
      tags: 'react,nextjs,javascript,web', duration: 1080, totalLessons: 42,
      rating: 4.8, ratingCount: 380, enrollmentCount: 980,
      instructor: 'James Wilson', instructorBio: 'React consultant and open-source contributor',
      isPublished: true,
      modules: { create: [
        { title: 'React Refresher', description: 'React fundamentals recap', order: 1, duration: 30, isPreview: true },
        { title: 'Next.js Basics', description: 'Getting started with Next.js', order: 2, duration: 40 },
        { title: 'App Router', description: 'Modern routing patterns', order: 3, duration: 45 },
        { title: 'Data Fetching', description: 'Server and client data', order: 4, duration: 50 },
        { title: 'Deployment', description: 'Deploying to Vercel', order: 5, duration: 25 },
      ]},
    }}),

    // ── 12 New Courses ──────────────────────────────────────────────────────────
    prisma.course.create({ data: {
      title: 'TypeScript Fundamentals', slug: 'typescript-fundamentals',
      description: 'Add static typing to your JavaScript code. Learn TypeScript from scratch and write more robust applications.',
      longDescription: 'TypeScript is the industry standard for large-scale JavaScript applications. This course takes you from zero to confident TypeScript developer, covering types, interfaces, generics, and real-world patterns.',
      thumbnail: UNS('photo-1516116216624-53e697fedbea'),
      price: 34.99, originalPrice: 54.99, difficulty: 'BEGINNER', category: 'typescript',
      tags: 'typescript,javascript,types,programming', duration: 720, totalLessons: 28,
      rating: 4.7, ratingCount: 560, enrollmentCount: 2100,
      instructor: 'Anna Kowalski', instructorBio: 'TypeScript core contributor and senior engineer',
      isPublished: true, isFeatured: true,
      modules: { create: [
        { title: 'Why TypeScript?', description: 'Benefits over plain JavaScript', order: 1, duration: 15, isPreview: true },
        { title: 'Types & Interfaces', description: 'Core type system concepts', order: 2, duration: 35 },
        { title: 'Generics', description: 'Writing reusable typed code', order: 3, duration: 40 },
        { title: 'Advanced Types', description: 'Unions, intersections, mapped types', order: 4, duration: 45 },
        { title: 'TypeScript in React', description: 'Typed React components', order: 5, duration: 30 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'Node.js & Express APIs', slug: 'nodejs-express-api',
      description: 'Build fast, scalable backend APIs with Node.js and Express. REST, authentication, databases, and deployment.',
      longDescription: 'Learn backend development from scratch with Node.js. Cover Express routing, middleware, JWT authentication, database integration, and deploying to the cloud.',
      thumbnail: UNS('photo-1558494949-ef010cbdcc31'),
      price: 44.99, originalPrice: 69.99, difficulty: 'INTERMEDIATE', category: 'web',
      tags: 'nodejs,express,backend,api,rest', duration: 960, totalLessons: 38,
      rating: 4.6, ratingCount: 340, enrollmentCount: 1540,
      instructor: 'Carlos Mendez', instructorBio: 'Backend engineer with 8+ years building APIs',
      isPublished: true,
      modules: { create: [
        { title: 'Node.js Fundamentals', description: 'Event loop, modules, npm', order: 1, duration: 25, isPreview: true },
        { title: 'Express Routing & Middleware', description: 'Building REST endpoints', order: 2, duration: 40 },
        { title: 'Authentication with JWT', description: 'Secure APIs with tokens', order: 3, duration: 45 },
        { title: 'Database Integration', description: 'MongoDB and SQL with Node.js', order: 4, duration: 50 },
        { title: 'Testing & Deployment', description: 'Testing APIs and deploying', order: 5, duration: 35 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'SQL & Database Design', slug: 'sql-database-design',
      description: 'Master SQL from basics to advanced queries. Design efficient databases that scale.',
      longDescription: 'SQL is the language of data. This course teaches you to write complex queries, design normalized schemas, optimize performance, and work with both SQLite and PostgreSQL.',
      thumbnail: UNS('photo-1544383835-bda2bc66a55d'),
      price: 29.99, originalPrice: 49.99, difficulty: 'BEGINNER', category: 'databases',
      tags: 'sql,databases,postgresql,data', duration: 660, totalLessons: 26,
      rating: 4.7, ratingCount: 480, enrollmentCount: 2800,
      instructor: 'Dr. Maria Santos', instructorBio: 'Database architect with 15 years enterprise experience',
      isPublished: true,
      modules: { create: [
        { title: 'SQL Basics', description: 'SELECT, INSERT, UPDATE, DELETE', order: 1, duration: 25, isPreview: true },
        { title: 'Joins & Relationships', description: 'Connecting tables effectively', order: 2, duration: 35 },
        { title: 'Database Design', description: 'Normalization and schema design', order: 3, duration: 40 },
        { title: 'Indexes & Performance', description: 'Making queries fast', order: 4, duration: 30 },
        { title: 'Advanced Queries', description: 'CTEs, window functions, subqueries', order: 5, duration: 45 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'AWS Cloud Essentials', slug: 'aws-cloud-essentials',
      description: 'Get started with Amazon Web Services. Deploy applications, manage infrastructure, and pass the AWS Solutions Architect exam.',
      longDescription: 'Cloud computing is essential for modern developers. This course covers core AWS services — EC2, S3, RDS, Lambda, IAM — and teaches you to architect scalable cloud applications.',
      thumbnail: UNS('photo-1451187580459-43490279c0fa'),
      price: 54.99, originalPrice: 84.99, difficulty: 'INTERMEDIATE', category: 'cloud',
      tags: 'aws,cloud,devops,ec2,s3,lambda', duration: 1140, totalLessons: 44,
      rating: 4.5, ratingCount: 290, enrollmentCount: 1100,
      instructor: 'Raj Patel', instructorBio: 'AWS Certified Solutions Architect & DevOps Engineer',
      isPublished: true,
      modules: { create: [
        { title: 'Cloud Computing Basics', description: 'IaaS, PaaS, SaaS overview', order: 1, duration: 20, isPreview: true },
        { title: 'EC2 & S3', description: 'Compute and storage fundamentals', order: 2, duration: 50 },
        { title: 'Databases in AWS', description: 'RDS, DynamoDB, ElastiCache', order: 3, duration: 45 },
        { title: 'Serverless with Lambda', description: 'Event-driven cloud functions', order: 4, duration: 40 },
        { title: 'IAM & Security', description: 'Identity, policies, and best practices', order: 5, duration: 35 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'Docker & Kubernetes', slug: 'docker-kubernetes',
      description: 'Containerize applications with Docker and orchestrate them with Kubernetes. Deploy anywhere with confidence.',
      longDescription: 'Learn the entire container ecosystem. Build Docker images, write compose files, and orchestrate production workloads with Kubernetes — the skills every DevOps engineer needs.',
      thumbnail: UNS('photo-1605745341112-85968b19335b'),
      price: 64.99, originalPrice: 99.99, difficulty: 'ADVANCED', category: 'devops',
      tags: 'docker,kubernetes,devops,containers,cicd', duration: 1320, totalLessons: 50,
      rating: 4.8, ratingCount: 210, enrollmentCount: 870,
      instructor: 'Tom Fischer', instructorBio: 'Site Reliability Engineer at a top-tier tech company',
      isPublished: true,
      modules: { create: [
        { title: 'Docker Fundamentals', description: 'Images, containers, Dockerfile', order: 1, duration: 35, isPreview: true },
        { title: 'Docker Compose', description: 'Multi-container applications', order: 2, duration: 40 },
        { title: 'Kubernetes Basics', description: 'Pods, deployments, services', order: 3, duration: 55 },
        { title: 'Kubernetes Networking', description: 'Ingress, services, DNS', order: 4, duration: 45 },
        { title: 'CI/CD Pipelines', description: 'Automated deployment with GitHub Actions', order: 5, duration: 50 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'Cybersecurity Basics', slug: 'cybersecurity-basics',
      description: 'Understand how attacks work and how to defend against them. Essential security knowledge for every developer.',
      longDescription: 'Security is everyone\'s responsibility. Learn about OWASP Top 10, XSS, SQL injection, cryptography, secure coding practices, and how to protect applications in production.',
      thumbnail: UNS('photo-1550751827-4bd374c3f58b'),
      price: 39.99, originalPrice: 64.99, difficulty: 'BEGINNER', category: 'security',
      tags: 'security,cybersecurity,owasp,hacking', duration: 780, totalLessons: 30,
      rating: 4.6, ratingCount: 320, enrollmentCount: 1650,
      instructor: 'Zara Ahmed', instructorBio: 'Certified Ethical Hacker and security consultant',
      isPublished: true,
      modules: { create: [
        { title: 'Security Fundamentals', description: 'CIA triad and threat landscape', order: 1, duration: 20, isPreview: true },
        { title: 'OWASP Top 10', description: 'Most critical web vulnerabilities', order: 2, duration: 40 },
        { title: 'Authentication & Cryptography', description: 'Passwords, hashing, JWT', order: 3, duration: 35 },
        { title: 'Secure Coding Practices', description: 'Writing code that stays secure', order: 4, duration: 40 },
        { title: 'Penetration Testing Basics', description: 'Finding vulnerabilities ethically', order: 5, duration: 45 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'Data Structures & Algorithms', slug: 'data-structures-algorithms',
      description: 'Crack coding interviews and write efficient code. Master arrays, trees, graphs, sorting, and dynamic programming.',
      longDescription: 'A strong foundation in DSA separates good engineers from great ones. This course covers all major data structures and algorithms with practical problems from real interviews at top companies.',
      thumbnail: UNS('photo-1454165804606-c3d57bc86b40'),
      price: 49.99, originalPrice: 79.99, difficulty: 'INTERMEDIATE', category: 'algorithms',
      tags: 'dsa,algorithms,data-structures,interviews,leetcode', duration: 1260, totalLessons: 48,
      rating: 4.9, ratingCount: 610, enrollmentCount: 3200,
      instructor: 'Prof. Lin Wei', instructorBio: 'Former Google engineer and CS professor at Stanford',
      isPublished: true, isFeatured: true,
      modules: { create: [
        { title: 'Arrays & Strings', description: 'Two pointers, sliding window', order: 1, duration: 40, isPreview: true },
        { title: 'Linked Lists & Stacks', description: 'Fundamental linear structures', order: 2, duration: 45 },
        { title: 'Trees & Graphs', description: 'BFS, DFS, binary search trees', order: 3, duration: 60 },
        { title: 'Sorting & Searching', description: 'QuickSort, MergeSort, binary search', order: 4, duration: 50 },
        { title: 'Dynamic Programming', description: 'Memoization and tabulation', order: 5, duration: 55 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'React Native Mobile Dev', slug: 'react-native-mobile',
      description: 'Build iOS and Android apps with one JavaScript codebase. From zero to a published mobile app.',
      longDescription: 'React Native lets you build real native apps using React. This course takes you through building a complete mobile app, covering navigation, state management, native APIs, and publishing to app stores.',
      thumbnail: UNS('photo-1512941937669-90a1b58e7e9c'),
      price: 59.99, originalPrice: 89.99, difficulty: 'INTERMEDIATE', category: 'mobile',
      tags: 'react-native,mobile,ios,android,javascript', duration: 1080, totalLessons: 40,
      rating: 4.5, ratingCount: 270, enrollmentCount: 1020,
      instructor: 'Priya Sharma', instructorBio: 'Mobile lead engineer with 5 published apps',
      isPublished: true,
      modules: { create: [
        { title: 'React Native Setup', description: 'Environment, Expo, first app', order: 1, duration: 30, isPreview: true },
        { title: 'Core Components', description: 'Views, text, images, lists', order: 2, duration: 45 },
        { title: 'Navigation', description: 'Stack, tab, and drawer navigation', order: 3, duration: 40 },
        { title: 'State & APIs', description: 'Zustand, Redux, and fetching data', order: 4, duration: 50 },
        { title: 'Publishing', description: 'App Store and Play Store submission', order: 5, duration: 35 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'Machine Learning with TensorFlow', slug: 'machine-learning-tensorflow',
      description: 'Build and train neural networks with TensorFlow and Keras. Go from math fundamentals to real AI projects.',
      longDescription: 'Machine learning is transforming every industry. This advanced course covers neural networks, CNNs, RNNs, NLP, and building production-ready ML pipelines with TensorFlow 2.x.',
      thumbnail: UNS('photo-1485827404703-89b55fcc595e'),
      price: 74.99, originalPrice: 119.99, difficulty: 'ADVANCED', category: 'data',
      tags: 'tensorflow,machine-learning,deep-learning,neural-networks,ai', duration: 1500, totalLessons: 55,
      rating: 4.7, ratingCount: 380, enrollmentCount: 1400,
      instructor: 'Dr. Yuki Tanaka', instructorBio: 'ML researcher and TensorFlow Certified Developer',
      isPublished: true,
      modules: { create: [
        { title: 'Math for ML', description: 'Linear algebra and calculus review', order: 1, duration: 35, isPreview: true },
        { title: 'Neural Networks', description: 'Perceptrons, backpropagation', order: 2, duration: 55 },
        { title: 'CNNs for Vision', description: 'Image classification and object detection', order: 3, duration: 60 },
        { title: 'RNNs & NLP', description: 'Text classification and sequence models', order: 4, duration: 55 },
        { title: 'ML in Production', description: 'Serving models and MLOps', order: 5, duration: 45 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'CSS & Modern Styling', slug: 'css-modern-styling',
      description: 'Master CSS Grid, Flexbox, animations, and Tailwind CSS. Build beautiful, responsive UIs from scratch.',
      longDescription: 'CSS is more powerful than ever. This course goes deep on modern layout techniques, custom properties, CSS animations, and utility-first frameworks like Tailwind CSS to build stunning web interfaces.',
      thumbnail: UNS('photo-1507721999472-8ed4421c4af2'),
      price: 24.99, originalPrice: 39.99, difficulty: 'BEGINNER', category: 'web',
      tags: 'css,tailwind,flexbox,grid,design,ui', duration: 540, totalLessons: 22,
      rating: 4.8, ratingCount: 730, enrollmentCount: 4100,
      instructor: 'Isabelle Dubois', instructorBio: 'UI engineer and design systems specialist',
      isPublished: true,
      modules: { create: [
        { title: 'CSS Fundamentals', description: 'Box model, selectors, specificity', order: 1, duration: 25, isPreview: true },
        { title: 'Flexbox Layout', description: 'One-dimensional layouts mastered', order: 2, duration: 30 },
        { title: 'CSS Grid', description: 'Two-dimensional layouts', order: 3, duration: 35 },
        { title: 'Animations & Transitions', description: 'Delightful motion effects', order: 4, duration: 30 },
        { title: 'Tailwind CSS', description: 'Utility-first rapid styling', order: 5, duration: 35 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'PostgreSQL for Developers', slug: 'postgresql-developers',
      description: 'Deep dive into PostgreSQL. Advanced queries, JSON support, full-text search, and performance tuning.',
      longDescription: 'PostgreSQL is the world\'s most advanced open-source database. This course covers JSONB, full-text search, indexing strategies, query planning, replication, and integrating with Node.js and Python.',
      thumbnail: UNS('photo-1477414348463-c0eb7f1359b6'),
      price: 44.99, originalPrice: 69.99, difficulty: 'INTERMEDIATE', category: 'databases',
      tags: 'postgresql,sql,databases,backend', duration: 900, totalLessons: 35,
      rating: 4.6, ratingCount: 190, enrollmentCount: 760,
      instructor: 'Hans Mueller', instructorBio: 'PostgreSQL DBA and performance tuning expert',
      isPublished: true,
      modules: { create: [
        { title: 'PostgreSQL Overview', description: 'Installation, psql, pgAdmin', order: 1, duration: 20, isPreview: true },
        { title: 'Advanced Queries', description: 'Window functions, CTEs, lateral joins', order: 2, duration: 50 },
        { title: 'JSON & JSONB', description: 'Document storage in PostgreSQL', order: 3, duration: 40 },
        { title: 'Indexing & Query Plans', description: 'Making queries blazing fast', order: 4, duration: 45 },
        { title: 'Replication & Backups', description: 'High availability patterns', order: 5, duration: 35 },
      ]},
    }}),

    prisma.course.create({ data: {
      title: 'System Design & Architecture', slug: 'system-design-architecture',
      description: 'Design scalable systems for millions of users. Ace system design interviews at FAANG companies.',
      longDescription: 'System design is the skill that separates senior engineers from the rest. This course teaches you to design Twitter, YouTube, Uber, and other large-scale systems using proven architectural patterns.',
      thumbnail: UNS('photo-1498050108023-c5249f4df085'),
      price: 79.99, originalPrice: 124.99, difficulty: 'ADVANCED', category: 'algorithms',
      tags: 'system-design,architecture,scalability,distributed-systems,interviews', duration: 1440, totalLessons: 52,
      rating: 4.9, ratingCount: 440, enrollmentCount: 2300,
      instructor: 'Michael Chang', instructorBio: 'Ex-Google, ex-Meta principal engineer and interview coach',
      isPublished: true, isFeatured: true,
      modules: { create: [
        { title: 'Design Principles', description: 'CAP theorem, ACID, scalability', order: 1, duration: 30, isPreview: true },
        { title: 'Database Design at Scale', description: 'Sharding, replication, caching', order: 2, duration: 55 },
        { title: 'Distributed Systems', description: 'Consistency, availability, partitions', order: 3, duration: 60 },
        { title: 'Case Studies', description: 'Design Twitter, YouTube, Uber', order: 4, duration: 65 },
        { title: 'Interview Framework', description: 'How to approach any system design question', order: 5, duration: 40 },
      ]},
    }}),
  ])

  console.log('✅ Created', courses.length, 'courses')

  // ─── Badges ──────────────────────────────────────────────────────────────────
  const badges = await Promise.all([
    prisma.badge.create({ data: { name: 'First Steps', description: 'Complete your first course module', icon: '/images/badges/first-steps.png', criteria: JSON.stringify({ type: 'modules_completed', count: 1 }), points: 10, rarity: 'COMMON', category: 'progress' } }),
    prisma.badge.create({ data: { name: 'Course Conqueror', description: 'Complete your first course', icon: '/images/badges/course-conqueror.png', criteria: JSON.stringify({ type: 'courses_completed', count: 1 }), points: 100, rarity: 'UNCOMMON', category: 'completion' } }),
    prisma.badge.create({ data: { name: 'Week Warrior', description: 'Maintain a 7-day learning streak', icon: '/images/badges/week-warrior.png', criteria: JSON.stringify({ type: 'streak', count: 7 }), points: 50, rarity: 'UNCOMMON', category: 'streak' } }),
    prisma.badge.create({ data: { name: 'Month Master', description: 'Maintain a 30-day learning streak', icon: '/images/badges/month-master.png', criteria: JSON.stringify({ type: 'streak', count: 30 }), points: 200, rarity: 'RARE', category: 'streak' } }),
    prisma.badge.create({ data: { name: 'Point Collector', description: 'Earn 1000 points', icon: '/images/badges/point-collector.png', criteria: JSON.stringify({ type: 'points', count: 1000 }), points: 50, rarity: 'UNCOMMON', category: 'points' } }),
    prisma.badge.create({ data: { name: 'Scholar', description: 'Complete 5 courses', icon: '/images/badges/scholar.png', criteria: JSON.stringify({ type: 'courses_completed', count: 5 }), points: 500, rarity: 'EPIC', category: 'completion' } }),
    prisma.badge.create({ data: { name: 'Chat Champion', description: 'Have 50 conversations with the AI assistant', icon: '/images/badges/chat-champion.png', criteria: JSON.stringify({ type: 'chat_messages', count: 50 }), points: 30, rarity: 'COMMON', category: 'engagement' } }),
    prisma.badge.create({ data: { name: 'Early Bird', description: 'Be among the first 100 users', icon: '/images/badges/early-bird.png', criteria: JSON.stringify({ type: 'user_number', count: 100 }), points: 100, rarity: 'LEGENDARY', category: 'special' } }),
  ])
  console.log('✅ Created', badges.length, 'badges')

  await prisma.userBadge.create({ data: { userId: testUser.id, badgeId: badges[0].id } })
  console.log('✅ Awarded badge to test user')
  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
