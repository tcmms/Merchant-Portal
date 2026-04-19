import type React from 'react'
import { Tooltip } from '@tcmms/flock-ds'
import { Trash2, RotateCcw, Package, Tag } from 'lucide-react'

const BULK_TOOLTIP_KEY = 'bulk_action_tooltip_shown'

interface BulkActionBarProps {
  selectedCount: number
  onSelectAll: () => void
  onDelete: () => void
  onUpdateStatuses: () => void
  onUpdateStocks: () => void
  onUpdatePrices: () => void
}

export function BulkActionBar({
  selectedCount,
  onSelectAll,
  onDelete,
  onUpdateStatuses,
  onUpdateStocks,
  onUpdatePrices,
}: BulkActionBarProps) {
  return (
    <Tooltip
      title="Choose an action to apply to all selected products."
      placement="top"
    >
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-4"
      style={{
        width: 815,
        height: 44,
        backgroundColor: '#161515',
        borderRadius: 12,
        boxShadow: '0px 25px 50px rgba(0,0,0,0.6)',
      }}
    >
      {/* Left: delete + count + select all */}
      <div className="flex items-center gap-3">
        <button
          onClick={onDelete}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:opacity-70 transition-opacity"
          aria-label="Delete selected"
        >
          <Trash2 size={16} color="white" />
        </button>

        <span className="text-sm font-medium text-white whitespace-nowrap">
          {selectedCount} selected
        </span>

        <button
          onClick={onSelectAll}
          className="text-sm font-medium whitespace-nowrap hover:opacity-80 transition-opacity"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Select all
        </button>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-1">
        <BulkButton icon={<RotateCcw size={14} />} onClick={onUpdateStatuses} highlight>
          Update statuses
        </BulkButton>
        <BulkButton icon={<Package size={14} />} onClick={onUpdateStocks}>
          Update stocks
        </BulkButton>
        <BulkButton icon={<Tag size={14} />} onClick={onUpdatePrices}>
          Update prices
        </BulkButton>
      </div>
    </div>
    </Tooltip>
  )
}

interface BulkButtonProps {
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
  highlight?: boolean
}

function BulkButton({ icon, children, onClick, highlight }: BulkButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 h-8 px-2 rounded-lg text-sm font-medium text-white whitespace-nowrap hover:opacity-80 transition-opacity"
      style={{
        backgroundColor: highlight ? 'rgba(255,255,255,0.15)' : 'transparent',
        minWidth: 80,
      }}
    >
      {icon}
      {children}
    </button>
  )
}
