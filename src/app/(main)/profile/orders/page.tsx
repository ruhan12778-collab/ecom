'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

interface OrderItem {
  id: string
  price: number
  quantity: number
  course: {
    id: string
    title: string
    slug: string
    thumbnail: string | null
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  discount: number
  total: number
  paymentMethod: string | null
  createdAt: string
  items: OrderItem[]
}

const statusColors: Record<string, string> = {
  COMPLETED: 'badge-success',
  PENDING: 'badge-warning',
  PROCESSING: 'badge-info',
  CANCELLED: 'badge-error',
  REFUNDED: 'bg-bg-tertiary text-text-secondary',
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile/orders')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-bg-tertiary rounded w-1/3" />
            <div className="h-32 bg-bg-tertiary rounded" />
            <div className="h-32 bg-bg-tertiary rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/profile" className="text-text-secondary hover:text-text-primary transition-colors">
            ← Profile
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Order History</h1>
        </div>

        {/* Empty state */}
        {orders.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">No orders yet</h2>
            <p className="text-text-secondary mb-6">
              Browse our courses and start your learning journey.
            </p>
            <Link href="/courses" className="btn btn-primary">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card">
                {/* Order header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-mono text-accent-primary font-medium">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`badge ${statusColors[order.status] || 'badge-info'}`}>
                    {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                  </span>
                </div>

                {/* Order items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b border-bg-tertiary last:border-0"
                    >
                      <Link
                        href={`/courses/${item.course.slug}`}
                        className="text-text-primary hover:text-accent-primary transition-colors flex-1 mr-4"
                      >
                        {item.course.title}
                      </Link>
                      <span className="text-text-secondary text-sm">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order footer */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-text-secondary">
                    {order.items.length} course{order.items.length !== 1 ? 's' : ''}
                    {order.paymentMethod && (
                      <span className="ml-2">· {order.paymentMethod}</span>
                    )}
                  </div>
                  <div className="text-right">
                    {order.discount > 0 && (
                      <p className="text-sm text-text-secondary line-through">
                        ${Number(order.subtotal).toFixed(2)}
                      </p>
                    )}
                    <p className="font-bold text-text-primary text-lg">
                      ${Number(order.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
