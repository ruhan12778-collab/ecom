export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Privacy Policy</h1>
        <p className="text-text-secondary mb-10">Last updated: March 2026</p>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. Information We Collect</h2>
            <p className="text-text-secondary leading-relaxed">
              We collect information you provide directly to us when you create an account, including your name,
              email address, and password. We also collect information about your activity on the platform,
              such as courses you enrol in, modules you complete, and interactions with our AI chatbot.
            </p>
            <p className="text-text-secondary leading-relaxed mt-3">
              We do not collect payment card details directly — all payment processing is handled
              by our trusted payment providers. We retain only the information necessary to provide
              our services and improve your experience.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. How We Use Your Information</h2>
            <p className="text-text-secondary leading-relaxed">
              Your information is used to provide, maintain, and improve our services. This includes
              personalising your learning experience, tracking your progress, awarding achievements,
              and enabling our AI chatbot to provide contextually relevant assistance.
            </p>
            <p className="text-text-secondary leading-relaxed mt-3">
              We do not sell, rent, or share your personal information with third parties for their
              marketing purposes. Your data is used solely to power the CodeEd platform.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. Data Security</h2>
            <p className="text-text-secondary leading-relaxed">
              We implement industry-standard security measures to protect your personal information.
              Passwords are hashed using bcrypt before storage and are never stored in plain text.
              Authentication uses HTTP-only cookies and JWT tokens to prevent cross-site scripting attacks.
            </p>
            <p className="text-text-secondary leading-relaxed mt-3">
              While we take reasonable precautions, no method of transmission over the internet is
              100% secure. We encourage you to use a strong, unique password for your account.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. Your Rights</h2>
            <p className="text-text-secondary leading-relaxed">
              You have the right to access, correct, or delete your personal data at any time.
              You can update your profile information from the{' '}
              <a href="/profile" className="text-accent-primary hover:underline">Profile Settings</a> page.
              To permanently delete your account and all associated data, use the "Delete Account"
              option in your profile settings.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">5. Contact Us</h2>
            <p className="text-text-secondary">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:support@codeed.com" className="text-accent-primary hover:underline">
                support@codeed.com
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
