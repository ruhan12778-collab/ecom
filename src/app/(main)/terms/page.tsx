export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Terms of Service</h1>
        <p className="text-text-secondary mb-10">Last updated: March 2026</p>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. Acceptance of Terms</h2>
            <p className="text-text-secondary leading-relaxed">
              By accessing or using CodeEd, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our platform.
              We reserve the right to update these terms at any time, and continued use of the
              platform constitutes acceptance of any changes.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. Use of Service</h2>
            <p className="text-text-secondary leading-relaxed">
              CodeEd is provided for personal, non-commercial educational use. You agree not to
              reproduce, distribute, or resell course content without explicit written permission.
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account.
            </p>
            <p className="text-text-secondary leading-relaxed mt-3">
              You must be at least 13 years of age to use this platform. By registering,
              you confirm that you meet this requirement.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. Intellectual Property</h2>
            <p className="text-text-secondary leading-relaxed">
              All content on CodeEd, including course materials, videos, text, graphics, and software,
              is the intellectual property of CodeEd or its content creators and is protected by
              applicable copyright and intellectual property laws.
            </p>
            <p className="text-text-secondary leading-relaxed mt-3">
              Upon purchasing a course, you are granted a personal, non-transferable licence to
              access the course content for your own learning purposes only.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. Limitation of Liability</h2>
            <p className="text-text-secondary leading-relaxed">
              CodeEd is provided on an "as is" basis without warranties of any kind. We do not
              guarantee that the platform will be uninterrupted or error-free. To the fullest extent
              permitted by law, CodeEd shall not be liable for any indirect, incidental, or
              consequential damages arising from your use of the platform.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">5. Changes to Terms</h2>
            <p className="text-text-secondary leading-relaxed">
              We may modify these Terms of Service at any time. We will notify users of significant
              changes via email or a notice on the platform. Your continued use of CodeEd after
              changes are posted constitutes your acceptance of the revised terms.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-3">6. Contact</h2>
            <p className="text-text-secondary">
              Questions about these Terms? Contact us at{' '}
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
