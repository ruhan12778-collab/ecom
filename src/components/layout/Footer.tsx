import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-display font-bold text-stone-200">CodeEd</span>
            </Link>
            <p className="text-stone-400 text-sm">
              Learn to code with AI-powered courses and personalized learning paths.
            </p>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-semibold text-stone-200 mb-4">Courses</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/courses?category=python" className="text-stone-400 hover:text-stone-200 text-sm transition-colors">
                  Python
                </Link>
              </li>
              <li>
                <Link href="/courses?category=javascript" className="text-stone-400 hover:text-stone-200 text-sm transition-colors">
                  JavaScript
                </Link>
              </li>
              <li>
                <Link href="/courses?category=web" className="text-stone-400 hover:text-stone-200 text-sm transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/courses?category=data" className="text-stone-400 hover:text-stone-200 text-sm transition-colors">
                  Data Science
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-stone-200 mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-stone-400 hover:text-stone-200 text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-stone-400 hover:text-stone-200 text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-stone-400 hover:text-stone-200 text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-stone-400 hover:text-stone-200 text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-stone-200 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-stone-400 hover:text-stone-200 text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-stone-400 hover:text-stone-200 text-sm transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <span className="text-stone-400 text-sm">
                  Email: support@codeed.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-stone-500 text-sm">
            {'\u00A9'} {new Date().getFullYear()} CodeEd. All rights reserved.
          </p>
          <p className="text-stone-500 text-sm mt-2 sm:mt-0">
            Built by Ruhan Khan
          </p>
        </div>
      </div>
    </footer>
  )
}
