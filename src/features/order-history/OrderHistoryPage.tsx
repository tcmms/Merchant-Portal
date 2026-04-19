import { forwardRef, useImperativeHandle } from 'react'
import { InputField, Select, Statistic, Table, Tag } from '@tcmms/flock-ds'
import { Search } from 'lucide-react'
import { Sidebar } from '../live-orders/components/Sidebar'
import type { ForcedState, OrderHistoryDevHandle } from '../dev-tools/types'
import { DevStateOverlay } from '../dev-tools/components/DevStateOverlay'

interface OrderHistoryPageProps {
  onNavigate?: (id: string) => void
  sidebarCollapsed?: boolean
  onSidebarToggle?: () => void
  storeLogo?: string
  storeName?: string
  forcedState?: ForcedState
}

type OrderStatus = 'completed' | 'cancelled' | 'refunded'

interface HistoryOrder {
  key: string
  orderId: string
  customer: string
  items: number
  total: number
  status: OrderStatus
  date: string
}

const MOCK_HISTORY: HistoryOrder[] = [
  { key: '1', orderId: '#10482', customer: 'Sarah Johnson', items: 3, total: 47.50, status: 'completed', date: '30 Mar, 14:22' },
  { key: '2', orderId: '#10481', customer: 'Mohammed Al-Rashid', items: 1, total: 12.00, status: 'cancelled', date: '30 Mar, 13:55' },
  { key: '3', orderId: '#10480', customer: 'Emily Chen', items: 5, total: 89.00, status: 'completed', date: '30 Mar, 13:10' },
  { key: '4', orderId: '#10479', customer: 'Ahmed Hassan', items: 2, total: 31.75, status: 'refunded', date: '30 Mar, 12:40' },
  { key: '5', orderId: '#10478', customer: 'Laura Martinez', items: 4, total: 62.00, status: 'completed', date: '30 Mar, 11:58' },
  { key: '6', orderId: '#10477', customer: 'James Wilson', items: 2, total: 24.50, status: 'completed', date: '30 Mar, 11:30' },
  { key: '7', orderId: '#10476', customer: 'Fatima Al-Zahra', items: 6, total: 105.25, status: 'completed', date: '30 Mar, 10:45' },
  { key: '8', orderId: '#10475', customer: 'Daniel Park', items: 1, total: 9.00, status: 'cancelled', date: '30 Mar, 10:12' },
]

const STATUS_TAG: Record<OrderStatus, { color: string; label: string }> = {
  completed: { color: 'success', label: 'Completed' },
  cancelled: { color: 'error', label: 'Cancelled' },
  refunded: { color: 'warning', label: 'Refunded' },
}

const columns = [
  {
    title: 'Order',
    dataIndex: 'orderId',
    key: 'orderId',
    render: (v: string) => (
      <span style={{ fontWeight: 600, color: 'var(--flock-color-text)' }}>{v}</span>
    ),
  },
  {
    title: 'Customer',
    dataIndex: 'customer',
    key: 'customer',
  },
  {
    title: 'Items',
    dataIndex: 'items',
    key: 'items',
    render: (v: number) => `${v} item${v !== 1 ? 's' : ''}`,
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    render: (v: number) => (
      <span style={{ fontWeight: 600 }}>QAR {v.toFixed(2)}</span>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (v: OrderStatus) => (
      <Tag color={STATUS_TAG[v].color}>{STATUS_TAG[v].label}</Tag>
    ),
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    render: (v: string) => (
      <span style={{ color: 'var(--flock-color-text-secondary)' }}>{v}</span>
    ),
  },
]

export const OrderHistoryPage = forwardRef<OrderHistoryDevHandle, OrderHistoryPageProps>(function OrderHistoryPage({ onNavigate, sidebarCollapsed, onSidebarToggle, storeLogo, storeName, forcedState = 'default' }, ref) {
  useImperativeHandle(ref, () => ({}))

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--flock-color-bg-layout)' }}>
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={onSidebarToggle}
        activeItem="order-history"
        onNavigate={onNavigate}
        storeLogo={storeLogo}
        storeName={storeName}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center px-8 shrink-0"
          style={{ height: '80px', borderBottom: '1px solid var(--flock-color-border)', background: 'var(--flock-color-bg-container)' }}
        >
          <h1 className="font-bold" style={{ fontSize: 'var(--flock-font-size-heading-2)', fontWeight: 'var(--flock-font-weight-extrabold)', letterSpacing: '-0.5px', color: 'var(--flock-color-text)' }}>
            Order History
          </h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6" style={{ position: 'relative' }}>
          <DevStateOverlay state={forcedState} />

          {/* Stats */}
          <div
            className="grid grid-cols-4 gap-px rounded-xl overflow-hidden"
            style={{ background: 'var(--flock-color-border)' }}
          >
            {[
              { title: 'Orders Today', value: 48 },
              { title: 'Revenue Today', value: 2340 },
              { title: 'Avg Order Value', value: 48.75 },
              { title: 'Cancelled', value: 3 },
            ].map(({ title, value }) => (
              <div
                key={title}
                className="flex flex-col gap-1 px-6 py-5"
                style={{ background: 'var(--flock-color-bg-container)' }}
              >
                <Statistic title={title} value={value} />
              </div>
            ))}
          </div>

          {/* Filters + Table */}
          <div
            className="rounded-xl flex flex-col overflow-hidden"
            style={{ background: 'var(--flock-color-bg-container)' }}
          >
            {/* Filters */}
            <div
              className="flex items-center gap-3 px-6 py-4"
              style={{ borderBottom: '1px solid var(--flock-color-border)' }}
            >
              <InputField
                placeholder="Search by order or customer…"
                prefix={<Search size={14} style={{ color: 'var(--flock-color-text-tertiary)' }} />}
                allowClear
                style={{ width: 280 }}
              />
              <Select
                placeholder="Status"
                allowClear
                options={[
                  { label: 'Completed', value: 'completed' },
                  { label: 'Cancelled', value: 'cancelled' },
                  { label: 'Refunded', value: 'refunded' },
                ]}
                style={{ width: 140 }}
              />
              <Select
                placeholder="Date range"
                allowClear
                options={[
                  { label: 'Today', value: 'today' },
                  { label: 'Yesterday', value: 'yesterday' },
                  { label: 'Last 7 days', value: '7d' },
                  { label: 'Last 30 days', value: '30d' },
                ]}
                style={{ width: 160 }}
              />
            </div>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={MOCK_HISTORY}
            />
          </div>
        </div>
      </div>
    </div>
  )
})
