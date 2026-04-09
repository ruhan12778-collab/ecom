'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Module {
  id: string
  title: string
  description: string
  content: string
  videoUrl: string
  duration: number
  isPreview: boolean
  order: number
}

const emptyModule = {
  title: '',
  description: '',
  content: '',
  videoUrl: '',
  duration: 0,
  isPreview: false,
  order: 0,
}

export default function ModulesPage({ params }: { params: Promise<{ id: string }> }) {
  const [courseId, setCourseId] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyModule)
  const [editFormData, setEditFormData] = useState(emptyModule)

  const fetchData = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/courses/${id}`)
      const json = await res.json()
      const course = json.data || json
      setCourseTitle(course.title || '')
      setModules(
        (course.modules || []).sort((a: Module, b: Module) => a.order - b.order)
      )
    } catch (err) {
      console.error('Failed to fetch course:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const { id } = await params
      setCourseId(id)
      await fetchData(id)
    }
    init()
  }, [params])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: (val: any) => void,
    current: any
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setter({
      ...current,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    })
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setFormData(emptyModule)
        setShowAddForm(false)
        await fetchData(courseId)
      }
    } catch (err) {
      console.error('Failed to add module:', err)
    }
  }

  const handleUpdate = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })
      if (res.ok) {
        setEditingId(null)
        await fetchData(courseId)
      }
    } catch (err) {
      console.error('Failed to update module:', err)
    }
  }

  const handleDelete = async (moduleId: string) => {
    if (!window.confirm('Delete this module?')) return
    try {
      await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}`, {
        method: 'DELETE',
      })
      await fetchData(courseId)
    } catch (err) {
      console.error('Failed to delete module:', err)
    }
  }

  const handleReorder = async (moduleId: string, newOrder: number) => {
    try {
      await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      })
      await fetchData(courseId)
    } catch (err) {
      console.error('Failed to reorder module:', err)
    }
  }

  const startEdit = (mod: Module) => {
    setEditingId(mod.id)
    setEditFormData({
      title: mod.title,
      description: mod.description,
      content: mod.content,
      videoUrl: mod.videoUrl,
      duration: mod.duration,
      isPreview: mod.isPreview,
      order: mod.order,
    })
  }

  const renderForm = (
    data: any,
    setter: (val: any) => void,
    onSubmit: (e: React.FormEvent) => void,
    submitLabel: string
  ) => (
    <form onSubmit={onSubmit} className="card p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={data.title}
            onChange={(e) => handleChange(e, setter, data)}
            className="input"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Duration (min)</label>
            <input
              type="number"
              name="duration"
              value={data.duration}
              onChange={(e) => handleChange(e, setter, data)}
              className="input"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Order</label>
            <input
              type="number"
              name="order"
              value={data.order}
              onChange={(e) => handleChange(e, setter, data)}
              className="input"
              min={0}
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
        <textarea
          name="description"
          value={data.description}
          onChange={(e) => handleChange(e, setter, data)}
          className="input min-h-[60px]"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Content</label>
        <textarea
          name="content"
          value={data.content}
          onChange={(e) => handleChange(e, setter, data)}
          className="input min-h-[100px]"
          rows={4}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Video URL</label>
        <input
          type="text"
          name="videoUrl"
          value={data.videoUrl}
          onChange={(e) => handleChange(e, setter, data)}
          className="input"
        />
      </div>
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          name="isPreview"
          checked={data.isPreview}
          onChange={(e) => handleChange(e, setter, data)}
          className="w-4 h-4 rounded border-stone-300 text-accent-teal focus:ring-accent-teal"
        />
        <span className="text-sm font-medium text-stone-700">Preview (free)</span>
      </label>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => { setShowAddForm(false); setEditingId(null) }}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )

  if (loading) {
    return <div className="text-stone-400">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/admin/courses/${courseId}/edit`} className="text-sm text-accent-teal hover:underline">
            &larr; Back to Course
          </Link>
          <h2 className="text-xl font-display font-bold text-stone-900 mt-1">
            Modules: {courseTitle}
          </h2>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setFormData({ ...emptyModule, order: modules.length + 1 })
          }}
          className="btn btn-primary"
        >
          Add Module
        </button>
      </div>

      <div className="space-y-4">
        {modules.map((mod, idx) => (
          <div key={mod.id}>
            {editingId === mod.id ? (
              renderForm(
                editFormData,
                setEditFormData,
                (e) => { e.preventDefault(); handleUpdate(mod.id) },
                'Save Changes'
              )
            ) : (
              <div className="card p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center text-sm font-bold">
                    {mod.order}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">{mod.title}</h3>
                    <p className="text-xs text-stone-500">
                      {mod.duration} min
                      {mod.isPreview && (
                        <span className="ml-2 inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium bg-accent-teal/10 text-accent-teal">
                          Preview
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => idx > 0 && handleReorder(mod.id, modules[idx - 1].order)}
                    disabled={idx === 0}
                    className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => idx < modules.length - 1 && handleReorder(mod.id, modules[idx + 1].order)}
                    disabled={idx === modules.length - 1}
                    className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => startEdit(mod)}
                    className="text-sm text-accent-teal hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(mod.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {modules.length === 0 && !showAddForm && (
          <div className="card p-8 text-center text-stone-400 text-sm">
            No modules yet. Click &quot;Add Module&quot; to get started.
          </div>
        )}
      </div>

      {showAddForm && renderForm(formData, setFormData, handleAdd, 'Add Module')}
    </div>
  )
}
