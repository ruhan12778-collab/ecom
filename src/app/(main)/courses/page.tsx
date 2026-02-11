'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail: string | null
  price: number
  originalPrice: number | null
  difficulty: string
  category: string
  duration: number
  totalLessons: number
  rating: number
  ratingCount: number
  enrollmentCount: number
  instructor: string
  isFeatured: boolean
}

interface CoursesResponse {
  success: boolean
  data: {
    items: Course[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function CoursesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    difficulty: searchParams.get('difficulty') || '',
    sort: searchParams.get('sort') || 'popular',
    page: Number(searchParams.get('page')) || 1,
  })

  useEffect(() => {
    fetchCourses()
  }, [filters])

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.category) params.set('category', filters.category)
      if (filters.difficulty) params.set('difficulty', filters.difficulty)
      if (filters.sort) params.set('sort', filters.sort)
      params.set('page', filters.page.toString())

      const response = await fetch(`/api/courses?${params}`)
      const data: CoursesResponse = await response.json()

      if (data.success) {
        setCourses(data.data.items)
        setTotalPages(data.data.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters, page: 1 }
    setFilters(updated)

    // Update URL params
    const params = new URLSearchParams()
    if (updated.search) params.set('search', updated.search)
    if (updated.category) params.set('category', updated.category)
    if (updated.difficulty) params.set('difficulty', updated.difficulty)
    if (updated.sort) params.set('sort', updated.sort)
    router.push(`/courses?${params}`)
  }

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'web', label: 'Web Development' },
    { value: 'data', label: 'Data Science' },
  ]

  const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
  ]

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ]

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Course Catalog</h1>
          <p className="text-text-secondary">
            Browse our collection of coding courses and start learning today
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="input"
              />
            </div>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="input"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Difficulty */}
            <select
              value={filters.difficulty}
              onChange={(e) => updateFilters({ difficulty: e.target.value })}
              className="input"
            >
              {difficulties.map((diff) => (
                <option key={diff.value} value={diff.value}>
                  {diff.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-text-secondary text-sm">
              {courses.length} courses found
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-text-secondary text-sm">Sort by:</span>
              <select
                value={filters.sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="input w-auto"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-video bg-bg-tertiary rounded-lg mb-4" />
                <div className="h-4 bg-bg-tertiary rounded w-1/4 mb-2" />
                <div className="h-6 bg-bg-tertiary rounded w-3/4 mb-2" />
                <div className="h-4 bg-bg-tertiary rounded w-full mb-4" />
                <div className="h-8 bg-bg-tertiary rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">No courses found</p>
            <button
              onClick={() => updateFilters({ search: '', category: '', difficulty: '' })}
              className="mt-4 btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="btn btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="flex items-center px-4 text-text-secondary">
              Page {filters.page} of {totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === totalPages}
              className="btn btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  const difficultyColors: Record<string, string> = {
    BEGINNER: 'badge-success',
    INTERMEDIATE: 'badge-warning',
    ADVANCED: 'badge-error',
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="card hover:border-accent-primary transition-all duration-200 cursor-pointer h-full flex flex-col">
        {/* Thumbnail */}
        <div className="aspect-video bg-bg-tertiary rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
          {course.isFeatured && (
            <span className="absolute top-2 right-2 badge bg-points-gold text-bg-primary">
              Featured
            </span>
          )}
          <span className="text-4xl">💻</span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`badge ${difficultyColors[course.difficulty]}`}>
              {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
            </span>
            <span className="text-xs text-text-secondary">{course.category}</span>
          </div>

          <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
            {course.title}
          </h3>

          <p className="text-sm text-text-secondary mb-4 line-clamp-2 flex-1">
            {course.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center text-xs text-text-secondary mb-4 space-x-4">
            <span>{formatDuration(course.duration)}</span>
            <span>{course.totalLessons} lessons</span>
            <span>{course.enrollmentCount.toLocaleString()} students</span>
          </div>

          {/* Rating and price */}
          <div className="flex items-center justify-between pt-4 border-t border-bg-tertiary">
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">⭐</span>
              <span className="font-medium">{Number(course.rating).toFixed(1)}</span>
              <span className="text-text-secondary text-xs">({course.ratingCount})</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-accent-primary">
                ${Number(course.price).toFixed(2)}
              </span>
              {course.originalPrice && (
                <span className="ml-2 text-sm text-text-secondary line-through">
                  ${Number(course.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
