import { Button, Icon, CustomerTierBadge } from '@tcmms/flock-ds'
import type { Order, OrderStatus, TabId } from '../types'

export interface OrderCardProps {
  order: Order
  isSelected: boolean
  activeTab: TabId
  onClick: () => void
  onAction?: () => void
  cardRef?: (el: HTMLButtonElement | null) => void
}

const actionLabel: Partial<Record<TabId, string>> = {
  needs_action: 'Accept',
  preparing: 'Ready',
}

export function OrderCard({ order, isSelected, activeTab, onClick, onAction, cardRef }: OrderCardProps) {
  const isCancelled = order.status === 'cancelled'
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
  const actionText = actionLabel[activeTab]
  const showAction = actionText && !isCancelled

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      className="w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
      style={{
        display: 'block',
        opacity: isCancelled ? 0.45 : 1,
        padding: '16px',
        background: isSelected
          ? 'var(--flock-color-fill-tertiary)'
          : 'var(--flock-color-bg-container)',
        borderBottom: '1px solid var(--flock-color-border-secondary)',
        outlineColor: 'var(--flock-color-primary)',
        transition: 'background 0.15s',
      }}
      aria-selected={isSelected}
    >
      {/* Row 1: item count + total (left) | driver status badge (right) */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-sm"
          style={{ color: 'var(--flock-color-text-secondary)' }}
        >
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
          <span style={{ margin: '0 4px', color: 'var(--flock-color-text-quaternary)' }}>·</span>
          QR {order.total.toFixed(1)}
        </span>
        <DriverStatusBadge status={order.status} />
      </div>

      {/* Row 2: order number (large) */}
      <div
        className="mb-3 font-bold"
        style={{
          fontSize: 'var(--flock-font-size-xl)',
          lineHeight: 'var(--flock-line-height-xl)',
          color: 'var(--flock-color-text)',
          letterSpacing: '-0.01em',
        }}
      >
        #{order.orderNumber}
      </div>

      {/* Row 3: tier + first order badges */}
      {(order.customer.tier !== 'standard' || order.isFirstOrder) && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {order.customer.tier !== 'standard' && (
            <CustomerTierBadge tier={order.customer.tier} />
          )}
          {order.isFirstOrder && <FirstOrderBadge />}
        </div>
      )}

      {/* Row 4: accept / ready button (right-aligned) */}
      {showAction && (
        <div className="flex justify-end">
          <Button
            type="primary"
            size="middle"
            onClick={(e) => { e.stopPropagation(); onAction?.() }}
          >
            {actionText}
          </Button>
        </div>
      )}
    </button>
  )
}

// ─── Internal sub-components ─────────────────────────────────────────────────

const statusConfig: Record<OrderStatus, { label: string; bg: string; color: string; spinner?: boolean }> = {
  needs_action: {
    label: 'Needs action',
    bg: 'var(--flock-color-primary-bg)',
    color: 'var(--flock-color-primary)',
  },
  looking_for_driver: {
    label: 'Looking for driver',
    bg: 'var(--flock-color-volcano-bg)',
    color: 'var(--flock-color-volcano)',
    spinner: true,
  },
  preparing: {
    label: 'Preparing',
    bg: 'var(--flock-color-info-bg)',
    color: 'var(--flock-color-info)',
  },
  ready_for_pickup: {
    label: 'Ready to pick up',
    bg: 'var(--flock-color-success-bg)',
    color: 'var(--flock-color-success)',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'var(--flock-color-error-bg)',
    color: 'var(--flock-color-error)',
  },
}

function DriverStatusBadge({ status }: { status: OrderStatus }) {
  const { label, bg, color, spinner } = statusConfig[status]

  return (
    <span
      className="flex items-center gap-1 shrink-0"
      style={{
        background: bg,
        color,
        padding: '1px 8px',
        borderRadius: 'var(--flock-radius-xl)',
        fontSize: 'var(--flock-font-size-sm)',
        fontWeight: 'var(--flock-font-weight-medium)',
        lineHeight: 'var(--flock-line-height-sm)',
      }}
    >
      {spinner && (
        <Icon
          name="InterfaceEssentialLoadingCircle1Icon"
          size={12}
          className="animate-spin"
          style={{ color }}
        />
      )}
      {label}
    </span>
  )
}

function FirstOrderBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 8px',
        borderRadius: 'var(--flock-radius-full)',
        background: 'rgba(0,0,0,0.04)',
        color: 'var(--flock-color-text)',
        fontSize: 'var(--flock-font-size-sm)',
        fontWeight: 'var(--flock-font-weight-medium)',
        lineHeight: 'var(--flock-line-height-sm)',
        fontFamily: 'var(--flock-font-family)',
      }}
    >
      First Order
    </span>
  )
}
