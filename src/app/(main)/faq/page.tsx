export default function FAQPage() {
  const faqs = [
    {
      category: 'Account',
      items: [
        {
          q: 'How do I create an account?',
          a: 'Click "Get Started" or "Sign Up" on the homepage, fill in your name, email, and password, choose your skill level, and you\'re good to go. Registration is free.',
        },
        {
          q: 'Can I change my email address?',
          a: 'Email addresses cannot be changed once set. If you need to update your email, please contact support@codeed.com.',
        },
        {
          q: 'How do I delete my account?',
          a: 'Go to Profile Settings and scroll to the "Danger Zone" section. Click "Delete Account" and follow the confirmation steps. This action is permanent and cannot be undone.',
        },
      ],
    },
    {
      category: 'Courses & Purchasing',
      items: [
        {
          q: 'How do I enrol in a course?',
          a: 'Browse the course catalogue, click on a course you\'re interested in, add it to your cart, and complete the checkout. You\'ll have immediate access after purchase.',
        },
        {
          q: 'Can I preview a course before buying?',
          a: 'Yes! Courses include a curriculum preview on the course detail page, and some modules are marked as "Preview" and are accessible without purchase.',
        },
        {
          q: 'Is there a refund policy?',
          a: 'Refund requests can be submitted within 14 days of purchase by contacting support@codeed.com. Note: this is a demo platform and all payments are simulated.',
        },
      ],
    },
    {
      category: 'Learning & Progress',
      items: [
        {
          q: 'How do I access a course I\'ve purchased?',
          a: 'Go to your Dashboard, find the course under "My Courses", and click "Continue Learning" to open the learning interface.',
        },
        {
          q: 'How are points earned?',
          a: 'You earn 10 points on enrolment, 25 points per module completed, 100 points for finishing a full course, 5 points for daily login, and bonus points for streaks and first purchases.',
        },
        {
          q: 'What are badges?',
          a: 'Badges are achievements you unlock by reaching milestones — like completing your first module, maintaining a 7-day streak, or finishing a full course. Badges have different rarities from Common to Legendary.',
        },
      ],
    },
    {
      category: 'Technical',
      items: [
        {
          q: 'What devices can I use CodeEd on?',
          a: 'CodeEd is fully responsive and works on desktop, tablet, and mobile browsers. No app download is required.',
        },
        {
          q: 'Why is the AI chatbot not responding?',
          a: 'The AI chatbot uses the Groq API. If it\'s unresponsive, check your internet connection. The chatbot will automatically fall back to FAQ-based responses if the AI service is unavailable.',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Frequently Asked Questions</h1>
        <p className="text-text-secondary text-lg mb-10">
          Quick answers to common questions about CodeEd.
        </p>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-xl font-semibold text-text-primary mb-4">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map((item, i) => (
                  <div key={i} className="card">
                    <h3 className="font-medium text-text-primary mb-2">{item.q}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-8 text-center">
          <p className="text-text-secondary mb-4">
            Didn&apos;t find your answer? Our support team is happy to help.
          </p>
          <a href="/contact" className="btn btn-primary">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
