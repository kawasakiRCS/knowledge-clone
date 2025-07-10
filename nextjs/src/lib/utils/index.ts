/**
 * Utility functions for the application
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 * 
 * @description Merges Tailwind CSS classes, handling conflicts properly
 * @param inputs - Class values to be merged
 * @returns Merged class string
 * @example
 * ```typescript
 * cn("px-2 py-1", "px-4") // "py-1 px-4"
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}