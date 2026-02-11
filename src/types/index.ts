import { z } from 'zod'

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  skillLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

// ============================================
// COURSE SCHEMAS
// ============================================

export const courseFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'popular']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
})

export type CourseFilter = z.infer<typeof courseFilterSchema>

// ============================================
// CART SCHEMAS
// ============================================

export const addToCartSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
})

export const updateCartSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  quantity: z.number().min(0).max(10),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartInput = z.infer<typeof updateCartSchema>

// ============================================
// ORDER SCHEMAS
// ============================================

export const createOrderSchema = z.object({
  paymentMethod: z.enum(['card', 'paypal', 'demo']).default('demo'),
  notes: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

// ============================================
// CHATBOT SCHEMAS
// ============================================

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000),
})

export type ChatMessageInput = z.infer<typeof chatMessageSchema>

// ============================================
// RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export const POINT_VALUES = {
  COURSE_ENROLLMENT: 10,
  MODULE_COMPLETION: 25,
  COURSE_COMPLETION: 100,
  DAILY_LOGIN: 5,
  STREAK_7_DAYS: 50,
  STREAK_30_DAYS: 200,
  FIRST_PURCHASE: 50,
  FIRST_CHAT: 10,
} as const

export const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  300,   // Level 3
  600,   // Level 4
  1000,  // Level 5
  1500,  // Level 6
  2200,  // Level 7
  3000,  // Level 8
  4000,  // Level 9
  5500,  // Level 10
] as const

export type PointAction = keyof typeof POINT_VALUES
