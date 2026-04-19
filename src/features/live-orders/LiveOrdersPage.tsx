import { useState, forwardRef, useImperativeHandle } from 'react'
import type { ForcedState, LiveOrdersDevHandle } from '../dev-tools/types'
import { DevStateOverlay } from '../dev-tools/components/DevStateOverlay'
import { Badge, Button, Tabs } from '@tcmms/flock-ds'
import { GitBranch, ChevronDown } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { OrderList } from './components/OrderList'
import { OrderDetail } from './components/OrderDetail'
import { useResizablePanel } from './hooks/useResizablePanel'
import { MOCK_ORDERS, getTabCounts } from './data/mockOrders'
import type { Order, TabId } from './types'

interface LiveOrdersPageProps {
  onNavigate?: (id: string) => void
  sidebarCollapsed?: boolean
  onSidebarToggle?: () => void
  storeLogo?: string
  storeName?: string
  forcedState?: ForcedState
}

export const LiveOrdersPage = forwardRef<LiveOrdersDevHandle, LiveOrdersPageProps>(function LiveOrdersPage({ onNavigate, sidebarCollapsed, onSidebarToggle, storeLogo, storeName, forcedState = 'default' }, ref) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('needs_action')
  const [isActioning, setIsActioning] = useState(false)
  const [devEmptyState, setDevEmptyState] = useState(false)
  const { width: listWidth, onMouseDown } = useResizablePanel({
    defaultWidth: 520,
    minWidth: 520,
    maxWidth: 620,
  })

  useImperativeHandle(ref, () => ({
    selectFirstOrder: () => setSelectedOrder(MOCK_ORDERS[0]),
    triggerActionLoading: () => {
      setSelectedOrder(prev => prev ?? MOCK_ORDERS[0])
      setIsActioning(true)
      setTimeout(() => setIsActioning(false), 3000)
    },
    showEmptyState: () => setDevEmptyState(v => !v),
  }))

  const handleOrderAction = async () => {
    setIsActioning(true)
    await new Promise(r => setTimeout(r, 1500))
    setIsActioning(false)
  }

  const tabCounts = getTabCounts(MOCK_ORDERS)

  const tabItems = [
    {
      key: 'needs_action',
      label: (
        <span className="flex items-center gap-1.5">
          Needs Action
          <Badge count={tabCounts.needs_action} color="var(--flock-color-primary)" showZero />
        </span>
      ),
    },
    {
      key: 'preparing',
      label: (
        <span className="flex items-center gap-1.5">
          Preparing
          <Badge count={tabCounts.preparing} color="var(--flock-color-fill-secondary)" showZero />
        </span>
      ),
    },
    {
      key: 'ready_for_pickup',
      label: (
        <span className="flex items-center gap-1.5">
          Ready for Pickup
          <Badge count={tabCounts.ready_for_pickup} color="var(--flock-color-warning)" showZero />
        </span>
      ),
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--flock-color-bg-layout)' }}>
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={onSidebarToggle} storeLogo={storeLogo} storeName={storeName} onNavigate={onNavigate} />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-8 shrink-0"
          style={{ height: '80px', borderBottom: '1px solid var(--flock-color-border)', background: 'var(--flock-color-bg-container)' }}
        >
          <div className="flex items-center gap-3">
            <h1 className="font-bold" style={{ fontSize: 'var(--flock-font-size-heading-2)', fontWeight: 'var(--flock-font-weight-extrabold)', letterSpacing: '-0.5px', color: 'var(--flock-color-text)' }}>
              Live Orders
            </h1>
            <Button
              type="text"
              size="small"
              icon={<GitBranch size={12} />}
              style={{ color: 'var(--flock-color-primary)', fontSize: 12 }}
            >
              5 branches
              <ChevronDown size={12} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: 'var(--flock-color-success)' }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: 'var(--flock-color-success)' }}
              />
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--flock-color-text-tertiary)' }}>Live</span>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden p-4" style={{ background: 'var(--flock-color-bg-layout)', gap: 0, position: 'relative' }}>
          <DevStateOverlay state={forcedState} />

          {/* Left column: tabs + list */}
          <div className="flex flex-col shrink-0" style={{ width: listWidth }}>
            {/* Tabs */}
            <div
              className="rounded-t-xl shadow-sm shrink-0"
              style={{ background: 'var(--flock-color-bg-container)' }}
            >
              <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as TabId)}
                items={tabItems}
                size="large"
                tabBarStyle={{ marginBottom: 0, paddingLeft: 16, paddingRight: 16 }}
              />
            </div>

            {/* OrderList island */}
            <div
              className="rounded-b-xl overflow-hidden shadow-sm flex flex-col flex-1"
              style={{ background: 'var(--flock-color-bg-container)' }}
            >
              <OrderList
                orders={devEmptyState ? [] : MOCK_ORDERS}
                activeTab={activeTab}
                selectedOrderId={selectedOrder?.id ?? null}
                onSelectOrder={setSelectedOrder}
                width={listWidth}
              />
            </div>
          </div>

          {/* Drag handle */}
          <div
            onMouseDown={onMouseDown}
            className="group relative flex items-center justify-center shrink-0 cursor-col-resize"
            style={{ width: 12 }}
            title="Drag to resize"
          >
            <div
              className="absolute inset-y-0 -left-1 -right-1 transition-colors duration-150 opacity-0 group-hover:opacity-20 group-active:opacity-30 rounded-full"
              style={{ background: 'var(--flock-color-primary)' }}
            />
            <div
              className="w-0.5 h-8 rounded-full transition-colors duration-150"
              style={{ background: 'var(--flock-color-border)' }}
            />
          </div>

          {/* OrderDetail island */}
          <div className="flex-1 overflow-hidden rounded-xl shadow-sm flex flex-col" style={{ background: 'var(--flock-color-bg-container)' }}>
            <OrderDetail order={selectedOrder} isActioning={isActioning} onAction={handleOrderAction} />
          </div>
        </div>
      </div>
    </div>
  )
})
