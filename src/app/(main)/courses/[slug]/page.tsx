'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { StickyCheckoutBar } from '@/components/layout/StickyCheckoutBar'

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

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const { addItem, items } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const isInCart = items.some((item) => item.courseId === course?.id)

  useEffect(() => {
    fetchCourse()
  }, [params.slug])

  useEffect(() => {
    if (isAuthenticated && course) {
      checkEnrollment()
    }
  }, [isAuthenticated, course])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.slug}`)
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

  const checkEnrollment = async () => {
    try {
      const response = await fetch('/api/enrollments')
      const data = await response.json()
      if (data.success) {
        const enrolled = data.data.some(
          (e: { course: { slug: string } }) => e.course.slug === params.slug
        )
        setIsEnrolled(enrolled)
      }
    } catch {
      // Silently fail — worst case user sees Add to Cart
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
          <h1 className="text-2xl font-display font-bold text-text-primary mb-4">Course Not Found</h1>
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/courses" className="text-stone-500 hover:text-stone-900 transition-colors">
            Courses
          </Link>
          <span className="mx-2 text-stone-400">/</span>
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
              <h1 className="text-3xl font-display font-bold text-text-primary mb-4">{course.title}</h1>
              <p className="text-text-secondary text-lg">{course.description}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center space-x-1">
                <span className="text-amber-500">{'\u2605'}</span>
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
            <div className="mb-8 pb-8 border-b border-stone-200">
              <h3 className="font-display font-bold text-text-primary mb-3">Instructor</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center text-white font-bold">
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
              <div className="mb-8 pb-8 border-b border-stone-200">
                <h3 className="font-display font-bold text-text-primary mb-4">About This Course</h3>
                <p className="text-text-secondary whitespace-pre-line leading-relaxed">{course.longDescription}</p>
              </div>
            )}

            {/* Curriculum */}
            <div className="mb-8">
              <h3 className="font-display font-bold text-text-primary mb-4">
                Course Curriculum ({course.modules.length} modules)
              </h3>
              <div className="space-y-2">
                {course.modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-4 bg-bg-secondary rounded-2xl"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 bg-stone-200 rounded-full flex items-center justify-center text-xs font-medium text-stone-600">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-text-primary font-medium">{module.title}</p>
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
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sticky top-24">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-stone-100 rounded-2xl mb-4 overflow-hidden">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover mix-blend-multiply"
                    sizes="(max-width: 1024px) 100vw, 400px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-300 to-stone-500 flex items-center justify-center">
                    <span className="text-6xl">{'\uD83D\uDCBB'}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-display font-bold text-text-primary">
                    {'\u00A3'}{Number(course.price).toFixed(2)}
                  </span>
                  {course.originalPrice && (
                    <>
                      <span className="text-lg text-text-secondary line-through">
                        {'\u00A3'}{Number(course.originalPrice).toFixed(2)}
                      </span>
                      <span className="badge bg-red-50 text-red-700">{discount}% OFF</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {isEnrolled ? (
                  <>
                    <Link
                      href={`/courses/${params.slug}/learn`}
                      className="w-full btn btn-primary py-3 block text-center"
                    >
                      {'\u25B6'} Continue Learning
                    </Link>
                    <p className="text-center text-sm text-accent-success font-medium">
                      {'\u2713'} You are enrolled in this course
                    </p>
                  </>
                ) : isInCart ? (
                  <Link href="/cart" className="w-full btn btn-secondary py-3 block text-center">
                    View in Cart
                  </Link>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full btn btn-primary py-3"
                  >
                    {addedToCart ? '\u2713 Added to Cart' : 'Add to Cart'}
                  </button>
                )}
                {!isAuthenticated && (
                  <p className="text-center text-sm text-text-secondary">
                    <Link href="/login" className="text-stone-900 font-medium hover:underline">
                      Sign in
                    </Link>{' '}
                    to track your progress
                  </p>
                )}
              </div>

              {/* Course includes */}
              <div className="mt-6 pt-6 border-t border-stone-200">
                <h4 className="font-display font-bold text-text-primary mb-3">This course includes:</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-center space-x-2">
                    <span>{'\uD83D\uDCF9'}</span>
                    <span>{formatDuration(course.duration)} of video content</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>{'\uD83D\uDCDA'}</span>
                    <span>{course.totalLessons} lessons</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>{'\uD83D\uDCF1'}</span>
                    <span>Access on mobile and desktop</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>{'\uD83C\uDFC6'}</span>
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>{'\u267E\uFE0F'}</span>
                    <span>Lifetime access</span>
                  </li>
                </ul>
              </div>

              {/* Tags */}
              {course.tags && (
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <h4 className="font-display font-bold text-text-primary mb-3">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.split(',').map((tag) => (
                      <span key={tag} className="badge bg-stone-100 text-text-secondary">
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

      {/* Sticky Checkout Bar */}
      <StickyCheckoutBar
        title={course.title}
        price={Number(course.price)}
        isInCart={isInCart}
        isEnrolled={isEnrolled}
        onAddToCart={handleAddToCart}
        slug={params.slug}
      />
    </div>
  )
}
