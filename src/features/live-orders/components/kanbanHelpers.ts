import { useEffect, useState } from 'react'
import type { Order } from '../types'

export function useClock(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

export interface SlaInfo {
  minutes: number
  isLate: boolean
  label: string
}

export function getSla(order: Order, now: number): SlaInfo | null {
  if (!order.prepareByTime) return null
  const diffMs = order.prepareByTime.getTime() - now
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 0) {
    return { minutes, isLate: true, label: `${Math.abs(minutes)}m late` }
  }
  return { minutes, isLate: false, label: `${minutes}m left` }
}

export function getPrepCommitment(order: Order, now: number): number | null {
  if (!order.prepareByTime) return null
  const minutes = Math.round((order.prepareByTime.getTime() - now) / 60000)
  return minutes > 0 ? minutes : null
}

