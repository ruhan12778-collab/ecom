'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, clearCart, getTotal } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNumber: string
    pointsEarned: number
  } | null>(null)

  const total = getTotal()

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cart')
      return
    }

    setIsCheckingOut(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'demo',
        }),
      })

      const data = await response.json()

      if (data.success) {
        clearCart()
        setOrderSuccess({
          orderNumber: data.data.order.orderNumber,
          pointsEarned: data.data.pointsEarned,
        })
      } else {
        alert(data.error || 'Checkout failed')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Order Confirmed!</h1>
          <p className="text-text-secondary mb-4">
            Your order <span className="font-mono text-accent-primary">{orderSuccess.orderNumber}</span> has been placed successfully.
          </p>
          <div className="p-4 bg-points-gold/20 rounded-lg mb-6">
            <p className="text-points-gold font-semibold">
              +{orderSuccess.pointsEarned} points earned! ⭐
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/dashboard" className="block w-full btn btn-primary">
              Go to Dashboard
            </Link>
            <Link href="/courses" className="block w-full btn btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Your Cart is Empty</h1>
          <p className="text-text-secondary mb-6">
            Explore our courses and find something to learn!
          </p>
          <Link href="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.courseId} className="card flex gap-4">
                <div className="w-24 h-16 bg-bg-tertiary rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💻</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">{item.title}</h3>
                  <p className="text-lg font-bold text-accent-primary">${item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeItem(item.courseId)}
                  className="text-text-secondary hover:text-accent-error transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              onClick={() => clearCart()}
              className="text-sm text-text-secondary hover:text-accent-error"
            >
              Clear Cart
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal ({items.length} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Discount</span>
                  <span>$0.00</span>
                </div>
              </div>

              <div className="border-t border-bg-tertiary pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold text-text-primary">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full btn btn-primary py-3 disabled:opacity-50"
              >
                {isCheckingOut ? 'Processing...' : 'Checkout'}
              </button>

              {!isAuthenticated && (
                <p className="mt-4 text-center text-sm text-text-secondary">
                  <Link href="/login?redirect=/cart" className="text-accent-primary hover:underline">
                    Sign in
                  </Link>{' '}
                  to complete your purchase
                </p>
              )}

              <div className="mt-6 p-4 bg-bg-tertiary rounded-lg">
                <p className="text-sm text-text-secondary text-center">
                  🔒 Demo Mode: No real payment required
                </p>
              </div>

              {/* Points preview */}
              <div className="mt-4 p-4 bg-points-gold/10 rounded-lg border border-points-gold/20">
                <p className="text-sm text-points-gold text-center">
                  ⭐ You&apos;ll earn ~{items.length * 10} points with this purchase!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
