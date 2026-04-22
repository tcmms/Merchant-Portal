import { useState } from 'react'
import { ConfigProvider } from 'antd'
import { Button, Tag, Empty, CustomerTierBadge, Steps } from '@tcmms/flock-ds'
import { toast } from '../utils/toast'
import { Printer, Copy, MessageSquare, Pencil, Plus, Truck, ShoppingBag, Package, AlertTriangle, User, Phone, MapPin, Clock, Banknote, CreditCard, Wifi, Barcode, Calendar } from 'lucide-react'
import type { Order, DriverStatus, PaymentMethod } from '../types'
import { OutOfStockFlow } from './OutOfStockFlow'
import { formatPickupTime, pickupUrgencyColor } from '../utils/formatPickupTime'

interface OrderDetailProps {
  order: Order | null
  isActioning?: boolean
  onAction?: () => void
  onCancelOrder?: () => void
  oosItemIds?: ReadonlySet<string>
  onMarkOutOfStock?: (itemIds: string[]) => void
  showStepper?: boolean
}

function statusToStep(
  status: Order['status'],
  hasPickup: boolean,
): { current: number; error?: boolean } {
  if (hasPickup) {
    // Needs Action → Scheduled → Preparing → Ready
    switch (status) {
      case 'needs_action':
      case 'looking_for_driver': return { current: 0 }
      case 'scheduled':          return { current: 1 }
      case 'preparing':          return { current: 2 }
      case 'ready_for_pickup':
      case 'in_delivery':        return { current: 3 }
      case 'cancelled':          return { current: 0, error: true }
    }
  }
  switch (status) {
    case 'needs_action':
    case 'looking_for_driver': return { current: 0 }
    case 'scheduled':          return { current: 0 }
    case 'preparing':          return { current: 1 }
    case 'ready_for_pickup':
    case 'in_delivery':        return { current: 2 }
    case 'cancelled':          return { current: 0, error: true }
  }
}

interface PrimaryActionConfig {
  label: string
  blue?: boolean
}

