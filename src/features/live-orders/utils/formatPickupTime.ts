type Urgency = 'future' | 'soon' | 'overdue'

export function formatPickupTime(pickup: Date, from: Date = new Date()): {
  time: string
  relative: string
  urgency: Urgency
} {
  const time = pickup.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  const diffMs = pickup.getTime() - from.getTime()
  const diffMin = Math.round(diffMs / 60000)

  if (diffMin < 0) {
    const absMin = Math.abs(diffMin)
    const relative = absMin < 60
      ? `Overdue by ${absMin} min`
      : `Overdue by ${Math.floor(absMin / 60)} h ${absMin % 60} min`
    return { time, relative, urgency: 'overdue' }
  }

  const urgency: Urgency = diffMin <= 30 ? 'soon' : 'future'

  if (diffMin < 60) return { time, relative: `in ${diffMin} min`, urgency }

  const hours = Math.floor(diffMin / 60)
  const pickupDate = pickup.toDateString()
  const fromDate = from.toDateString()
  const tomorrow = new Date(from); tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowDate = tomorrow.toDateString()

  if (pickupDate === fromDate) {
    const mins = diffMin % 60
    return { time, relative: mins ? `in ${hours} h ${mins} min` : `in ${hours} h`, urgency }
  }
  if (pickupDate === tomorrowDate) {
    const dayLabel = pickup.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { time, relative: `Tomorrow · ${dayLabel}`, urgency }
  }
  const dayLabel = pickup.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return { time, relative: dayLabel, urgency }
}

export const pickupUrgencyColor: Record<Urgency, string> = {
  future: 'var(--flock-color-info)',
  soon: 'var(--flock-color-volcano)',
  overdue: 'var(--flock-color-error)',
}
