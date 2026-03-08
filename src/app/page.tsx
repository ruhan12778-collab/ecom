import Link from 'next/link'
import Image from 'next/image'

const FEATURED_COURSES = [
  {
    title: 'Python for Beginners',
    description: 'Start your coding journey with Python fundamentals and build real projects',
    price: 29.99,
    originalPrice: 49.99,
    difficulty: 'Beginner',
    rating: 4.8,
    ratingCount: 1250,
    slug: 'python-for-beginners',
    instructor: 'Dr. Sarah Chen',
    thumbnail: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=800&auto=format&fit=crop',
    students: 5420,
  },
  {
    title: 'JavaScript Mastery',
    description: 'Master modern JavaScript and ES6+ features to build dynamic web apps',
    price: 49.99,
    originalPrice: 79.99,
    difficulty: 'Intermediate',
    rating: 4.9,
    ratingCount: 890,
    slug: 'javascript-mastery',
    instructor: 'Mike Johnson',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
    students: 3200,
  },
  {
    title: 'Full Stack Development',
    description: 'Build complete web applications from scratch — frontend to deployment',
    price: 79.99,
    originalPrice: 129.99,
    difficulty: 'Advanced',
    rating: 4.7,
    ratingCount: 650,
    slug: 'full-stack-development',
    instructor: 'Emily Rodriguez',
    thumbnail: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&auto=format&fit=crop',
    students: 1850,
  },
]

const CATEGORIES = [
  { label: 'Python', emoji: '🐍', value: 'python' },
  { label: 'JavaScript', emoji: '⚡', value: 'javascript' },
  { label: 'TypeScript', emoji: '🔷', value: 'typescript' },
  { label: 'Data Science', emoji: '📊', value: 'data' },
  { label: 'Cloud', emoji: '☁️', value: 'cloud' },
  { label: 'Databases', emoji: '🗄️', value: 'databases' },
  { label: 'Security', emoji: '🔐', value: 'security' },
  { label: 'Mobile', emoji: '📱', value: 'mobile' },
]

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-white/20">
              <span>🎓</span>
              <span>10,000+ learners already enrolled</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Learn to Code.
              <br />
              <span className="text-blue-200">Build Your Future.</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-xl leading-relaxed">
              Expert-led courses with AI-powered assistance. Earn points, unlock badges, and climb the leaderboard as you learn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-lg shadow-md"
              >
                Explore Courses
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white/50 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-lg"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-blue-900 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <StatItem icon="👨‍🎓" number="10,000+" label="Students" />
            <StatItem icon="📚" number="5" label="Expert Courses" />
            <StatItem icon="⭐" number="4.8" label="Avg Rating" />
            <StatItem icon="🌐" number="100%" label="Online" />
          </div>
        </div>
      </section>

      {/* Category chips */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-bg-secondary border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">What do you want to learn?</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={`/courses?category=${cat.value}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-text-primary hover:border-accent-primary hover:text-accent-primary transition-colors shadow-sm"
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary border border-accent-primary rounded-full text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              View All →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-text-primary">Most Popular Courses</h2>
              <p className="text-text-secondary mt-1">Handpicked by our expert team</p>
            </div>
            <Link href="/courses" className="hidden sm:block text-accent-primary hover:underline font-medium">
              View All Courses →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_COURSES.map((course) => (
              <Link key={course.slug} href={`/courses/${course.slug}`} className="group">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-2 left-2">
                      <span
                        className={`badge text-xs ${
                          course.difficulty === 'Beginner'
                            ? 'bg-green-100 text-green-800'
                            : course.difficulty === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-text-primary mb-1 line-clamp-2 group-hover:text-accent-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-text-secondary mb-2">by {course.instructor}</p>
                    <p className="text-sm text-text-secondary mb-3 flex-1 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-sm">⭐</span>
                        <span className="text-sm font-semibold">{course.rating}</span>
                        <span className="text-xs text-text-secondary">({course.ratingCount.toLocaleString()})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-accent-primary">${course.price}</span>
                        <span className="ml-1 text-sm text-text-secondary line-through">${course.originalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="sm:hidden text-center mt-6">
            <Link href="/courses" className="btn btn-secondary">View All Courses</Link>
          </div>
        </div>
      </section>

      {/* Why CodeEd */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-bg-secondary border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-3">Why Choose CodeEd?</h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Everything you need to go from beginner to job-ready developer
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🤖"
              color="bg-blue-100"
              iconColor="text-blue-600"
              title="AI-Powered Assistant"
              description="Get personalized course recommendations and instant help from our AI chatbot, available 24/7."
            />
            <FeatureCard
              icon="🎮"
              color="bg-green-100"
              iconColor="text-green-600"
              title="Gamified Learning"
              description="Earn points, unlock badges, maintain streaks, and compete on the leaderboard as you progress."
            />
            <FeatureCard
              icon="💻"
              color="bg-purple-100"
              iconColor="text-purple-600"
              title="Hands-on Projects"
              description="Learn by doing with interactive exercises, real-world projects, and a growing curriculum."
            />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Coding Journey?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join 10,000+ learners who are already building their future with CodeEd.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-lg shadow-md"
            >
              Create Free Account
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white/50 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-lg"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatItem({ icon, number, label }: { icon: string; number: string; label: string }) {
  return (
    <div className="flex items-center gap-3 text-white py-2">
      <span className="text-2xl">{icon}</span>
      <div className="text-left">
        <div className="font-bold text-lg leading-tight">{number}</div>
        <div className="text-blue-300 text-sm">{label}</div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  color,
  iconColor,
  title,
  description,
}: {
  icon: string
  color: string
  iconColor: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-text-primary">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
  )
}
