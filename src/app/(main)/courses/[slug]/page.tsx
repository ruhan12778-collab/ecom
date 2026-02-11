'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  duration: number
  isPreview: boolean
}

interface Course {
  id: string
  title: string
  slug: string
  description: string
  longDescription: string | null
  thumbnail: string | null
  price: number
  originalPrice: number | null
  difficulty: string
  category: string
  tags: string | null
  duration: number
  totalLessons: number
  rating: number
  ratingCount: number
  enrollmentCount: number
  instructor: string
  instructorBio: string | null
  modules: Module[]
}

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem, items } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const isInCart = items.some((item) => item.courseId === course?.id)

  useEffect(() => {
    fetchCourse()
  }, [resolvedParams.slug])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${resolvedParams.slug}`)
      const data = await response.json()

      if (data.success) {
        setCourse(data.data)
      } else {
        setError(data.error || 'Course not found')
      }
    } catch (err) {
      setError('Failed to load course')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!course) return

    addItem({
      courseId: course.id,
      title: course.title,
      price: Number(course.price),
      thumbnail: course.thumbnail || undefined,
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-bg-tertiary rounded w-1/4 mb-4" />
            <div className="h-12 bg-bg-tertiary rounded w-3/4 mb-4" />
            <div className="h-64 bg-bg-tertiary rounded mb-8" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Course Not Found</h1>
          <p className="text-text-secondary mb-8">{error}</p>
          <Link href="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    )
  }

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

  const discount = course.originalPrice
    ? Math.round(((Number(course.originalPrice) - Number(course.price)) / Number(course.originalPrice)) * 100)
    : 0

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/courses" className="text-text-secondary hover:text-text-primary">
            Courses
          </Link>
          <span className="mx-2 text-text-secondary">/</span>
          <span className="text-text-primary">{course.title}</span>
        </nav>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Course info */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <span className={`badge ${difficultyColors[course.difficulty]}`}>
                  {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
                </span>
                <span className="text-text-secondary">{course.category}</span>
              </div>
              <h1 className="text-3xl font-bold text-text-primary mb-4">{course.title}</h1>
              <p className="text-text-secondary text-lg">{course.description}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">{Number(course.rating).toFixed(1)}</span>
                <span className="text-text-secondary">({course.ratingCount} ratings)</span>
              </div>
              <span className="text-text-secondary">
                {course.enrollmentCount.toLocaleString()} students enrolled
              </span>
              <span className="text-text-secondary">{formatDuration(course.duration)} total</span>
              <span className="text-text-secondary">{course.totalLessons} lessons</span>
            </div>

            {/* Instructor */}
            <div className="card mb-6">
              <h3 className="font-semibold text-text-primary mb-2">Instructor</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center text-white font-bold">
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-text-primary">{course.instructor}</p>
                  {course.instructorBio && (
                    <p className="text-sm text-text-secondary">{course.instructorBio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {course.longDescription && (
              <div className="card mb-6">
                <h3 className="font-semibold text-text-primary mb-4">About This Course</h3>
                <div className="prose prose-invert">
                  <p className="text-text-secondary whitespace-pre-line">{course.longDescription}</p>
                </div>
              </div>
            )}

            {/* Curriculum */}
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-4">
                Course Curriculum ({course.modules.length} modules)
              </h3>
              <div className="space-y-2">
                {course.modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-bg-primary rounded-full flex items-center justify-center text-xs text-text-secondary">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-text-primary">{module.title}</p>
                        {module.description && (
                          <p className="text-sm text-text-secondary">{module.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {module.isPreview && (
                        <span className="badge badge-info text-xs">Preview</span>
                      )}
                      <span className="text-text-secondary text-sm">{module.duration}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Purchase card */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              {/* Thumbnail */}
              <div className="aspect-video bg-bg-tertiary rounded-lg mb-4 flex items-center justify-center">
                <span className="text-6xl">💻</span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-text-primary">
                    ${Number(course.price).toFixed(2)}
                  </span>
                  {course.originalPrice && (
                    <>
                      <span className="text-lg text-text-secondary line-through">
                        ${Number(course.originalPrice).toFixed(2)}
                      </span>
                      <span className="badge bg-accent-error text-white">{discount}% OFF</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {isInCart ? (
                  <Link href="/cart" className="w-full btn btn-secondary py-3 block text-center">
                    View in Cart
                  </Link>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full btn btn-primary py-3"
                  >
                    {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
                  </button>
                )}
                {!isAuthenticated && (
                  <p className="text-center text-sm text-text-secondary">
                    <Link href="/login" className="text-accent-primary hover:underline">
                      Sign in
                    </Link>{' '}
                    to track your progress
                  </p>
                )}
              </div>

              {/* Course includes */}
              <div className="mt-6 pt-6 border-t border-bg-tertiary">
                <h4 className="font-semibold text-text-primary mb-3">This course includes:</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-center space-x-2">
                    <span>📹</span>
                    <span>{formatDuration(course.duration)} of video content</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>📚</span>
                    <span>{course.totalLessons} lessons</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>📱</span>
                    <span>Access on mobile and desktop</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>🏆</span>
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>♾️</span>
                    <span>Lifetime access</span>
                  </li>
                </ul>
              </div>

              {/* Tags */}
              {course.tags && (
                <div className="mt-6 pt-6 border-t border-bg-tertiary">
                  <h4 className="font-semibold text-text-primary mb-3">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.split(',').map((tag) => (
                      <span key={tag} className="badge bg-bg-tertiary text-text-secondary">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
