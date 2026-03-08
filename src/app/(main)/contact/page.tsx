'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Contact Us</h1>
        <p className="text-text-secondary text-lg mb-10">
          We&apos;d love to hear from you. Our team typically responds within 24 hours.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Get in Touch</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <p className="font-medium text-text-primary">Email</p>
                    <a
                      href="mailto:support@codeed.com"
                      className="text-accent-primary hover:underline text-sm"
                    >
                      support@codeed.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">⏰</span>
                  <div>
                    <p className="font-medium text-text-primary">Response Time</p>
                    <p className="text-sm text-text-secondary">We typically respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <p className="font-medium text-text-primary">AI Chatbot</p>
                    <p className="text-sm text-text-secondary">
                      For instant answers, try our AI chatbot — available 24/7 on any page.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-text-primary mb-3">Quick Links</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/faq" className="text-accent-primary hover:underline">→ Frequently Asked Questions</a>
                </li>
                <li>
                  <a href="/help" className="text-accent-primary hover:underline">→ Help Center</a>
                </li>
                <li>
                  <a href="/courses" className="text-accent-primary hover:underline">→ Browse Courses</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact form */}
          <div className="card">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">Message Sent!</h2>
                <p className="text-text-secondary text-sm">
                  Thank you for reaching out. We&apos;ll get back to you at <strong>{formData.email}</strong> within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Send a Message</h2>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Smith"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="input resize-none"
                    required
                  />
                </div>

                <button type="submit" className="w-full btn btn-primary py-3">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
