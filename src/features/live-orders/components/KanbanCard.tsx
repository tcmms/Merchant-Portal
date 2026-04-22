import { useState } from 'react'
import { Button, CustomerTierBadge, Dropdown, Tag } from '@tcmms/flock-ds'
import { Info, AlertTriangle, Truck, CircleCheck, Calendar, MoreHorizontal } from 'lucide-react'
import type { Order } from '../types'
import { useClock, getSla, getPrepCommitment } from './kanbanHelpers'
import { formatPickupTime, pickupUrgencyColor } from '../utils/formatPickupTime'

export interface KanbanCardProps {
  order: Order
  onAction?: () => void
  onReject?: () => void
  onClick?: () => void
  compact?: boolean
  draggable?: boolean
  urgent?: boolean
}

export function KanbanCard({ order, onAction, onReject, onClick, compact = false, draggable = true, urgent = false }: KanbanCardProps) {
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
  if (compact || isReady || isInDelivery) return <ReadyCard order={order} onClick={onClick} onAction={onAction} draggable={draggable} />

  const sla = getSla(order, now)
  const late = isPreparing && sla?.isLate === true
  const prepCommit = getPrepCommitment(order, now)

  return (
    <CardShell
      onClick={onClick}
      late={late || isScheduledOverdueCard}
      urgent={urgent}
      scheduledDue={isScheduledDue}
      draggable={draggable}
      orderId={order.id}
    >
      <div className="flex items-center justify-between mb-1 gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0" style={{ flex: '1 1 auto' }}>
          <OrderIdMeta order={order} />
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
              color: 'var(--flock-color-text-secondary)',
            }}
          >
            <ItemCountSummary order={order} />
          </span>
        </div>
        {isScheduledIncoming || isScheduledStatus
          ? <ScheduledPill pickup={order.pickupTime!} />
          : isNew
            ? <SlaPill kind="commit" minutes={prepCommit} />
            : isPreparing && sla
              ? <SlaPill kind={sla.isLate ? 'late' : 'left'} minutes={Math.abs(sla.minutes)} />
              : null}
      </div>

      <div className="flex items-center gap-2 mb-2 min-w-0">
        <span
          className="font-bold"
          style={{
            fontSize: 18,
            lineHeight: '24px',
            color: 'var(--flock-color-text)',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
            flex: '0 1 auto',
          }}
        >
          {formatCustomerName(order.customer.name)}
        </span>
        {(order.customer.tier !== 'standard' || order.isFirstOrder) && (
          <span className="flex items-center gap-1 shrink-0 flex-wrap">
            {order.customer.tier !== 'standard' && <CustomerTierBadge tier={order.customer.tier} />}
            {order.isFirstOrder && <Tag color="success" bordered={false} closeIcon={false} style={{ margin: 0 }}>First Order</Tag>}
          </span>
        )}
      </div>

      <ItemsList order={order} />

      {isPreparing && order.driver && (
        <DriverRow order={order} />
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
          size="middle"
          onClick={(e) => { e.stopPropagation(); onClick?.() }}
        >
          Order Details
        </Button>
        {isNew && (
          <Button
            type="primary"
            size="middle"
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
              size="middle"
              aria-label="More actions"
              icon={<MoreHorizontal size={14} />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        )}
        {isScheduledStatus && (
          <Button
            type="primary"
            size="middle"
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
            size="middle"
            onClick={(e) => { e.stopPropagation(); onAction?.() }}
          >
            Mark Ready
          </Button>
        )}
      </div>
    </CardShell>
  )
}

function OrderIdMeta({ order }: { order: Order }) {
  return (
    <span
      style={{
        fontSize: 13,
        lineHeight: '20px',
        color: 'var(--flock-color-text-secondary)',
      }}
    >
      #{order.orderNumber}
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
    <ul className="mb-2" style={{ listStyle: 'none', padding: 0, margin: '0 0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {visible.map((i) => (
        <li
          key={i.id}
          style={{
            fontSize: 14,
            lineHeight: '20px',
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
        <li style={{ fontSize: 13, lineHeight: '18px', color: 'var(--flock-color-text-secondary)' }}>
          +{extra} more
        </li>
      )}
    </ul>
  )
}

function DriverRow({ order }: { order: Order }) {
  if (!order.driver) return null
  const label =
    order.driver.status === 'arrived'
      ? `${order.driver.name} · arrived`
      : order.driver.status === 'picking_up'
      ? `${order.driver.name} · picking up`
      : `${order.driver.name} · en route`
  return (
    <div
      className="flex items-center gap-1.5 mb-2"
      style={{
        color: 'var(--flock-color-text-secondary)',
        fontSize: 13,
        lineHeight: '20px',
      }}
    >
      <Truck size={14} />
      <span>{label}</span>
    </div>
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
  draggable = false,
  orderId,
  children,
}: {
  onClick?: () => void
  late?: boolean
  urgent?: boolean
  scheduledDue?: boolean
  draggable?: boolean
  orderId?: string
  children: React.ReactNode
}) {
  const [isHovered, setIsHovered] = useState(false)

  const borderColor = late
    ? 'var(--flock-color-error)'
    : urgent || scheduledDue
      ? 'var(--flock-color-volcano, #fa541c)'
      : isHovered
        ? 'var(--flock-color-border)'
        : 'var(--flock-color-border-secondary)'
  const baseShadow = late
    ? '0 0 0 2px var(--flock-color-error-bg)'
    : urgent || scheduledDue
      ? '0 0 0 2px rgba(250, 84, 28, 0.16)'
      : '0 1px 2px rgba(0,0,0,0.04)'
  const hoverLift = '0 8px 20px rgba(0,0,0,0.10)'
  const shadow = isHovered ? `${baseShadow}, ${hoverLift}` : baseShadow
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={draggable}
      onDragStart={(e) => {
        setIsHovered(false)
        if (!orderId) return
        e.dataTransfer.setData('text/plain', orderId)
        e.dataTransfer.effectAllowed = 'move'
      }}
      className="w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2"
      style={{
        display: 'block',
        padding: '12px',
        background: 'var(--flock-color-bg-container)',
        border: `1px solid ${borderColor}`,
        boxShadow: shadow,
        borderRadius: 'var(--flock-radius-lg)',
        outlineColor: 'var(--flock-color-primary)',
        transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease',
      }}
    >
      {children}
    </div>
  )
}

function ReadyCard({ order, onClick, onAction, draggable = false }: { order: Order; onClick?: () => void; onAction?: () => void; draggable?: boolean }) {
  const isOwn = order.deliveryMode === 'own'
  const isInDelivery = order.status === 'in_delivery'
  const driverLabel = isOwn
    ? isInDelivery
      ? 'Own courier · delivering'
      : 'Own delivery · ready for pickup'
    : order.driver
      ? order.driver.status === 'arrived'
        ? 'Courier arrived'
        : order.driver.status === 'picking_up'
        ? 'Courier picking up'
        : `${order.driver.name} · on route`
      : 'Looking for courier'
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
    <CardShell onClick={onClick} draggable={draggable} orderId={order.id}>
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
      <div
        className="flex items-center gap-1.5"
        style={{
          color: 'var(--flock-color-text-secondary)',
          fontSize: 14,
          lineHeight: '20px',
        }}
      >
        <Truck size={14} />
        <span>{driverLabel}</span>
      </div>
      {isOwn && onAction && (
        <div className="flex justify-end mt-2">
          <Button
            type="primary"
            size="middle"
            onClick={(e) => { e.stopPropagation(); onAction() }}
          >
            {isInDelivery ? 'Delivered' : 'Picked Up'}
          </Button>
        </div>
      )}
    </CardShell>
  )
}

