import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  courseId: string
  title: string
  price: number
  quantity: number
  thumbnail?: string
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (courseId: string) => void
  updateQuantity: (courseId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  syncWithServer: () => Promise<void>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) => {
        const { items } = get()
        const existingItem = items.find((i) => i.courseId === item.courseId)

        if (existingItem) {
          // Course already in cart, don't add duplicate
          return
        }

        set({ items: [...items, { ...item, quantity: 1 }] })

        // Sync with server if authenticated
        get().syncWithServer()
      },

      removeItem: (courseId) => {
        const { items } = get()
        set({ items: items.filter((i) => i.courseId !== courseId) })
        get().syncWithServer()
      },

      updateQuantity: (courseId, quantity) => {
        const { items } = get()
        if (quantity <= 0) {
          set({ items: items.filter((i) => i.courseId !== courseId) })
        } else {
          set({
            items: items.map((i) =>
              i.courseId === courseId ? { ...i, quantity } : i
            ),
          })
        }
        get().syncWithServer()
      },

      clearCart: () => {
        set({ items: [] })
        get().syncWithServer()
      },

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },

      syncWithServer: async () => {
        // This will sync cart with server when user is authenticated
        try {
          const { items } = get()
          await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          })
        } catch (e) {
          // Ignore sync errors - cart is still stored locally
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
