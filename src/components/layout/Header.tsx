'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

function getLevelProgress(points: number): number {
  return ((points % 500) / 500) * 100
}

function UserAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initial = (name || 'U').charAt(0).toUpperCase()
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <span
      className={`${dim} rounded-full bg-stone-900 text-white font-medium flex items-center justify-center select-none`}
    >
      {initial}
    </span>
  )
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0l2.2 5.5L16 8l-5.8 2.5L8 16l-2.2-5.5L0 8l5.8-2.5z" />
    </svg>
  )
}

function LevelProgressBar({ points }: { points: number }) {
  const progress = getLevelProgress(points)
  return (
    <div className="h-[2px] w-full bg-stone-100">
      <div
        className="h-full bg-accent-teal transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items } = useCartStore()

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const navLinks = [
    { href: '/courses', label: 'Courses', authOnly: false },
    { href: '/dashboard', label: 'Dashboard', authOnly: true },
    { href: '/leaderboard', label: 'Leaderboard', authOnly: true },
  ]

  const dropdownItems = [
    { href: '/profile', label: 'Profile' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/profile/orders', label: 'Order History' },
  ]

  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <span className="text-xl font-display font-bold text-text-primary tracking-tight">
              CodeEd
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Points */}
            {isAuthenticated && user && (
              <div className="hidden sm:flex items-center space-x-1.5 text-accent-warm px-2 py-1">
                <SparkIcon />
                <span className="text-sm font-semibold tabular-nums">
                  {user.points ?? 0}
                </span>
              </div>
            )}

            {/* Search */}
            <Link
              href="/courses?search="
              className="p-2 text-stone-400 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-50"
            >
              <SearchIcon />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-stone-400 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-50"
            >
              <CartIcon />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="ml-1 rounded-full transition-transform active:scale-95"
                  aria-label="User menu"
                >
                  <UserAvatar name={user.name} />
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-float border border-stone-100 p-1 transition-all duration-150 origin-top-right ${
                    dropdownOpen
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 -translate-y-1 pointer-events-none'
                  }`}
                >
                  {/* User info header */}
                  <div className="px-3 py-2.5 border-b border-stone-100 mb-1">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Level {user.level} &middot; {user.points ?? 0} pts
                    </p>
                  </div>

                  {dropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-bg-secondary transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        logout()
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3 ml-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary text-sm px-5 py-2">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 text-stone-500 hover:text-stone-900 transition-colors rounded-lg"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Level progress bar — full width, under nav */}
      {isAuthenticated && user && <LevelProgressBar points={user.points ?? 0} />}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-100">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            {/* Mobile user info */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
                <UserAvatar name={user.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {user.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-xs text-stone-400">
                      Level {user.level}
                    </span>
                    <span className="flex items-center space-x-1 text-accent-warm text-xs">
                      <SparkIcon />
                      <span className="font-medium">{user.points ?? 0}</span>
                    </span>
                  </div>
                  {/* Mobile progress bar */}
                  <div className="mt-2 h-[2px] w-full bg-stone-100 rounded-full">
                    <div
                      className="h-full bg-accent-teal rounded-full transition-all duration-500"
                      style={{ width: `${getLevelProgress(user.points ?? 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                if (link.authOnly && !isAuthenticated) return null
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              })}

              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                  >
                    Order History
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      logout()
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t border-stone-100">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 text-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary text-sm text-center py-2.5"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
