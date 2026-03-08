'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

interface ModuleWithProgress {
  id: string
  title: string
  description: string | null
  order: number
  duration: number
  videoUrl: string | null
  content: string | null
  isPreview: boolean
  completed: boolean
}

interface CourseLearnData {
  course: {
    id: string
    title: string
    slug: string
    description: string
    instructor: string
  }
  modules: ModuleWithProgress[]
  enrollment: {
    progress: number
    completedAt: string | null
    enrolledAt: string
  }
}

interface PointsToast {
  visible: boolean
  pointsAwarded: number
  leveledUp: boolean
  newLevel: number
}

export default function CourseLearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [data, setData] = useState<CourseLearnData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [toast, setToast] = useState<PointsToast>({ visible: false, pointsAwarded: 0, leveledUp: false, newLevel: 1 })
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/courses/${resolvedParams.slug}/learn`)
    }
  }, [isAuthenticated, authLoading, router, resolvedParams.slug])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCourseContent()
    }
  }, [isAuthenticated, resolvedParams.slug])

  const fetchCourseContent = async () => {
    try {
      const response = await fetch(`/api/courses/${resolvedParams.slug}/learn`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        // Select first incomplete module, or first module
        const firstIncomplete = result.data.modules.find((m: ModuleWithProgress) => !m.completed)
        setSelectedModuleId(firstIncomplete?.id || result.data.modules[0]?.id || null)
      } else if (response.status === 403) {
        // Not enrolled — redirect to course detail
        router.push(`/courses/${resolvedParams.slug}`)
      }
    } catch (err) {
      console.error('Failed to fetch course content:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!selectedModuleId || isMarkingComplete) return

    setIsMarkingComplete(true)
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: selectedModuleId }),
      })

      const result = await response.json()

      if (result.success && !result.data?.alreadyCompleted) {
        const { pointsAwarded, leveledUp, newLevel } = result.data

        // Update local state — mark module as completed
        setData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            modules: prev.modules.map((m) =>
              m.id === selectedModuleId ? { ...m, completed: true } : m
            ),
            enrollment: {
              ...prev.enrollment,
              progress: result.data.progress
                ? Math.round((result.data.progress.completed / result.data.progress.total) * 100)
                : prev.enrollment.progress,
              completedAt: result.data.courseCompleted ? new Date().toISOString() : prev.enrollment.completedAt,
            },
          }
        })

        // Show toast
        setToast({ visible: true, pointsAwarded, leveledUp, newLevel })
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500)
      }
    } catch (err) {
      console.error('Failed to mark module complete:', err)
    } finally {
      setIsMarkingComplete(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)
    if (match) return `https://www.youtube.com/embed/${match[1]}`
    return null
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-bg-tertiary rounded w-1/4 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-96 bg-bg-tertiary rounded" />
              <div className="lg:col-span-2 h-96 bg-bg-tertiary rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Course Not Found</h1>
          <Link href="/courses" className="btn btn-primary">Browse Courses</Link>
        </div>
      </div>
    )
  }

  const selectedModule = data.modules.find((m) => m.id === selectedModuleId)
  const selectedIndex = data.modules.findIndex((m) => m.id === selectedModuleId)
  const prevModule = selectedIndex > 0 ? data.modules[selectedIndex - 1] : null
  const nextModule = selectedIndex < data.modules.length - 1 ? data.modules[selectedIndex + 1] : null
  const completedCount = data.modules.filter((m) => m.completed).length

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      {/* Points Toast */}
      {toast.visible && (
        <div className="fixed top-6 right-6 z-50 card bg-accent-primary text-white shadow-lg animate-pulse px-6 py-4 rounded-xl">
          <p className="font-bold text-lg">+{toast.pointsAwarded} points! 🎉</p>
          {toast.leveledUp && (
            <p className="text-sm mt-1">Level up! Now level {toast.newLevel} 🚀</p>
          )}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm flex items-center space-x-2">
          <Link href="/courses" className="text-text-secondary hover:text-text-primary">Courses</Link>
          <span className="text-text-secondary">/</span>
          <Link href={`/courses/${data.course.slug}`} className="text-text-secondary hover:text-text-primary">
            {data.course.title}
          </Link>
          <span className="text-text-secondary">/</span>
          <span className="text-text-primary">Learning</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar — Module List */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              {/* Course title */}
              <h2 className="font-bold text-text-primary mb-3 text-lg">{data.course.title}</h2>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-secondary">Progress</span>
                  <span className="text-accent-primary font-medium">
                    {completedCount}/{data.modules.length} modules
                  </span>
                </div>
                <div className="w-full bg-bg-tertiary rounded-full h-2">
                  <div
                    className="bg-accent-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data.enrollment.progress}%` }}
                  />
                </div>
                {data.enrollment.completedAt && (
                  <p className="text-xs text-accent-success mt-1 font-medium">✓ Course Completed!</p>
                )}
              </div>

              {/* Module list */}
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {data.modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModuleId(module.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-start space-x-3 ${
                      module.id === selectedModuleId
                        ? 'bg-accent-primary/10 border border-accent-primary/20'
                        : 'hover:bg-bg-tertiary'
                    }`}
                  >
                    {/* Completion indicator */}
                    <div className="mt-0.5 flex-shrink-0">
                      {module.completed ? (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-bg-tertiary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        module.id === selectedModuleId ? 'text-accent-primary' : 'text-text-primary'
                      }`}>
                        {module.order}. {module.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">{module.duration}m</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Module Content */}
          <div className="lg:col-span-2">
            {selectedModule ? (
              <div>
                {/* Module header */}
                <div className="card mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">
                        Module {selectedModule.order} of {data.modules.length}
                      </p>
                      <h1 className="text-2xl font-bold text-text-primary">{selectedModule.title}</h1>
                    </div>
                    {selectedModule.completed && (
                      <span className="badge badge-success flex-shrink-0">✓ Completed</span>
                    )}
                  </div>
                  {selectedModule.description && (
                    <p className="text-text-secondary">{selectedModule.description}</p>
                  )}
                  <div className="flex items-center space-x-3 mt-3 text-sm text-text-secondary">
                    <span>⏱ {formatDuration(selectedModule.duration)}</span>
                    <span>· {data.course.instructor}</span>
                  </div>
                </div>

                {/* Video content */}
                {selectedModule.videoUrl && (
                  <div className="card mb-4">
                    {getYouTubeEmbedUrl(selectedModule.videoUrl) ? (
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <iframe
                          src={getYouTubeEmbedUrl(selectedModule.videoUrl)!}
                          className="w-full h-full"
                          allowFullScreen
                          title={selectedModule.title}
                        />
                      </div>
                    ) : (
                      <video
                        src={selectedModule.videoUrl}
                        controls
                        className="w-full rounded-lg"
                      />
                    )}
                  </div>
                )}

                {/* Text content */}
                {selectedModule.content && (
                  <div className="card mb-4">
                    <h3 className="font-semibold text-text-primary mb-3">Lesson Content</h3>
                    <div className="whitespace-pre-wrap text-text-secondary leading-relaxed">
                      {selectedModule.content}
                    </div>
                  </div>
                )}

                {/* No content placeholder */}
                {!selectedModule.videoUrl && !selectedModule.content && (
                  <div className="card mb-4 text-center py-12">
                    <div className="text-4xl mb-3">📚</div>
                    <p className="text-text-secondary">Content for this module is coming soon.</p>
                  </div>
                )}

                {/* Mark Complete + Navigation */}
                <div className="card">
                  <div className="flex items-center justify-between">
                    {/* Prev button */}
                    <button
                      onClick={() => prevModule && setSelectedModuleId(prevModule.id)}
                      disabled={!prevModule}
                      className="btn btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>

                    {/* Mark complete */}
                    {!selectedModule.completed ? (
                      <button
                        onClick={handleMarkComplete}
                        disabled={isMarkingComplete}
                        className="btn btn-primary"
                      >
                        {isMarkingComplete ? 'Marking...' : '✓ Mark as Complete'}
                      </button>
                    ) : (
                      <span className="text-green-500 font-medium text-sm">✓ Completed</span>
                    )}

                    {/* Next button */}
                    <button
                      onClick={() => nextModule && setSelectedModuleId(nextModule.id)}
                      disabled={!nextModule}
                      className="btn btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-text-secondary">Select a module from the sidebar to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
