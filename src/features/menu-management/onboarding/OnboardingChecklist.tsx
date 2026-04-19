import { useEffect, useState } from 'react'
import { X, Check, Circle, ChevronRight } from 'lucide-react'
import { CHECKLIST_ITEMS, type ChecklistItemId } from './checklistConfig'

interface OnboardingChecklistProps {
  itemStates: Record<ChecklistItemId, boolean>
  completedCount: number
  totalCount: number
  isCompleted: boolean
  isExpanded: boolean
  onToggleExpanded: () => void
  onItemClick?: (id: ChecklistItemId) => void
  activeItemId?: ChecklistItemId | null
  spotlightActive?: boolean
}

export function OnboardingChecklist({
  itemStates,
  completedCount,
  totalCount,
  isCompleted,
  isExpanded,
  onToggleExpanded,
  onItemClick,
  activeItemId,
  spotlightActive,
}: OnboardingChecklistProps) {
  const [showDoneMessage, setShowDoneMessage] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!isCompleted || spotlightActive) return
    setShowDoneMessage(true)
    const timer = setTimeout(() => setHidden(true), 2000)
    return () => clearTimeout(timer)
  }, [isCompleted, spotlightActive])

  if (hidden) return null

  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const zIndex = spotlightActive ? 9500 : 1000

  // ── Completed message (only after spotlight ends) ──
  if (showDoneMessage && !spotlightActive) {
    return (
      <div
        className="fixed flex items-center gap-2 bg-white"
        style={{
          bottom: 24,
          right: 24,
          width: 320,
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          padding: 16,
          zIndex,
        }}
        role="status"
      >
        <Check size={16} style={{ color: '#E31D1C' }} />
        <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
          You're all set!
        </span>
      </div>
    )
  }

  // ── Collapsed ──
  if (!isExpanded) {
    return (
      <div
        className="fixed bg-white cursor-pointer"
        style={{
          bottom: 24,
          right: 24,
          width: 320,
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          zIndex,
        }}
        role="complementary"
        aria-label="Setup guide"
      >
        <button
          onClick={onToggleExpanded}
          className="flex items-center justify-between w-full text-left"
          style={{ padding: 16 }}
          aria-label={`Setup guide — ${completedCount} of ${totalCount} done. Click to expand.`}
        >
          <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
            Setup guide
          </span>
          <span className="text-sm" style={{ color: '#999999' }}>
            {completedCount}/{totalCount} ✓
          </span>
        </button>

        {/* Progress bar */}
        <div
          style={{
            height: 4,
            borderRadius: '0 0 12px 12px',
            backgroundColor: '#E5E5E5',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: '100%',
              backgroundColor: '#E31D1C',
              borderRadius: 2,
              transition: 'width 300ms ease',
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-center" style={{ padding: '8px 16px' }}>
          <button
            onClick={e => { e.stopPropagation(); onToggleExpanded() }}
            className="text-xs"
            style={{ color: '#999999', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Expand
          </button>
        </div>
      </div>
    )
  }

  // ── Expanded ──
  return (
    <div
      className="fixed bg-white flex flex-col"
      style={{
        bottom: 24,
        right: 24,
        width: 320,
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        zIndex,
      }}
      role="complementary"
      aria-label="Setup guide"
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: '16px 16px 0 16px' }}>
        <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
          Setup guide
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: '#999999' }}>
            {completedCount} / {totalCount}
          </span>
          <button
            onClick={onToggleExpanded}
            aria-label="Collapse setup guide"
            className="flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-black/5"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={14} style={{ color: '#999999' }} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 4,
          borderRadius: 2,
          backgroundColor: '#E5E5E5',
          margin: '12px 16px 4px 16px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: '#E31D1C',
            borderRadius: 2,
            transition: 'width 300ms ease',
          }}
        />
      </div>

      {/* Items */}
      <div style={{ padding: '4px 16px 0 16px' }}>
        {CHECKLIST_ITEMS.map(item => (
          <ChecklistItem
            key={item.id}
            id={item.id}
            label={item.label}
            done={itemStates[item.id]}
            isActive={item.id === activeItemId}
            onClick={onItemClick}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex justify-center"
        style={{ padding: '8px 16px 12px 16px', borderTop: '1px solid #F0F0F0', marginTop: 4 }}
      >
        <button
          onClick={onToggleExpanded}
          className="text-xs"
          style={{ color: '#999999', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Collapse
        </button>
      </div>
    </div>
  )
}

// ── Single checklist item ──

interface ChecklistItemProps {
  id: ChecklistItemId
  label: string
  done: boolean
  isActive?: boolean
  onClick?: (id: ChecklistItemId) => void
}

function ChecklistItem({ id, label, done, isActive, onClick }: ChecklistItemProps) {
  return (
    <button
      onClick={() => onClick?.(id)}
      className="group flex items-center gap-3 w-full rounded-lg transition-colors hover:bg-[#F5F5F5] text-left bg-transparent border-none cursor-pointer"
      style={{
        minHeight: 44,
        padding: '4px 8px',
        backgroundColor: isActive ? '#FEF2F2' : undefined,
      }}
    >
      {done ? (
        <span
          className="flex items-center justify-center shrink-0"
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: '#E31D1C',
          }}
        >
          <Check size={12} color="white" strokeWidth={3} />
        </span>
      ) : isActive ? (
        <span
          className="shrink-0"
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: '2px solid #E31D1C',
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <Circle size={18} style={{ color: '#D9D9D9' }} className="shrink-0" />
      )}
      <span
        className="text-sm leading-5 flex-1"
        style={{ color: isActive ? '#E31D1C' : done ? '#999999' : '#1A1A1A', fontWeight: isActive ? 500 : undefined }}
      >
        {label}
      </span>
      <ChevronRight
        size={14}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: isActive ? '#E31D1C' : '#999999' }}
      />
    </button>
  )
}
