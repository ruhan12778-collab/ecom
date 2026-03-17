'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items } = useCartStore()

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-display font-bold text-text-primary">CodeEd</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/courses" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
              Courses
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                  Dashboard
                </Link>
                <Link href="/leaderboard" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                  Leaderboard
                </Link>
                <Link href="/profile" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-stone-500 hover:text-stone-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Points (if authenticated) */}
            {isAuthenticated && user && (
              <div className="hidden sm:flex items-center space-x-1 text-points-gold">
                <span>{'\u2B50'}</span>
                <span className="font-medium">{user.points || 0}</span>
              </div>
            )}

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="hidden sm:block text-sm text-stone-500">
                  Hi, {user?.name || 'User'}
                </span>
                <button
                  onClick={logout}
                  className="btn btn-secondary text-sm px-4 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/login" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary text-sm px-5 py-2.5">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200">
            <div className="flex flex-col space-y-4">
              <Link href="/courses" className="text-sm font-medium text-stone-500 hover:text-stone-900">
                Courses
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-sm font-medium text-stone-500 hover:text-stone-900">
                    Dashboard
                  </Link>
                  <Link href="/leaderboard" className="text-sm font-medium text-stone-500 hover:text-stone-900">
                    Leaderboard
                  </Link>
                  <Link href="/profile" className="text-sm font-medium text-stone-500 hover:text-stone-900">
                    Profile
                  </Link>
                  <button onClick={logout} className="text-left text-sm font-medium text-stone-500 hover:text-stone-900">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-stone-500 hover:text-stone-900">
                    Login
                  </Link>
                  <Link href="/register" className="text-sm font-medium text-stone-500 hover:text-stone-900">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
