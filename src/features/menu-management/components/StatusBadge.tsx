import { ChevronDown } from 'lucide-react'
import { Dropdown } from '@tcmms/flock-ds'
import type { ItemStatus } from '../types/catalog'

const STATUS_CONFIG: Record<ItemStatus, { bg: string; color: string; label: string }> = {
  active:            { bg: '#d8f0db',           color: '#08af3b',             label: 'Active' },
  inactive:          { bg: '#f2f2f2',            color: 'rgba(0,0,0,0.88)',    label: 'Inactive' },
  rejected:          { bg: '#fff2f0',            color: '#E31D1C',             label: 'Rejected' },
  archived:          { bg: 'rgba(0,0,0,0.45)',   color: '#ffffff',             label: 'Archived' },
  awaiting_approval: { bg: '#fff9e6',            color: '#f90',                label: 'Approval' },
  draft:             { bg: '#b9b9b9',            color: '#ffffff',             label: 'Draft' },
}

const STATUS_MENU_ITEMS = (['active', 'inactive'] as ItemStatus[]).map(key => ({
  key,
  label: STATUS_CONFIG[key].label,
}))

// Active/Inactive → Dropdown + ChevronDown
// Rejected        → Dropdown + ArrowRight
// Others          → static span, no icon, no interaction
type BadgeVariant = 'select' | 'static'

const BADGE_VARIANT: Record<ItemStatus, BadgeVariant> = {
  active:            'select',
  inactive:          'select',
  rejected:          'static',
  archived:          'static',
  awaiting_approval: 'static',
  draft:             'static',
}

interface StatusBadgeProps {
  status: ItemStatus
  onChange?: (status: ItemStatus) => void
}

export function StatusBadge({ status, onChange }: StatusBadgeProps) {
  const { bg, color, label } = STATUS_CONFIG[status]
  const variant = BADGE_VARIANT[status]

  const baseStyle: React.CSSProperties = {
    backgroundColor: bg,
    color,
    borderRadius: 16,
    padding: '1px 8px',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: '16px',
    border: 'none',
  }

  if (variant === 'static') {
    return (
      <span
        className="inline-flex items-center shrink-0 select-none"
        style={{ ...baseStyle, cursor: 'default' }}
      >
        {label}
      </span>
    )
  }

  return (
    <Dropdown
      menu={{
        items: STATUS_MENU_ITEMS,
        onClick: ({ key }) => onChange?.(key as ItemStatus),
      }}
      trigger={['click']}
    >
      <button
        className="flex items-center gap-1 cursor-pointer select-none shrink-0 transition-[filter] hover:brightness-90"
        style={baseStyle}
      >
        {label}
        {variant === 'select' && <ChevronDown size={14} color={color} />}
      </button>
    </Dropdown>
  )
}