function getPrimaryAction(order: Order): PrimaryActionConfig | null {
  const now = Date.now()
  const minutesToPickup = order.pickupTime
    ? (order.pickupTime.getTime() - now) / 60000
    : null

  switch (order.status) {
    case 'needs_action': {
      const isScheduledIncoming = minutesToPickup != null && minutesToPickup >= 30
      return { label: 'Accept the Order', blue: isScheduledIncoming }
    }
    case 'scheduled': {
      const isDue = minutesToPickup != null && minutesToPickup <= 30
      return isDue
        ? { label: 'Start Now', blue: false }
        : { label: 'Start Preparation', blue: true }
    }
    case 'preparing':        return { label: 'Mark as Ready' }
    case 'ready_for_pickup': return { label: 'Complete Order' }
    default: return null
  }
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' }) +
    ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function OrderDetail({ order, isActioning = false, onAction, onCancelOrder, oosItemIds, onMarkOutOfStock, showStepper = true }: OrderDetailProps) {
  const [outOfStockOpen, setOutOfStockOpen] = useState(false)

  if (!order) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Empty description="Select an order to view details" />
      </div>
    )
  }

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
  const action = getPrimaryAction(order)
  const hasPickup = order.pickupTime != null
  const { current, error } = statusToStep(order.status, hasPickup)
  const canCancel = order.status === 'scheduled'

  function handlePrimaryAction() {
    onAction?.()
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: 'var(--flock-color-bg-container)' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="shrink-0" style={{ padding: '20px 20px 0', borderBottom: '1px solid var(--flock-color-split)' }}>

        {/* Row 1: order number (left) | action buttons (right) */}
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="min-w-0">
            <span className="font-bold" style={{ fontSize: 24, letterSpacing: '-0.5px', color: 'var(--flock-color-text)' }}>
              Order #{order.orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="middle"
              disabled={isActioning}
              icon={<Package size={14} />}
              onClick={() => setOutOfStockOpen(true)}
            >
              Out of Stock
            </Button>
            {canCancel && (
              <Button
                size="middle"
                danger
                disabled={isActioning}
                onClick={onCancelOrder}
              >
                Cancel Order
              </Button>
            )}
            {action && (
              <Button
                type="primary"
                size="middle"
                loading={isActioning}
                disabled={isActioning}
                onClick={handlePrimaryAction}
                style={
                  action.blue
                    ? { background: 'var(--flock-color-info)', borderColor: 'var(--flock-color-info)' }
                    : undefined
                }
              >
                {action.label}
              </Button>
            )}
          </div>
        </div>

        {/* Pickup block — only for scheduled orders (has pickupTime) */}
        {hasPickup && <PickupBlock pickup={order.pickupTime!} />}

        {/* Steps */}
        {showStepper && (
          <div className="pt-4 pb-5">
            <ConfigProvider theme={{ token: { colorTextDisabled: 'rgba(0,0,0,0.12)' } }}>
              <Steps
                size="small"
                current={current}
                status={error ? 'error' : undefined}
                items={hasPickup ? [
                  { title: <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>Needs Action</span> },
                  { title: <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>Scheduled</span> },
                  { title: <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>Preparing</span> },
                  { title: <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>Ready</span> },
                ] : [
                  { title: <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>Needs Action</span> },
                  { title: <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>Preparing</span> },
                  { title: <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>Ready</span> },
                ]}
              />
            </ConfigProvider>
          </div>
        )}
        {!showStepper && <div className="pb-5" />}

      </header>

      {/* ── Scrollable body ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* Meta: 2-column grid */}
        <section style={{ padding: '20px 20px', borderBottom: '1px solid var(--flock-color-split)' }}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {/* Left col */}
            <div className="flex items-center gap-2 flex-wrap">
              <MetaCell icon={<User size={14} />} text={order.customer.name} />
              {order.customer.tier !== 'standard' && <CustomerTierBadge tier={order.customer.tier} />}
              {order.isFirstOrder && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 10px',
                    borderRadius: 'var(--flock-radius-full)',
                    background: 'rgba(0,0,0,0.04)',
                    color: 'var(--flock-color-text)',
                    fontSize: 14,
                    fontWeight: 'var(--flock-font-weight-medium)',
                    lineHeight: '20px',
                    fontFamily: 'var(--flock-font-family)',
                  }}
                >
                  First Order
                </span>
              )}
            </div>
            <MetaCell
              icon={<Clock size={14} />}
              text={order.prepareByTime
                ? `${formatTime(order.prepareByTime)} · ${getMinutesLeft(order.prepareByTime)} min left`
                : formatDateTime(order.createdAt)
              }
              accent={!!order.prepareByTime}
            />
            <button
              className="flex items-center gap-2 text-sm w-fit"
              style={{ color: 'var(--flock-color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => { navigator.clipboard.writeText(order.customer.phone); toast.success('Phone copied') }}
            >
              <Phone size={14} style={{ color: 'var(--flock-color-text-tertiary)', flexShrink: 0 }} />
              {order.customer.phone}
              <Copy size={12} style={{ color: 'var(--flock-color-text-quaternary)' }} />
            </button>
            <MetaCell icon={<MapPin size={14} />} text={order.customer.address} />
          </div>

          {/* Driver row (full width if present) */}
          {order.driver && (
            <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--flock-color-split)' }}>
              <span className="text-sm" style={{ color: 'var(--flock-color-text-tertiary)' }}>Driver</span>
              <DriverStatusBadge status={order.driver.status} />
              <span className="text-sm font-medium" style={{ color: 'var(--flock-color-text)' }}>{order.driver.name}</span>
              <button
                className="flex items-center gap-1.5 text-sm ml-auto"
                style={{ color: 'var(--flock-color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => { navigator.clipboard.writeText(order.driver!.phone); toast.success('Phone copied') }}
              >
                {order.driver.phone}
                <Copy size={12} style={{ color: 'var(--flock-color-text-quaternary)' }} />
              </button>
            </div>
          )}
        </section>

        {/* Customer note */}
        {order.customerNote && (
          <section
            className="flex items-center gap-4"
            style={{ padding: '16px 20px', borderBottom: '1px solid var(--flock-color-split)', background: 'var(--flock-color-warning-bg)' }}
          >
            <MessageSquare size={20} style={{ color: 'var(--flock-color-warning)', flexShrink: 0 }} />
            <span className="text-sm" style={{ color: 'var(--flock-color-text)' }}>{order.customerNote}</span>
          </section>
        )}

        {/* Items */}
        <section style={{ padding: '16px 20px 0' }}>

          {/* Column headers */}
          <div
            className="flex items-center gap-4 mt-3 pb-2"
            style={{ borderBottom: '1px solid var(--flock-color-split)' }}
          >
            <span className="flex-1 text-sm font-medium" style={{ color: 'var(--flock-color-text-tertiary)' }}>Item</span>
            <span className="text-sm font-medium shrink-0" style={{ color: 'var(--flock-color-text-tertiary)', minWidth: 64, textAlign: 'right' }}>Price</span>
            <div style={{ width: 28, flexShrink: 0 }} />
          </div>

          {/* Items */}
          {order.items.map((item, idx) => {
            const isOos = oosItemIds?.has(item.id) ?? false
            const strike: React.CSSProperties = isOos
              ? { textDecoration: 'line-through', color: 'var(--flock-color-text-quaternary)' }
              : {}
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 py-3"
                style={{ borderBottom: idx < order.items.length - 1 ? '1px solid var(--flock-color-split)' : 'none' }}
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} className="rounded-xl object-cover shrink-0"
                    style={{ width: 52, height: 52, background: 'var(--flock-color-border-secondary)', opacity: isOos ? 0.5 : 1 }} />
                ) : (
                  <div className="rounded-xl flex items-center justify-center shrink-0"
                    style={{ width: 52, height: 52, background: 'var(--flock-color-border-secondary)', opacity: isOos ? 0.5 : 1 }}>
                    <Package size={18} style={{ color: 'var(--flock-color-text-quaternary)' }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className="mb-1"
                    style={{
                      fontSize: 'var(--flock-font-size-xl)',
                      fontWeight: 'var(--flock-font-weight-bold)',
                      color: isOos ? 'var(--flock-color-text-quaternary)' : 'var(--flock-color-text)',
                      textDecoration: isOos ? 'line-through' : 'none',
                    }}
                  >
                    {item.quantity} × {item.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--flock-color-text-quaternary)', ...strike }}>
                    <Barcode size={11} />
                    {item.barcode}
                  </div>
                </div>
                <div className="text-right shrink-0" style={{ minWidth: 64 }}>
                  <div
                    style={{
                      fontSize: 'var(--flock-font-size-xl)',
                      fontWeight: 'var(--flock-font-weight-bold)',
                      color: isOos ? 'var(--flock-color-text-quaternary)' : 'var(--flock-color-text)',
                      textDecoration: isOos ? 'line-through' : 'none',
                    }}
                  >
                    QR {item.totalPrice.toFixed(2)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--flock-color-text-tertiary)', ...strike }}>
                    {item.quantity} × QR {item.unitPrice.toFixed(0)}
                  </div>
                </div>
                <Button type="text" size="small" aria-label="Edit item" icon={<Pencil size={13} />}
                  style={{ color: 'var(--flock-color-text-quaternary)', flexShrink: 0 }} />
              </div>
            )
          })}

          <div style={{ padding: '12px 0 16px' }}>
            <Button type="dashed" block icon={<Plus size={13} />}
              style={{ color: 'var(--flock-color-text-secondary)', background: 'var(--flock-color-bg-layout)' }}>
              Add Items
            </Button>
          </div>
        </section>

        {/* Payment breakdown */}
        <section style={{ padding: '0 20px 24px' }}>
          <div style={{ borderTop: '1px solid var(--flock-color-split)', paddingTop: 16 }}>
            <PaymentRow label={`${itemCount} item(s) subtotal`} value={`QR ${order.subtotal.toFixed(2)}`} />
            <div style={{ height: 12 }} />
            <PaymentRow
              label="Discount"
              value={order.discount > 0 ? `−QR ${order.discount.toFixed(2)}` : '−QR 0.00'}
              color={order.discount > 0 ? 'var(--flock-color-success)' : 'var(--flock-color-text-quaternary)'}
            />
            <div style={{ height: 12 }} />
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5" style={{ color: 'var(--flock-color-text-secondary)' }}>
                {order.isDelivery
                  ? <Truck size={13} style={{ color: 'var(--flock-color-text-tertiary)' }} />
                  : <ShoppingBag size={13} style={{ color: 'var(--flock-color-text-tertiary)' }} />}
                {order.isDelivery ? 'Delivery Fee' : 'Pickup'}
                {order.isDelivery && order.deliveryFee > order.subtotal * 2 && (
                  <Tag color="warning" icon={<AlertTriangle size={10} />} closable={false}>High</Tag>
                )}
              </span>
              <span style={{ color: 'var(--flock-color-text)' }}>QR {order.deliveryFee.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* ── Sticky total ─────────────────────────────────── */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            borderTop: '1px solid var(--flock-color-split)',
            background: 'var(--flock-color-bg-container)',
          }}
        >
          <div className="flex items-center justify-between" style={{ padding: '10px 20px' }}>
            <div>
              <div className="text-xs mb-0.5" style={{ color: 'var(--flock-color-text-tertiary)' }}>Amount due</div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--flock-color-text-secondary)' }}>
                <span>Total · {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                <PaymentMethodBadge method={order.paymentMethod} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="font-bold" style={{ fontSize: 'var(--flock-font-size-heading-3)', color: 'var(--flock-color-text)', letterSpacing: '-0.5px' }}>
                QR {order.total.toFixed(2)}
              </span>
              <Button icon={<Printer size={13} />} size="small">
                Print Receipt
              </Button>
            </div>
          </div>
        </div>

      </div>

      <OutOfStockFlow
        open={outOfStockOpen}
        onClose={() => setOutOfStockOpen(false)}
        items={order.items}
        orderNumber={order.orderNumber}
        onSubmit={onMarkOutOfStock}
      />
    </div>
  )
}

