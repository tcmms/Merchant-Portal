import { useState } from 'react'
import { Button, CustomerTierBadge, Dropdown, Tag } from '@tcmms/flock-ds'
import { Info, AlertTriangle, Truck, CircleCheck, Calendar, MoreHorizontal, Loader2, Navigation, Clock, XCircle, ShoppingBag } from 'lucide-react'
import type { Order, DriverStatus } from '../types'
import { useClock, getSla, getPrepCommitment } from './kanbanHelpers'
import { formatPickupTime, pickupUrgencyColor } from '../utils/formatPickupTime'

export interface KanbanCardProps {
  order: Order
  onAction?: () => void
  onReject?: () => void
  onDismiss?: () => void
  onClick?: () => void
  compact?: boolean
  draggable?: boolean
  urgent?: boolean
}

export function KanbanCard({ order, onAction, onReject, onDismiss, onClick, compact = false, draggable = true, urgent = false }: KanbanCardProps) {
  const now = useClock(1000)
  const isReady = order.status === 'ready_for_pickup'
  const isPreparing = order.status === 'preparing' || order.status === 'looking_for_driver'
  const isNew = order.status === 'needs_action'
  const isScheduledStatus = order.status === 'scheduled'
  const hasPickupTime = order.pickupTime != null
  const minutesToPickup = hasPickupTime
    ? (order.pickupTime!.getTime() - now) / 60000
    : null
  const isScheduledIncoming = isNew && hasPickupTime && (minutesToPickup ?? 0) >= 30
  const isScheduledDue = isScheduledStatus && minutesToPickup != null && minutesToPickup <= 30 && minutesToPickup >= 0
  const isScheduledOverdueCard = isScheduledStatus && minutesToPickup != null && minutesToPickup < 0
  const showBlueAccept = isScheduledIncoming // blue for "accept future order"
  const showBlueStartPrep = isScheduledStatus && !isScheduledDue && !isScheduledOverdueCard // blue for "early start"

  const isInDelivery = order.status === 'in_delivery'
  const isCancelled = order.status === 'cancelled'
  const isCustomerCancelled = isCancelled && order.cancelledBy === 'customer'
  const isTakeaway = !order.isDelivery
  if (compact || isReady || isInDelivery) return <ReadyCard order={order} onClick={onClick} onAction={onAction} draggable={draggable} />

  const sla = getSla(order, now)
  const late = !isCancelled && isPreparing && sla?.isLate === true
  const prepCommit = getPrepCommitment(order, now)

  return (
    <CardShell
      onClick={onClick}
      late={late || isScheduledOverdueCard}
      urgent={urgent && !isCancelled}
      scheduledDue={isScheduledDue && !isCancelled}
      premiumPriority={order.isPremiumPriority && !isCancelled}
      draggable={draggable && !isCancelled}
      orderId={order.id}
    >
      <div className="flex items-center justify-between mb-1 gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0" style={{ flex: '1 1 auto' }}>
          <OrderIdMeta order={order} strikethrough={isCustomerCancelled} />
          <span
            style={{
              color: 'var(--flock-color-text-quaternary)',
              fontSize: 13,
              lineHeight: '20px',
            }}
          >
            ·
          </span>
          <span
            className="truncate"
            style={{
              fontSize: 13,
              lineHeight: '20px',
              color: isCustomerCancelled ? 'var(--flock-color-text-tertiary)' : 'var(--flock-color-text)',
              textDecoration: isCustomerCancelled ? 'line-through' : 'none',
            }}
          >
            <ItemCountSummary order={order} />
          </span>
        </div>
        {isCancelled
          ? <CancelledOrderPill />
          : isScheduledIncoming || isScheduledStatus
            ? <ScheduledPill pickup={order.pickupTime!} />
            : isNew
              ? <SlaPill kind="commit" minutes={prepCommit} />
              : isPreparing && sla
                ? <SlaPill kind={sla.isLate ? 'late' : 'left'} minutes={Math.abs(sla.minutes)} />
                : null}
      </div>

      <div className="flex items-center gap-2 mb-3 min-w-0">
        <span
          className="font-bold"
          style={{
            fontSize: 22,
            lineHeight: '30px',
            color: isCustomerCancelled ? 'var(--flock-color-text-tertiary)' : 'var(--flock-color-text)',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
            flex: '0 1 auto',
            textDecoration: isCustomerCancelled ? 'line-through' : 'none',
            textDecorationThickness: isCustomerCancelled ? '2px' : undefined,
          }}
        >
          {formatCustomerName(order.customer.name)}
        </span>
        {(order.customer.tier !== 'standard' || order.isFirstOrder || isTakeaway) && (
          <span className="flex items-center gap-1 shrink-0 flex-wrap">
            {order.customer.tier !== 'standard' && <CustomerTierBadge tier={order.customer.tier} />}
            {order.isFirstOrder && (
              <span style={{ display: 'inline-flex', margin: 0 }}>
                <Tag color="success" bordered={false} closeIcon={false}>First Order</Tag>
              </span>
            )}
            {isTakeaway && <TakeawayTag />}
          </span>
        )}
      </div>

      <ItemsList order={order} />

      {!isCancelled && (isTakeaway
        ? ((isNew || isPreparing) && (
            <div className="mb-2">
              <CustomerOnRoutePill />
            </div>
          ))
        : order.driver && (
            <div className="mb-2">
              <DriverStatusBadge status={order.driver.status} />
            </div>
          )
      )}

      {late && (
        <div
          className="flex items-center gap-1.5 mb-2"
          style={{ color: 'var(--flock-color-error)', fontSize: 14, lineHeight: '20px', fontWeight: 'var(--flock-font-weight-medium)' }}
        >
          <AlertTriangle size={14} />
          <span>Courier waiting · notify runner</span>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          size="large"
          onClick={(e) => { e.stopPropagation(); onClick?.() }}
        >
          Order Details
        </Button>
        {isCancelled && (
          <Button
            size="large"
            onClick={(e) => { e.stopPropagation(); onDismiss?.() }}
            style={{
              background: 'var(--flock-color-fill-quaternary, #f6f6f6)',
              borderColor: 'var(--flock-color-fill-quaternary, #f6f6f6)',
            }}
          >
            Dismiss
          </Button>
        )}
        {isNew && !isCancelled && (
          <Button
            type="primary"
            size="large"
            onClick={(e) => { e.stopPropagation(); onAction?.() }}
            style={
              showBlueAccept
                ? { background: 'var(--flock-color-info)', borderColor: 'var(--flock-color-info)' }
                : undefined
            }
          >
            Accept{!isScheduledIncoming && prepCommit != null && <span style={{ opacity: 0.85, marginLeft: 6 }}>· {prepCommit}m</span>}
          </Button>
        )}
        {isNew && isScheduledIncoming && onReject && (
          <Dropdown
            menu={{
              items: [
                { key: 'reject', label: 'Reject Order', danger: true },
              ],
              onClick: ({ key, domEvent }) => {
                domEvent.stopPropagation()
                if (key === 'reject') onReject()
              },
            }}
            trigger={['click']}
          >
            <Button
              size="large"
              aria-label="More actions"
              icon={<MoreHorizontal size={16} />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        )}
        {isScheduledStatus && (
          <Button
            type="primary"
            size="large"
            onClick={(e) => { e.stopPropagation(); onAction?.() }}
            style={
              showBlueStartPrep
                ? { background: 'var(--flock-color-info)', borderColor: 'var(--flock-color-info)' }
                : undefined
            }
          >
            {isScheduledDue || isScheduledOverdueCard ? 'Start Now' : 'Start Preparation'}
          </Button>
        )}
        {isPreparing && (
          <Button
            type="primary"
            size="large"
            onClick={(e) => { e.stopPropagation(); onAction?.() }}
          >
            Mark Ready
          </Button>
        )}
      </div>
    </CardShell>
  )
}

function OrderIdMeta({ order, strikethrough = false }: { order: Order; strikethrough?: boolean }) {
  return (
    <span
      style={{
        fontSize: 13,
        lineHeight: '20px',
        color: strikethrough ? 'var(--flock-color-text-tertiary)' : 'var(--flock-color-text)',
        textDecoration: strikethrough ? 'line-through' : 'none',
      }}
    >
      #{order.orderNumber}
    </span>
  )
}

function CancelledOrderPill() {
  return (
    <span
      className="flex items-center gap-1 shrink-0"
      style={{
        background: 'var(--flock-color-error-bg)',
        color: 'var(--flock-color-error)',
        padding: '2px 10px',
        borderRadius: 'var(--flock-radius-xl)',
        fontSize: 14,
        fontWeight: 'var(--flock-font-weight-semibold)',
        lineHeight: '20px',
      }}
    >
      <XCircle size={14} />
      Cancelled Order
    </span>
  )
}

function ItemCountSummary({ order }: { order: Order }) {
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
  return (
    <>
      {itemCount} {itemCount === 1 ? 'item' : 'items'}
      <span style={{ margin: '0 4px', color: 'var(--flock-color-text-quaternary)' }}>·</span>
      QR {order.total.toFixed(1)}
    </>
  )
}

function formatCustomerName(full: string): string {
  const [first, ...rest] = full.trim().split(/\s+/)
  if (!rest.length) return first
  const initial = rest[rest.length - 1][0]?.toUpperCase() ?? ''
  return initial ? `${first} ${initial}.` : first
}

function ItemsList({ order }: { order: Order }) {
  const visible = order.items.slice(0, 2)
  const extra = order.items.length - visible.length
  return (
    <ul className="mb-3" style={{ listStyle: 'none', padding: 0, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {visible.map((i) => (
        <li
          key={i.id}
          style={{
            fontSize: 15,
            lineHeight: '22px',
            color: 'var(--flock-color-text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontWeight: 'var(--flock-font-weight-semibold)', marginRight: 6 }}>
            {i.quantity}×
          </span>
          {i.name}
        </li>
      ))}
      {extra > 0 && (
        <li style={{ fontSize: 13, lineHeight: '18px', color: 'var(--flock-color-text)' }}>
          +{extra} more
        </li>
      )}
    </ul>
  )
}

function TakeawayTag() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 'var(--flock-radius-full)',
        background: 'var(--flock-color-info-bg)',
        color: 'var(--flock-color-info)',
        fontSize: 13,
        fontWeight: 'var(--flock-font-weight-medium)',
        lineHeight: '18px',
      }}
    >
      <ShoppingBag size={11} />
      Takeaway
    </span>
  )
}

function CustomerOnRoutePill() {
  return (
    <span
      className="inline-flex items-center gap-1 shrink-0"
      style={{
        background: 'var(--flock-color-info-bg)',
        color: 'var(--flock-color-info)',
        padding: '2px 8px',
        borderRadius: 16,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '16px',
        whiteSpace: 'nowrap',
      }}
    >
      <Navigation size={12} />
      Customer on route
    </span>
  )
}

function DriverStatusBadge({ status }: { status: DriverStatus }) {
  const configs: Record<DriverStatus, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
    looking:          { bg: '#fff4ed', color: '#fa541c', label: 'Looking for driver',  icon: <Loader2 size={12} className="animate-spin" /> },
    on_route:         { bg: '#f0f5ff', color: '#2f54eb', label: 'Driver on Route',     icon: <Navigation size={12} /> },
    nearby:           { bg: '#fcf0ff', color: '#9a36d9', label: 'Driver Nearby',        icon: <Info size={12} /> },
    waiting:          { bg: '#fff2f0', color: '#ff5558', label: 'Driver is Waiting',    icon: <Clock size={12} /> },
    arrived:          { bg: '#f6f6f6', color: 'rgba(0,0,0,0.88)', label: 'Ready to Pick Up', icon: <CircleCheck size={12} /> },
    picking_up:       { bg: '#f6f6f6', color: 'rgba(0,0,0,0.88)', label: 'Picked Up',   icon: <CircleCheck size={12} /> },
    customer_near:    { bg: '#e6f7ff', color: '#0a84ff', label: 'Near Customer',        icon: <Navigation size={12} /> },
    customer_arrived: { bg: '#f4f0ff', color: '#5c44f0', label: 'At Customer',          icon: <CircleCheck size={12} /> },
  }
  const { bg, color, label, icon } = configs[status]
  return (
    <span
      className="inline-flex items-center gap-1 shrink-0"
      style={{
        background: bg,
        color,
        padding: '2px 8px',
        borderRadius: 16,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '16px',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </span>
  )
}

function ScheduledPill({ pickup }: { pickup: Date }) {
  const { time, relative, urgency } = formatPickupTime(pickup)
  const fg = pickupUrgencyColor[urgency]
  const bg = urgency === 'future'
    ? 'var(--flock-color-info-bg)'
    : urgency === 'soon'
      ? 'var(--flock-color-volcano-bg)'
      : 'var(--flock-color-error-bg)'
  return (
    <span
      className="flex items-center gap-1.5 shrink-0"
      style={{
        background: bg,
        color: fg,
        padding: '2px 10px',
        borderRadius: 'var(--flock-radius-xl)',
        fontSize: 14,
        fontWeight: 'var(--flock-font-weight-semibold)',
        lineHeight: '20px',
      }}
    >
      <Calendar size={14} />
      <span>{time}</span>
      <span style={{ opacity: 0.65, fontWeight: 500 }}>· {relative}</span>
    </span>
  )
}

function SlaPill({ kind, minutes }: { kind: 'commit' | 'left' | 'late'; minutes: number | null }) {
  if (minutes == null) return null
  const palette =
    kind === 'late'
      ? { bg: 'var(--flock-color-error-bg)', fg: 'var(--flock-color-error)' }
      : kind === 'left' && minutes <= 3
      ? { bg: 'var(--flock-color-warning-bg)', fg: 'var(--flock-color-warning)' }
      : { bg: 'var(--flock-color-volcano-bg)', fg: 'var(--flock-color-volcano)' }

  const text = kind === 'late' ? `${minutes}m late` : kind === 'left' ? `${minutes}m left` : `${minutes}m prep`

  return (
    <span
      className="flex items-center gap-1 shrink-0"
      style={{
        background: palette.bg,
        color: palette.fg,
        padding: '2px 10px',
        borderRadius: 'var(--flock-radius-xl)',
        fontSize: 14,
        fontWeight: 'var(--flock-font-weight-semibold)',
        lineHeight: '20px',
      }}
    >
      {kind === 'late' ? <AlertTriangle size={14} /> : <Info size={14} />}
      {text}
    </span>
  )
}

function CardShell({
  onClick,
  late = false,
  urgent = false,
  scheduledDue = false,
  premiumPriority = false,
  draggable = false,
  orderId,
  children,
}: {
  onClick?: () => void
  late?: boolean
  urgent?: boolean
  scheduledDue?: boolean
  premiumPriority?: boolean
  draggable?: boolean
  orderId?: string
  children: React.ReactNode
}) {
  const [isHovered, setIsHovered] = useState(false)

  const borderColor = late
    ? 'var(--flock-color-error)'
    : urgent || scheduledDue
      ? 'var(--flock-color-volcano, #fa541c)'
      : 'var(--flock-color-border)'
  const baseShadow = late
    ? '0 0 0 2px var(--flock-color-error-bg)'
    : urgent || scheduledDue
      ? '0 0 0 2px rgba(250, 84, 28, 0.16)'
      : '0 1px 2px rgba(0,0,0,0.04)'
  const hoverLift = '0 8px 20px rgba(0,0,0,0.10)'
  const shadow = isHovered ? `${baseShadow}, ${hoverLift}` : baseShadow

  const interactionProps = {
    role: 'button' as const,
    tabIndex: 0,
    onClick,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() }
    },
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    draggable,
    onDragStart: (e: React.DragEvent) => {
      setIsHovered(false)
      if (!orderId) return
      e.dataTransfer.setData('text/plain', orderId)
      e.dataTransfer.effectAllowed = 'move'
    },
  }

  const frameStyle: React.CSSProperties = {
    background: 'var(--flock-color-bg-container)',
    border: `1px solid ${borderColor}`,
    boxShadow: shadow,
    borderRadius: 'var(--flock-radius-lg)',
    outlineColor: 'var(--flock-color-primary)',
    transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
    transition: 'box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease',
    // Cards sit in a flex-column container with overflow-y: auto. Without this they
    // shrink proportionally when combined height exceeds the column (most visible when
    // a new card spawns at the top). flex-shrink: 0 keeps each card at its natural
    // "hug content" height and defers scrolling to the parent.
    flexShrink: 0,
  }

  // Premium-priority cards get a left-side vertical strip. Everything else uses the
  // original block layout so the Ready/In Delivery islands stay untouched.
  if (premiumPriority) {
    return (
      <div
        {...interactionProps}
        className="w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 overflow-hidden"
        style={{ ...frameStyle, display: 'flex', alignItems: 'stretch' }}
      >
        <PremiumPriorityStrip />
        <div style={{ flex: 1, padding: '16px', minWidth: 0 }}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      {...interactionProps}
      className="w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2"
      style={{ ...frameStyle, display: 'block', padding: '16px' }}
    >
      {children}
    </div>
  )
}

function PremiumPriorityStrip() {
  return (
    <div
      aria-label="Premium Priority"
      style={{
        flexShrink: 0,
        width: 28,
        background: '#e8f3c5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          color: '#66a81d',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        Priority
      </span>
    </div>
  )
}

function ReadyCard({ order, onClick, onAction, draggable = false }: { order: Order; onClick?: () => void; onAction?: () => void; draggable?: boolean }) {
  const isOwn = order.deliveryMode === 'own'
  const isInDelivery = order.status === 'in_delivery'
  const isTakeaway = !order.isDelivery

  const statusTagBg = isInDelivery
    ? 'var(--flock-color-info-bg)'
    : order.driver?.status === 'arrived'
      ? 'var(--flock-color-success-bg)'
      : 'var(--flock-color-bg-layout)'
  const statusTagColor = isInDelivery
    ? 'var(--flock-color-info)'
    : order.driver?.status === 'arrived'
      ? 'var(--flock-color-success)'
      : 'var(--flock-color-text)'
  const statusTagLabel = isInDelivery ? 'In Delivery' : 'Ready'

  return (
    <CardShell
      onClick={onClick}
      draggable={draggable}
      orderId={order.id}
      premiumPriority={order.isPremiumPriority}
    >
      <div className="flex items-center justify-between mb-1">
        <OrderIdMeta order={order} />
        <span
          className="inline-flex items-center gap-1"
          style={{
            background: statusTagBg,
            color: statusTagColor,
            padding: '2px 10px',
            borderRadius: 'var(--flock-radius-xl)',
            fontSize: 14,
            lineHeight: '20px',
            fontWeight: 'var(--flock-font-weight-semibold)',
          }}
        >
          <CircleCheck size={14} />
          {statusTagLabel}
        </span>
      </div>
      <div
        className="font-bold mb-1"
        style={{
          fontSize: 20,
          lineHeight: '26px',
          color: 'var(--flock-color-text)',
          letterSpacing: '-0.01em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {formatCustomerName(order.customer.name)}
      </div>
      {isTakeaway ? (
        <div
          className="flex items-center gap-1.5"
          style={{
            color: 'var(--flock-color-text)',
            fontSize: 14,
            lineHeight: '20px',
          }}
        >
          <ShoppingBag size={14} />
          <span>Takeaway · waiting for customer</span>
        </div>
      ) : isOwn ? (
        <div
          className="flex items-center gap-1.5"
          style={{
            color: 'var(--flock-color-text)',
            fontSize: 14,
            lineHeight: '20px',
          }}
        >
          <Truck size={14} />
          <span>{isInDelivery ? 'Own courier · delivering' : 'Own delivery · ready for pickup'}</span>
        </div>
      ) : order.driver ? (
        <div className="flex items-center gap-2 flex-wrap">
          <DriverStatusBadge status={order.driver.status} />
          {order.driver.name && (
            <span
              style={{
                fontSize: 14,
                lineHeight: '20px',
                color: 'var(--flock-color-text)',
              }}
            >
              {order.driver.name}
            </span>
          )}
        </div>
      ) : (
        <DriverStatusBadge status="looking" />
      )}
      {(isOwn || isTakeaway) && onAction && (
        <div className="flex justify-end mt-3">
          <Button
            type="primary"
            size="large"
            onClick={(e) => { e.stopPropagation(); onAction() }}
          >
            {isInDelivery ? 'Delivered' : 'Picked Up'}
          </Button>
        </div>
      )}
    </CardShell>
  )
}

