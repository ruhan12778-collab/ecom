'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/courses?${params}`)
      const data = await res.json()
      setCourses(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchCourses()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return
    try {
      await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
      fetchCourses()
    } catch (err) {
      console.error('Failed to delete course:', err)
    }
  }

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'BEGINNER': return 'bg-green-50 text-green-700'
      case 'INTERMEDIATE': return 'bg-amber-50 text-amber-700'
      case 'ADVANCED': return 'bg-red-50 text-red-700'
      default: return 'bg-stone-100 text-stone-600'
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Courses</h2>
          <p className="text-sm text-stone-500 mt-0.5">{total} total courses</p>
        </div>
        <Link href="/admin/courses/new" className="btn btn-primary px-4 py-2 text-sm">
          + Add Course
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button type="submit" className="btn btn-secondary px-4 py-2 text-sm">Search</button>
      </form>

      {loading ? (
        <div className="py-20 text-center text-stone-400 text-sm">Loading courses...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Course</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Level</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Price</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Enrollments</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Modules</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-stone-900">{course.title}</p>
                          <p className="text-xs text-stone-400">{course.instructor}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium text-stone-600 capitalize">{course.category}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-stone-900 tabular-nums">
                      {`£${Number(course.price).toFixed(2)}`}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-green-500' : 'bg-stone-300'}`} />
                        {course.isFeatured && (
                          <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-stone-600 tabular-nums">
                      {(course.enrollmentCount || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-stone-600 tabular-nums">
                      {course._count?.modules || 0}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-1.5 rounded-md text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-sm text-stone-400">
                      No courses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-stone-400">
                Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-md text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-stone-500">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-md text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