/* ─── Helpers ────────────────────────────────────────────── */

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function getMinutesLeft(target: Date): number {
  return Math.max(0, Math.floor((target.getTime() - Date.now()) / 60000))
}

/* ─── Sub-components ─────────────────────────────────────── */

function PickupBlock({ pickup }: { pickup: Date }) {
  const { time, relative, urgency } = formatPickupTime(pickup)
  const accent = pickupUrgencyColor[urgency]
  const bg = urgency === 'future'
    ? 'var(--flock-color-info-bg)'
    : urgency === 'soon'
      ? 'var(--flock-color-volcano-bg)'
      : 'var(--flock-color-error-bg)'
  const label = urgency === 'future'
    ? 'Scheduled pickup'
    : urgency === 'soon'
      ? 'Pickup — start preparing'
      : 'Pickup overdue'
  return (
    <div
      className="flex items-center gap-3 mt-3"
      style={{
        padding: '12px 14px',
        borderRadius: 12,
        background: bg,
        border: `1px solid ${accent}`,
      }}
    >
      <Calendar size={20} style={{ color: accent, flexShrink: 0 }} />
      <div className="flex flex-col min-w-0">
        <span style={{ fontSize: 12, fontWeight: 500, color: accent, lineHeight: '16px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--flock-color-text)', lineHeight: '28px', letterSpacing: '-0.01em' }}>
            {time}
          </span>
          <span style={{ fontSize: 14, fontWeight: 500, color: accent, lineHeight: '20px' }}>
            {relative}
          </span>
        </div>
      </div>
    </div>
  )
}

