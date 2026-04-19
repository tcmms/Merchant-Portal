import { useRef, useState } from 'react'
import { Badge, Button, Empty, InputSearch } from '@tcmms/flock-ds'
import { SlidersHorizontal, Calendar, ArrowRight } from 'lucide-react'
import { OrderCard } from './OrderCard'
import { useDebounce } from '../hooks/useDebounce'
import type { Order, TabId } from '../types'

interface OrderListProps {
  orders: Order[]
  activeTab: TabId
  selectedOrderId: string | null
  onSelectOrder: (order: Order) => void
  onOrderAction?: (orderId: string) => void
  width: number
}

export function OrderList({ orders, activeTab, selectedOrderId, onSelectOrder, onOrderAction, width }: OrderListProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const tabOrders = orders.filter((o) => {
    if (activeTab === 'needs_action') {
      return o.status === 'needs_action' || o.status === 'looking_for_driver' || o.status === 'cancelled'
    }
    if (activeTab === 'preparing') return o.status === 'preparing'
    if (activeTab === 'ready_for_pickup') return o.status === 'ready_for_pickup'
    return false
  })

  const filtered = debouncedSearch
    ? tabOrders.filter(
        (o) =>
          o.orderNumber.includes(debouncedSearch) ||
          o.customer.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : tabOrders

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!filtered.length) return
    const currentIndex = filtered.findIndex((o) => o.id === selectedOrderId)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = currentIndex === -1
        ? filtered[0]
        : filtered[Math.min(currentIndex + 1, filtered.length - 1)]
      onSelectOrder(next)
      cardRefs.current.get(next.id)?.scrollIntoView({ block: 'nearest' })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = currentIndex === -1
        ? filtered[filtered.length - 1]
        : filtered[Math.max(currentIndex - 1, 0)]
      onSelectOrder(prev)
      cardRefs.current.get(prev.id)?.scrollIntoView({ block: 'nearest' })
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ width, minWidth: 0, flexShrink: 0 }}
    >
      {/* Search + Filter */}
      <div
        className="flex items-center gap-2 shrink-0"
        style={{ padding: '12px 16px', borderBottom: '1px solid var(--flock-color-border-secondary)' }}
      >
        <InputSearch
          placeholder="Search order, customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="large"
          style={{ flex: 1 }}
        />
        <Button size="large" icon={<SlidersHorizontal size={15} />}>
          Filter
        </Button>
      </div>

      {/* Order list */}
      <div
        className="flex-1 overflow-y-auto focus-visible:outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Orders list"
      >
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full py-12">
            <Empty
              description={debouncedSearch ? 'No orders match your search' : 'No orders in this tab'}
            />
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={order.id === selectedOrderId}
                activeTab={activeTab}
                onClick={() => onSelectOrder(order)}
                onAction={() => onOrderAction?.(order.id)}
                cardRef={(el) => {
                  if (el) cardRefs.current.set(order.id, el)
                  else cardRefs.current.delete(order.id)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 shrink-0" style={{ borderTop: '1px solid var(--flock-color-border)' }}>
        <Button
          type="text"
          size="small"
          icon={<Calendar size={13} />}
          style={{ borderRadius: 0, borderRight: '1px solid var(--flock-color-border)', height: 48, color: 'var(--flock-color-text-tertiary)' }}
        >
          Scheduled Orders
          <Badge count={0} showZero color="var(--flock-color-fill-secondary)" style={{ color: 'var(--flock-color-text-tertiary)', boxShadow: 'none' }} />
        </Button>
        <Button
          type="text"
          size="small"
          iconPosition="end"
          icon={<ArrowRight size={13} />}
          style={{ borderRadius: 0, height: 48, color: 'var(--flock-color-text-tertiary)' }}
        >
          Order Tracker
        </Button>
      </div>
    </div>
  )
}
