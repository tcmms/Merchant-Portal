import type { RefObject } from 'react'
import { X } from 'lucide-react'
import { useDevTools } from './DevToolsContext'
import { SectionLabel } from './components/SectionLabel'
import { FlowButton } from './components/FlowButton'
import type { ForcedState, PageDevHandle, LiveOrdersDevHandle, CatalogDevHandle } from './types'

type Page = 'live-orders' | 'menu-management'

interface DevToolsPanelProps {
  activePage: Page
  // forcedState/onForcedStateChange/onNavigate are kept in the prop interface so the
  // parent contract doesn't change; the manager-facing UI hides the Screen/State sections.
  forcedState: ForcedState
  onForcedStateChange: (state: ForcedState) => void
  activeRef: RefObject<PageDevHandle | null>
  onNavigate: (page: Page) => void
}

export function DevToolsPanel({ activePage, onForcedStateChange, activeRef }: DevToolsPanelProps) {
  const { isOpen, toggle } = useDevTools()
  const flowGroups = getFlowGroups(activePage, activeRef, onForcedStateChange)

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

        {/* FLOW GROUPS */}
        {flowGroups.map(group => (
          <div key={group.label}>
            <SectionLabel>{group.label}</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {group.flows.map(flow => (
                <FlowButton key={flow.label} label={flow.label} onClick={flow.action} />
              ))}
            </div>
          </div>
        ))}
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

interface Flow {
  label: string
  description?: string
  action: () => void
}

interface FlowGroup {
  label: string
  hint?: string
  flows: Flow[]
}

function getFlowGroups(
  activePage: Page,
  ref: RefObject<PageDevHandle | null>,
  _onForcedStateChange: (s: ForcedState) => void,
): FlowGroup[] {
  const r = ref.current

  if (!r) return []

  if (activePage === 'live-orders') {
    const lr = r as LiveOrdersDevHandle
    return [
      {
        label: 'Demos',
        flows: [
          { label: '🏪 Default screen',            action: () => lr.resetScheduledOverrides() },
          { label: '🎬 Single order on the board', action: () => lr.enterSingleOrderDemo() },
          { label: '🚚 Own-delivery order',        action: () => lr.enterOwnDeliveryDemo() },
          { label: '⭐ VIP / premium priority',     action: () => lr.enterPremiumPriorityDemo() },
        ],
      },
      {
        label: 'Spawn',
        flows: [
          { label: '📞 Scheduled order arrives',    action: () => lr.spawnScheduledIncoming() },
          { label: '⭐ VIP order arrives',          action: () => lr.spawnPremiumPriorityOrder() },
          { label: '❌ Customer cancels order',     action: () => lr.spawnCustomerCancelledOrder() },
          { label: '⏰ Scheduled order due now',    action: () => lr.spawnDueScheduled() },
        ],
      },
      {
        label: 'Edge cases',
        flows: [
          { label: '⚠️ Urgent prep alert',          action: () => lr.triggerUrgentPrepBanner() },
          { label: '⏰ Scheduled → due',            action: () => lr.forceFirstScheduledDue() },
          { label: '🔴 Scheduled → overdue',       action: () => lr.forceFirstScheduledOverdue() },
        ],
      },
    ]
  }

  if (activePage === 'menu-management') {
    const cr = r as CatalogDevHandle
    return [
      {
        label: 'Catalog',
        flows: [
          { label: 'Open product drawer',         action: () => cr.openProductDrawer() },
          { label: 'Open bulk update modal',      action: () => cr.openBulkUpdateModal() },
          { label: 'Trigger spotlight tour',      action: () => cr.triggerSpotlight() },
          { label: 'Select all items',            action: () => cr.selectAllItems() },
          { label: 'Switch to rejected view',     action: () => cr.switchToRejectedView() },
        ],
      },
    ]
  }

  return []
}
