'use client'

import { useEffect, useRef, useState } from 'react'

interface StatConfig {
  target: number
  suffix: string
  label: string
  duration: number
}

const STATS: StatConfig[] = [
  { target: 10000, suffix: '+', label: 'Students', duration: 2000 },
  { target: 25, suffix: '', label: 'Expert Courses', duration: 1500 },
  { target: 4.8, suffix: '', label: 'Avg Rating', duration: 1800 },
  { target: 100, suffix: '%', label: 'Online', duration: 1600 },
]

function useCountUp(target: number, duration: number, started: boolean) {
  const [value, setValue] = useState(0)
  const isDecimal = target % 1 !== 0

  useEffect(() => {
    if (!started) return

    const startTime = performance.now()
    let raf: number

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target

      setValue(isDecimal ? Math.round(current * 10) / 10 : Math.round(current))

      if (progress < 1) {
        raf = requestAnimationFrame(animate)
      } else {
        setValue(target)
      }
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, started, isDecimal])

  return isDecimal ? value.toFixed(1) : value.toLocaleString()
}

function AnimatedStat({ stat, started }: { stat: StatConfig; started: boolean }) {
  const display = useCountUp(stat.target, stat.duration, started)

  return (
    <div className="text-center px-6 py-4">
      <div className="font-display font-bold text-3xl md:text-4xl text-text-primary tabular-nums tracking-tight">
        {display}{stat.suffix}
      </div>
      <div className="text-text-secondary text-sm mt-1">{stat.label}</div>
    </div>
  )
}

export function AnimatedStats() {
  const ref = useRef<HTMLElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="bg-bg-secondary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-center divide-x divide-stone-200">
          {STATS.map((stat) => (
            <AnimatedStat key={stat.label} stat={stat} started={started} />
          ))}
        </div>
      </div>
    </section>
  )
}
