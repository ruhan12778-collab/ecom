'use client'

import Link from 'next/link'

interface StickyCheckoutBarProps {
  title: string
  price: number
  isInCart: boolean
  isEnrolled: boolean
  onAddToCart: () => void
  slug: string
}

export function StickyCheckoutBar({ title, price, isInCart, isEnrolled, onAddToCart, slug }: StickyCheckoutBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-stone-200 z-40 py-3 px-4 shadow-float">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-text-primary truncate">{title}</p>
          <p className="text-sm text-accent-success flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-accent-success rounded-full inline-block" />
            Available Now
          </p>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-2xl font-display font-bold text-text-primary">{'\u00A3'}{price.toFixed(2)}</span>
          {isEnrolled ? (
            <Link href={`/courses/${slug}/learn`} className="btn btn-primary">
              Continue Learning
            </Link>
          ) : isInCart ? (
            <Link href="/cart" className="btn btn-secondary">
              View Cart
            </Link>
          ) : (
            <button onClick={onAddToCart} className="btn btn-primary">
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
