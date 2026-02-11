import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-140px)]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-6">
              Learn to Code with{' '}
              <span className="text-accent-primary">CodeEd</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
              Master programming skills with our AI-powered learning platform.
              Interactive courses, personalized recommendations, and gamified progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="btn btn-primary text-lg px-8 py-3">
                Browse Courses
              </Link>
              <Link href="/register" className="btn btn-secondary text-lg px-8 py-3">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>

        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-primary/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CodeEd?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🤖"
              title="AI-Powered Assistant"
              description="Get personalized course recommendations and instant help from our AI chatbot."
            />
            <FeatureCard
              icon="🎮"
              title="Gamified Learning"
              description="Earn points, unlock badges, and track your progress with our gamification system."
            />
            <FeatureCard
              icon="💻"
              title="Hands-on Projects"
              description="Learn by doing with interactive coding exercises and real-world projects."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="50+" label="Courses" />
            <StatCard number="10k+" label="Students" />
            <StatCard number="95%" label="Satisfaction" />
            <StatCard number="24/7" label="AI Support" />
          </div>
        </div>
      </section>

      {/* Popular Courses Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Popular Courses</h2>
            <Link href="/courses" className="text-accent-primary hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CoursePreviewCard
              title="Python for Beginners"
              description="Start your coding journey with Python fundamentals"
              price={29.99}
              difficulty="Beginner"
              rating={4.8}
            />
            <CoursePreviewCard
              title="JavaScript Mastery"
              description="Master modern JavaScript and ES6+ features"
              price={49.99}
              difficulty="Intermediate"
              rating={4.9}
            />
            <CoursePreviewCard
              title="Full Stack Development"
              description="Build complete web applications from scratch"
              price={79.99}
              difficulty="Advanced"
              rating={4.7}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-text-secondary mb-8">
            Join thousands of learners and start your coding journey today.
          </p>
          <Link href="/register" className="btn btn-primary text-lg px-8 py-3">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="card text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-accent-primary mb-2">{number}</div>
      <div className="text-text-secondary">{label}</div>
    </div>
  )
}

function CoursePreviewCard({
  title,
  description,
  price,
  difficulty,
  rating
}: {
  title: string
  description: string
  price: number
  difficulty: string
  rating: number
}) {
  const difficultyColors: Record<string, string> = {
    Beginner: 'badge-success',
    Intermediate: 'badge-warning',
    Advanced: 'badge-error',
  }

  return (
    <div className="card hover:border-accent-primary transition-colors cursor-pointer">
      <div className="aspect-video bg-bg-tertiary rounded-lg mb-4 flex items-center justify-center">
        <span className="text-4xl">💻</span>
      </div>
      <span className={`badge ${difficultyColors[difficulty]} mb-2`}>{difficulty}</span>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold text-accent-primary">${price}</span>
        <span className="text-text-secondary text-sm">⭐ {rating}</span>
      </div>
    </div>
  )
}
