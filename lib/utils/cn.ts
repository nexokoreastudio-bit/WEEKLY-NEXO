import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * className 병합 유틸리티
 * clsx와 tailwind-merge를 결합하여 Tailwind 클래스 충돌을 자동으로 해결
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

