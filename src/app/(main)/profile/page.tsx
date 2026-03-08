'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

const skillLevelLabel: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

const skillLevelBadgeColor: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
  ADVANCED: 'bg-red-100 text-red-800',
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skillLevel: 'BEGINNER',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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
        await checkAuth()
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

        {/* Hero Avatar Section */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 mb-6 text-white shadow-md">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 shadow-inner">
              {formData.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{formData.name}</h1>
              <p className="text-blue-200 text-sm mb-2">{formData.email}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${skillLevelBadgeColor[formData.skillLevel]}`}>
                {skillLevelLabel[formData.skillLevel]}
              </span>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold">{user?.points || 0}</div>
              <div className="text-blue-200 text-xs mt-0.5">Total Points</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold">Level {user?.level || 1}</div>
              <div className="text-blue-200 text-xs mt-0.5">Current Level</div>
            </div>
          </div>
        </div>

        {/* Account Settings Card */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Account Settings</h2>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <p className="mt-1 text-xs text-text-secondary">Email cannot be changed</p>
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
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h3 className="font-semibold text-red-700 mb-3">Danger Zone</h3>
          {!showDeleteConfirm ? (
            <>
              <p className="text-sm text-text-secondary mb-4">
                Once you delete your account, there is no going back. All your data, enrollments, and progress will be permanently removed.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
              >
                Delete Account
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-red-700">
                ⚠️ This action is irreversible. Enter your password to confirm.
              </p>
              <div>
                <label htmlFor="deletePassword" className="block text-sm font-medium text-text-secondary mb-1">
                  Current Password
                </label>
                <input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value)
                    setDeleteError('')
                  }}
                  placeholder="Enter your password"
                  className="input border-red-200 focus:border-red-400"
                />
                {deleteError && (
                  <p className="mt-1 text-sm text-red-600">{deleteError}</p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletePassword('')
                    setDeleteError('')
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!deletePassword) {
                      setDeleteError('Please enter your password')
                      return
                    }
                    setIsDeleting(true)
                    setDeleteError('')
                    try {
                      const response = await fetch('/api/auth/account', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ confirmPassword: deletePassword }),
                      })
                      const data = await response.json()
                      if (data.success) {
                        logout()
                        router.push('/')
                      } else {
                        setDeleteError(data.error || 'Failed to delete account')
                      }
                    } catch {
                      setDeleteError('An error occurred. Please try again.')
                    } finally {
                      setIsDeleting(false)
                    }
                  }}
                  disabled={isDeleting}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex-1 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
