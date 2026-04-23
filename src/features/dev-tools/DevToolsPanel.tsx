import type { RefObject } from 'react'
import { X } from 'lucide-react'
import { useDevTools } from './DevToolsContext'
import { SectionLabel } from './components/SectionLabel'
import { StateToggle } from './components/StateToggle'
import { FlowButton } from './components/FlowButton'
import type { ForcedState, PageDevHandle, LiveOrdersDevHandle, CatalogDevHandle } from './types'

type Page = 'live-orders' | 'menu-management'

interface DevToolsPanelProps {
  activePage: Page
  forcedState: ForcedState
  onForcedStateChange: (state: ForcedState) => void
  activeRef: RefObject<PageDevHandle | null>
  onNavigate: (page: Page) => void
}

const PAGE_LABELS: Record<Page, string> = {
  'live-orders': 'Live Orders',
  'menu-management': 'Catalog',
}

const ALL_PAGES: Page[] = ['live-orders', 'menu-management']

export function DevToolsPanel({ activePage, forcedState, onForcedStateChange, activeRef, onNavigate }: DevToolsPanelProps) {
  const { isOpen, toggle } = useDevTools()
  const flows = getFlows(activePage, activeRef, onForcedStateChange)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 272,
        zIndex: 9998,
        background: 'white',
        borderLeft: '1px solid #e8e8e8',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 240ms cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 12px',
        borderBottom: '1px solid #f0f0f0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(0,0,0,0.88)' }}>DevTools</span>
          <span style={{
            fontSize: 9, fontWeight: 600,
            background: '#161515', color: 'white',
            padding: '1px 5px', borderRadius: 4, letterSpacing: '0.05em',
          }}>DEV</span>
        </div>
        <button
          onClick={toggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 6, color: 'rgba(0,0,0,0.45)' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* SCREEN */}
        <div>
          <SectionLabel>Screen</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ALL_PAGES.map(page => (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid',
                  borderColor: activePage === page ? '#161515' : '#e8e8e8',
                  background: activePage === page ? '#161515' : 'white',
                  color: activePage === page ? 'white' : 'rgba(0,0,0,0.65)',
                  fontSize: 13,
                  fontWeight: activePage === page ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 150ms',
                }}
              >
                {PAGE_LABELS[page]}
              </button>
            ))}
          </div>
        </div>

        {/* STATE */}
        <div>
          <SectionLabel>State</SectionLabel>
          <StateToggle value={forcedState} onChange={onForcedStateChange} />
        </div>

        {/* FLOWS */}
        {flows.length > 0 && (
          <div>
            <SectionLabel>Flows</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {flows.map(flow => (
                <FlowButton key={flow.label} label={flow.label} onClick={flow.action} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid #f0f0f0',
        fontSize: 10,
        color: 'rgba(0,0,0,0.2)',
        textAlign: 'center',
        letterSpacing: '0.06em',
        flexShrink: 0,
      }}>
        NOT IN PRODUCTION BUILD
      </div>
    </div>
  )
}

function getFlows(
  activePage: Page,
  ref: RefObject<PageDevHandle | null>,
  _onForcedStateChange: (s: ForcedState) => void,
): { label: string; action: () => void }[] {
  const r = ref.current

  if (!r) return []

  if (activePage === 'live-orders') {
    const lr = r as LiveOrdersDevHandle
    return [
      { label: 'Select first order', action: () => lr.selectFirstOrder() },
      { label: 'Trigger action loading (3s)', action: () => lr.triggerActionLoading() },
      { label: 'Toggle empty state', action: () => lr.showEmptyState() },
      { label: '🎬 Demo: single-order flow', action: () => lr.enterSingleOrderDemo() },
      { label: '🚚 Demo: own-delivery flow', action: () => lr.enterOwnDeliveryDemo() },
      { label: '⭐ Demo: premium priority', action: () => lr.enterPremiumPriorityDemo() },
      { label: '⭐ Spawn premium-priority order', action: () => lr.spawnPremiumPriorityOrder() },
      { label: '❌ Spawn customer-cancelled order', action: () => lr.spawnCustomerCancelledOrder() },
      { label: '⏰ Force scheduled → due', action: () => lr.forceFirstScheduledDue() },
      { label: '🔴 Force scheduled → overdue', action: () => lr.forceFirstScheduledOverdue() },
      { label: '⏰ Spawn due-scheduled order', action: () => lr.spawnDueScheduled() },
      { label: '↻ Reset scheduled overrides', action: () => lr.resetScheduledOverrides() },
    ]
  }

  if (activePage === 'menu-management') {
    const cr = r as CatalogDevHandle
    return [
      { label: 'Open product drawer', action: () => cr.openProductDrawer() },
      { label: 'Open bulk update modal', action: () => cr.openBulkUpdateModal() },
      { label: 'Trigger spotlight tour', action: () => cr.triggerSpotlight() },
      { label: 'Select all items', action: () => cr.selectAllItems() },
      { label: 'Switch to rejected view', action: () => cr.switchToRejectedView() },
    ]
  }

  return []
}
