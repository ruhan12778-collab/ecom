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
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop',
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
    description: 'Build complete web applications from scratch -- frontend to deployment',
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
  { label: 'Python', value: 'python' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Data Science', value: 'data' },
  { label: 'Cloud', value: 'cloud' },
  { label: 'Databases', value: 'databases' },
  { label: 'Security', value: 'security' },
  { label: 'Mobile', value: 'mobile' },
]

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-bg-primary">
        {/* Subtle radial gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(166,123,91,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-medium text-text-secondary tracking-widest uppercase mb-6 fade-in-up">
              10,000+ learners already enrolled
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-extrabold text-text-primary mb-6 leading-[1.1] tracking-tight fade-in-up" style={{ animationDelay: '0.1s' }}>
              Master the Craft
              <br />
              of Code
            </h1>
            <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto leading-relaxed fade-in-up" style={{ animationDelay: '0.2s' }}>
              Expert-led courses with AI-powered assistance. Earn points, unlock badges, and climb the leaderboard as you learn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/courses"
                className="btn btn-primary text-lg px-10 py-4"
              >
                Explore Courses
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 text-text-secondary font-medium hover:text-text-primary transition-colors text-lg"
              >
                {'Get Started Free \u2192'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-bg-secondary py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <StatItem number="10,000+" label="Students" />
            <StatItem number="5" label="Expert Courses" />
            <StatItem number="4.8" label="Avg Rating" />
            <StatItem number="100%" label="Online" />
          </div>
        </div>
      </section>

      {/* Category chips */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-bg-primary">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium text-text-secondary mb-4 uppercase tracking-widest">What do you want to learn?</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={`/courses?category=${cat.value}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 rounded-full text-sm font-medium text-text-primary hover:bg-stone-900 hover:text-white transition-all duration-200"
              >
                <span>{cat.label}</span>
              </Link>
            ))}
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 rounded-full text-sm font-medium text-white hover:bg-stone-800 transition-all duration-200"
            >
              {'View All \u2192'}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-text-primary">Most Popular Courses</h2>
              <p className="text-text-secondary mt-2">Handpicked by our expert team</p>
            </div>
            <Link href="/courses" className="hidden sm:block text-text-secondary hover:text-text-primary font-medium transition-colors">
              {'View All Courses \u2192'}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_COURSES.map((course) => (
              <Link key={course.slug} href={`/courses/${course.slug}`} className="group">
                <div className="rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-300 h-full flex flex-col bg-white/40 hover:bg-white/70 hover:shadow-card-hover">
                  <div className="relative aspect-video overflow-hidden bg-stone-100">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`badge text-xs ${
                          course.difficulty === 'Beginner'
                            ? 'bg-green-50 text-green-800'
                            : course.difficulty === 'Intermediate'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-red-50 text-red-800'
                        }`}
                      >
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display font-bold text-text-primary mb-1 line-clamp-2 group-hover:text-accent-warm transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-text-secondary mb-2">by {course.instructor}</p>
                    <p className="text-sm text-text-secondary mb-4 flex-1 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-stone-200/50">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-sm">{'\u2605'}</span>
                        <span className="text-sm font-semibold">{course.rating}</span>
                        <span className="text-xs text-text-secondary">({course.ratingCount.toLocaleString()})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-display font-bold text-text-primary">{'\u00A3'}{course.price}</span>
                        <span className="ml-1 text-sm text-text-secondary line-through">{'\u00A3'}{course.originalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="sm:hidden text-center mt-8">
            <Link href="/courses" className="btn btn-secondary">View All Courses</Link>
          </div>
        </div>
      </section>

      {/* Why CodeEd */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-text-primary mb-3">Why Choose CodeEd?</h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Everything you need to go from beginner to job-ready developer
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureItem
              title="AI-Powered Assistant"
              description="Get personalized course recommendations and instant help from our AI chatbot, available 24/7."
            />
            <FeatureItem
              title="Gamified Learning"
              description="Earn points, unlock badges, maintain streaks, and compete on the leaderboard as you progress."
            />
            <FeatureItem
              title="Hands-on Projects"
              description="Learn by doing with interactive exercises, real-world projects, and a growing curriculum."
            />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-stone-50 mb-4">Ready to Start Your Coding Journey?</h2>
          <p className="text-stone-400 mb-10 text-lg">
            Join 10,000+ learners who are already building their future with CodeEd.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-stone-900 font-semibold rounded-full hover:bg-stone-100 transition-colors text-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-10 py-4 border-2 border-stone-600 text-stone-300 font-semibold rounded-full hover:border-stone-400 hover:text-white transition-colors text-lg"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="text-left">
        <div className="font-display font-bold text-lg leading-tight text-text-primary">{number}</div>
        <div className="text-text-secondary text-sm">{label}</div>
      </div>
    </div>
  )
}

function FeatureItem({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <h3 className="text-xl font-display font-bold mb-2 text-text-primary">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
  )
}
