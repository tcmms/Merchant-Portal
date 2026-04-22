import { useState, forwardRef, useImperativeHandle, useRef } from 'react'
import type { ForcedState, LiveOrdersDevHandle } from '../dev-tools/types'
import { DevStateOverlay } from '../dev-tools/components/DevStateOverlay'
import { Badge, Button, Drawer, InputSearch, Tabs } from '@tcmms/flock-ds'
import { toast } from './utils/toast'
import { GitBranch, ChevronDown, ChevronRight, LayoutGrid, Columns3, SlidersHorizontal } from 'lucide-react'
import { StatusSegmented } from '../menu-management/components/StatusSegmented'
import { BranchStatusDrawer } from './components/BranchStatusDrawer'
import { Sidebar } from './components/Sidebar'
import { OrderList } from './components/OrderList'
import { OrderDetail } from './components/OrderDetail'
import { KanbanBoard, type KanbanBoardHandle } from './components/KanbanBoard'
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
  const [layoutMode, setLayoutMode] = useState<'split' | 'kanban'>('split')
  const [headerSearch, setHeaderSearch] = useState('')
  const [branchStatusOpen, setBranchStatusOpen] = useState(false)
  const [oosByOrderId, setOosByOrderId] = useState<Record<string, Set<string>>>({})

  const handleMarkOutOfStock = (orderId: string, itemIds: string[]) => {
    setOosByOrderId((prev) => {
      const merged = new Set(prev[orderId] ?? [])
      itemIds.forEach((id) => merged.add(id))
      return { ...prev, [orderId]: merged }
    })
  }

  const selectedOosItems = selectedOrder ? oosByOrderId[selectedOrder.id] : undefined
  const { width: listWidth, onMouseDown } = useResizablePanel({
    defaultWidth: 520,
    minWidth: 520,
    maxWidth: 620,
  })

  const kanbanRef = useRef<KanbanBoardHandle | null>(null)

  useImperativeHandle(ref, () => ({
    selectFirstOrder: () => setSelectedOrder(MOCK_ORDERS[0]),
    triggerActionLoading: () => {
      setSelectedOrder(prev => prev ?? MOCK_ORDERS[0])
      setIsActioning(true)
      setTimeout(() => setIsActioning(false), 3000)
    },
    showEmptyState: () => setDevEmptyState(v => !v),
    forceFirstScheduledDue: () => {
      if (layoutMode !== 'kanban') {
        toast.info('Switch to Kanban layout to test scheduled flows')
        return
      }
      const ok = kanbanRef.current?.forceFirstScheduledDue() ?? false
      toast[ok ? 'success' : 'warning'](
        ok ? 'Top scheduled order pushed into due window (pickup now ~20 min)' : 'No eligible scheduled orders',
      )
    },
    forceFirstScheduledOverdue: () => {
      if (layoutMode !== 'kanban') {
        toast.info('Switch to Kanban layout to test scheduled flows')
        return
      }
      const ok = kanbanRef.current?.forceFirstScheduledOverdue() ?? false
      toast[ok ? 'warning' : 'info'](
        ok ? 'Top scheduled order forced into overdue (pickup 5 min ago)' : 'No scheduled orders to override',
      )
    },
    spawnDueScheduled: () => {
      if (layoutMode !== 'kanban') {
        toast.info('Switch to Kanban layout to test scheduled flows')
        return
      }
      kanbanRef.current?.spawnDueScheduled()
      toast.success('Spawned a due scheduled order (pickup in 15 min)')
    },
    enterSingleOrderDemo: () => {
      if (layoutMode !== 'kanban') {
        toast.info('Switch to Kanban layout to run the single-order demo')
        return
      }
      kanbanRef.current?.enterSingleOrderDemo()
      toast.success('Single-order demo — one order, full lifecycle ready')
    },
    enterOwnDeliveryDemo: () => {
      if (layoutMode !== 'kanban') {
        toast.info('Switch to Kanban layout to run the own-delivery demo')
        return
      }
      kanbanRef.current?.enterOwnDeliveryDemo()
      toast.success('Own-delivery demo — one order, Picked Up / Delivered buttons enabled')
    },
    resetScheduledOverrides: () => {
      kanbanRef.current?.resetOverrides()
      toast.info('Scheduled overrides cleared')
    },
  }))

  const handleOrderAction = async () => {
    if (!selectedOrder) return
    // Kanban mode: delegate to board state so the list updates live.
    if (layoutMode === 'kanban' && kanbanRef.current) {
      const status = selectedOrder.status
      if (status === 'needs_action' || status === 'looking_for_driver') {
        kanbanRef.current.acceptOrder(selectedOrder.id)
      } else if (status === 'scheduled') {
        kanbanRef.current.startPreparation(selectedOrder.id)
      } else if (status === 'preparing') {
        kanbanRef.current.markReady(selectedOrder.id)
      }
      // Close the drawer so the user sees the result in the board.
      setSelectedOrder(null)
      return
    }
    // Split layout: simulate a loading tick for now.
    setIsActioning(true)
    await new Promise(r => setTimeout(r, 1500))
    setIsActioning(false)
  }

  const handleCancelOrder = () => {
    if (!selectedOrder) return
    if (layoutMode === 'kanban' && kanbanRef.current) {
      // Open reason modal; actual cancellation happens on confirm inside the board.
      kanbanRef.current.openRejectModal(selectedOrder.id)
      setSelectedOrder(null)
    }
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
          className="flex items-center justify-between pr-4 shrink-0 gap-3"
          style={{ height: '80px', paddingLeft: 40, borderBottom: '1px solid var(--flock-color-border)', background: 'var(--flock-color-bg-container)' }}
        >
          <div className="flex items-center gap-3 shrink-0">
            <h1
              className="font-bold whitespace-nowrap cursor-pointer select-none"
              onClick={() => setLayoutMode('kanban')}
              style={{
                fontSize: 'var(--flock-font-size-heading-2)',
                fontWeight: 'var(--flock-font-weight-extrabold)',
                letterSpacing: '-0.5px',
                color: 'var(--flock-color-text)',
                margin: 0,
              }}
            >
              Live Orders
            </h1>
            <StatusSegmented
              options={[
                { label: <Columns3 size={16} />, value: 'split', tooltip: 'Split view' },
                { label: <LayoutGrid size={16} />, value: 'kanban', tooltip: 'Kanban view' },
              ]}
              value={layoutMode}
              onChange={(val) => setLayoutMode(val as 'split' | 'kanban')}
            />
            {layoutMode === 'split' && (
              <Button
                type="text"
                size="small"
                icon={<GitBranch size={12} />}
                style={{ color: 'var(--flock-color-primary)', fontSize: 12 }}
              >
                5 branches
                <ChevronDown size={12} />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 min-w-0">
            {layoutMode === 'kanban' && (
              <>
                <div style={{ width: 260, flexShrink: 1, minWidth: 160 }}>
                  <InputSearch
                    placeholder="Search by ID/Item Name"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    size="large"
                  />
                </div>
                <Button size="large" icon={<SlidersHorizontal size={15} />}>
                  All Filters
                </Button>
                <Button size="large" icon={<ChevronDown size={14} />} iconPlacement="end">
                  Order Tracker
                </Button>
                <button
                  type="button"
                  onClick={() => setBranchStatusOpen(true)}
                  className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 rounded-lg transition-colors"
                  style={{
                    height: 40,
                    padding: '0 8px 0 12px',
                    background: 'var(--flock-color-fill-quaternary, #f6f6f6)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    outlineColor: 'var(--flock-color-primary)',
                  }}
                  aria-label="Open branch status"
                >
                  <span className="whitespace-nowrap" style={{ fontSize: 14, color: 'rgba(0,0,0,0.88)', lineHeight: '22px' }}>
                    Branch Status:{' '}
                    <span style={{ color: 'var(--flock-color-success, #08af3b)', fontWeight: 500 }}>
                      3/4 Accepting Orders
                    </span>
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--flock-color-text-tertiary)' }} />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Main content */}
        {layoutMode === 'kanban' ? (
          <div className="flex flex-1 overflow-hidden" style={{ background: 'var(--flock-color-bg-layout)', position: 'relative' }}>
            <DevStateOverlay state={forcedState} />
            <KanbanBoard
              orders={devEmptyState ? [] : MOCK_ORDERS}
              onSelectOrder={setSelectedOrder}
              boardRef={kanbanRef}
            />
          </div>
        ) : (
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
            <OrderDetail
              order={selectedOrder}
              isActioning={isActioning}
              onAction={handleOrderAction}
              oosItemIds={selectedOosItems}
              onMarkOutOfStock={(ids) => selectedOrder && handleMarkOutOfStock(selectedOrder.id, ids)}
            />
          </div>
        </div>
        )}
      </div>

      <BranchStatusDrawer open={branchStatusOpen} onClose={() => setBranchStatusOpen(false)} />

      {/* Kanban drawer — shows full order detail when a card is selected */}
      <Drawer
        open={layoutMode === 'kanban' && selectedOrder != null}
        onClose={() => setSelectedOrder(null)}
        placement="right"
        width={560}
        closable
        styles={{
          body: { padding: 0, background: 'var(--flock-color-bg-container)' },
          header: { padding: '16px 24px', borderBottom: '1px solid var(--flock-color-border-secondary)' },
        }}
        title={selectedOrder ? `Order #${selectedOrder.orderNumber}` : null}
      >
        <OrderDetail
          order={selectedOrder}
          isActioning={isActioning}
          onAction={handleOrderAction}
          onCancelOrder={handleCancelOrder}
          oosItemIds={selectedOosItems}
          onMarkOutOfStock={(ids) => selectedOrder && handleMarkOutOfStock(selectedOrder.id, ids)}
          showStepper={false}
        />
      </Drawer>
    </div>
  )
})
