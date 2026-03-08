import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Help Center</h1>
        <p className="text-text-secondary text-lg mb-10">
          Find answers and learn how to get the most out of CodeEd.
        </p>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Getting Started</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-bg-tertiary rounded-lg">
                <span className="text-xl">1️⃣</span>
                <div>
                  <p className="font-medium text-text-primary">Create your account</p>
                  <p className="text-sm text-text-secondary mt-1">
                    <Link href="/register" className="text-accent-primary hover:underline">Sign up</Link>{' '}
                    with your email and choose your skill level (Beginner, Intermediate, or Advanced).
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-bg-tertiary rounded-lg">
                <span className="text-xl">2️⃣</span>
                <div>
                  <p className="font-medium text-text-primary">Browse courses</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Explore our{' '}
                    <Link href="/courses" className="text-accent-primary hover:underline">course catalogue</Link>{' '}
                    and filter by difficulty, category, or price.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-bg-tertiary rounded-lg">
                <span className="text-xl">3️⃣</span>
                <div>
                  <p className="font-medium text-text-primary">Enrol and learn</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Add courses to your cart, complete checkout, then access your courses from
                    your dashboard to start learning immediately.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-bg-tertiary rounded-lg">
                <span className="text-xl">4️⃣</span>
                <div>
                  <p className="font-medium text-text-primary">Track progress and earn badges</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Mark modules as complete to earn points, level up, and unlock achievement badges.
                    Check your stats on your{' '}
                    <Link href="/dashboard" className="text-accent-primary hover:underline">dashboard</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Common Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'How do I access a course I purchased?',
                  a: 'After checkout, go to your Dashboard. Click any enrolled course to open the learning interface where you can watch lessons and mark modules complete.',
                },
                {
                  q: 'How does the points and levelling system work?',
                  a: 'You earn points for completing modules (25 pts), finishing a full course (100 pts), daily logins (5 pts), and more. Points accumulate to increase your level from 1 to 10.',
                },
                {
                  q: 'What is the AI chatbot?',
                  a: 'The AI chatbot (powered by Groq) is available on every page via the chat icon. Ask it questions about courses, programming concepts, or get personalised course recommendations.',
                },
                {
                  q: 'Can I get a refund?',
                  a: 'For refund requests, please contact us at support@codeed.com within 14 days of purchase. As this is a demo platform, all purchases are simulated.',
                },
              ].map((item, i) => (
                <div key={i} className="border-b border-bg-tertiary last:border-0 pb-4 last:pb-0">
                  <p className="font-medium text-text-primary mb-1">{item.q}</p>
                  <p className="text-sm text-text-secondary">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">Still Need Help?</h2>
            <p className="text-text-secondary mb-4">
              Can&apos;t find what you&apos;re looking for? Check our full FAQ or get in touch directly.
            </p>
            <div className="flex space-x-3">
              <Link href="/faq" className="btn btn-secondary">
                View FAQ
              </Link>
              <Link href="/contact" className="btn btn-primary">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