function MetaCell({ icon, text, accent }: { icon: React.ReactNode; text: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span style={{ color: 'var(--flock-color-text-tertiary)', flexShrink: 0 }}>{icon}</span>
      <span style={{ color: accent ? 'var(--flock-color-volcano)' : 'var(--flock-color-text-secondary)' }}>
        {text}
      </span>
    </div>
  )
}

const driverStatusConfig: Record<DriverStatus, { label: string; bg: string; color: string }> = {
  on_route:   { label: 'On Route',   bg: 'var(--flock-color-warning)', color: '#fff' },
  arrived:    { label: 'Arrived',    bg: 'var(--flock-color-success)', color: '#fff' },
  picking_up: { label: 'Picking Up', bg: 'var(--flock-color-info)',    color: '#fff' },
}

function DriverStatusBadge({ status }: { status: DriverStatus }) {
  const { label, bg, color } = driverStatusConfig[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1px 8px', borderRadius: 'var(--flock-radius-xl)',
      background: bg, color,
      fontSize: 'var(--flock-font-size-sm)',
      fontWeight: 'var(--flock-font-weight-medium)',
      lineHeight: 'var(--flock-line-height-sm)',
    }}>
      {label}
    </span>
  )
}

const paymentMethodConfig: Record<PaymentMethod, { label: string; icon: React.ReactNode }> = {
  cash:   { label: 'Cash',   icon: <Banknote size={11} /> },
  card:   { label: 'Card',   icon: <CreditCard size={11} /> },
  online: { label: 'Online', icon: <Wifi size={11} /> },
}

function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const { label, icon } = paymentMethodConfig[method]
  return (
    <span
      className="flex items-center gap-1"
      style={{
        padding: '1px 8px',
        borderRadius: 'var(--flock-radius-xl)',
        background: 'var(--flock-color-fill-quaternary)',
        color: 'var(--flock-color-text-secondary)',
        fontSize: 'var(--flock-font-size-sm)',
        fontWeight: 'var(--flock-font-weight-medium)',
        lineHeight: 'var(--flock-line-height-sm)',
      }}
    >
      {icon}
      {label}
    </span>
  )
}

function PaymentRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: 'var(--flock-color-text-secondary)' }}>{label}</span>
      <span style={{ color: color ?? 'var(--flock-color-text)' }}>{value}</span>
    </div>
  )
}
