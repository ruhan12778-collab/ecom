import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  role: string
  points: number
  level: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  _hasHydrated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, skillLevel: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  checkAuth: () => Promise<void>
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,

      login: async (email: string, password: string) => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || error.message || 'Login failed')
        }

        const data = await response.json()
        set({ user: data.user, isAuthenticated: true })
      },

      register: async (name: string, email: string, password: string, skillLevel: string) => {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, skillLevel }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Registration failed')
        }

        const data = await response.json()
        set({ user: data.user, isAuthenticated: true })
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch (e) {
          // Ignore logout errors
        }
        set({ user: null, isAuthenticated: false })
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/me')
          if (response.ok) {
            const data = await response.json()
            set({ user: data.user, isAuthenticated: true })
          } else {
            set({ user: null, isAuthenticated: false })
          }
        } catch {
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state, isLoading: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
