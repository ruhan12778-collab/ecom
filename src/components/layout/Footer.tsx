import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">💻</span>
              <span className="text-xl font-bold text-text-primary">CodeEd</span>
            </Link>
            <p className="text-text-secondary text-sm">
              Learn to code with AI-powered courses and personalized learning paths.
            </p>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Courses</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/courses?category=python" className="text-text-secondary hover:text-text-primary text-sm">
                  Python
                </Link>
              </li>
              <li>
                <Link href="/courses?category=javascript" className="text-text-secondary hover:text-text-primary text-sm">
                  JavaScript
                </Link>
              </li>
              <li>
                <Link href="/courses?category=web" className="text-text-secondary hover:text-text-primary text-sm">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/courses?category=data" className="text-text-secondary hover:text-text-primary text-sm">
                  Data Science
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-text-secondary hover:text-text-primary text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-secondary hover:text-text-primary text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-secondary hover:text-text-primary text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-secondary hover:text-text-primary text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-text-secondary hover:text-text-primary text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-text-secondary hover:text-text-primary text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <span className="text-text-secondary text-sm">
                  Email: support@codeed.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-text-secondary text-sm">
            &copy; {new Date().getFullYear()} CodeEd. All rights reserved.
          </p>
          <p className="text-text-secondary text-sm mt-2 sm:mt-0">
            Built by Ruhan Khan
          </p>
        </div>
      </div>
    </footer>
  )
}
