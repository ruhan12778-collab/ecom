'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

// ── Animated Code Lesson ────────────────────────────────────────────────────
// Simulates a teacher writing code — fully CSS-driven, no video files needed

const CODE_SNIPPETS: Record<string, string[]> = {
  default: [
    'def greet(name):',
    '    """Say hello to a user."""',
    '    message = f"Hello, {name}!"',
    '    print(message)',
    '    return message',
    '',
    '# Let\'s test our function',
    'result = greet("Student")',
    'print(f"Result: {result}")',
  ],
}

function AnimatedCodeLesson({ moduleTitle }: { moduleTitle: string }) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)
  const lines = CODE_SNIPPETS.default

  useEffect(() => {
    setVisibleLines(0)
    const lineTimer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= lines.length) {
          clearInterval(lineTimer)
          return prev
        }
        return prev + 1
      })
    }, 800)

    const cursorTimer = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 530)

    return () => {
      clearInterval(lineTimer)
      clearInterval(cursorTimer)
    }
  }, [moduleTitle])

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#1e1e2e] aspect-video">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#181825] border-b border-[#313244]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#f38ba8]" />
            <div className="w-3 h-3 rounded-full bg-[#f9e2af]" />
            <div className="w-3 h-3 rounded-full bg-[#a6e3a1]" />
          </div>
          <span className="text-[#6c7086] text-xs ml-2 font-mono">lesson.py</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#a6e3a1] animate-pulse" />
          <span className="text-[#a6adc8] text-xs">Live Coding</span>
        </div>
      </div>

      {/* Code area */}
      <div className="p-4 font-mono text-sm leading-relaxed overflow-hidden">
        {lines.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="flex">
            <span className="text-[#6c7086] select-none w-8 text-right mr-4 text-xs leading-relaxed">
              {i + 1}
            </span>
            <span className="text-[#cdd6f4]">
              {line.startsWith('def ') ? (
                <>
                  <span className="text-[#cba6f7]">def </span>
                  <span className="text-[#89b4fa]">{line.slice(4, line.indexOf('('))}</span>
                  <span className="text-[#cdd6f4]">{line.slice(line.indexOf('('))}</span>
                </>
              ) : line.startsWith('#') || line.startsWith('    """') ? (
                <span className="text-[#6c7086]">{line}</span>
              ) : line.includes('print') ? (
                <>
                  <span className="text-[#cdd6f4]">{line.slice(0, line.indexOf('print'))}</span>
                  <span className="text-[#89b4fa]">print</span>
                  <span className="text-[#cdd6f4]">{line.slice(line.indexOf('print') + 5)}</span>
                </>
              ) : line.includes('return ') ? (
                <>
                  <span className="text-[#cdd6f4]">{line.slice(0, line.indexOf('return'))}</span>
                  <span className="text-[#cba6f7]">return </span>
                  <span className="text-[#cdd6f4]">{line.slice(line.indexOf('return') + 7)}</span>
                </>
              ) : (
                <span>{line}</span>
              )}
            </span>
          </div>
        ))}
        {visibleLines < lines.length && (
          <div className="flex">
            <span className="text-[#6c7086] select-none w-8 text-right mr-4 text-xs leading-relaxed">
              {visibleLines + 1}
            </span>
            <span className={`inline-block w-2 h-4 bg-[#cba6f7] ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-[#181825] border-t border-[#313244] flex items-center justify-between">
        <span className="text-[#6c7086] text-xs">CodeEd Interactive Lesson</span>
        <span className="text-[#6c7086] text-xs">
          Line {Math.min(visibleLines + 1, lines.length)}/{lines.length}
        </span>
      </div>
    </div>
  )
}

// ── Notepad Component ───────────────────────────────────────────────────────

function Notepad({ courseSlug }: { courseSlug: string }) {
  const storageKey = `codeed-notes-${courseSlug}`
  const [notes, setNotes] = useState('')
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) setNotes(saved)
  }, [storageKey])

  const handleChange = useCallback((value: string) => {
    setNotes(value)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem(storageKey, value)
    }, 400)
  }, [storageKey])

  return (
    <div className="bg-[#fffef5] rounded-xl border border-amber-200/60 flex flex-col h-full min-h-[400px] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200/40">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
          <span className="text-sm font-medium text-amber-800">Notes</span>
        </div>
        <span className="text-xs text-amber-500">Auto-saved</span>
      </div>

      {/* Lined textarea */}
      <div className="flex-1 relative">
        <textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Take notes while you learn..."
          className="w-full h-full resize-none p-4 bg-transparent text-sm text-stone-700 leading-[28px] focus:outline-none placeholder:text-amber-300"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #fde68a40 27px, #fde68a40 28px)',
            backgroundPosition: '0 12px',
          }}
          spellCheck={false}
        />
      </div>
    </div>
  )
}

// ── Main Learn Page ─────────────────────────────────────────────────────────

export default function CourseLearnPage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<CourseLearnData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [toast, setToast] = useState<PointsToast>({ visible: false, pointsAwarded: 0, leveledUp: false, newLevel: 1 })
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/courses/${params.slug}/learn`)
    }
  }, [isAuthenticated, authLoading, router, params.slug])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCourseContent()
    }
  }, [isAuthenticated, params.slug])

  const fetchCourseContent = async () => {
    try {
      const response = await fetch(`/api/courses/${params.slug}/learn`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        const firstIncomplete = result.data.modules.find((m: ModuleWithProgress) => !m.completed)
        setSelectedModuleId(firstIncomplete?.id || result.data.modules[0]?.id || null)
      } else if (response.status === 403) {
        router.push(`/courses/${params.slug}`)
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

        setToast({ visible: true, pointsAwarded, leveledUp, newLevel })
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500)

        // Sync points in header
        useAuthStore.getState().checkAuth()
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
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-bg-tertiary rounded w-1/4 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="h-96 bg-bg-tertiary rounded" />
              <div className="lg:col-span-3 h-96 bg-bg-tertiary rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
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
        <div className="fixed top-6 right-6 z-50 bg-stone-900 text-white shadow-lg px-6 py-4 rounded-xl animate-bounce">
          <p className="font-bold text-lg">+{toast.pointsAwarded} points!</p>
          {toast.leveledUp && (
            <p className="text-sm mt-1 text-stone-300">Level up! Now level {toast.newLevel}</p>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
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

        <div className="flex gap-6">
          {/* Left Sidebar — Module List */}
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="card sticky top-24">
              <h2 className="font-bold text-text-primary mb-3 text-base">{data.course.title}</h2>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-secondary">Progress</span>
                  <span className="text-accent-teal font-medium">
                    {completedCount}/{data.modules.length}
                  </span>
                </div>
                <div className="w-full bg-bg-tertiary rounded-full h-1.5">
                  <div
                    className="bg-accent-teal h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${data.enrollment.progress}%` }}
                  />
                </div>
                {data.enrollment.completedAt && (
                  <p className="text-xs text-green-600 mt-1 font-medium">Course Completed</p>
                )}
              </div>

              {/* Module list */}
              <div className="space-y-0.5 max-h-[60vh] overflow-y-auto pr-1">
                {data.modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModuleId(module.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start space-x-2.5 ${
                      module.id === selectedModuleId
                        ? 'bg-accent-teal/10 border border-accent-teal/20'
                        : 'hover:bg-bg-tertiary'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {module.completed ? (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 ${module.id === selectedModuleId ? 'border-accent-teal' : 'border-stone-300'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        module.id === selectedModuleId ? 'text-accent-teal' : 'text-text-primary'
                      }`}>
                        {module.order}. {module.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">{module.duration} min</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {selectedModule ? (
              <div className="flex gap-5">
                {/* Content column */}
                <div className="flex-1 min-w-0">
                  {/* Module header */}
                  <div className="card mb-4">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-xs text-text-secondary uppercase tracking-wider">
                        Module {selectedModule.order} of {data.modules.length}
                      </p>
                      {selectedModule.completed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Done
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl font-bold text-text-primary">{selectedModule.title}</h1>
                    {selectedModule.description && (
                      <p className="text-text-secondary text-sm mt-1">{selectedModule.description}</p>
                    )}
                    <div className="flex items-center space-x-3 mt-2 text-xs text-text-secondary">
                      <span>{formatDuration(selectedModule.duration)}</span>
                      <span className="w-1 h-1 rounded-full bg-stone-300" />
                      <span>{data.course.instructor}</span>
                    </div>
                  </div>

                  {/* Video / Animated Lesson */}
                  <div className="card mb-4 p-0 overflow-hidden">
                    {selectedModule.videoUrl && getYouTubeEmbedUrl(selectedModule.videoUrl) ? (
                      <div className="aspect-video">
                        <iframe
                          src={getYouTubeEmbedUrl(selectedModule.videoUrl)!}
                          className="w-full h-full"
                          allowFullScreen
                          title={selectedModule.title}
                        />
                      </div>
                    ) : selectedModule.videoUrl ? (
                      <video
                        src={selectedModule.videoUrl}
                        controls
                        className="w-full"
                      />
                    ) : (
                      <AnimatedCodeLesson moduleTitle={selectedModule.title} />
                    )}
                  </div>

                  {/* Text content */}
                  {selectedModule.content && (
                    <div className="card mb-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">Lesson Content</h3>
                      <div className="whitespace-pre-wrap text-text-secondary leading-relaxed text-sm">
                        {selectedModule.content}
                      </div>
                    </div>
                  )}

                  {/* Mark Complete + Navigation */}
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => prevModule && setSelectedModuleId(prevModule.id)}
                        disabled={!prevModule}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        Previous
                      </button>

                      {!selectedModule.completed ? (
                        <button
                          onClick={handleMarkComplete}
                          disabled={isMarkingComplete}
                          className="btn btn-primary px-5 py-2 text-sm"
                        >
                          {isMarkingComplete ? 'Saving...' : 'Mark as Complete'}
                        </button>
                      ) : (
                        <span className="text-green-600 font-medium text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Completed
                        </span>
                      )}

                      <button
                        onClick={() => nextModule && setSelectedModuleId(nextModule.id)}
                        disabled={!nextModule}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notepad panel — always visible */}
                <div className="w-80 flex-shrink-0 hidden lg:block">
                  <div className="sticky top-24">
                    <Notepad courseSlug={data.course.slug} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center py-16">
                <p className="text-text-secondary">Select a module from the sidebar to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
