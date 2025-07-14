/**
 * Common type definitions for the application
 */

/**
 * Knowledge entity type
 * 
 * @description Represents a knowledge article in the system
 */
export interface Knowledge {
  knowledgeId: bigint
  title: string
  content?: string
  publicFlag?: number
  tagIds?: string
  tagNames?: string
  likeCount?: bigint
  commentCount?: number
  typeId?: number
  insertUser?: number
  insertDatetime?: Date
  updateUser?: number
  updateDatetime?: Date
  deleteFlag?: number
  notifyStatus?: number
  viewCount?: bigint
  point: number
}

/**
 * User entity type
 * 
 * @description Represents a user in the system
 */
export interface User {
  id: number
  userId: string
  password: string
  userName: string
  mailAddress: string
  insertUser: number
  insertDatetime: Date
  updateUser: number
  updateDatetime: Date
  deleteFlag: number
}

/**
 * API response wrapper type
 * 
 * @description Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Export auth types
export * from './auth';