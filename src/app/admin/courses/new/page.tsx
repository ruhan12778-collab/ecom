'use client'

import { useRouter } from 'next/navigation'
import CourseForm from '@/components/admin/CourseForm'

export default function NewCoursePage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to create course')
    }

    router.push('/admin/courses')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold text-stone-900">Create New Course</h2>
      <CourseForm onSubmit={handleSubmit} />
    </div>
  )
}
