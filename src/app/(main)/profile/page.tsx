'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skillLevel: 'BEGINNER',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        skillLevel: user.skillLevel,
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          skillLevel: formData.skillLevel,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        await checkAuth() // Refresh user data
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Profile Settings</h1>

        <div className="card">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-accent-primary rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {formData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-text-primary">{formData.name}</p>
                <p className="text-sm text-text-secondary">{formData.email}</p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                className="input bg-gray-100 cursor-not-allowed"
                disabled
              />
              <p className="mt-1 text-xs text-text-secondary">
                Email cannot be changed
              </p>
            </div>

            {/* Skill Level */}
            <div>
              <label htmlFor="skillLevel" className="block text-sm font-medium text-text-secondary mb-1">
                Skill Level
              </label>
              <select
                id="skillLevel"
                value={formData.skillLevel}
                onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                className="input"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              <p className="mt-1 text-xs text-text-secondary">
                This helps us recommend courses at your level
              </p>
            </div>

            {/* Stats Display */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-text-primary mb-3">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{user?.points || 0}</p>
                  <p className="text-sm text-text-secondary">Total Points</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-2xl font-bold text-accent-primary">Level {user?.level || 1}</p>
                  <p className="text-sm text-text-secondary">Current Level</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full btn btn-primary py-3 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="card mt-8 border-red-200 bg-red-50">
          <h3 className="font-medium text-red-700 mb-4">Danger Zone</h3>
          <p className="text-sm text-text-secondary mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="btn bg-red-100 text-red-700 hover:bg-red-200 border border-red-300">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
