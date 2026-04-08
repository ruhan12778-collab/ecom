'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CourseForm from '@/components/admin/CourseForm'

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [courseId, setCourseId] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      const { id } = await params
      setCourseId(id)
      try {
        const res = await fetch(`/api/admin/courses/${id}`)
        const data = await res.json()
        setCourse(data.data || data)
      } catch (err) {
        console.error('Failed to fetch course:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params])

  const handleSubmit = async (data: any) => {
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to update course')
    }

    router.push('/admin/courses')
  }

  if (loading) {
    return <div className="text-stone-400">Loading...</div>
  }

  if (!course) {
    return <div className="text-red-500">Course not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-stone-900">Edit Course</h2>
        <Link
          href={`/admin/courses/${courseId}/modules`}
          className="btn btn-secondary"
        >
          Manage Modules
        </Link>
      </div>
      <CourseForm initialData={course} onSubmit={handleSubmit} isEdit />
    </div>
  )
}
