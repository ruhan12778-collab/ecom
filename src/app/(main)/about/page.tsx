export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-2">About CodeEd</h1>
        <p className="text-text-secondary text-lg mb-10">
          Empowering the next generation of developers through interactive, AI-powered education.
        </p>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">Our Mission</h2>
            <p className="text-text-secondary leading-relaxed">
              CodeEd is built on the belief that learning to code should be accessible, engaging, and effective
              for everyone. We combine cutting-edge AI technology with proven pedagogical methods to create
              a learning experience that adapts to your skill level and keeps you motivated throughout your journey.
            </p>
            <p className="text-text-secondary leading-relaxed mt-3">
              Our platform bridges the gap between passive video courses and hands-on practice by offering
              an AI-powered chatbot tutor, a gamified progression system, and a curated catalogue of
              industry-relevant coding courses.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-4">What We Offer</h2>
            <ul className="space-y-3">
              {[
                { icon: '🎓', title: 'Expert-Led Courses', desc: 'Structured courses covering Python, JavaScript, React, Data Science, and more.' },
                { icon: '🤖', title: 'AI-Powered Tutor', desc: 'Our intelligent chatbot provides personalised guidance and answers your coding questions 24/7.' },
                { icon: '🏆', title: 'Gamified Learning', desc: 'Earn points, unlock badges, and level up as you progress through your learning journey.' },
                { icon: '📊', title: 'Progress Tracking', desc: 'Detailed dashboards to monitor your completion rates, streaks, and achievements.' },
                { icon: '🌙', title: 'Clean Interface', desc: 'A distraction-free, modern learning environment designed to keep you in flow.' },
              ].map((item) => (
                <li key={item.title} className="flex items-start space-x-3">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-medium text-text-primary">{item.title}</p>
                    <p className="text-sm text-text-secondary">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">The Team</h2>
            <p className="text-text-secondary leading-relaxed">
              CodeEd was built with passion for education and technology as part of the COMP1682
              Final Year Project at the University of Greenwich. The platform represents months of
              research, design, and development — combining modern web technologies with thoughtful
              UX to deliver a genuinely useful learning tool.
            </p>
            <p className="text-text-secondary leading-relaxed mt-3">
              We are committed to continuously improving the platform based on learner feedback
              and the latest research in educational technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
