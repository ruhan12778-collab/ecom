'use client'

import { useState, useEffect } from 'react'

interface CourseFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isEdit?: boolean
}

const CATEGORIES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'web', label: 'Web Development' },
  { value: 'mobile', label: 'Mobile Development' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'devops', label: 'DevOps' },
  { value: 'system-design', label: 'System Design' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'rust', label: 'Rust' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'database', label: 'Databases' },
  { value: 'cloud', label: 'Cloud' },
]

const THUMBNAIL_SUGGESTIONS = [
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579403124614-197f69d8187b?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format&fit=crop',
]

const DIFFICULTIES = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
]

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function CourseForm({ initialData, onSubmit, isEdit = false }: CourseFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    longDescription: '',
    price: 0,
    originalPrice: 0,
    difficulty: 'BEGINNER',
    category: 'python',
    instructor: '',
    thumbnail: '',
    tags: '',
    duration: 0,
    totalLessons: 0,
    isPublished: true,
    isFeatured: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        longDescription: initialData.longDescription || '',
        price: initialData.price || 0,
        originalPrice: initialData.originalPrice || 0,
        difficulty: initialData.difficulty || 'BEGINNER',
        category: initialData.category || 'python',
        instructor: initialData.instructor || '',
        thumbnail: initialData.thumbnail || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
        duration: initialData.duration || 0,
        totalLessons: initialData.totalLessons || 0,
        isPublished: initialData.isPublished || false,
        isFeatured: initialData.isFeatured || false,
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
      }

      if (name === 'title' && !isEdit) {
        updated.slug = generateSlug(value)
      }

      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const submitData = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }
      await onSubmit(submitData)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
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
        <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input min-h-[80px]"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Long Description</label>
        <textarea
          name="longDescription"
          value={formData.longDescription}
          onChange={handleChange}
          className="input min-h-[120px]"
          rows={5}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="input"
            min={0}
            step={0.01}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Original Price</label>
          <input
            type="number"
            name="originalPrice"
            value={formData.originalPrice}
            onChange={handleChange}
            className="input"
            min={0}
            step={0.01}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="input"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Instructor</label>
          <input
            type="text"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      {/* Thumbnail section with preview and suggestions */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">Course Thumbnail</label>

        <div className="flex gap-4">
          {/* Preview */}
          <div className="w-48 h-28 rounded-lg border border-stone-200 overflow-hidden bg-stone-50 flex-shrink-0">
            {formData.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.thumbnail}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* URL input + clear */}
          <div className="flex-1 flex flex-col gap-2">
            <input
              type="text"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              className="input"
              placeholder="https://images.unsplash.com/..."
            />
            <div className="flex items-center gap-2">
              {formData.thumbnail && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, thumbnail: '' }))}
                  className="text-xs text-stone-500 hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              )}
              <span className="text-xs text-stone-400">Paste a URL or pick a suggestion below</span>
            </div>
          </div>
        </div>

        {/* Suggestions grid */}
        <div>
          <p className="text-xs font-medium text-stone-500 mb-2">Quick picks</p>
          <div className="grid grid-cols-6 gap-2">
            {THUMBNAIL_SUGGESTIONS.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, thumbnail: url }))}
                className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${
                  formData.thumbnail === url
                    ? 'border-accent-teal ring-2 ring-accent-teal/20'
                    : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Option ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="input"
            placeholder="react, typescript, web"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="input"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Total Lessons</label>
          <input
            type="number"
            name="totalLessons"
            value={formData.totalLessons}
            onChange={handleChange}
            className="input"
            min={0}
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
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
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="w-4 h-4 rounded border-stone-300 text-accent-teal focus:ring-accent-teal"
          />
          <span className="text-sm font-medium text-stone-700">Featured</span>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary"
        >
          {submitting ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
        </button>
      </div>
    </form>
  )
}
