type Urgency = 'normal' | 'warning' | 'critical'

export function formatTimeAgo(date: Date): { text: string; urgency: Urgency } {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return { text: 'just now', urgency: 'normal' }
  if (mins < 15) return { text: `${mins} min ago`, urgency: 'normal' }
  if (mins < 30) return { text: `${mins} min ago`, urgency: 'warning' }
  return { text: `${mins} min ago`, urgency: 'critical' }
}

export const urgencyColor: Record<Urgency, string> = {
  normal: 'var(--flock-color-text-tertiary)',
  warning: 'var(--flock-color-warning)',
  critical: 'var(--flock-color-primary)',
}
