'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Stats {
  totalUsers: number
  totalCourses: number
  totalOrders: number
  totalRevenue: number
  totalEnrollments: number
  recentOrders: any[]
  recentUsers: any[]
}

// ---------------------------------------------------------------------------
// Mock chart data
// ---------------------------------------------------------------------------

const enrollmentTrend = [
  { month: 'Oct', enrollments: 42 },
  { month: 'Nov', enrollments: 68 },
  { month: 'Dec', enrollments: 55 },
  { month: 'Jan', enrollments: 89 },
  { month: 'Feb', enrollments: 112 },
  { month: 'Mar', enrollments: 134 },
]

const revenueTrend = [
  { month: 'Oct', revenue: 2400 },
  { month: 'Nov', revenue: 3800 },
  { month: 'Dec', revenue: 3200 },
  { month: 'Jan', revenue: 5100 },
  { month: 'Feb', revenue: 4700 },
  { month: 'Mar', revenue: 6300 },
]

const courseDistribution = [
  { name: 'Python', value: 28 },
  { name: 'JavaScript', value: 24 },
  { name: 'Web Dev', value: 18 },
  { name: 'Data Science', value: 14 },
  { name: 'DevOps', value: 10 },
  { name: 'System Design', value: 6 },
]

const DONUT_COLORS = ['#0D9488', '#F59E0B', '#3B82F6', '#8B5CF6', '#22C55E', '#F43F5E']

const skillDistribution = [
  { level: 'Beginner', count: 156, total: 400, color: '#3B82F6' },
  { level: 'Intermediate', count: 178, total: 400, color: '#F59E0B' },
  { level: 'Advanced', count: 66, total: 400, color: '#8B5CF6' },
]

// ---------------------------------------------------------------------------
// Status badge colors
// ---------------------------------------------------------------------------

const statusStyles: Record<string, string> = {
  COMPLETED: 'bg-green-50 text-green-700',
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-red-50 text-red-700',
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label, prefix = '' }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-stone-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      <p className="font-medium">{label}</p>
      <p className="text-stone-300">
        {prefix}{typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        const data = await res.json()
        setStats(data.data || data)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-stone-400">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-red-500">Failed to load dashboard data.</p>
      </div>
    )
  }

  // ── KPI cards ──────────────────────────────────────────────────────────

  const kpis = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+12%',
      positive: true,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Courses',
      value: stats.totalCourses.toLocaleString(),
      change: '+3',
      positive: true,
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: '+8%',
      positive: true,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Revenue',
      value: `£${Number(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: '+23%',
      positive: true,
      bgColor: 'bg-green-50',
      textColor: 'text-green-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
    },
    {
      label: 'Enrollments',
      value: (stats.totalEnrollments ?? 0).toLocaleString(),
      change: '+18%',
      positive: true,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      ),
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className={`${kpi.bgColor} ${kpi.textColor} w-10 h-10 rounded-lg flex items-center justify-center`}>
                {kpi.icon}
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  kpi.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}
              >
                {kpi.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 tracking-tight">{kpi.value}</p>
              <p className="text-sm text-stone-500 mt-0.5">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row 1: Enrollment Trend + Revenue Overview ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enrollment Trend */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-semibold text-stone-900 mb-4">Enrollment Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentTrend} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="enrollGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0D9488" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E7E5E4" strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#78716C' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#78716C' }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#0D9488"
                  strokeWidth={2}
                  fill="url(#enrollGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-semibold text-stone-900 mb-4">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                <CartesianGrid vertical={false} stroke="#E7E5E4" strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#78716C' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#78716C' }}
                  tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ChartTooltip prefix="£" />} />
                <Bar dataKey="revenue" fill="#292524" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Charts Row 2: Course Distribution + Skill Levels ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Course Distribution */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-semibold text-stone-900 mb-4">Course Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {courseDistribution.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-stone-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                        <p className="font-medium">{payload[0].name}</p>
                        <p className="text-stone-300">{payload[0].value} courses</p>
                      </div>
                    )
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-stone-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Skill Distribution */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-semibold text-stone-900 mb-4">User Skill Distribution</h3>
          <div className="flex flex-col justify-center h-64 gap-6 px-2">
            {skillDistribution.map((skill) => {
              const pct = Math.round((skill.count / skill.total) * 100)
              return (
                <div key={skill.level}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stone-700">{skill.level}</span>
                    <span className="text-sm text-stone-500">
                      {skill.count} users ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: skill.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tables: Recent Orders + Recent Users ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h3 className="text-sm font-semibold text-stone-900">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Order</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {stats.recentOrders.slice(0, 5).map((order: any) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-stone-900 font-medium">
                      #{order.orderNumber || order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-3 text-sm text-stone-600">{order.user?.name || 'N/A'}</td>
                    <td className="px-6 py-3 text-sm text-stone-900 font-medium tabular-nums">
                      £{Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusStyles[order.status] || 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-stone-400 tabular-nums">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-stone-400">
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h3 className="text-sm font-semibold text-stone-900">Recent Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Level</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Points</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {stats.recentUsers.slice(0, 5).map((user: any) => (
                  <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-stone-900 font-medium">{user.name}</td>
                    <td className="px-6 py-3 text-sm text-stone-500 truncate max-w-[160px]">{user.email}</td>
                    <td className="px-6 py-3 text-sm text-stone-900 tabular-nums">{user.gamification?.level ?? 1}</td>
                    <td className="px-6 py-3 text-sm text-stone-900 tabular-nums">{(user.gamification?.points ?? 0).toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-stone-400 tabular-nums">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
                {stats.recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-stone-400">
                      No recent users
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
