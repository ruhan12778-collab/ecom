'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditCMSPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [pageId, setPageId] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    isPublished: false,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { id } = await params
      setPageId(id)
      try {
        const res = await fetch(`/api/admin/pages/${id}`)
        const data = await res.json()
        const page = data.data || data
        setFormData({
          title: page.title || '',
          slug: page.slug || '',
          content: page.content || '',
          isPublished: page.isPublished || false,
        })
      } catch (err) {
        console.error('Failed to fetch page:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update page')
      }

      router.push('/admin/pages')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-stone-400">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold text-stone-900">Edit Page</h2>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="input min-h-[300px]"
            rows={15}
          />
        </div>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
            className="w-4 h-4 rounded border-stone-300 text-accent-teal focus:ring-accent-teal"
          />
          <span className="text-sm font-medium text-stone-700">Published</span>
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Saving...' : 'Update Page'}
          </button>
        </div>
      </form>
    </div>
  )
}
