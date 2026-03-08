'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-accent-primary">
            CodeEd
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-text-primary">Forgot Password</h1>
          <p className="mt-2 text-text-secondary">Reset your account password</p>
        </div>

        <div className="card">
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Check your inbox</h2>
              <p className="text-text-secondary text-sm">
                If an account with <span className="font-medium text-text-primary">{email}</span> exists,
                you will be contacted by the admin at{' '}
                <span className="font-medium text-accent-primary">support@codeed.com</span>.
              </p>
              <p className="text-text-secondary text-sm mt-3">
                For immediate assistance, please email us directly.
              </p>
              <Link href="/login" className="btn btn-primary mt-6 inline-block">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                  required
                />
              </div>

              <button type="submit" className="w-full btn btn-primary py-3">
                Send Reset Link
              </button>

              <p className="text-center text-sm text-text-secondary">
                Remember your password?{' '}
                <Link href="/login" className="text-accent-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
